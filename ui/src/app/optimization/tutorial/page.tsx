import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Zap, Settings, CheckCircle, Circle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AIAssistantButton from '@/components/ai-assistant/AIAssistantButton';

export const metadata: Metadata = {
  title: 'Optimization Tutorial - SirsiNexus',
  description: 'Step-by-step tutorial for getting started with SirsiNexus platform optimization',
};

export default function OptimizationTutorialPage() {
  const steps = [
    {
      title: "Initial Assessment",
      description: "Analyze your current infrastructure and identify optimization opportunities",
      duration: "15 minutes",
      difficulty: "Beginner",
      completed: true,
      tasks: [
        "Review current resource utilization",
        "Identify performance bottlenecks",
        "Assess cost patterns",
        "Set optimization goals"
      ]
    },
    {
      title: "Configure Optimization Policies",
      description: "Set up automated optimization rules and constraints",
      duration: "20 minutes",
      difficulty: "Beginner",
      completed: true,
      tasks: [
        "Create optimization policy templates",
        "Define resource constraints",
        "Set budget limits",
        "Configure approval workflows"
      ]
    },
    {
      title: "Performance Optimization",
      description: "Implement performance improvements and monitoring",
      duration: "30 minutes",
      difficulty: "Intermediate",
      completed: false,
      tasks: [
        "Enable auto-scaling policies",
        "Optimize database queries",
        "Configure caching strategies",
        "Set performance alerts"
      ]
    },
    {
      title: "Cost Optimization",
      description: "Reduce infrastructure costs while maintaining performance",
      duration: "25 minutes",
      difficulty: "Intermediate",
      completed: false,
      tasks: [
        "Right-size compute instances",
        "Implement scheduled scaling",
        "Optimize storage usage",
        "Configure cost alerts"
      ]
    },
    {
      title: "AI-Driven Optimization",
      description: "Enable advanced AI features for autonomous optimization",
      duration: "20 minutes",
      difficulty: "Advanced",
      completed: false,
      tasks: [
        "Enable predictive analytics",
        "Configure anomaly detection",
        "Set up automated recommendations",
        "Review AI optimization results"
      ]
    },
    {
      title: "Monitoring and Reporting",
      description: "Set up comprehensive monitoring and reporting for optimization results",
      duration: "15 minutes",
      difficulty: "Beginner",
      completed: false,
      tasks: [
        "Configure optimization dashboards",
        "Set up regular reports",
        "Create custom metrics",
        "Enable alerting"
      ]
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

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
                Optimization Tutorial
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete step-by-step guide to optimize your infrastructure for performance and cost efficiency
            </p>
          </div>

          {/* Progress Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Tutorial Progress
              </CardTitle>
              <CardDescription>
                Track your progress through the optimization tutorial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {completedSteps} of {steps.length} steps completed
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(progressPercentage)}% complete
                  </span>
                </div>
                <Progress value={progressPercentage} className="w-full" />
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Completed
                  </div>
                  <div className="flex items-center gap-1">
                    <Circle className="h-4 w-4" />
                    Pending
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tutorial Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <Card key={index} className={`transition-all ${step.completed ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20/50' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 mt-1">
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {step.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(step.difficulty)}>
                        {step.difficulty}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {step.duration}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Tasks:</h4>
                    <ul className="space-y-2">
                      {step.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className={`h-4 w-4 ${step.completed ? 'text-green-500' : 'text-muted-foreground'}`} />
                          <span className={step.completed ? 'text-muted-foreground line-through' : ''}>
                            {task}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {!step.completed && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-900">Next Step:</p>
                            <p className="text-blue-700 dark:text-blue-300 mt-1">
                              Complete the tasks above to proceed with this optimization step. 
                              Use the AI Assistant for guidance on any specific configuration.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Getting Started */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Getting Started
              </CardTitle>
              <CardDescription>
                Prerequisites and initial setup for optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Prerequisites</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Active SirsiNexus account with optimization features enabled</li>
                    <li>• Infrastructure monitoring configured and operational</li>
                    <li>• Basic understanding of your application architecture</li>
                    <li>• Access to cloud provider accounts (if applicable)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Initial Setup Commands</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`# Check optimization feature availability
curl -X GET "https://api.sirsinexus.com/v1/optimization/status" \\
  -H "Authorization: Bearer YOUR_API_TOKEN"

# Initialize optimization workspace
curl -X POST "https://api.sirsinexus.com/v1/optimization/initialize" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"workspace_name": "my-optimization-workspace"}'`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Configuration Template</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "optimization_goals": {
    "primary": "cost_efficiency",
    "secondary": "performance",
    "constraints": {
      "max_monthly_cost_increase": "5%",
      "min_availability": "99.9%",
      "performance_threshold": "p95 < 500ms"
    }
  },
  "scope": {
    "environments": ["production", "staging"],
    "excluded_resources": ["critical-db", "legacy-systems"]
  },
  "automation": {
    "auto_apply": false,
    "approval_required": true,
    "maintenance_windows": ["02:00-04:00 UTC"]
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
              <CardDescription>
                Tips for successful optimization implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Performance Optimization</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Start with non-production environments</li>
                    <li>• Monitor metrics before and after changes</li>
                    <li>• Implement gradual rollouts</li>
                    <li>• Set up automated rollback triggers</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Cost Optimization</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Review cost impacts weekly</li>
                    <li>• Use reserved capacity for stable workloads</li>
                    <li>• Implement tagging for cost allocation</li>
                    <li>• Set up budget alerts and limits</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Resources */}
          <Card className="mt-8">
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
                    <li>• <Link href="/optimization/docs" className="hover:text-foreground">Complete Documentation</Link></li>
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
