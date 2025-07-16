'use client';

import React, { useState } from 'react';
import { BarChart, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "Getting Started",
    question: "How do I access the Analytics Dashboard?",
    answer: "The Analytics Dashboard is available at /analytics in the main navigation. It provides real-time insights into migration performance, system health, and predictive analytics powered by TensorFlow, pandas, and Prophet."
  },
  {
    category: "Getting Started", 
    question: "What data sources does the analytics platform use?",
    answer: "The analytics platform integrates with CockroachDB for migration data, Redis cache for real-time metrics, Prometheus for system metrics, and agent telemetry for operational data. It also supports AWS CloudWatch, Azure Monitor, and GCP Operations."
  },
  {
    category: "Features",
    question: "What types of analytics and insights are available?",
    answer: "The platform provides migration analytics (success rates, downtime), performance monitoring, cost analysis, predictive forecasting with 88% accuracy, anomaly detection using multiple ML algorithms, and real-time infrastructure metrics."
  },
  {
    category: "Features",
    question: "How accurate are the predictive forecasts?",
    answer: "Our analytics platform achieves 88% forecast accuracy using multiple ML models including Prophet for seasonal trends, ARIMA for time series analysis, and Gaussian Process for non-parametric Bayesian forecasting."
  },
  {
    category: "Machine Learning",
    question: "What ML models are used for analytics?",
    answer: "We use Prophet for seasonal trend forecasting, ARIMA for time series analysis, Gaussian Process for Bayesian forecasting, Isolation Forest for anomaly detection, One-Class SVM for novelty detection, and LSTM networks for deep learning anomaly detection."
  },
  {
    category: "Machine Learning",
    question: "How does anomaly detection work?",
    answer: "Anomaly detection uses multiple algorithms including Isolation Forest for unsupervised detection, One-Class SVM for novelty detection, statistical methods like Z-score and IQR-based detection, and LSTM networks for deep learning anomaly detection."
  },
  {
    category: "Performance",
    question: "What are the performance characteristics of the analytics system?",
    answer: "The system provides sub-100ms query response times, 99.9% uptime, real-time data processing, and can handle large-scale datasets. Performance scales linearly with available resources."
  },
  {
    category: "Performance",
    question: "How is data freshness maintained?",
    answer: "Data freshness is maintained through real-time processing pipelines, automated data refresh intervals, and live streaming from various data sources. Most metrics are updated in real-time or near real-time."
  },
  {
    category: "Configuration",
    question: "How do I configure data retention policies?",
    answer: "Data retention is configured through environment variables: METRICS_RETENTION_DAYS (default 90), FORECAST_HORIZON_DAYS (default 30), and can be customized based on your storage and compliance requirements."
  },
  {
    category: "Configuration",
    question: "Can I customize the analytics models?",
    answer: "Yes, you can configure model parameters through environment variables including MODEL_RETRAIN_INTERVAL (default 24h), PREDICTION_CONFIDENCE (default 0.95), and BATCH_SIZE (default 1000). Advanced users can also customize model weights and thresholds."
  },
  {
    category: "Troubleshooting",
    question: "Why are my analytics not updating in real-time?",
    answer: "Check if REAL_TIME_PROCESSING=true is set, verify data source connections are active, ensure sufficient system resources are available, and check the analytics service logs for any processing errors."
  },
  {
    category: "Troubleshooting",
    question: "How do I troubleshoot forecast accuracy issues?",
    answer: "Review model performance metrics, check data quality and completeness, verify the forecast horizon matches your use case, consider adjusting model parameters, and ensure sufficient historical data is available for training."
  }
];

export default function AnalyticsFAQPage() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const categories = Array.from(new Set(faqData.map(item => item.category)));

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
              <h1 className="text-4xl font-bold text-gray-900">Analytics FAQ</h1>
              <p className="text-gray-600">Frequently Asked Questions & Troubleshooting</p>
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
            <a href="/analytics/tutorial" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100">
              <span className="font-medium">Tutorial</span>
            </a>
            <a href="/analytics/faq" className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
              <span className="font-medium text-purple-900">FAQ</span>
            </a>
            <button className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg">
              <BarChart className="h-4 w-4" />
              <span className="font-medium">AI Guide</span>
            </button>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">FAQ Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category} className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">{category}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {faqData
                  .filter(item => item.category === category)
                  .map((item, index) => {
                    const globalIndex = faqData.indexOf(item);
                    const isExpanded = expandedItems.has(globalIndex);
                    
                    return (
                      <div key={globalIndex} className="p-6">
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <h4 className="font-semibold text-gray-900 pr-4">{item.question}</h4>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="mt-4 text-gray-600 leading-relaxed">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg text-white p-6">
          <h3 className="text-xl font-bold mb-2">Still Need Help?</h3>
          <p className="mb-4">
            Can't find the answer you're looking for? Our AI-powered analytics support is available 24/7.
          </p>
          <div className="flex gap-4">
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors">
              Contact Support
            </button>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
