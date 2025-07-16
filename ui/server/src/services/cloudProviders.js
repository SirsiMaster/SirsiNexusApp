const AWS = require('aws-sdk');
const { ComputeEngine } = require('@google-cloud/compute');
const { ResourceManagementClient } = require('@azure/arm-resources');
const { ComputeManagementClient } = require('@azure/arm-compute');
const { DefaultAzureCredential } = require('@azure/identity');
const DigitalOcean = require('do-wrapper').default;
const database = require('./database');

class CloudProviderService {
  constructor() {
    this.providers = new Map();
    this.monitoringIntervals = new Map();
    this.resourceCache = new Map();
    
    console.log('Cloud provider service initialized');
  }

  // Initialize cloud provider connections
  async initializeProvider(userId, providerType, credentials) {
    try {
      let client = null;
      const cacheKey = `${userId}_${providerType}`;

      switch (providerType.toLowerCase()) {
        case 'aws':
          client = await this.initializeAWS(credentials);
          break;
        case 'azure':
          client = await this.initializeAzure(credentials);
          break;
        case 'gcp':
          client = await this.initializeGCP(credentials);
          break;
        case 'digitalocean':
          client = await this.initializeDigitalOcean(credentials);
          break;
        default:
          throw new Error(`Unsupported provider: ${providerType}`);
      }

      this.providers.set(cacheKey, {
        type: providerType,
        client,
        userId,
        lastConnected: new Date(),
        isHealthy: true
      });

      // Store encrypted credentials in database
      await database.storeCloudCredentials(userId, providerType, credentials);

      console.log(`${providerType} provider initialized for user ${userId}`);
      return { success: true, provider: providerType };
    } catch (error) {
      console.error(`Failed to initialize ${providerType} provider:`, error);
      throw new Error(`Failed to connect to ${providerType}: ${error.message}`);
    }
  }

  async initializeAWS(credentials) {
    const { accessKeyId, secretAccessKey, region = 'us-east-1' } = credentials;
    
    const awsConfig = {
      accessKeyId,
      secretAccessKey,
      region
    };

    // Update AWS config
    AWS.config.update(awsConfig);

    // Test connection
    const ec2 = new AWS.EC2();
    await ec2.describeRegions().promise();

    return {
      ec2: new AWS.EC2(),
      rds: new AWS.RDS(),
      s3: new AWS.S3(),
      cloudWatch: new AWS.CloudWatch(),
      costExplorer: new AWS.CostExplorer({ region: 'us-east-1' }),
      lambda: new AWS.Lambda(),
      ecs: new AWS.ECS(),
      config: awsConfig
    };
  }

  async initializeAzure(credentials) {
    const { clientId, clientSecret, tenantId, subscriptionId } = credentials;
    
    // Use service principal credentials
    process.env.AZURE_CLIENT_ID = clientId;
    process.env.AZURE_CLIENT_SECRET = clientSecret;
    process.env.AZURE_TENANT_ID = tenantId;

    const credential = new DefaultAzureCredential();
    
    // Test connection
    const resourceClient = new ResourceManagementClient(credential, subscriptionId);
    await resourceClient.resourceGroups.list().next();

    return {
      resourceClient,
      computeClient: new ComputeManagementClient(credential, subscriptionId),
      credential,
      subscriptionId
    };
  }

  async initializeGCP(credentials) {
    const { projectId, keyFile } = credentials;
    
    // Set up authentication
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyFile;

    const compute = new ComputeEngine({
      projectId,
      keyFilename: keyFile
    });

    // Test connection
    await compute.getZones();

    return {
      compute,
      projectId
    };
  }

  async initializeDigitalOcean(credentials) {
    const { apiToken } = credentials;
    
    const client = new DigitalOcean(apiToken);
    
    // Test connection
    await client.account.get();

    return client;
  }

  // Get all resources across providers
  async getAllResources(userId) {
    const allResources = [];
    const userProviders = this.getUserProviders(userId);

    for (const [key, provider] of userProviders) {
      try {
        const resources = await this.getProviderResources(provider);
        allResources.push(...resources);
      } catch (error) {
        console.error(`Failed to get resources from ${provider.type}:`, error);
      }
    }

    return allResources;
  }

