'use client';

import React, { useState } from 'react';
import { BarChart, ArrowLeft, Play, CheckCircle, ChevronRight, Code, Terminal } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  command?: string;
  tips?: string[];
  completed: boolean;
}

export default function AnalyticsTutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([
    {
      id: "setup",
      title: "Analytics Configuration",
      description: "Configure the analytics platform for optimal performance with your data sources and requirements.",
      code: `# Analytics Platform Configuration
ANALYTICS_ENABLED=true
FORECASTING_MODELS=prophet,arima,gp
ANOMALY_DETECTION=true
REAL_TIME_PROCESSING=true

# Data Retention Settings
METRICS_RETENTION_DAYS=90
FORECAST_HORIZON_DAYS=30
ANOMALY_THRESHOLD=2.5`,
      command: "export ANALYTICS_ENABLED=true",
      tips: [
        "Start with balanced model selection for general use",
        "Adjust retention based on storage capacity",
        "Enable real-time processing for critical metrics"
      ],
      completed: false
    },
    {
      id: "data-sources",
      title: "Connect Data Sources",
      description: "Connect and verify your data sources including databases, monitoring systems, and external APIs.",
      command: "curl -H 'Authorization: Bearer $JWT_TOKEN' http://localhost:8080/api/analytics/sources",
      code: `{
  "data_sources": [
    {
      "name": "CockroachDB",
      "type": "database",
      "status": "connected",
      "last_sync": "2025-01-06T10:30:00Z"
    },
    {
      "name": "Prometheus",
      "type": "metrics",
      "status": "connected", 
      "metrics_count": 1247
    },
    {
      "name": "Redis Cache",
      "type": "cache",
      "status": "connected",
      "cache_hit_ratio": 0.94
    }
  ]
}`,
      tips: [
        "Verify all data sources are connected before proceeding",
        "Check data freshness and quality indicators",
        "Ensure proper authentication is configured"
      ],
      completed: false
    },
    {
      id: "first-dashboard",
      title: "Create Your First Dashboard",
      description: "Set up a custom analytics dashboard to monitor your key performance indicators and migration metrics.",
      code: `{
  "dashboard_config": {
    "name": "Migration Analytics",
    "refresh_interval": "30s",
    "widgets": [
      {
        "type": "metric_card",
        "title": "Migration Success Rate",
        "metric": "migration.success_rate",
        "format": "percentage"
      },
      {
        "type": "time_series",
        "title": "Migration Performance",
        "metrics": ["migration.duration", "migration.downtime"],
        "time_range": "24h"
      }
    ]
  }
}`,
      command: "curl -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer $JWT_TOKEN' -d @dashboard.json http://localhost:8080/api/analytics/dashboards",
      tips: [
        "Start with basic metrics before adding complex visualizations",
        "Use appropriate refresh intervals for your use case",
        "Group related metrics together for better insights"
      ],
      completed: false
    },
    {
      id: "forecasting",
      title: "Configure Predictive Forecasting",
      description: "Set up predictive analytics to forecast resource usage, costs, and performance trends.",
      command: "curl -X POST -H 'Authorization: Bearer $JWT_TOKEN' http://localhost:8080/api/analytics/forecast/configure",
      code: `{
  "forecast_config": {
    "models": ["prophet", "arima"],
    "horizon_days": 30,
    "confidence_interval": 0.95,
    "seasonality": "auto",
    "metrics": [
      "resource.cpu_usage",
      "resource.memory_usage", 
      "cost.total_spend"
    ]
  }
}`,
      tips: [
        "Prophet works well for metrics with seasonal patterns",
        "ARIMA is effective for stationary time series",
        "Use 95% confidence intervals for production forecasts"
      ],
      completed: false
    },
    {
      id: "anomaly-detection", 
      title: "Set Up Anomaly Detection",
      description: "Configure intelligent anomaly detection to automatically identify unusual patterns and potential issues.",
      code: `{
  "anomaly_config": {
    "algorithms": ["isolation_forest", "one_class_svm"],
    "sensitivity": "medium",
    "metrics": [
      "migration.error_rate",
      "system.response_time",
      "cost.unexpected_charges"
    ],
    "notifications": {
      "email": ["admin@company.com"],
      "webhook": "https://hooks.slack.com/webhook"
    }
  }
}`,
      tips: [
        "Start with medium sensitivity to avoid false positives",
        "Combine multiple algorithms for better accuracy",
        "Configure notifications for critical anomalies"
      ],
      completed: false
    }
  ]);

  const markStepComplete = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].completed = true;
    setSteps(newSteps);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

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
              <h1 className="text-4xl font-bold text-gray-900">Analytics Tutorial</h1>
              <p className="text-gray-600">Master analytics and predictive insights</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Documentation Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a href="/analytics/docs" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100">
              <span className="font-medium">Documentation</span>
            </a>
            <a href="/analytics/tutorial" className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
              <Play className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-purple-900">Tutorial</span>
            </a>
            <a href="/analytics/faq" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100">
              <span className="font-medium">FAQ</span>
            </a>
            <button className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg">
              <BarChart className="h-4 w-4" />
              <span className="font-medium">AI Guide</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Tutorial Progress</h3>
            <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Navigator */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tutorial Steps</h3>
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  index === currentStep
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : step.completed
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-current opacity-30"></span>
                )}
                <span className="text-sm font-medium">{index + 1}. {step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
              {currentStep + 1}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {currentStepData.description}
          </p>

          {currentStepData.command && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Command
              </h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                {currentStepData.command}
              </div>
            </div>
          )}

          {currentStepData.code && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Code className="h-4 w-4" />
                {currentStepData.command ? 'Expected Response' : 'Configuration'}
              </h4>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <pre className="text-sm text-gray-800 overflow-x-auto">
                  {currentStepData.code}
                </pre>
              </div>
            </div>
          )}

          {currentStepData.tips && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">💡 Pro Tips</h4>
              <ul className="space-y-2">
                {currentStepData.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous Step
            </button>

            <button
              onClick={() => markStepComplete(currentStep)}
              disabled={currentStepData.completed}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
            >
              {currentStepData.completed ? 'Completed ✓' : 'Mark Complete'}
            </button>

            <button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next Step
            </button>
          </div>
        </div>

        {/* Completion */}
        {steps.every(step => step.completed) && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg text-white p-6">
            <h3 className="text-xl font-bold mb-2">🎉 Tutorial Complete!</h3>
            <p className="mb-4">
              Congratulations! You've mastered the Analytics Dashboard. You're now ready to leverage 
              predictive analytics, anomaly detection, and real-time insights for your infrastructure.
            </p>
            <div className="flex gap-4">
              <a href="/analytics" className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors">
                Go to Analytics
              </a>
              <a href="/analytics/docs" className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors">
                View Documentation
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
