'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Server, Database, Cloud, Bot, MessageSquare, 
  Sparkles, CheckCircle, AlertTriangle, Info, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Resource } from '@/types/migration';
import ResourceDependencyGraph from '@/components/ui/resource-dependency-graph';
import { aiService } from '@/lib/ai-services';
import { trackResourceDiscovery, trackUserInteraction } from '@/lib/analytics';

interface ResourceTypeCount {
  type: string;
  count: number;
  icon: React.ElementType;
}

interface PlanStepProps {
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const PlanStep: React.FC<PlanStepProps> = ({ onComplete }) => {
  console.log('PlanStep: Component rendered with onComplete:', onComplete);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [agentMessage, setAgentMessage] = useState('');
  const [discoveryProgress, setDiscoveryProgress] = useState(0);
  const [showAgentChat, setShowAgentChat] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [showErrorResolution, setShowErrorResolution] = useState(false);

  // Comprehensive infrastructure resource types
  const [resourceTypes, setResourceTypes] = useState<ResourceTypeCount[]>([]);

  const agentMessages = [
    'Scanning your cloud infrastructure...',
    'Analyzing AWS resources in us-east-1...',
    'Discovering EC2 instances and databases...',
    'Mapping dependencies and relationships...',
    'Generating migration compatibility matrix...',
    'Discovery complete! Found 23 resources.',
  ];

  const generateComprehensiveResources = () => {
    // Get demo context from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const entity = urlParams.get('entity') || localStorage.getItem('selectedEntity') || 'tvfone';
    const journey = urlParams.get('demo') || localStorage.getItem('selectedJourney') || 'migration';
    
    console.log('Generating resources for:', { entity, journey });
    
    // Generate business-specific and journey-specific resources
    let infrastructureResources: Resource[] = [];
    
    // Base resources that apply to all businesses
    const baseResources: Resource[] = [
      // Compute Resources
      {
        id: 'vm-web-01',
        name: 'web-server-01',
        type: 'compute',
        status: 'not_started',
        metadata: {
          instanceType: 't3.large',
          os: 'Ubuntu 20.04 LTS',
          cpu: '2 vCPU',
          memory: '8GB',
          region: 'us-east-1a',
        },
      },
      {
        id: 'vm-app-01',
        name: 'application-server-cluster',
        type: 'compute',
        status: 'not_started',
        metadata: {
          instanceType: 't3.xlarge',
          count: '3 instances',
          os: 'RHEL 8.4',
          cpu: '4 vCPU each',
          memory: '16GB each',
        },
      },
      // Database Resources
      {
        id: 'db-prod-01',
        name: 'production-database',
        type: 'database',
        status: 'not_started',
        metadata: {
          engine: 'PostgreSQL 13.4',
          size: '250GB',
          connections: '150 max',
          backups: 'Daily automated',
        },
      },
      {
        id: 'db-analytics-01',
        name: 'analytics-warehouse',
        type: 'database',
        status: 'not_started',
        metadata: {
          engine: 'MySQL 8.0',
          size: '1.2TB',
          type: 'Data Warehouse',
          partitions: '24 monthly',
        },
      },
      // Network Infrastructure
      {
        id: 'net-fw-01',
        name: 'main-firewall',
        type: 'network',
        status: 'not_started',
        metadata: {
          type: 'Firewall',
          model: 'Cisco ASA 5515-X',
          rules: '247 active rules',
          zones: 'DMZ, Internal, Management',
        },
      },
      {
        id: 'net-sw-01',
        name: 'core-switch-stack',
        type: 'network',
        status: 'not_started',
        metadata: {
          type: 'Layer 3 Switch',
          model: 'Cisco Catalyst 9300',
          ports: '48 ports active',
          vlans: '12 VLANs configured',
        },
      },
      {
        id: 'net-rt-01',
        name: 'border-router',
        type: 'network',
        status: 'not_started',
        metadata: {
          type: 'Border Router',
          model: 'Cisco ISR 4431',
          interfaces: 'WAN, LAN, DMZ',
          routing: 'BGP, OSPF',
        },
      },
      {
        id: 'net-lb-01',
        name: 'application-load-balancer',
        type: 'network',
        status: 'not_started',
        metadata: {
          type: 'Load Balancer',
          model: 'F5 BigIP LTM',
          pools: '8 server pools',
          ssl: 'SSL offloading enabled',
        },
      },
      // Storage Resources
      {
        id: 'stor-nas-01',
        name: 'file-server-array',
        type: 'storage',
        status: 'not_started',
        metadata: {
          type: 'NAS Storage',
          capacity: '50TB total',
          used: '32TB used (64%)',
          shares: '125 network shares',
        },
      },
      {
        id: 'stor-san-01',
        name: 'database-storage-san',
        type: 'storage',
        status: 'not_started',
        metadata: {
          type: 'SAN Storage',
          capacity: '20TB SSD',
          performance: '50K IOPS',
          redundancy: 'RAID 10',
        },
      },
      // Security & Identity
      {
        id: 'sec-ad-01',
        name: 'active-directory-domain',
        type: 'identity',
        status: 'not_started',
        metadata: {
          type: 'Domain Controller',
          domain: 'company.local',
          users: '1,247 user accounts',
          groups: '89 security groups',
        },
      },
      {
        id: 'sec-ca-01',
        name: 'certificate-authority',
        type: 'security',
        status: 'not_started',
        metadata: {
          type: 'PKI Certificate Authority',
          certificates: '156 active certs',
          templates: '12 cert templates',
          validity: '2-year default',
        },
      },
      // Applications & Services
      {
        id: 'app-email-01',
        name: 'email-server-exchange',
        type: 'application',
        status: 'not_started',
        metadata: {
          type: 'Email Server',
          platform: 'Microsoft Exchange 2019',
          mailboxes: '1,200 mailboxes',
          storage: '2.8TB email data',
        },
      },
      {
        id: 'app-file-01',
        name: 'file-share-server',
        type: 'application',
        status: 'not_started',
        metadata: {
          type: 'File Server',
          platform: 'Windows Server 2019',
          shares: '75 shared folders',
          permissions: 'ACL-based security',
        },
      },
      // User Accounts & Service Accounts
      {
        id: 'usr-batch-01',
        name: 'user-accounts-migration',
        type: 'users',
        status: 'not_started',
        metadata: {
          type: 'User Accounts',
          total: '1,247 user accounts',
          active: '1,156 active users',
          groups: '89 security groups',
          policies: '15 group policies',
        },
      },
      {
        id: 'usr-svc-01',
        name: 'service-accounts',
        type: 'users',
        status: 'not_started',
        metadata: {
          type: 'Service Accounts',
          total: '34 service accounts',
          applications: '23 app services',
          databases: '8 db services',
          scheduled: '12 scheduled tasks',
        },
      },
    ];
    
    // Add business-specific resources based on entity
    if (entity === 'tvfone') {
      // TVfone - Media & Entertainment specific resources
      infrastructureResources.push(
        {
          id: 'media-cdn-01',
          name: 'global-content-delivery',
          type: 'network',
          status: 'not_started',
          metadata: {
            type: 'CDN',
            provider: 'Cloudflare',
            regions: '15 global regions',
            bandwidth: '50 Gbps peak',
            content: '45.7TB cached',
          },
        },
        {
          id: 'media-stream-01',
          name: 'streaming-servers',
          type: 'compute',
          status: 'not_started',
          metadata: {
            type: 'Streaming Infrastructure',
            instances: '12 c5.4xlarge',
            concurrent: '450K users',
            bitrates: '720p, 1080p, 4K',
          },
        },
        {
          id: 'media-ai-01',
          name: 'ai-recommendation-engine',
          type: 'application',
          status: 'not_started',
          metadata: {
            type: 'ML/AI Service',
            framework: 'TensorFlow',
            models: '15 recommendation models',
            processing: '2M recommendations/day',
          },
        },
        {
          id: 'media-content-01',
          name: 'video-content-storage',
          type: 'storage',
          status: 'not_started',
          metadata: {
            type: 'Object Storage',
            capacity: '850TB video content',
            formats: 'MP4, WebM, HLS',
            redundancy: '3x replication',
          },
        }
      );
    } else if (entity === 'kulturio') {
      // Kulturio - Healthcare specific resources
      infrastructureResources.push(
        {
          id: 'health-emr-01',
          name: 'electronic-medical-records',
          type: 'database',
          status: 'not_started',
          metadata: {
            type: 'EMR Database',
            records: '150K patient records',
            compliance: 'HIPAA compliant',
            encryption: 'AES-256 at rest',
          },
        },
        {
          id: 'health-ai-01',
          name: 'skin-analysis-ai',
          type: 'application',
          status: 'not_started',
          metadata: {
            type: 'Medical AI',
            framework: 'PyTorch',
            models: 'Dermatology CNN',
            accuracy: '94.2% diagnosis rate',
          },
        },
        {
          id: 'health-imaging-01',
          name: 'medical-imaging-storage',
          type: 'storage',
          status: 'not_started',
          metadata: {
            type: 'PACS Storage',
            capacity: '12.3TB medical images',
            formats: 'DICOM, JPEG',
            retention: '7 year legal requirement',
          },
        },
        {
          id: 'health-tele-01',
          name: 'telemedicine-platform',
          type: 'application',
          status: 'not_started',
          metadata: {
            type: 'Video Conferencing',
            platform: 'WebRTC',
            concurrent: '500 sessions',
            security: 'End-to-end encrypted',
          },
        }
      );
    } else if (entity === 'uniedu') {
      // UniEdu - Education specific resources
      infrastructureResources.push(
        {
          id: 'edu-sis-01',
          name: 'student-information-system',
          type: 'database',
          status: 'not_started',
          metadata: {
            type: 'SIS Database',
            records: '385K student records',
            compliance: 'FERPA compliant',
            retention: 'Permanent academic records',
          },
        },
        {
          id: 'edu-lms-01',
          name: 'learning-management-system',
          type: 'application',
          status: 'not_started',
          metadata: {
            type: 'LMS Platform',
            platform: 'Moodle',
            courses: '2,500 active courses',
            users: '50K concurrent users',
          },
        },
        {
          id: 'edu-analytics-01',
          name: 'student-analytics-warehouse',
          type: 'database',
          status: 'not_started',
          metadata: {
            type: 'Analytics DB',
            engine: 'PostgreSQL',
            size: '28.5TB data',
            insights: 'Performance analytics',
          },
        },
        {
          id: 'edu-research-01',
          name: 'research-computing-cluster',
          type: 'compute',
          status: 'not_started',
          metadata: {
            type: 'HPC Cluster',
            nodes: '64 compute nodes',
            cores: '2,048 CPU cores',
            memory: '16TB total RAM',
          },
        }
      );
    }
    
    // Add journey-specific resources
    if (journey === 'optimization') {
      infrastructureResources.push(
        {
          id: 'opt-monitor-01',
          name: 'cost-optimization-dashboard',
          type: 'application',
          status: 'not_started',
          metadata: {
            type: 'Monitoring Tool',
            platform: 'Grafana + Prometheus',
            metrics: '500+ cost metrics',
            savings: '$450K identified',
          },
        },
        {
          id: 'opt-rightsizing-01',
          name: 'resource-rightsizing-analysis',
          type: 'application',
          status: 'not_started',
          metadata: {
            type: 'Optimization Engine',
            analysis: 'CPU, Memory, Storage',
            recommendations: '47 rightsizing ops',
            potential: '32% cost reduction',
          },
        }
      );
    } else if (journey === 'scaleUp') {
      infrastructureResources.push(
        {
          id: 'scale-autoscale-01',
          name: 'auto-scaling-groups',
          type: 'compute',
          status: 'not_started',
          metadata: {
            type: 'Auto Scaling',
            min: '2 instances',
            max: '50 instances',
            triggers: 'CPU, Memory, Network',
          },
        },
        {
          id: 'scale-elastic-01',
          name: 'elastic-load-balancers',
          type: 'network',
          status: 'not_started',
          metadata: {
            type: 'Application Load Balancer',
            capacity: '10K RPS peak',
            health: 'Health check enabled',
            ssl: 'SSL termination',
          },
        }
      );
    }
    
    return [...baseResources, ...infrastructureResources];
  };
  
  const handleDiscoveryError = (error: string) => {
    setDiscoveryError(error);
    setShowErrorResolution(true);
    setIsDiscovering(false);
    setAgentMessage('Discovery failed: ' + error);
  };

  const retryDiscovery = () => {
    setDiscoveryError(null);
    setShowErrorResolution(false);
    startDiscovery();
  };

  const bypassDiscovery = () => {
    setDiscoveryError(null);
    setShowErrorResolution(false);
    setIsDiscovering(false);
    
    // Load default mock resources as fallback
    const fallbackResources: Resource[] = [
      {
        id: 'fallback-db-01',
        name: 'fallback-database',
        type: 'database',
        status: 'not_started',
        metadata: {
          engine: 'PostgreSQL 13.4',
          size: '100GB',
          note: 'Manually configured fallback resource',
        },
      },
      {
        id: 'fallback-web-01',
        name: 'fallback-web-server',
        type: 'compute',
        status: 'not_started',
        metadata: {
          instanceType: 't3.medium',
          os: 'Ubuntu 20.04',
          note: 'Manually configured fallback resource',
        },
      },
    ];
    
    setResources(fallbackResources);
    setDiscoveryProgress(100);
    setAgentMessage('Using fallback resource configuration. Discovery bypassed.');
  };

  const startDiscovery = async () => {
    // Clear previous findings
    setResources([]);
    setResourceTypes([]);
    setDiscoveryProgress(0);
    setAgentMessage('');
    setDiscoveryError(null);
    setShowErrorResolution(false);
    
    setIsDiscovering(true);
    setShowAgentChat(true);
    
    // Call backend discovery API
    try {
      setAgentMessage('Connecting to backend discovery service...');
      const response = await fetch('/api/migration/discovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceType: 'hybrid',
          credentials: 'mock-credentials',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Backend discovery service unavailable');
      }
      
      const result = await response.json();
      if (result.success) {
        setAgentMessage('Backend discovery completed successfully!');
        setResources(result.data.resources);
        setResourceTypes(result.data.summary.typeCounts.map((tc: any) => ({
          ...tc,
          icon: {
            Compute: Server,
            Database: Database,
            Network: Cloud,
            Storage: Database,
          }[tc.type] || Server
        })));
        setDiscoveryProgress(100);
        setIsDiscovering(false);
        return;
      }
    } catch (error) {
      console.warn('Backend discovery failed, falling back to mock discovery:', error);
      setAgentMessage('Backend unavailable, using comprehensive mock discovery...');
    }
    
    const comprehensiveMessages = [
      'Initializing comprehensive infrastructure scan...',
      'Scanning network topology and devices...',
      'Discovering compute instances and virtual machines...',
      'Analyzing database systems and storage...',
      'Mapping network infrastructure (routers, switches, firewalls)...',
      'Cataloging user accounts and service identities...',
      'Analyzing applications and services...',
      'Evaluating security infrastructure and certificates...',
      'Compiling dependency mappings...',
      'Generating migration readiness assessment...',
      'Discovery complete! Found comprehensive infrastructure inventory.',
    ];
    
    // Simulate comprehensive discovery with realistic timing
    try {
      for (let i = 0; i < comprehensiveMessages.length; i++) {
        setAgentMessage(comprehensiveMessages[i]);
        setDiscoveryProgress((i + 1) / comprehensiveMessages.length * 100);
        
        // Simulate potential errors during discovery
        if (i === 3 && Math.random() < 0.3) { // 30% chance of error on database discovery
          throw new Error('Failed to connect to database servers. Authentication or network issues detected.');
        }
        if (i === 5 && Math.random() < 0.2) { // 20% chance of error on user account discovery
          throw new Error('Active Directory connection timeout. Unable to enumerate user accounts.');
        }
        
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown discovery error occurred.';
      handleDiscoveryError(errorMessage);
      return; // Exit early on error
    }
    
    // Generate comprehensive resource inventory
    const discoveredResources = generateComprehensiveResources();
    
    // Calculate resource type counts
    const typeCounts = discoveredResources.reduce((acc, resource) => {
      const existing = acc.find(item => item.type === resource.type);
      if (existing) {
        existing.count++;
      } else {
        const iconMap: Record<string, React.ElementType> = {
          compute: Server,
          database: Database,
          network: Cloud,
          storage: Database,
          identity: Server,
          security: Server,
          application: Server,
          users: Server,
        };
        acc.push({
          type: resource.type.charAt(0).toUpperCase() + resource.type.slice(1),
          count: 1,
          icon: iconMap[resource.type] || Server,
        });
      }
      return acc;
    }, [] as ResourceTypeCount[]);
    
    setResourceTypes(typeCounts);
    setResources(discoveredResources);
    setIsDiscovering(false);
    
    // Final comprehensive summary
    setTimeout(() => {
      const totalResources = discoveredResources.length;
      setAgentMessage(`Discovery complete! Found ${totalResources} infrastructure components ready for migration analysis. Comprehensive inventory includes compute, network, storage, security, applications, and user accounts.`);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Discovery Section */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-gray-100">Resource Discovery</h3>
        
        <button
          onClick={startDiscovery}
          disabled={isDiscovering}
          className="mb-6 flex items-center rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
        >
          <Search className="mr-2 h-5 w-5" />
          {isDiscovering ? 'Discovering...' : 'Start Discovery'}
        </button>

        {/* Resource Type Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {resourceTypes.map((rt) => (
            <motion.div
              key={rt.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4"
            >
              <div className="flex items-center">
                <rt.icon className="mr-3 h-6 w-6 text-sirsi-500" />
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-gray-100">{rt.type}</p>
                  <p className="text-base text-slate-800 dark:text-gray-300 font-medium">{rt.count} found</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

{/* Resource Dependency Visualization */}
      {resources.length > 0 && (
        <div className="p-6">
          <ResourceDependencyGraph
            resources={resources.map(r => ({
              id: r.id,
              name: r.name,
              type: r.type as 'compute' | 'database' | 'network' | 'storage' | 'security',
              status: 'healthy' as const,
              dependencies: [],
              metadata: r.metadata
            }))}
            showMigrationPath
            onNodeClick={node => trackUserInteraction('resource_node_click', 'ResourceDependencyGraph', { nodeId: node.id, nodeType: node.type })}
          />
        </div>
      )}
      
      {/* Resource List */}
      {resources.length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="mb-4 text-2xl font-bold text-slate-900">Discovered Resources</h3>
          <div className="space-y-2">
            {resources.map((resource) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-gray-100 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">{resource.name}</p>
                    <p className="text-base text-slate-800 font-medium">{resource.type}</p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {Object.entries(resource.metadata).map(([key, value]) => (
                      <p key={key}>
                        {key}: <span className="font-medium">{value}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Agent Chat Interface */}
      <AnimatePresence>
        {showAgentChat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-sirsi-200 bg-sirsi-50 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-sirsi-500 rounded-full">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-sirsi-900">Discovery Agent</h4>
                <p className="text-sm text-sirsi-600">AI-powered infrastructure discovery</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            {isDiscovering && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-sirsi-700">Discovery Progress</span>
                  <span className="text-sm text-sirsi-600">{Math.round(discoveryProgress)}%</span>
                </div>
                <div className="w-full bg-sirsi-200 rounded-full h-2">
                  <motion.div
                    className="bg-sirsi-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${discoveryProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
            
            {/* Agent Message */}
            <motion.div
              key={agentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3"
            >
              <MessageSquare className="h-5 w-5 text-sirsi-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-sirsi-800">{agentMessage}</p>
                {isDiscovering && (
                  <div className="flex items-center space-x-1 mt-2">
                    <RefreshCw className="h-3 w-3 text-sirsi-500 animate-spin" />
                    <span className="text-xs text-sirsi-600">Working...</span>
                  </div>
                )}
                {!isDiscovering && resources.length > 0 && (
                  <div className="flex items-center space-x-1 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700 dark:text-green-300">Discovery completed successfully</span>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Error Resolution */}
            {showErrorResolution && discoveryError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-900">Discovery Error</span>
                </div>
                <p className="text-sm text-red-800 dark:text-red-300 mb-4">{discoveryError}</p>
                <div className="flex space-x-3">
                  <Button
                    onClick={retryDiscovery}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Discovery
                  </Button>
                  <Button
                    onClick={bypassDiscovery}
                    size="sm"
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Use Fallback Configuration
                  </Button>
                </div>
                <div className="mt-3 text-xs text-red-600">
                  <p>• Retry: Attempts discovery again with current settings</p>
                  <p>• Fallback: Uses pre-configured sample resources to continue</p>
                </div>
              </motion.div>
            )}

            {/* Agent Suggestions */}
            {!isDiscovering && resources.length > 0 && !showErrorResolution && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-sirsi-100"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">AI Recommendations</span>
                </div>
                <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <p>• Consider migrating databases first to establish connectivity</p>
                  <p>• Group resources by region to optimize network transfer costs</p>
                  <p>• Schedule migration during low-traffic hours (2-4 AM EST)</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setShowAgentChat(!showAgentChat)}
          className="flex items-center space-x-2"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{showAgentChat ? 'Hide' : 'Show'} Agent Chat</span>
        </Button>
        
        <Button
          onClick={() => {
            alert('BUTTON CLICKED! Continue button is working!');
            console.log('PlanStep: Continue to Requirements clicked');
            console.log('PlanStep: resources count:', resources.length);
            console.log('PlanStep: isDiscovering:', isDiscovering);
            console.log('PlanStep: onComplete function exists:', typeof onComplete === 'function');
            console.log('PlanStep: onComplete function:', onComplete);
            
            // Force completion if discovery is still running or no resources found
            if (isDiscovering || resources.length === 0) {
              console.log('PlanStep: Setting up mock resources for demo');
              const mockResources: Resource[] = [
                {
                  id: '1',
                  name: 'prod-db-01',
                  type: 'database',
                  status: 'not_started',
                  metadata: {
                    engine: 'postgresql',
                    version: '13.4',
                    size: '100GB',
                  },
                },
                {
                  id: '2',
                  name: 'web-server-cluster',
                  type: 'compute',
                  status: 'not_started',
                  metadata: {
                    instanceType: 't3.large',
                    count: '3',
                    os: 'Ubuntu 20.04',
                  },
                }
              ];
              
              setIsDiscovering(false);
              setResources(mockResources);
              setDiscoveryProgress(100);
              setAgentMessage('Discovery complete! Found ' + mockResources.length + ' resources ready for migration.');
            }
            
            // Always call onComplete to proceed
            console.log('PlanStep: Calling onComplete...');
            try {
              const artifact = {
                name: 'Migration Assessment Report',
                type: 'PDF',
                size: '2.4 MB',
                content: `Demo content for Migration Assessment Report.\nTotal Resources: ${resources.length || 2}`
              };
              onComplete(artifact);
              console.log('PlanStep: onComplete called successfully');
            } catch (error) {
              console.error('PlanStep: Error calling onComplete:', error);
            }
          }}
          disabled={false} // Always enabled for demo
          className="bg-sirsi-500 hover:bg-sirsi-600 text-lg px-8 py-4 font-bold"
        >
          Continue to Requirements
        </Button>
      </div>
    </div>
  );
};