  async getProviderResources(provider) {
    switch (provider.type.toLowerCase()) {
      case 'aws':
        return await this.getAWSResources(provider.client);
      case 'azure':
        return await this.getAzureResources(provider.client);
      case 'gcp':
        return await this.getGCPResources(provider.client);
      case 'digitalocean':
        return await this.getDigitalOceanResources(provider.client);
      default:
        return [];
    }
  }

  async getAWSResources(awsClient) {
    const resources = [];

    try {
      // EC2 Instances
      const ec2Response = await awsClient.ec2.describeInstances().promise();
      
      for (const reservation of ec2Response.Reservations) {
        for (const instance of reservation.Instances) {
          resources.push({
            id: instance.InstanceId,
            name: this.getResourceName(instance.Tags) || instance.InstanceId,
            type: 'ec2_instance',
            provider: 'aws',
            region: instance.Placement.AvailabilityZone.slice(0, -1),
            status: instance.State.Name,
            size: instance.InstanceType,
            publicIP: instance.PublicIpAddress,
            privateIP: instance.PrivateIpAddress,
            launchTime: instance.LaunchTime,
            cost: await this.estimateEC2Cost(instance.InstanceType),
            tags: instance.Tags || [],
            monitoring: instance.Monitoring.State === 'enabled',
            encrypted: instance.BlockDeviceMappings?.some(bdm => bdm.Ebs?.Encrypted),
            publicAccess: !!instance.PublicIpAddress
          });
        }
      }

      // RDS Instances
      const rdsResponse = await awsClient.rds.describeDBInstances().promise();
      
      for (const db of rdsResponse.DBInstances) {
        resources.push({
          id: db.DBInstanceIdentifier,
          name: db.DBInstanceIdentifier,
          type: 'rds_instance',
          provider: 'aws',
          region: db.AvailabilityZone?.slice(0, -1) || 'unknown',
          status: db.DBInstanceStatus,
          size: db.DBInstanceClass,
          engine: db.Engine,
          engineVersion: db.EngineVersion,
          cost: await this.estimateRDSCost(db.DBInstanceClass),
          monitoring: db.MonitoringInterval > 0,
          encrypted: db.StorageEncrypted,
          publicAccess: db.PubliclyAccessible
        });
      }

      // S3 Buckets
      const s3Response = await awsClient.s3.listBuckets().promise();
      
      for (const bucket of s3Response.Buckets) {
        try {
          const location = await awsClient.s3.getBucketLocation({ Bucket: bucket.Name }).promise();
          const encryption = await awsClient.s3.getBucketEncryption({ Bucket: bucket.Name }).promise().catch(() => null);
          const acl = await awsClient.s3.getBucketAcl({ Bucket: bucket.Name }).promise();
          
          resources.push({
            id: bucket.Name,
            name: bucket.Name,
            type: 's3_bucket',
            provider: 'aws',
            region: location.LocationConstraint || 'us-east-1',
            status: 'active',
            creationDate: bucket.CreationDate,
            cost: 0, // Would need CloudWatch metrics for accurate cost
            encrypted: !!encryption,
            publicAccess: acl.Grants.some(grant => 
              grant.Grantee.Type === 'Group' && 
              grant.Grantee.URI?.includes('AllUsers')
            )
          });
        } catch (error) {
          console.error(`Error processing S3 bucket ${bucket.Name}:`, error);
        }
      }

    } catch (error) {
      console.error('Error fetching AWS resources:', error);
    }

    return resources;
  }

  async getAzureResources(azureClient) {
    const resources = [];

    try {
      // Virtual Machines
      const vmsIterator = azureClient.computeClient.virtualMachines.listAll();
      
      for await (const vm of vmsIterator) {
        resources.push({
          id: vm.vmId || vm.name,
          name: vm.name,
          type: 'vm',
          provider: 'azure',
          region: vm.location,
          status: vm.provisioningState,
          size: vm.hardwareProfile?.vmSize,
          osType: vm.storageProfile?.osDisk?.osType,
          cost: await this.estimateAzureVMCost(vm.hardwareProfile?.vmSize),
          resourceGroup: vm.id?.split('/')[4],
          monitoring: false, // Would need additional API calls
          encrypted: vm.storageProfile?.osDisk?.encryptionSettings?.enabled,
          publicAccess: false // Would need network interface details
        });
      }

      // Resource Groups
      const resourceGroupsIterator = azureClient.resourceClient.resourceGroups.list();
      
      for await (const rg of resourceGroupsIterator) {
        resources.push({
          id: rg.id,
          name: rg.name,
          type: 'resource_group',
          provider: 'azure',
          region: rg.location,
          status: rg.provisioningState,
          cost: 0
        });
      }

    } catch (error) {
      console.error('Error fetching Azure resources:', error);
    }

    return resources;
  }

