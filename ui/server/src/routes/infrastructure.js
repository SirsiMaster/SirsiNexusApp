const express = require('express');
const auth = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();

// Connect cloud provider
router.post('/providers', auth, rateLimit.strict, async (req, res, next) => {
  try {
    const { provider, credentials } = req.body;
    
    if (!provider || !credentials) {
      return res.status(400).json({ 
        error: 'Provider and credentials are required' 
      });
    }

    const supportedProviders = ['aws', 'azure', 'gcp', 'digitalocean'];
    if (!supportedProviders.includes(provider.toLowerCase())) {
      return res.status(400).json({ 
        error: `Unsupported provider. Supported: ${supportedProviders.join(', ')}` 
      });
    }

    const result = await req.app.locals.cloudService.initializeProvider(
      req.user.id, 
      provider, 
      credentials
    );

    // Send notification
    if (req.app.locals.notificationService) {
      await req.app.locals.notificationService.sendNotification(
        req.user.id,
        'infrastructure',
        'Cloud Provider Connected',
        `Successfully connected to ${provider}`,
        { provider },
        req.user
      );
    }

    res.json({
      success: true,
      provider: result.provider,
      message: `Successfully connected to ${provider}`
    });
  } catch (error) {
    next(error);
  }
});

// Get all resources across providers
router.get('/resources', auth, async (req, res, next) => {
  try {
    const resources = await req.app.locals.cloudService.getAllResources(req.user.id);
    
    // Group by provider
    const groupedResources = resources.reduce((acc, resource) => {
      if (!acc[resource.provider]) {
        acc[resource.provider] = [];
      }
      acc[resource.provider].push(resource);
      return acc;
    }, {});

    // Calculate summary statistics
    const summary = {
      total: resources.length,
      byProvider: Object.keys(groupedResources).reduce((acc, provider) => {
        acc[provider] = groupedResources[provider].length;
        return acc;
      }, {}),
      totalCost: resources.reduce((sum, resource) => sum + (resource.cost || 0), 0),
      activeResources: resources.filter(r => ['running', 'active', 'available'].includes(r.status)).length
    };

    res.json({
      success: true,
      resources,
      groupedResources,
      summary
    });
  } catch (error) {
    next(error);
  }
});

// Create new resource
router.post('/resources', auth, rateLimit.strict, async (req, res, next) => {
  try {
    const { provider, resourceType, config } = req.body;
    
    if (!provider || !resourceType || !config) {
      return res.status(400).json({ 
        error: 'Provider, resourceType, and config are required' 
      });
    }

    const result = await req.app.locals.cloudService.createResource(
      req.user.id, 
      provider, 
      resourceType, 
      config
    );

    // Send notification
    if (req.app.locals.notificationService) {
      await req.app.locals.notificationService.sendNotification(
        req.user.id,
        'infrastructure',
        'Resource Created',
        `New ${resourceType} created in ${provider}`,
        { provider, resourceType, resourceId: result.id },
        req.user
      );
    }

    // Broadcast real-time update
    if (req.app.locals.webSocketService) {
      req.app.locals.webSocketService.broadcastInfrastructureUpdate({
        resourceId: result.id,
        provider,
        type: 'resource_created',
        data: result
      });
    }

    res.status(201).json({
      success: true,
      resource: result,
      message: `${resourceType} creation initiated`
    });
  } catch (error) {
    next(error);
  }
});

// Delete resource
router.delete('/resources/:resourceId', auth, rateLimit.strict, async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const { provider } = req.query;
    
    if (!provider) {
      return res.status(400).json({ 
        error: 'Provider query parameter is required' 
      });
    }

    const result = await req.app.locals.cloudService.deleteResource(
      req.user.id, 
      provider, 
      resourceId
    );

    // Send notification
    if (req.app.locals.notificationService) {
      await req.app.locals.notificationService.sendNotification(
        req.user.id,
        'infrastructure',
        'Resource Deleted',
        `Resource ${resourceId} deletion initiated`,
        { provider, resourceId },
        req.user
      );
    }

    // Broadcast real-time update
    if (req.app.locals.webSocketService) {
      req.app.locals.webSocketService.broadcastInfrastructureUpdate({
        resourceId,
        provider,
        type: 'resource_deleted',
        data: result
      });
    }

    res.json({
      success: true,
      status: result.status,
      message: `Resource deletion initiated`
    });
  } catch (error) {
    next(error);
  }
});

// Start monitoring a resource
router.post('/resources/:resourceId/monitor', auth, rateLimit.general, async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    
    const result = await req.app.locals.cloudService.startResourceMonitoring(
      req.user.id, 
      resourceId
    );

    res.json({
      success: true,
      status: result.status,
      message: result.status === 'already_monitoring' 
        ? 'Resource is already being monitored' 
        : 'Resource monitoring started'
    });
  } catch (error) {
    next(error);
  }
});

// Stop monitoring a resource
router.delete('/resources/:resourceId/monitor', auth, rateLimit.general, async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    
    const result = await req.app.locals.cloudService.stopResourceMonitoring(
      req.user.id, 
      resourceId
    );

    res.json({
      success: true,
      status: result.status,
      message: result.status === 'not_monitoring' 
        ? 'Resource was not being monitored' 
        : 'Resource monitoring stopped'
    });
  } catch (error) {
    next(error);
  }
});

// Get resource metrics
router.get('/resources/:resourceId/metrics', auth, async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const { timeRange = '1h' } = req.query;
    
    // Get metrics from database
    const metrics = await req.app.locals.database.getResourceMetrics(
      req.user.id, 
      resourceId, 
      timeRange
    );

    res.json({
      success: true,
      metrics,
      timeRange
    });
  } catch (error) {
    next(error);
  }
});

