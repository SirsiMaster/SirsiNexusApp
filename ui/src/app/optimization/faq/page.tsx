'use client';

import Link from 'next/link';
import { ArrowLeft, TrendingUp, HelpCircle, Zap, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import AIAssistantButton from '@/components/ai-assistant/AIAssistantButton';

export default function OptimizationFAQPage() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (categoryIndex: number, faqIndex: number) => {
    const key = `${categoryIndex}-${faqIndex}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const faqs = [
    {
      category: "General",
      questions: [
        {
          question: "What is platform optimization in SirsiNexus?",
          answer: "Platform optimization in SirsiNexus refers to the automated process of improving system performance, reducing costs, and enhancing resource utilization across your infrastructure. It includes performance tuning, cost management, resource right-sizing, and intelligent workload distribution."
        },
        {
          question: "How does AI-driven optimization work?",
          answer: "Our AI optimization engine analyzes historical usage patterns, current workload metrics, and infrastructure performance to make intelligent recommendations. It can automatically adjust resource allocation, predict scaling needs, and optimize configurations based on machine learning models trained on best practices and your specific usage patterns."
        },
        {
          question: "What types of optimization are supported?",
          answer: "SirsiNexus supports multiple optimization types: Performance optimization (CPU, memory, network), Cost optimization (right-sizing, reserved capacity), Security optimization (compliance without performance impact), Database optimization (query tuning, indexing), and Application optimization (caching, code analysis)."
        }
      ]
    },
    {
      category: "Performance",
      questions: [
        {
          question: "How quickly will I see performance improvements?",
          answer: "Basic optimizations typically show results within 15-30 minutes. Complex optimizations involving infrastructure changes may take 2-6 hours. The AI engine provides real-time feedback and incremental improvements, with major optimizations scheduled during maintenance windows."
        },
        {
          question: "Can optimization cause downtime?",
          answer: "Standard optimizations are designed to be zero-downtime. However, significant infrastructure changes (like instance type changes) may require brief maintenance windows. The system always provides advance notice and can be configured to only perform non-disruptive optimizations automatically."
        },
        {
          question: "What metrics are used for optimization decisions?",
          answer: "The optimization engine considers CPU utilization, memory usage, network throughput, disk I/O, response times, error rates, cost per operation, user satisfaction scores, and custom business metrics you define. All decisions are based on multi-dimensional analysis of these metrics."
        }
      ]
    },
    {
      category: "Cost Management",
      questions: [
        {
          question: "How much can I expect to save with optimization?",
          answer: "Cost savings vary by workload, but typical customers see 20-40% reduction in infrastructure costs within the first 3 months. The system provides detailed cost projections and ROI analysis before implementing any optimization strategies."
        },
        {
          question: "Does optimization work with existing cloud commitments?",
          answer: "Yes, the optimization engine is aware of your existing reserved instances, committed use discounts, and other cloud commitments. It optimizes within these constraints and can recommend when to make additional commitments for further savings."
        },
        {
          question: "Can I set budget limits for optimization changes?",
          answer: "Absolutely. You can set monthly budget limits, cost increase thresholds, and approval workflows for optimizations that exceed certain cost impacts. The system will always respect your budget constraints while maximizing efficiency within those limits."
        }
      ]
    },
    {
      category: "Configuration",
      questions: [
        {
          question: "How do I configure optimization policies?",
          answer: "Optimization policies are configured through the web interface or API. You can set optimization goals (performance vs. cost), define constraints (budget limits, maintenance windows), specify which resources to include/exclude, and set approval workflows for different types of changes."
        },
        {
          question: "Can I exclude certain resources from optimization?",
          answer: "Yes, you can exclude specific resources, resource groups, or entire environments from optimization. This is useful for production-critical systems, compliance-sensitive workloads, or resources with specific configuration requirements."
        },
        {
          question: "How do I rollback optimization changes?",
          answer: "All optimization changes include automatic rollback capabilities. You can configure automatic rollback triggers (performance degradation, error rate increases) or manually rollback changes through the interface. The system maintains configuration snapshots for quick restoration."
        }
      ]
    },
    {
      category: "Integration",
      questions: [
        {
          question: "Does optimization work with my existing monitoring tools?",
          answer: "Yes, SirsiNexus optimization integrates with popular monitoring tools like Prometheus, Grafana, DataDog, New Relic, and others. It can consume metrics from these tools and coordinate optimization decisions with your existing observability stack."
        },
        {
          question: "Can I use optimization with multi-cloud deployments?",
          answer: "Absolutely. The optimization engine is cloud-agnostic and can optimize across AWS, Azure, GCP, and on-premises infrastructure simultaneously. It considers inter-cloud data transfer costs and compliance requirements when making optimization decisions."
        },
        {
          question: "How does optimization work with CI/CD pipelines?",
          answer: "Optimization can be integrated into CI/CD pipelines through APIs and webhooks. It can optimize staging environments for cost, production environments for performance, and provide optimization recommendations as part of deployment reviews."
        }
      ]
    },
    {
      category: "Security & Compliance",
      questions: [
        {
          question: "Are optimization changes audited?",
          answer: "Yes, all optimization decisions and changes are fully audited. The system logs what changes were made, why they were made, who approved them (if applicable), and the results. These logs are available for compliance reporting and security reviews."
        },
        {
          question: "Can optimization impact security configurations?",
          answer: "Optimization respects all security boundaries and compliance requirements. It will not modify security groups, encryption settings, or access controls. Security optimization focuses on improving security posture without compromising performance or availability."
        },
        {
          question: "How is data privacy maintained during optimization?",
          answer: "The optimization engine analyzes metadata and performance metrics only - never application data. All optimization decisions are based on resource utilization patterns and performance characteristics, not sensitive business data."
        }
      ]
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
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Optimization FAQ
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Frequently asked questions about platform optimization features and best practices
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-6">
            {faqs.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category.category === 'General' && <Settings className="h-5 w-5" />}
                    {category.category === 'Performance' && <Zap className="h-5 w-5" />}
                    {category.category === 'Cost Management' && <TrendingUp className="h-5 w-5" />}
                    {category.category === 'Configuration' && <Settings className="h-5 w-5" />}
                    {category.category === 'Integration' && <Settings className="h-5 w-5" />}
                    {category.category === 'Security & Compliance' && <Settings className="h-5 w-5" />}
                    {category.category}
                  </CardTitle>
                  <CardDescription>
                    Common questions about {category.category.toLowerCase()} optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.questions.map((faq, faqIndex) => {
                      const key = `${categoryIndex}-${faqIndex}`;
                      const isOpen = openItems[key];
                      return (
                        <div key={faqIndex}>
                          <button
                            onClick={() => toggleItem(categoryIndex, faqIndex)}
                            className="w-full text-left"
                          >
                            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
                              <h3 className="font-medium">{faq.question}</h3>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </button>
                          {isOpen && (
                            <div className="p-4 pt-0">
                              <p className="text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Links */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
              <CardDescription>
                Additional resources and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Documentation</h4>
                  <div className="space-y-2">
                    <Link href="/optimization/docs" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-300">
                      <Badge variant="outline">Docs</Badge>
                      Complete Optimization Guide
                    </Link>
                    <Link href="/optimization/tutorial" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-300">
                      <Badge variant="outline">Tutorial</Badge>
                      Step-by-step Tutorial
                    </Link>
                    <Link href="/optimization/ai-guide" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-300">
                      <Badge variant="outline">AI Guide</Badge>
                      AI Optimization Guide
                    </Link>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Related Features</h4>
                  <div className="space-y-2">
                    <Link href="/analytics" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-300">
                      <Badge variant="outline">Analytics</Badge>
                      Performance Analytics
                    </Link>
                    <Link href="/scaling" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-300">
                      <Badge variant="outline">Scaling</Badge>
                      Auto-scaling Features
                    </Link>
                    <Link href="/observability" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-300">
                      <Badge variant="outline">Monitoring</Badge>
                      Observability Tools
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Still have questions?</strong> Use the AI Assistant below or contact our support team 
                  for personalized help with your optimization needs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <AIAssistantButton />
      </div>
    </div>
  );
}