  async getGCPResources(gcpClient) {
    const resources = [];

    try {
      // Compute Engine Instances
      const [zones] = await gcpClient.compute.getZones();
      
      for (const zone of zones) {
        try {
          const [vms] = await zone.getVMs();
          
          for (const vm of vms) {
            const [metadata] = await vm.getMetadata();
            
            resources.push({
              id: metadata.id,
              name: metadata.name,
              type: 'compute_instance',
              provider: 'gcp',
              region: zone.name,
              status: metadata.status,
              size: metadata.machineType?.split('/').pop(),
              cost: await this.estimateGCPVMCost(metadata.machineType?.split('/').pop()),
              monitoring: false, // Would need additional API calls
              encrypted: metadata.disks?.some(disk => disk.diskEncryptionKey),
              publicAccess: metadata.networkInterfaces?.some(ni => ni.accessConfigs?.length > 0)
            });
          }
        } catch (error) {
          console.error(`Error processing GCP zone ${zone.name}:`, error);
        }
      }

    } catch (error) {
      console.error('Error fetching GCP resources:', error);
    }

    return resources;
  }

  async getDigitalOceanResources(doClient) {
    const resources = [];

    try {
      // Droplets
      const droplets = await doClient.droplets.getAll();
      
      for (const droplet of droplets.body.droplets) {
        resources.push({
          id: droplet.id.toString(),
          name: droplet.name,
          type: 'droplet',
          provider: 'digitalocean',
          region: droplet.region.name,
          status: droplet.status,
          size: droplet.size.slug,
          cost: droplet.size.price_monthly,
          image: droplet.image.name,
          monitoring: droplet.monitoring,
          encrypted: false, // DigitalOcean doesn't provide this in basic API
          publicAccess: droplet.networks.v4.some(net => net.type === 'public')
        });
      }

      // Volumes
      const volumes = await doClient.volumes.getAll();
      
      for (const volume of volumes.body.volumes) {
        resources.push({
          id: volume.id,
          name: volume.name,
          type: 'volume',
          provider: 'digitalocean',
          region: volume.region.name,
          status: 'active',
          size: `${volume.size_gigabytes}GB`,
          cost: volume.size_gigabytes * 0.10, // $0.10 per GB per month
          attachedTo: volume.droplet_ids
        });
      }

    } catch (error) {
      console.error('Error fetching DigitalOcean resources:', error);
    }

    return resources;
  }

  // Cost estimation helpers
  async estimateEC2Cost(instanceType) {
    const costMap = {
      't2.micro': 8.5,
      't2.small': 17,
      't2.medium': 34,
      't3.micro': 7.6,
      't3.small': 15.2,
      't3.medium': 30.4,
      'm5.large': 70,
      'm5.xlarge': 140,
      'c5.large': 62,
      'c5.xlarge': 124
    };
    
    return costMap[instanceType] || 50; // Default estimate
  }

  async estimateRDSCost(instanceClass) {
    const costMap = {
      'db.t3.micro': 15,
      'db.t3.small': 30,
      'db.t3.medium': 60,
      'db.m5.large': 140,
      'db.m5.xlarge': 280,
      'db.r5.large': 180,
      'db.r5.xlarge': 360
    };
    
    return costMap[instanceClass] || 75;
  }

  async estimateAzureVMCost(vmSize) {
    const costMap = {
      'Standard_B1s': 8,
      'Standard_B1ms': 15,
      'Standard_B2s': 30,
      'Standard_D2s_v3': 70,
      'Standard_D4s_v3': 140,
      'Standard_F2s_v2': 60,
      'Standard_F4s_v2': 120
    };
    
    return costMap[vmSize] || 60;
  }

  async estimateGCPVMCost(machineType) {
    const costMap = {
      'f1-micro': 5,
      'g1-small': 15,
      'n1-standard-1': 25,
      'n1-standard-2': 50,
      'n1-standard-4': 100,
      'e2-micro': 7,
      'e2-small': 14,
      'e2-medium': 28
    };
    
    return costMap[machineType] || 40;
  }

