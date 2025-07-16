import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Eye, BarChart3, AlertTriangle, Activity, Search, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AIAssistantButton from '@/components/ai-assistant/AIAssistantButton';

export const metadata: Metadata = {
  title: 'Observability Documentation - SirsiNexus',
  description: 'Comprehensive documentation for SirsiNexus monitoring, logging, and observability features',
};

export default function ObservabilityDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/observability" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Observability
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Observability Documentation
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive monitoring, logging, and observability platform for complete system visibility
            </p>
          </div>

          {/* Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Observability Overview
              </CardTitle>
              <CardDescription>
                Understanding the three pillars of observability in SirsiNexus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">The Three Pillars</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <BarChart3 className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-blue-600 mb-2">Metrics</h4>
                    <p className="text-sm text-muted-foreground">
                      Time-series data for performance, resource utilization, and business KPIs
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                    <Database className="h-6 w-6 text-green-600 mb-2" />
                    <h4 className="font-semibold text-green-600 mb-2">Logs</h4>
                    <p className="text-sm text-muted-foreground">
                      Structured and unstructured log data for debugging and analysis
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <Activity className="h-6 w-6 text-purple-600 mb-2" />
                    <h4 className="font-semibold text-purple-600 mb-2">Traces</h4>
                    <p className="text-sm text-muted-foreground">
                      Distributed tracing for understanding request flows and dependencies
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Real-time Monitoring:</strong> Live dashboards with sub-second latency</li>
                  <li>• <strong>AI-Powered Alerting:</strong> Intelligent anomaly detection and smart notifications</li>
                  <li>• <strong>Unified Dashboard:</strong> Single pane of glass for all observability data</li>
                  <li>• <strong>Multi-Cloud Support:</strong> Monitor across AWS, Azure, GCP, and on-premises</li>
                  <li>• <strong>Custom Metrics:</strong> Define and track business-specific KPIs</li>
                  <li>• <strong>Advanced Analytics:</strong> Machine learning insights and trend analysis</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Stack */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monitoring Stack
              </CardTitle>
              <CardDescription>
                Technology stack and integration points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Core Components</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h5 className="font-semibold text-blue-600">Metrics Collection</h5>
                        <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                          <li>• Prometheus for metrics aggregation</li>
                          <li>• Grafana for visualization</li>
                          <li>• Custom collectors for business metrics</li>
                          <li>• OpenTelemetry for standardized collection</li>
                        </ul>
                      </div>

                      <div className="border-l-4 border-green-500 pl-4">
                        <h5 className="font-semibold text-green-600">Log Management</h5>
                        <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                          <li>• Elasticsearch for log storage and search</li>
                          <li>• Logstash for log processing and transformation</li>
                          <li>• Kibana for log analysis and visualization</li>
                          <li>• Fluentd for log shipping and routing</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h5 className="font-semibold text-purple-600">Distributed Tracing</h5>
                        <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                          <li>• Jaeger for trace collection and analysis</li>
                          <li>• OpenTelemetry for trace instrumentation</li>
                          <li>• Zipkin integration for legacy systems</li>
                          <li>• Custom span processors for enrichment</li>
                        </ul>
                      </div>

                      <div className="border-l-4 border-orange-500 pl-4">
                        <h5 className="font-semibold text-orange-600">Alerting & Notification</h5>
                        <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                          <li>• AlertManager for alert routing</li>
                          <li>• AI-powered anomaly detection</li>
                          <li>• Multi-channel notifications (Slack, PagerDuty, etc.)</li>
                          <li>• Intelligent alert correlation and deduplication</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Configuration & Setup</CardTitle>
              <CardDescription>
                How to configure observability for your infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Prometheus Configuration</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'sirsinexus-core'
    static_configs:
      - targets: ['core-engine:8080']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'sirsinexus-agents'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: sirsi-agent`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Grafana Dashboard Configuration</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "dashboard": {
    "title": "SirsiNexus System Overview",
    "panels": [
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(cpu_usage_total[5m])",
            "legendFormat": "{{instance}}"
          }
        ]
      },
      {
        "title": "Memory Usage", 
        "type": "singlestat",
        "targets": [
          {
            "expr": "memory_usage_bytes / memory_total_bytes * 100"
          }
        ]
      }
    ]
  }
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Log Configuration</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`# fluent.conf
<source>
  @type tail
  path /var/log/sirsinexus/*.log
  pos_file /var/log/fluentd/sirsinexus.log.pos
  tag sirsinexus.*
  format json
  time_key timestamp
  time_format %Y-%m-%dT%H:%M:%S.%NZ
</source>

<filter sirsinexus.**>
  @type parser
  key_name message
  <parse>
    @type json
  </parse>
</filter>

<match sirsinexus.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name sirsinexus-logs
  type_name _doc
</match>`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerting Rules */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alerting & Notifications
              </CardTitle>
              <CardDescription>
                Intelligent alerting with AI-powered anomaly detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Alert Rules Example</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`groups:
- name: sirsinexus.rules
  rules:
  - alert: HighCPUUsage
    expr: cpu_usage_percent > 80
    for: 5m
    labels:
      severity: warning
      component: infrastructure
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is {{ $value }}% on {{ $labels.instance }}"

  - alert: MemoryLeak
    expr: increase(memory_usage_bytes[1h]) > 1073741824
    for: 10m
    labels:
      severity: critical
      component: application
    annotations:
      summary: "Potential memory leak detected"
      description: "Memory usage increased by {{ $value }} bytes in the last hour"

  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
      component: service
    annotations:
      summary: "Service is down"
      description: "{{ $labels.job }} service is not responding"`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">AI-Powered Anomaly Detection</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Adaptive Thresholds</h5>
                      <p className="text-sm text-muted-foreground">
                        Machine learning algorithms automatically adjust alert thresholds based on historical patterns,
                        reducing false positives and improving signal-to-noise ratio.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">Pattern Recognition</h5>
                      <p className="text-sm text-muted-foreground">
                        AI identifies complex patterns and correlations across multiple metrics to detect anomalies
                        that traditional rule-based systems might miss.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                      <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Predictive Alerting</h5>
                      <p className="text-sm text-muted-foreground">
                        Forecast potential issues before they occur based on trending data and historical incidents,
                        enabling proactive resolution.
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
                Observability API endpoints for custom integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">GET /api/metrics</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">POST /api/metrics/custom</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">GET /api/logs/search</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">GET /api/traces/&#123;traceId&#125;</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">POST /api/alerts/rules</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">GET /api/dashboards</code>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
              <CardDescription>
                Recommendations for effective observability implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-700 dark:text-green-300">Monitoring Best Practices</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                      <li>✓ Monitor the four golden signals (latency, traffic, errors, saturation)</li>
                      <li>✓ Set up Service Level Objectives (SLOs)</li>
                      <li>✓ Use appropriate metric aggregation intervals</li>
                      <li>✓ Implement effective alert routing and escalation</li>
                      <li>✓ Create runbooks for common alerts</li>
                      <li>✓ Monitor your monitoring system</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300">Logging Best Practices</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                      <li>✓ Use structured logging with consistent formats</li>
                      <li>✓ Include correlation IDs for request tracing</li>
                      <li>✓ Set appropriate log levels and retention policies</li>
                      <li>✓ Implement log sampling for high-volume systems</li>
                      <li>✓ Use centralized logging for distributed systems</li>
                      <li>✓ Ensure logs contain actionable information</li>
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
                    <li>• <Link href="/observability/tutorial" className="hover:text-foreground">Observability Tutorial</Link></li>
                    <li>• <Link href="/observability/faq" className="hover:text-foreground">Frequently Asked Questions</Link></li>
                    <li>• <Link href="/observability/ai-guide" className="hover:text-foreground">AI Monitoring Guide</Link></li>
                    <li>• <Link href="/analytics/docs" className="hover:text-foreground">Analytics Integration</Link></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Related Features</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <Link href="/analytics" className="hover:text-foreground">Analytics & Insights</Link></li>
                    <li>• <Link href="/security" className="hover:text-foreground">Security Monitoring</Link></li>
                    <li>• <Link href="/agents" className="hover:text-foreground">Agent Monitoring</Link></li>
                    <li>• <Link href="/optimization" className="hover:text-foreground">Performance Optimization</Link></li>
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
