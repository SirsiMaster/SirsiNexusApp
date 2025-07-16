import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Brain, Zap, Settings, AlertCircle, Target, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AIAssistantButton from '@/components/ai-assistant/AIAssistantButton';

export const metadata: Metadata = {
  title: 'AI-Powered Optimization Guide - SirsiNexus',
  description: 'Comprehensive guide to AI-driven optimization features and autonomous infrastructure management',
};

export default function OptimizationAIGuidePage() {
  const aiFeatures = [
    {
      title: "Predictive Scaling",
      description: "AI predicts traffic patterns and scales resources before demand spikes",
      icon: <Target className="h-5 w-5" />,
      capabilities: [
        "Historical pattern analysis",
        "Seasonal trend detection",
        "Event-based scaling predictions",
        "Multi-metric forecasting"
      ],
      accuracy: "94%",
      savings: "35%"
    },
    {
      title: "Cost Optimization AI",
      description: "Intelligent cost reduction through automated resource right-sizing",
      icon: <BarChart3 className="h-5 w-5" />,
      capabilities: [
        "Resource utilization analysis",
        "Right-sizing recommendations",
        "Reserved capacity optimization",
        "Waste elimination detection"
      ],
      accuracy: "89%",
      savings: "42%"
    },
    {
      title: "Performance Intelligence",
      description: "AI-driven performance optimization and bottleneck identification",
      icon: <Zap className="h-5 w-5" />,
      capabilities: [
        "Bottleneck root cause analysis",
        "Performance anomaly detection",
        "Optimization priority ranking",
        "Impact prediction modeling"
      ],
      accuracy: "91%",
      savings: "28%"
    },
    {
      title: "Autonomous Configuration",
      description: "Self-tuning system configurations based on workload patterns",
      icon: <Settings className="h-5 w-5" />,
      capabilities: [
        "Parameter auto-tuning",
        "Configuration drift detection",
        "Best practice enforcement",
        "Change impact assessment"
      ],
      accuracy: "87%",
      savings: "22%"
    }
  ];

  const optimizationStrategies = [
    {
      category: "Reactive Optimization",
      description: "Responds to current system state and immediate needs",
      examples: [
        "Scale up when CPU > 80%",
        "Add memory when usage > 90%",
        "Migrate hot data to faster storage"
      ],
      pros: ["Simple to implement", "Immediate response", "Low complexity"],
      cons: ["Reactive delays", "May miss patterns", "Higher resource usage"]
    },
    {
      category: "Predictive Optimization",
      description: "Uses AI to predict future needs and optimize proactively",
      examples: [
        "Pre-scale for predicted traffic",
        "Cache popular content ahead of time",
        "Optimize queries before peak usage"
      ],
      pros: ["Proactive scaling", "Better performance", "Cost efficient"],
      cons: ["Complex implementation", "Requires training data", "Prediction accuracy dependent"]
    },
    {
      category: "Continuous Optimization",
      description: "Ongoing AI-driven optimization based on real-time learning",
      examples: [
        "Dynamic resource allocation",
        "Real-time configuration tuning",
        "Adaptive caching strategies"
      ],
      pros: ["Always improving", "Adapts to changes", "Maximum efficiency"],
      cons: ["Highest complexity", "Requires robust monitoring", "May introduce instability"]
    }
  ];

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
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI-Powered Optimization
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Harness the power of artificial intelligence for autonomous infrastructure optimization and intelligent resource management
            </p>
          </div>

          {/* AI Features */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {aiFeatures.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white">
                        {feature.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Key Capabilities:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {feature.capabilities.map((capability, capIndex) => (
                          <li key={capIndex}>• {capability}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                          {feature.accuracy} accurate
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Avg. savings</p>
                        <p className="font-semibold text-green-600">{feature.savings}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Optimization Strategies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Optimization Strategies
              </CardTitle>
              <CardDescription>
                Different approaches to AI-driven optimization based on your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {optimizationStrategies.map((strategy, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{strategy.category}</h3>
                        <p className="text-muted-foreground mt-1">{strategy.description}</p>
                      </div>
                      <Badge variant={index === 0 ? "secondary" : index === 1 ? "default" : "destructive"}>
                        {index === 0 ? "Basic" : index === 1 ? "Advanced" : "Expert"}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Examples:</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {strategy.examples.map((example, exIndex) => (
                            <li key={exIndex}>• {example}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-300">Pros:</h4>
                        <ul className="space-y-1 text-sm text-green-600">
                          {strategy.pros.map((pro, proIndex) => (
                            <li key={proIndex}>✓ {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-orange-700">Considerations:</h4>
                        <ul className="space-y-1 text-sm text-orange-600">
                          {strategy.cons.map((con, conIndex) => (
                            <li key={conIndex}>⚠ {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Model Configuration */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Model Configuration
              </CardTitle>
              <CardDescription>
                Configure AI optimization models for your specific environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Training Data Requirements</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-medium">Minimum Dataset:</h5>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• 30 days of historical metrics</li>
                        <li>• Resource utilization data</li>
                        <li>• Performance benchmarks</li>
                        <li>• Cost data (if available)</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium">Optimal Dataset:</h5>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• 90+ days of comprehensive data</li>
                        <li>• Multiple seasonal cycles</li>
                        <li>• Business event correlations</li>
                        <li>• External factor data</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Model Configuration Example</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "ai_optimization": {
    "model_type": "ensemble",
    "prediction_horizon": "24h",
    "confidence_threshold": 0.85,
    "learning_rate": "adaptive",
    "features": {
      "resource_metrics": true,
      "seasonal_patterns": true,
      "business_events": true,
      "external_factors": false
    },
    "optimization_targets": {
      "primary": "cost_efficiency",
      "secondary": "performance",
      "constraints": {
        "max_cost_increase": 5,
        "min_availability": 99.9
      }
    },
    "auto_retrain": {
      "enabled": true,
      "frequency": "weekly",
      "drift_threshold": 0.1
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>AI Optimization Best Practices</CardTitle>
              <CardDescription>
                Guidelines for successful AI-driven optimization implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-700 dark:text-green-300">Do's</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground mt-2">
                      <li>✓ Start with non-critical environments</li>
                      <li>✓ Monitor AI decisions closely initially</li>
                      <li>✓ Set conservative limits for autonomous actions</li>
                      <li>✓ Maintain human oversight for major changes</li>
                      <li>✓ Regularly validate AI recommendations</li>
                      <li>✓ Keep training data current and clean</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-red-700 dark:text-red-300">Don'ts</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground mt-2">
                      <li>✗ Enable full automation without testing</li>
                      <li>✗ Ignore AI confidence scores</li>
                      <li>✗ Skip regular model retraining</li>
                      <li>✗ Assume AI recommendations are always optimal</li>
                      <li>✗ Neglect edge case handling</li>
                      <li>✗ Disable safety constraints</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">AI Safety Considerations</h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                      Always maintain human oversight for critical systems. The AI provides recommendations 
                      and can automate routine optimizations, but important architectural decisions should 
                      involve human review. Set appropriate confidence thresholds and safety limits.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>AI Performance Metrics</CardTitle>
              <CardDescription>
                Key metrics to monitor AI optimization effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">94.2%</div>
                  <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
                  <div className="text-xs text-green-600 mt-1">↑ 2.1% from last month</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">31%</div>
                  <div className="text-sm text-muted-foreground">Cost Reduction</div>
                  <div className="text-xs text-blue-600 mt-1">↑ 5% from last month</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">12ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                  <div className="text-xs text-purple-600 mt-1">↓ 3ms from last month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Related Resources</CardTitle>
              <CardDescription>
                Additional AI and optimization resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Documentation</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <Link href="/optimization/docs" className="hover:text-foreground">Complete Optimization Guide</Link></li>
                    <li>• <Link href="/optimization/tutorial" className="hover:text-foreground">Step-by-step Tutorial</Link></li>
                    <li>• <Link href="/optimization/faq" className="hover:text-foreground">Frequently Asked Questions</Link></li>
                    <li>• <Link href="/ai-orchestration/docs" className="hover:text-foreground">AI Orchestration</Link></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Related Features</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <Link href="/analytics" className="hover:text-foreground">Analytics & Insights</Link></li>
                    <li>• <Link href="/scaling" className="hover:text-foreground">Auto-scaling</Link></li>
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