  // Resource management operations
  async createResource(userId, provider, resourceType, config) {
    const providerClient = this.getProviderClient(userId, provider);
    
    if (!providerClient) {
      throw new Error(`Provider ${provider} not configured for user`);
    }

    switch (provider.toLowerCase()) {
      case 'aws':
        return await this.createAWSResource(providerClient.client, resourceType, config);
      case 'azure':
        return await this.createAzureResource(providerClient.client, resourceType, config);
      case 'gcp':
        return await this.createGCPResource(providerClient.client, resourceType, config);
      case 'digitalocean':
        return await this.createDigitalOceanResource(providerClient.client, resourceType, config);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async createAWSResource(awsClient, resourceType, config) {
    switch (resourceType) {
      case 'ec2_instance':
        const params = {
          ImageId: config.imageId || 'ami-0abcdef1234567890',
          InstanceType: config.instanceType || 't3.micro',
          MinCount: 1,
          MaxCount: 1,
          SecurityGroupIds: config.securityGroups || ['sg-default'],
          SubnetId: config.subnetId,
          TagSpecifications: [{
            ResourceType: 'instance',
            Tags: config.tags || [{ Key: 'Name', Value: config.name || 'SirsiNexus-Instance' }]
          }]
        };
        
        const result = await awsClient.ec2.runInstances(params).promise();
        return {
          id: result.Instances[0].InstanceId,
          status: 'launching',
          provider: 'aws'
        };
        
      default:
        throw new Error(`Unsupported AWS resource type: ${resourceType}`);
    }
  }

  async createDigitalOceanResource(doClient, resourceType, config) {
    switch (resourceType) {
      case 'droplet':
        const dropletConfig = {
          name: config.name || 'sirsinexus-droplet',
          region: config.region || 'nyc1',
          size: config.size || 's-1vcpu-1gb',
          image: config.image || 'ubuntu-20-04-x64',
          ssh_keys: config.sshKeys || [],
          backups: config.backups || false,
          ipv6: config.ipv6 || false,
          monitoring: config.monitoring || true
        };
        
        const result = await doClient.droplets.create(dropletConfig);
        return {
          id: result.body.droplet.id.toString(),
          status: 'creating',
          provider: 'digitalocean'
        };
        
      default:
        throw new Error(`Unsupported DigitalOcean resource type: ${resourceType}`);
    }
  }

  async deleteResource(userId, provider, resourceId) {
    const providerClient = this.getProviderClient(userId, provider);
    
    if (!providerClient) {
      throw new Error(`Provider ${provider} not configured for user`);
    }

    switch (provider.toLowerCase()) {
      case 'aws':
        return await this.deleteAWSResource(providerClient.client, resourceId);
      case 'digitalocean':
        return await this.deleteDigitalOceanResource(providerClient.client, resourceId);
      default:
        throw new Error(`Delete operation not implemented for ${provider}`);
    }
  }

  async deleteAWSResource(awsClient, resourceId) {
    // Determine resource type by ID pattern
    if (resourceId.startsWith('i-')) {
      // EC2 Instance
      await awsClient.ec2.terminateInstances({ InstanceIds: [resourceId] }).promise();
      return { status: 'terminating' };
    } else {
      throw new Error(`Cannot determine resource type for ID: ${resourceId}`);
    }
  }

  async deleteDigitalOceanResource(doClient, resourceId) {
    await doClient.droplets.delete(resourceId);
    return { status: 'deleting' };
  }

  // Monitoring and metrics
  async startResourceMonitoring(userId, resourceId) {
    const cacheKey = `${userId}_${resourceId}`;
    
    // Don't start if already monitoring
    if (this.monitoringIntervals.has(cacheKey)) {
      return { status: 'already_monitoring' };
    }

    // Start monitoring interval (every 5 minutes)
    const interval = setInterval(async () => {
      try {
        await this.collectResourceMetrics(userId, resourceId);
      } catch (error) {
        console.error(`Monitoring error for resource ${resourceId}:`, error);
      }
    }, 5 * 60 * 1000);

    this.monitoringIntervals.set(cacheKey, interval);
    
    return { status: 'monitoring_started' };
  }

  async stopResourceMonitoring(userId, resourceId) {
    const cacheKey = `${userId}_${resourceId}`;
    
    if (this.monitoringIntervals.has(cacheKey)) {
      clearInterval(this.monitoringIntervals.get(cacheKey));
      this.monitoringIntervals.delete(cacheKey);
      return { status: 'monitoring_stopped' };
    }
    
    return { status: 'not_monitoring' };
  }

  async collectResourceMetrics(userId, resourceId) {
    // This would collect real metrics from cloud providers
    // For now, simulate some metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      cpu: {
        average: Math.random() * 100,
        max: Math.random() * 100
      },
      memory: {
        average: Math.random() * 100,
        max: Math.random() * 100
      },
      network: {
        inBytes: Math.floor(Math.random() * 1000000),
        outBytes: Math.floor(Math.random() * 1000000),
        latency: Math.random() * 50
      },
      disk: {
        readOps: Math.floor(Math.random() * 1000),
        writeOps: Math.floor(Math.random() * 1000),
        io: Math.random() * 100
      }
    };

    // Store metrics in database
    await database.storeResourceMetrics(userId, resourceId, metrics);

    // Trigger real-time updates via WebSocket
    if (global.webSocketService) {
      global.webSocketService.broadcastInfrastructureUpdate({
        resourceId,
        provider: 'unknown', // Would need to look this up
        type: 'metrics_update',
        data: metrics
      });
    }

    return metrics;
  }

