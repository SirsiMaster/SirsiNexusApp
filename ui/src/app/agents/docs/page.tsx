import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Bot, Settings, Zap, Shield, Code, Network } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AIAssistantButton from '@/components/ai-assistant/AIAssistantButton';

export const metadata: Metadata = {
  title: 'Agents Documentation - SirsiNexus',
  description: 'Comprehensive documentation for SirsiNexus autonomous agent management and deployment',
};

export default function AgentsDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/agents" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Agents
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Agents Documentation
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive guide to autonomous agent management, deployment, and orchestration capabilities
            </p>
          </div>

          {/* Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Agent System Overview
              </CardTitle>
              <CardDescription>
                Understanding the autonomous agent architecture and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">What are SirsiNexus Agents?</h3>
                <p className="text-muted-foreground mb-4">
                  SirsiNexus agents are autonomous software entities that can perform infrastructure tasks, 
                  monitor systems, execute workflows, and make decisions based on predefined policies and AI insights.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Autonomous Operation:</strong> Agents work independently with minimal human intervention</li>
                  <li>• <strong>Multi-Cloud Support:</strong> Deploy agents across AWS, Azure, GCP, and on-premises</li>
                  <li>• <strong>AI-Powered:</strong> Leverage machine learning for intelligent decision-making</li>
                  <li>• <strong>Secure Communication:</strong> End-to-end encryption and zero-trust architecture</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Agent Types</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-blue-600 mb-2">Infrastructure Agents</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Resource monitoring and management</li>
                      <li>• Auto-scaling and optimization</li>
                      <li>• Security compliance enforcement</li>
                      <li>• Performance tuning</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-purple-600 mb-2">Workflow Agents</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Task orchestration and execution</li>
                      <li>• Event-driven automation</li>
                      <li>• Integration with external systems</li>
                      <li>• Custom workflow processing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Architecture */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Agent Architecture
              </CardTitle>
              <CardDescription>
                Technical architecture and communication patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Core Components</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Bot className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                      <h5 className="font-semibold">Agent Runtime</h5>
                      <p className="text-xs text-muted-foreground">Execution environment</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Code className="h-6 w-6 mx-auto text-green-600 mb-2" />
                      <h5 className="font-semibold">Task Engine</h5>
                      <p className="text-xs text-muted-foreground">Workflow processing</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Network className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                      <h5 className="font-semibold">Communication Layer</h5>
                      <p className="text-xs text-muted-foreground">Secure messaging</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Communication Protocols</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>gRPC:</strong> High-performance RPC for agent-to-agent communication</li>
                    <li>• <strong>WebSocket:</strong> Real-time bidirectional communication with control plane</li>
                    <li>• <strong>Message Queues:</strong> Asynchronous task distribution and event handling</li>
                    <li>• <strong>REST APIs:</strong> Standard HTTP interfaces for management operations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Deployment */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Agent Deployment
              </CardTitle>
              <CardDescription>
                How to deploy and configure agents across different environments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Deployment Methods</h4>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-semibold text-blue-600">Kubernetes Deployment</h5>
                      <p className="text-sm text-muted-foreground mb-2">Deploy agents as Kubernetes pods with auto-scaling</p>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: sirsi-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sirsi-agent
  template:
    metadata:
      labels:
        app: sirsi-agent
    spec:
      containers:
      - name: agent
        image: sirsinexus/agent:latest
        env:
        - name: AGENT_TYPE
          value: "infrastructure"
        - name: CONTROL_PLANE_URL
          value: "https://control.sirsinexus.com"`}
                      </pre>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-semibold text-green-600">Docker Deployment</h5>
                      <p className="text-sm text-muted-foreground mb-2">Standalone agent deployment using Docker</p>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`docker run -d \\
  --name sirsi-agent \\
  --restart unless-stopped \\
  -e AGENT_TYPE=workflow \\
  -e CONTROL_PLANE_URL=https://control.sirsinexus.com \\
  -e API_KEY=$SIRSI_API_KEY \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  sirsinexus/agent:latest`}
                      </pre>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-semibold text-purple-600">Cloud-Native Deployment</h5>
                      <p className="text-sm text-muted-foreground mb-2">Deploy using cloud provider services</p>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`# AWS ECS Task Definition
{
  "family": "sirsi-agent",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [{
    "name": "agent",
    "image": "sirsinexus/agent:latest",
    "environment": [
      {"name": "AGENT_TYPE", "value": "infrastructure"},
      {"name": "AWS_REGION", "value": "us-west-2"}
    ]
  }]
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
              <CardDescription>
                Detailed configuration options and environment variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Core Configuration</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Variable</th>
                          <th className="text-left p-2">Description</th>
                          <th className="text-left p-2">Default</th>
                          <th className="text-left p-2">Required</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b">
                          <td className="p-2"><code>AGENT_TYPE</code></td>
                          <td className="p-2">Type of agent (infrastructure, workflow, hybrid)</td>
                          <td className="p-2">infrastructure</td>
                          <td className="p-2">No</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2"><code>CONTROL_PLANE_URL</code></td>
                          <td className="p-2">URL of the SirsiNexus control plane</td>
                          <td className="p-2">-</td>
                          <td className="p-2">Yes</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2"><code>API_KEY</code></td>
                          <td className="p-2">Authentication key for control plane</td>
                          <td className="p-2">-</td>
                          <td className="p-2">Yes</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2"><code>LOG_LEVEL</code></td>
                          <td className="p-2">Logging verbosity (debug, info, warn, error)</td>
                          <td className="p-2">info</td>
                          <td className="p-2">No</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Advanced Configuration</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`# agent-config.yaml
agent:
  type: infrastructure
  name: agent-\${HOSTNAME}
  tags:
    environment: production
    region: us-west-2
    
communication:
  control_plane_url: https://control.sirsinexus.com
  heartbeat_interval: 30s
  retry_attempts: 3
  
security:
  tls_enabled: true
  cert_path: /etc/ssl/certs/agent.crt
  key_path: /etc/ssl/private/agent.key
  
monitoring:
  metrics_enabled: true
  metrics_port: 9090
  health_check_port: 8080
  
tasks:
  max_concurrent: 5
  timeout: 300s
  retry_policy:
    max_attempts: 3
    backoff: exponential`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Reference */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>
                Agent management and control API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">GET /api/agents</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">POST /api/agents/deploy</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">GET /api/agents/&#123;id&#125;/status</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">PUT /api/agents/&#123;id&#125;/config</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">POST /api/agents/&#123;id&#125;/tasks</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">DELETE /api/agents/&#123;id&#125;</code>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Best Practices
              </CardTitle>
              <CardDescription>
                Security considerations and operational best practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-700 dark:text-green-300">Security Best Practices</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                      <li>✓ Use TLS encryption for all communications</li>
                      <li>✓ Rotate API keys regularly</li>
                      <li>✓ Implement least-privilege access</li>
                      <li>✓ Monitor agent activities and logs</li>
                      <li>✓ Use network segmentation</li>
                      <li>✓ Keep agent software updated</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300">Operational Best Practices</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                      <li>✓ Deploy agents in high-availability pairs</li>
                      <li>✓ Set appropriate resource limits</li>
                      <li>✓ Configure health checks and monitoring</li>
                      <li>✓ Use blue-green deployment strategies</li>
                      <li>✓ Implement proper error handling</li>
                      <li>✓ Plan for disaster recovery</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Related Resources</CardTitle>
              <CardDescription>
                Additional documentation and learning materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Documentation</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <Link href="/agents/tutorial" className="hover:text-foreground">Agent Tutorial</Link></li>
                    <li>• <Link href="/agents/faq" className="hover:text-foreground">Frequently Asked Questions</Link></li>
                    <li>• <Link href="/agents/ai-guide" className="hover:text-foreground">AI Agent Guide</Link></li>
                    <li>• <Link href="/hypervisor/docs" className="hover:text-foreground">Hypervisor Integration</Link></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Related Features</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <Link href="/ai-orchestration" className="hover:text-foreground">AI Orchestration</Link></li>
                    <li>• <Link href="/security" className="hover:text-foreground">Security & Compliance</Link></li>
                    <li>• <Link href="/observability" className="hover:text-foreground">Monitoring & Observability</Link></li>
                    <li>• <Link href="/hypervisor" className="hover:text-foreground">Hypervisor Control</Link></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <AIAssistantButton />
      </div>
    </div>
  );
}