// Check provider health
router.get('/providers/:provider/health', auth, async (req, res, next) => {
  try {
    const { provider } = req.params;
    
    const health = await req.app.locals.cloudService.checkProviderHealth(
      req.user.id, 
      provider
    );

    res.json({
      success: true,
      provider,
      healthy: health.healthy,
      error: health.error || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Get cost analysis
router.get('/costs', auth, async (req, res, next) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const analysis = await req.app.locals.cloudService.getCostAnalysis(
      req.user.id, 
      timeRange
    );

    res.json({
      success: true,
      analysis,
      timeRange
    });
  } catch (error) {
    next(error);
  }
});

// Get infrastructure overview/dashboard
router.get('/overview', auth, async (req, res, next) => {
  try {
    // Get resources
    const resources = await req.app.locals.cloudService.getAllResources(req.user.id);
    
    // Get cost analysis
    const costAnalysis = await req.app.locals.cloudService.getCostAnalysis(req.user.id);
    
    // Calculate overview statistics
    const overview = {
      totalResources: resources.length,
      activeResources: resources.filter(r => ['running', 'active', 'available'].includes(r.status)).length,
      totalMonthlyCost: costAnalysis.totalCost,
      resourcesByProvider: resources.reduce((acc, resource) => {
        acc[resource.provider] = (acc[resource.provider] || 0) + 1;
        return acc;
      }, {}),
      resourcesByType: resources.reduce((acc, resource) => {
        acc[resource.type] = (acc[resource.type] || 0) + 1;
        return acc;
      }, {}),
      resourcesByRegion: resources.reduce((acc, resource) => {
        acc[resource.region] = (acc[resource.region] || 0) + 1;
        return acc;
      }, {}),
      healthChecks: {
        total: Object.keys(costAnalysis.breakdown).length,
        healthy: Object.keys(costAnalysis.breakdown).length // Simplified
      },
      recentActivity: [] // Would come from activity logs
    };

    res.json({
      success: true,
      overview,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Get available regions for a provider
router.get('/providers/:provider/regions', auth, async (req, res, next) => {
  try {
    const { provider } = req.params;
    
    // This would typically call the cloud provider API
    // For now, return static data
    const regions = {
      aws: [
        { id: 'us-east-1', name: 'US East (N. Virginia)' },
        { id: 'us-west-2', name: 'US West (Oregon)' },
        { id: 'eu-west-1', name: 'Europe (Ireland)' },
        { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)' }
      ],
      azure: [
        { id: 'eastus', name: 'East US' },
        { id: 'westus2', name: 'West US 2' },
        { id: 'westeurope', name: 'West Europe' },
        { id: 'southeastasia', name: 'Southeast Asia' }
      ],
      gcp: [
        { id: 'us-central1', name: 'Iowa' },
        { id: 'us-west1', name: 'Oregon' },
        { id: 'europe-west1', name: 'Belgium' },
        { id: 'asia-southeast1', name: 'Singapore' }
      ],
      digitalocean: [
        { id: 'nyc1', name: 'New York 1' },
        { id: 'nyc3', name: 'New York 3' },
        { id: 'sfo3', name: 'San Francisco 3' },
        { id: 'lon1', name: 'London 1' }
      ]
    };

    res.json({
      success: true,
      provider,
      regions: regions[provider.toLowerCase()] || []
    });
  } catch (error) {
    next(error);
  }
});

// Get available instance types for a provider
router.get('/providers/:provider/instance-types', auth, async (req, res, next) => {
  try {
    const { provider } = req.params;
    
    // This would typically call the cloud provider API
    // For now, return static data
    const instanceTypes = {
      aws: [
        { id: 't3.micro', name: 't3.micro', cpu: '2 vCPU', memory: '1 GB', cost: 7.6 },
        { id: 't3.small', name: 't3.small', cpu: '2 vCPU', memory: '2 GB', cost: 15.2 },
        { id: 't3.medium', name: 't3.medium', cpu: '2 vCPU', memory: '4 GB', cost: 30.4 },
        { id: 'm5.large', name: 'm5.large', cpu: '2 vCPU', memory: '8 GB', cost: 70 }
      ],
      azure: [
        { id: 'Standard_B1s', name: 'Standard B1s', cpu: '1 vCPU', memory: '1 GB', cost: 8 },
        { id: 'Standard_B2s', name: 'Standard B2s', cpu: '2 vCPU', memory: '4 GB', cost: 30 },
        { id: 'Standard_D2s_v3', name: 'Standard D2s v3', cpu: '2 vCPU', memory: '8 GB', cost: 70 }
      ],
      gcp: [
        { id: 'e2-micro', name: 'e2-micro', cpu: '0.25-2 vCPU', memory: '1 GB', cost: 7 },
        { id: 'e2-small', name: 'e2-small', cpu: '0.5-2 vCPU', memory: '2 GB', cost: 14 },
        { id: 'e2-medium', name: 'e2-medium', cpu: '1-2 vCPU', memory: '4 GB', cost: 28 }
      ],
      digitalocean: [
        { id: 's-1vcpu-1gb', name: 'Basic 1GB', cpu: '1 vCPU', memory: '1 GB', cost: 5 },
        { id: 's-1vcpu-2gb', name: 'Basic 2GB', cpu: '1 vCPU', memory: '2 GB', cost: 10 },
        { id: 's-2vcpu-4gb', name: 'Basic 4GB', cpu: '2 vCPU', memory: '4 GB', cost: 20 }
      ]
    };

    res.json({
      success: true,
      provider,
      instanceTypes: instanceTypes[provider.toLowerCase()] || []
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
