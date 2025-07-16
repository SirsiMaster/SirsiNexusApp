'use client';

import React from 'react';
import { BarChart, ArrowLeft, FileText, Code, Settings } from 'lucide-react';

export default function AnalyticsDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/analytics" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Analytics Dashboard
          </a>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <BarChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Documentation & Technical Specifications</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Documentation Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a href="/analytics/docs" className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
              <FileText className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-purple-900">Documentation</span>
            </a>
            <a href="/analytics/tutorial" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100">
              <Code className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Tutorial</span>
            </a>
            <a href="/analytics/faq" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100">
              <Settings className="h-4 w-4 text-gray-500" />
              <span className="font-medium">FAQ</span>
            </a>
            <button className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg">
              <BarChart className="h-4 w-4" />
              <span className="font-medium">AI Guide</span>
            </button>
          </div>
        </div>

        {/* Main Documentation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-600 mb-6">
              The Analytics Dashboard provides comprehensive migration analytics and insights using advanced 
              machine learning algorithms. Built with TensorFlow, pandas, and Prophet integration, it delivers 
              real-time monitoring, predictive analytics, and intelligent forecasting for your infrastructure operations.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">Key Features</h3>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li><strong>Real-time Analytics:</strong> Live data processing and visualization</li>
              <li><strong>Predictive Modeling:</strong> AI-powered forecasting with 88% accuracy</li>
              <li><strong>Anomaly Detection:</strong> Multi-algorithm anomaly detection and alerting</li>
              <li><strong>Performance Monitoring:</strong> Comprehensive infrastructure metrics</li>
              <li><strong>Cost Analysis:</strong> Detailed cost optimization insights</li>
              <li><strong>Custom Dashboards:</strong> Configurable analytics views</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mb-3">Architecture</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <pre className="text-sm">
{`analytics-platform/src/
├── forecasting/              # Time Series Forecasting
│   ├── time_series_forecasting.py  # Prophet, ARIMA, GP
│   └── forecast_models.py    # Model implementations
├── anomaly/                  # Anomaly Detection
│   ├── anomaly_detection.py  # Multi-algorithm detection
│   └── anomaly_models.py     # Detection algorithms
├── risk/                     # Risk Assessment
│   ├── risk_assessment.py    # Risk scoring algorithms
│   └── risk_models.py        # Risk prediction models
└── optimization/             # Performance Optimization
    ├── performance_optimization.py
    └── optimization_algorithms.py`}
              </pre>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">API Endpoints</h3>
            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">GET</span>
                  <code className="text-sm">/api/analytics/metrics</code>
                </div>
                <p className="text-gray-600 text-sm">Retrieve current analytics metrics and KPIs</p>
                <div className="mt-2 text-xs text-gray-500">
                  <strong>Auth:</strong> Required | <strong>Response:</strong> MetricsResult
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">POST</span>
                  <code className="text-sm">/api/analytics/forecast</code>
                </div>
                <p className="text-gray-600 text-sm">Generate predictive forecasts for specified metrics</p>
                <div className="mt-2 text-xs text-gray-500">
                  <strong>Auth:</strong> Required | <strong>Response:</strong> ForecastResult
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">GET</span>
                  <code className="text-sm">/api/analytics/anomalies</code>
                </div>
                <p className="text-gray-600 text-sm">Get detected anomalies and alert information</p>
                <div className="mt-2 text-xs text-gray-500">
                  <strong>Auth:</strong> Required | <strong>Response:</strong> AnomalyResult
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">Data Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Primary Sources</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>CockroachDB: Migration data</li>
                  <li>Redis Cache: Real-time metrics</li>
                  <li>Prometheus: System metrics</li>
                  <li>Agent Telemetry: Operation data</li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">External Integrations</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>AWS CloudWatch</li>
                  <li>Azure Monitor</li>
                  <li>GCP Operations</li>
                  <li>Custom APIs</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">Machine Learning Models</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Forecasting Models</h4>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li><strong>Prophet:</strong> Seasonal trend forecasting with holiday effects</li>
                <li><strong>ARIMA:</strong> Time series analysis and prediction</li>
                <li><strong>Gaussian Process:</strong> Non-parametric Bayesian forecasting</li>
              </ul>
              
              <h4 className="font-semibold text-gray-900 mb-2">Anomaly Detection</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Isolation Forest:</strong> Unsupervised anomaly detection</li>
                <li><strong>One-Class SVM:</strong> Novelty detection</li>
                <li><strong>Statistical Methods:</strong> Z-score and IQR-based detection</li>
                <li><strong>LSTM Networks:</strong> Deep learning anomaly detection</li>
              </ul>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">Configuration</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <pre className="text-sm">
{`# Environment Variables
ANALYTICS_ENABLED=true
FORECASTING_MODELS=prophet,arima,gp
ANOMALY_DETECTION=true
REAL_TIME_PROCESSING=true

# Data Retention
METRICS_RETENTION_DAYS=90
FORECAST_HORIZON_DAYS=30
ANOMALY_THRESHOLD=2.5

# ML Configuration
MODEL_RETRAIN_INTERVAL=24h
PREDICTION_CONFIDENCE=0.95
BATCH_SIZE=1000`}
              </pre>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">&lt; 100ms</div>
                <div className="text-sm text-gray-600">Query Response Time</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <div className="text-sm text-gray-600">System Uptime</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">88%</div>
                <div className="text-sm text-gray-600">Forecast Accuracy</div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">Monitoring & Alerting</h3>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li><strong>Real-time Alerts:</strong> Configurable thresholds for anomalies and performance</li>
              <li><strong>Dashboard Health:</strong> System status and data freshness monitoring</li>
              <li><strong>Model Performance:</strong> Accuracy tracking and drift detection</li>
              <li><strong>Resource Usage:</strong> CPU, memory, and storage utilization</li>
              <li><strong>Integration Status:</strong> Data source connectivity monitoring</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mb-3">Security & Compliance</h3>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Role-based access control for sensitive analytics data</li>
              <li>Data encryption in transit and at rest</li>
              <li>Audit logging for all analytics operations</li>
              <li>GDPR compliance for personal data processing</li>
              <li>Secure API authentication with JWT tokens</li>
            </ul>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">💡 Best Practices</h4>
              <p className="text-purple-800 text-sm">
                For optimal performance, configure data retention policies based on your needs, enable 
                real-time processing for critical metrics, and regularly review forecast accuracy to 
                tune model parameters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