  // Utility methods
  getUserProviders(userId) {
    const userProviders = new Map();
    
    for (const [key, provider] of this.providers) {
      if (key.startsWith(`${userId}_`)) {
        userProviders.set(key, provider);
      }
    }
    
    return userProviders;
  }

  getProviderClient(userId, providerType) {
    const key = `${userId}_${providerType}`;
    return this.providers.get(key) || null;
  }

  getResourceName(tags) {
    if (!tags) return null;
    const nameTag = tags.find(tag => tag.Key === 'Name');
    return nameTag ? nameTag.Value : null;
  }

  // Health checks
  async checkProviderHealth(userId, providerType) {
    const provider = this.getProviderClient(userId, providerType);
    
    if (!provider) {
      return { healthy: false, error: 'Provider not configured' };
    }

    try {
      switch (providerType.toLowerCase()) {
        case 'aws':
          await provider.client.ec2.describeRegions().promise();
          break;
        case 'azure':
          await provider.client.resourceClient.resourceGroups.list().next();
          break;
        case 'gcp':
          await provider.client.compute.getZones();
          break;
        case 'digitalocean':
          await provider.client.account.get();
          break;
      }
      
      provider.isHealthy = true;
      provider.lastConnected = new Date();
      
      return { healthy: true };
    } catch (error) {
      provider.isHealthy = false;
      return { healthy: false, error: error.message };
    }
  }

  // Get cost analysis
  async getCostAnalysis(userId, timeRange = '30d') {
    const userProviders = this.getUserProviders(userId);
    const analysis = {
      totalCost: 0,
      breakdown: {},
      trends: [],
      recommendations: []
    };

    for (const [key, provider] of userProviders) {
      try {
        const providerCosts = await this.getProviderCosts(provider, timeRange);
        analysis.breakdown[provider.type] = providerCosts;
        analysis.totalCost += providerCosts.total;
      } catch (error) {
        console.error(`Failed to get costs for ${provider.type}:`, error);
      }
    }

    return analysis;
  }

  async getProviderCosts(provider, timeRange) {
    // This would integrate with each provider's billing/cost APIs
    // For now, return simulated data
    return {
      total: Math.floor(Math.random() * 1000),
      breakdown: {
        compute: Math.floor(Math.random() * 500),
        storage: Math.floor(Math.random() * 200),
        network: Math.floor(Math.random() * 100),
        other: Math.floor(Math.random() * 200)
      },
      trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
    };
  }

  // Cleanup
  shutdown() {
    console.log('Shutting down cloud provider service...');
    
    // Clear all monitoring intervals
    for (const interval of this.monitoringIntervals.values()) {
      clearInterval(interval);
    }
    
    this.monitoringIntervals.clear();
    this.providers.clear();
    this.resourceCache.clear();
  }
}

module.exports = CloudProviderService;
