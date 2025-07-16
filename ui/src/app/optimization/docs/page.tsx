import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Settings, Zap, TrendingUp, Shield, Cloud, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AIAssistantButton from '@/components/ai-assistant/AIAssistantButton';

export const metadata: Metadata = {
  title: 'Optimization Documentation - SirsiNexus',
  description: 'Comprehensive documentation for SirsiNexus platform optimization features and capabilities',
};

export default function OptimizationDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/optimization" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Optimization
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Optimization Documentation
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive guide to platform optimization features, performance tuning, and cost management capabilities
            </p>
          </div>

          {/* Core Concepts */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Core Optimization Concepts
              </CardTitle>
              <CardDescription>
                Fundamental principles and approaches for platform optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Performance Optimization</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Resource Allocation:</strong> Dynamic CPU, memory, and storage optimization</li>
                  <li>• <strong>Workload Distribution:</strong> Intelligent load balancing and scaling</li>
                  <li>• <strong>Cache Management:</strong> Multi-layer caching strategies</li>
                  <li>• <strong>Database Tuning:</strong> Query optimization and indexing</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Cost Optimization</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Right-sizing:</strong> Optimal instance and resource sizing</li>
                  <li>• <strong>Auto-scaling:</strong> Demand-based resource allocation</li>
                  <li>• <strong>Reserved Capacity:</strong> Long-term cost reduction strategies</li>
                  <li>• <strong>Waste Elimination:</strong> Idle resource identification and cleanup</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">AI-Driven Optimization</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Predictive Analytics:</strong> Forecasting resource needs</li>
                  <li>• <strong>Anomaly Detection:</strong> Performance issue identification</li>
                  <li>• <strong>Pattern Recognition:</strong> Workload pattern analysis</li>
                  <li>• <strong>Automated Tuning:</strong> Self-optimizing configurations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Optimization Features */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Optimization Features
              </CardTitle>
              <CardDescription>
                Available optimization tools and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Cloud className="h-5 w-5 mt-1 text-blue-500" />
                    <div>
                      <h4 className="font-semibold">Infrastructure Optimization</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatic infrastructure scaling, right-sizing, and resource allocation optimization
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 mt-1 text-green-500" />
                    <div>
                      <h4 className="font-semibold">Database Performance</h4>
                      <p className="text-sm text-muted-foreground">
                        Query optimization, indexing strategies, and connection pooling
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 mt-1 text-purple-500" />
                    <div>
                      <h4 className="font-semibold">Security Optimization</h4>
                      <p className="text-sm text-muted-foreground">
                        Security posture optimization without performance impact
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 mt-1 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">Cost Management</h4>
                      <p className="text-sm text-muted-foreground">
                        Automated cost tracking, budget alerts, and optimization recommendations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 mt-1 text-yellow-500" />
                    <div>
                      <h4 className="font-semibold">Application Performance</h4>
                      <p className="text-sm text-muted-foreground">
                        Code optimization, caching strategies, and performance monitoring
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Settings className="h-5 w-5 mt-1 text-indigo-500" />
                    <div>
                      <h4 className="font-semibold">Configuration Tuning</h4>
                      <p className="text-sm text-muted-foreground">
                        Automated configuration optimization based on workload patterns
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Reference */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>
                Key endpoints for optimization management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">GET /api/optimization/metrics</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">POST /api/optimization/configure</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">PUT /api/optimization/policies</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">GET /api/optimization/recommendations</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">POST /api/optimization/execute</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">DELETE /api/optimization/policies/:id</code>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Examples */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Configuration Examples</CardTitle>
              <CardDescription>
                Sample optimization configurations and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Auto-scaling Policy</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "policy_name": "web_tier_autoscaling",
  "target_resource": "web-servers",
  "min_instances": 2,
  "max_instances": 10,
  "target_cpu_utilization": 70,
  "scale_up_cooldown": 300,
  "scale_down_cooldown": 600,
  "metrics": ["cpu", "memory", "requests_per_second"]
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Cost Optimization Rules</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "cost_optimization": {
    "idle_resource_threshold": "5%",
    "downsize_threshold": "30%",
    "schedule_based_scaling": true,
    "reserved_instance_recommendations": true,
    "budget_alerts": {
      "threshold": 80,
      "notify": ["admin@company.com"]
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Related Resources</CardTitle>
              <CardDescription>
                Additional documentation and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Documentation</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <Link href="/optimization/tutorial" className="hover:text-foreground">Optimization Tutorial</Link></li>
                    <li>• <Link href="/optimization/faq" className="hover:text-foreground">Frequently Asked Questions</Link></li>
                    <li>• <Link href="/optimization/ai-guide" className="hover:text-foreground">AI Optimization Guide</Link></li>
                    <li>• <Link href="/analytics/docs" className="hover:text-foreground">Analytics Integration</Link></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Related Features</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <Link href="/scaling" className="hover:text-foreground">Auto-scaling</Link></li>
                    <li>• <Link href="/analytics" className="hover:text-foreground">Performance Analytics</Link></li>
                    <li>• <Link href="/observability" className="hover:text-foreground">Monitoring & Observability</Link></li>
                    <li>• <Link href="/security" className="hover:text-foreground">Security Optimization</Link></li>
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
