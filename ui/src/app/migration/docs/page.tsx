'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Book, 
  Settings, 
  Zap, 
  Shield, 
  Globe, 
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  ExternalLink,
  Code,
  Database,
  Cloud,
  Monitor
} from 'lucide-react';

const documentationSections = [
  { id: 'overview', name: 'Overview', icon: FileText },
  { id: 'architecture', name: 'Architecture', icon: Settings },
  { id: 'features', name: 'Features', icon: Zap },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'api', name: 'API Reference', icon: Code },
  { id: 'dependencies', name: 'Dependencies', icon: Database },
  { id: 'deployment', name: 'Deployment', icon: Cloud },
  { id: 'monitoring', name: 'Monitoring', icon: Monitor }
];

export default function MigrationDocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Migration Wizard Overview</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                The Migration Wizard is a comprehensive tool that guides users through cloud migration 
                processes with AI-powered planning, automated discovery, and intelligent recommendations.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-blue-900">Key Benefits</h3>
              </div>
              <ul className="space-y-2 text-blue-800 dark:text-blue-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Reduces migration time by up to 70%
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  AI-powered cost optimization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Automated security compliance checking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Zero-downtime migration strategies
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Migration Process Flow</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { step: 1, title: 'Discovery', desc: 'Automated infrastructure scanning' },
                  { step: 2, title: 'Planning', desc: 'AI-powered migration strategy' },
                  { step: 3, title: 'Execution', desc: 'Monitored migration process' },
                  { step: 4, title: 'Validation', desc: 'Post-migration verification' }
                ].map((item) => (
                  <div key={item.step} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-emerald-600 mb-2">Step {item.step}</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{item.title}</div>
                    <div className="text-gray-600 dark:text-gray-400">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Version Information</h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <table className="w-full">
                  <tbody className="space-y-2">
                    <tr>
                      <td className="font-semibold text-gray-900 dark:text-gray-100 pr-4">Current Version:</td>
                      <td className="text-gray-600 dark:text-gray-400">v2.1.0</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-gray-900 dark:text-gray-100 pr-4">Last Updated:</td>
                      <td className="text-gray-600 dark:text-gray-400">January 6, 2025</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-gray-900 dark:text-gray-100 pr-4">Compatibility:</td>
                      <td className="text-gray-600 dark:text-gray-400">AWS, Azure, GCP, Multi-cloud</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-gray-900 dark:text-gray-100 pr-4">Phase:</td>
                      <td className="text-gray-600 dark:text-gray-400">Phase 1 (Stable)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'architecture':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Architecture</h2>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">System Architecture</h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                <div className="text-gray-600 dark:text-gray-400 mb-4">[Architecture Diagram]</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Interactive architecture diagram showing Migration Wizard components
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Core Components</h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Discovery Engine</li>
                  <li>• Planning AI</li>
                  <li>• Execution Engine</li>
                  <li>• Validation Service</li>
                  <li>• Rollback Manager</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">External Integrations</h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Cloud Provider APIs</li>
                  <li>• Container Orchestrators</li>
                  <li>• CI/CD Pipelines</li>
                  <li>• Monitoring Systems</li>
                  <li>• Security Scanners</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-amber-600" />
                <h3 className="text-xl font-semibold text-amber-900">Technical Requirements</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-amber-800">
                <div>
                  <h4 className="font-semibold mb-2">Minimum Requirements</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 4 CPU cores</li>
                    <li>• 8GB RAM</li>
                    <li>• 100GB storage</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recommended</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 8 CPU cores</li>
                    <li>• 16GB RAM</li>
                    <li>• 500GB SSD</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Network</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 1Gbps bandwidth</li>
                    <li>• Low latency</li>
                    <li>• Secure connections</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Features</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                {
                  title: 'AI-Powered Discovery',
                  description: 'Automatically discover and analyze your infrastructure',
                  features: [
                    'Network topology mapping',
                    'Application dependency analysis',
                    'Performance baseline establishment',
                    'Security vulnerability assessment'
                  ]
                },
                {
                  title: 'Intelligent Planning',
                  description: 'AI creates optimized migration strategies',
                  features: [
                    'Cost optimization recommendations',
                    'Timeline estimation',
                    'Risk assessment',
                    'Resource right-sizing'
                  ]
                },
                {
                  title: 'Automated Execution',
                  description: 'Execute migrations with minimal manual intervention',
                  features: [
                    'Zero-downtime strategies',
                    'Real-time progress tracking',
                    'Automatic rollback triggers',
                    'Health monitoring'
                  ]
                },
                {
                  title: 'Validation & Testing',
                  description: 'Comprehensive post-migration validation',
                  features: [
                    'Performance validation',
                    'Functional testing',
                    'Security compliance',
                    'Data integrity checks'
                  ]
                }
              ].map((section, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{section.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{section.description}</p>
                  <ul className="space-y-2">
                    {section.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Security</h2>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-red-600" />
                <h3 className="text-xl font-semibold text-red-900">Security Features</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-red-900 mb-3">Data Protection</h4>
                  <ul className="space-y-2 text-red-800 dark:text-red-300">
                    <li>• End-to-end encryption</li>
                    <li>• Data anonymization</li>
                    <li>• Secure key management</li>
                    <li>• GDPR compliance</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-900 mb-3">Access Control</h4>
                  <ul className="space-y-2 text-red-800 dark:text-red-300">
                    <li>• Multi-factor authentication</li>
                    <li>• Role-based permissions</li>
                    <li>• Audit logging</li>
                    <li>• Session management</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Compliance Standards</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['SOC 2', 'ISO 27001', 'GDPR', 'HIPAA'].map((standard) => (
                  <div key={standard} className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{standard}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">API Reference</h2>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">REST API Endpoints</h3>
              <div className="space-y-4">
                {[
                  { method: 'POST', endpoint: '/api/migration/discover', description: 'Start infrastructure discovery' },
                  { method: 'GET', endpoint: '/api/migration/plan/{id}', description: 'Get migration plan details' },
                  { method: 'POST', endpoint: '/api/migration/execute', description: 'Execute migration plan' },
                  { method: 'GET', endpoint: '/api/migration/status/{id}', description: 'Get migration status' }
                ].map((api, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className={`px-3 py-1 rounded text-sm font-mono ${
                      api.method === 'GET' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    }`}>
                      {api.method}
                    </span>
                    <code className="font-mono text-gray-900 dark:text-gray-100">{api.endpoint}</code>
                    <span className="text-gray-600 dark:text-gray-400 ml-auto">{api.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Authentication</h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <code className="text-sm">
                  Authorization: Bearer {'{'}your-jwt-token{'}'}
                </code>
              </div>
            </div>
          </div>
        );

      case 'dependencies':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Dependencies</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Core Dependencies</h3>
                <div className="space-y-3">
                  {[
                    { name: 'SirsiNexus Core Engine', version: 'v2.1.0', status: 'Required' },
                    { name: 'Agent Manager', version: 'v1.8.2', status: 'Required' },
                    { name: 'Analytics Engine', version: 'v1.5.1', status: 'Optional' }
                  ].map((dep, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{dep.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{dep.version}</div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        dep.status === 'Required' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      }`}>
                        {dep.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">External Services</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Cloud Provider APIs', type: 'Integration' },
                    { name: 'Kubernetes API', type: 'Orchestration' },
                    { name: 'Prometheus', type: 'Monitoring' }
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{service.name}</div>
                      <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                        {service.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'deployment':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Deployment</h2>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Deployment Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Docker', desc: 'Container deployment', cmd: 'docker run sirsi/migration:latest' },
                  { title: 'Kubernetes', desc: 'Orchestrated deployment', cmd: 'kubectl apply -f migration.yaml' },
                  { title: 'Helm', desc: 'Package manager', cmd: 'helm install migration sirsi/migration' }
                ].map((option, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{option.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{option.desc}</p>
                    <code className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded block">{option.cmd}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Configuration</h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <pre className="text-sm overflow-x-auto">
{`# migration-config.yaml
migration:
  discovery:
    enabled: true
    scanInterval: "24h"
  planning:
    aiEnabled: true
    optimizationLevel: "aggressive"
  execution:
    parallelism: 4
    rollbackEnabled: true`}
                </pre>
              </div>
            </div>
          </div>
        );

      case 'monitoring':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Monitoring</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Metrics</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Migration success rate</li>
                  <li>• Average migration time</li>
                  <li>• Resource utilization</li>
                  <li>• Error rates</li>
                  <li>• Performance baselines</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Alerts</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Migration failures</li>
                  <li>• Performance degradation</li>
                  <li>• Security violations</li>
                  <li>• Resource exhaustion</li>
                  <li>• Compliance issues</li>
                </ul>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Dashboard</h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Interactive monitoring dashboard with real-time migration metrics
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Migration Wizard Documentation</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Complete technical documentation and specifications
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <ExternalLink className="h-4 w-4" />
                Open API
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Documentation</h3>
              <ul className="space-y-2">
                {documentationSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {section.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
