'use client';

import React from 'react';
import { Brain, ArrowLeft, FileText, Code, Settings } from 'lucide-react';

export default function AIOrchestrationDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 dark:from-gray-900 dark:to-gray-800 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/ai-orchestration" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to AI Orchestration
          </a>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/200 dark:bg-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">AI Orchestration Engine</h1>
              <p className="text-gray-600 dark:text-gray-400">Documentation & Technical Specifications</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Documentation Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a href="/ai-orchestration/docs" className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-900">Documentation</span>
            </a>
            <a href="/ai-orchestration/tutorial" className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:bg-gray-800">
              <Code className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="font-medium">Tutorial</span>
            </a>
            <a href="/ai-orchestration/faq" className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:bg-gray-800">
              <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="font-medium">FAQ</span>
            </a>
            <button className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-50 dark:from-gray-900 dark:to-gray-8000 text-white p-3 rounded-lg">
              <Brain className="h-4 w-4" />
              <span className="font-medium">AI Guide</span>
            </button>
          </div>
        </div>

        {/* Main Documentation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Overview</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The AI Orchestration Engine is a sophisticated system that provides intelligent workflow automation 
              and decision-making capabilities. Built on advanced multi-criteria decision making (MCDM) algorithms 
              with fuzzy logic, it enables autonomous operation and optimization of complex infrastructure workflows.
            </p>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Key Features</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li><strong>Multi-Agent Coordination:</strong> Seamless orchestration across multiple AI agents</li>
              <li><strong>Decision Engine:</strong> Advanced MCDM with fuzzy logic for optimal decisions</li>
              <li><strong>Continuous Learning:</strong> Self-improving algorithms that learn from operations</li>
              <li><strong>Autonomous Optimization:</strong> Real-time performance and resource optimization</li>
              <li><strong>Workflow Automation:</strong> End-to-end automation of complex processes</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Architecture</h3>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6">
              <pre className="text-sm">
{`core-engine/src/ai/
├── feature_awareness.rs      # Feature registry & discovery
├── hypervisor_integration.rs # Hypervisor integration
├── agent_feature_access.rs   # Agent feature access
├── autonomous_execution.rs   # Autonomous execution
├── decision/                 # MCDM decision engine
├── orchestration/            # Multi-agent coordination
├── learning/                 # Continuous learning
└── optimization/             # Performance optimization`}
              </pre>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">API Endpoints</h3>
            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded">POST</span>
                  <code className="text-sm">/api/ai/orchestrate</code>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Start AI-driven orchestration workflow</p>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <strong>Auth:</strong> Required | <strong>Response:</strong> OrchestrationResult
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded">GET</span>
                  <code className="text-sm">/api/ai/status</code>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Get current orchestration status and metrics</p>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <strong>Auth:</strong> Required | <strong>Response:</strong> StatusResult
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Minimum Requirements</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>CPU: 8 cores</li>
                  <li>Memory: 16 GB RAM</li>
                  <li>Storage: 200 GB</li>
                  <li>Network: 10 Gbps</li>
                </ul>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Recommended Requirements</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>CPU: 16 cores</li>
                  <li>Memory: 32 GB RAM</li>
                  <li>Storage: 1 TB</li>
                  <li>Network: 25 Gbps</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Dependencies</h3>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6">
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li><strong>Core Engine:</strong> Rust-based orchestration framework</li>
                <li><strong>ML Platform:</strong> TensorFlow and PyTorch integration</li>
                <li><strong>Kubernetes:</strong> Container orchestration support</li>
                <li><strong>Docker:</strong> Containerization platform</li>
              </ul>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Configuration</h3>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6">
              <pre className="text-sm">
{`# Environment Variables
AI_ORCHESTRATION_ENABLED=true
DECISION_ENGINE_MODE=fuzzy_logic
LEARNING_RATE=0.001
OPTIMIZATION_LEVEL=aggressive
MAX_CONCURRENT_WORKFLOWS=50

# Feature Registry
FEATURE_REGISTRY_URL=postgresql://root@localhost:26257/sirsi_nexus
FEATURE_CACHE_TTL=300

# Integration Settings
HYPERVISOR_ENDPOINT=http://localhost:8080
AGENT_MANAGER_URL=http://localhost:8081`}
              </pre>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Monitoring & Metrics</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The AI Orchestration Engine provides comprehensive monitoring capabilities:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li><strong>Decision Accuracy:</strong> Track AI decision-making performance</li>
              <li><strong>Workflow Success Rate:</strong> Monitor automation success rates</li>
              <li><strong>Response Time:</strong> Measure orchestration response times</li>
              <li><strong>Resource Utilization:</strong> Track CPU, memory, and storage usage</li>
              <li><strong>Learning Progress:</strong> Monitor continuous learning improvements</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Security Considerations</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li>All API endpoints require authentication via JWT tokens</li>
              <li>Role-based access control (RBAC) for different orchestration levels</li>
              <li>Encrypted communication between AI components</li>
              <li>Comprehensive audit logging for all orchestration activities</li>
              <li>Secure credential management for external system integration</li>
            </ul>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
              <p className="text-blue-800 dark:text-blue-300 text-sm">
                For optimal performance, enable continuous learning mode and configure the decision engine 
                with domain-specific weights based on your infrastructure requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
