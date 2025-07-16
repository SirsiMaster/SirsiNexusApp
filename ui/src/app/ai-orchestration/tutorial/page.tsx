'use client';

import React, { useState } from 'react';
import { Brain, ArrowLeft, Play, CheckCircle, ChevronRight, Code, Terminal } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  command?: string;
  tips?: string[];
  completed: boolean;
}

export default function AIOrchestrationTutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([
    {
      id: "setup",
      title: "Environment Setup",
      description: "Configure your environment for AI Orchestration. Ensure all required services are running and properly configured.",
      code: `# Environment Variables
AI_ORCHESTRATION_ENABLED=true
DECISION_ENGINE_MODE=fuzzy_logic
LEARNING_RATE=0.001
OPTIMIZATION_LEVEL=balanced
MAX_CONCURRENT_WORKFLOWS=25`,
      command: "export AI_ORCHESTRATION_ENABLED=true",
      tips: [
        "Start with 'balanced' optimization level for production",
        "Monitor resource usage when increasing concurrent workflows",
        "Use 'conservative' mode for critical production systems"
      ],
      completed: false
    },
    {
      id: "verification",
      title: "System Verification",
      description: "Verify that all AI Orchestration components are operational and the system is ready to handle workflows.",
      command: "curl -H 'Authorization: Bearer $JWT_TOKEN' http://localhost:8080/api/ai/status",
      code: `{
  "status": "operational",
  "decision_engine": "active",
  "ml_platform": "ready",
  "agent_framework": "online",
  "accuracy": "88%",
  "active_workflows": 12
}`,
      tips: [
        "Ensure accuracy is above 85% before production use",
        "Check that all dependencies are in 'ready' state",
        "Verify JWT authentication is properly configured"
      ],
      completed: false
    },
    {
      id: "first-orchestration",
      title: "Your First Orchestration",
      description: "Create and execute your first AI-driven orchestration workflow. This will demonstrate the system's decision-making capabilities.",
      code: `{
  "workflow_type": "infrastructure_optimization",
  "target_resources": ["cpu", "memory", "storage"],
  "optimization_goal": "cost_performance_balance",
  "constraints": {
    "max_downtime": "5m",
    "budget_limit": 1000
  }
}`,
      command: "curl -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer $JWT_TOKEN' -d @workflow.json http://localhost:8080/api/ai/orchestrate",
      tips: [
        "Start with simple optimization goals",
        "Set realistic downtime constraints",
        "Monitor the workflow execution in real-time"
      ],
      completed: false
    },
    {
      id: "monitoring",
      title: "Monitoring Orchestration",
      description: "Learn how to monitor active orchestrations, view decision traces, and understand the AI's reasoning process.",
      command: "curl -H 'Authorization: Bearer $JWT_TOKEN' http://localhost:8080/api/ai/workflows/active",
      code: `{
  "active_workflows": [
    {
      "id": "wf-123",
      "status": "executing",
      "progress": "65%",
      "decisions_made": 8,
      "estimated_completion": "2m 30s"
    }
  ]
}`,
      tips: [
        "Check workflow progress every 30 seconds",
        "Review decision traces for learning opportunities",
        "Set up alerts for failed orchestrations"
      ],
      completed: false
    },
    {
      id: "advanced-config",
      title: "Advanced Configuration",
      description: "Configure advanced features like custom decision weights, learning parameters, and integration with monitoring systems.",
      code: `# Advanced Configuration
DECISION_WEIGHTS='{
  "cost": 0.4,
  "performance": 0.3,
  "reliability": 0.2,
  "security": 0.1
}'
LEARNING_ENABLED=true
MONITORING_INTEGRATION=prometheus
ALERT_THRESHOLDS='{
  "error_rate": 0.05,
  "response_time": 5000
}'`,
      tips: [
        "Adjust weights based on your business priorities",
        "Enable learning mode after initial validation",
        "Configure monitoring for production visibility"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 dark:from-gray-900 dark:to-gray-800 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/ai-orchestration" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-300 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to AI Orchestration
          </a>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/200 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">AI Orchestration Tutorial</h1>
              <p className="text-gray-600 dark:text-gray-400">Step-by-step guide to mastering AI orchestration</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Documentation Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a href="/ai-orchestration/docs" className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:bg-gray-800">
              <span className="font-medium">Documentation</span>
            </a>
            <a href="/ai-orchestration/tutorial" className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
              <Play className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-900">Tutorial</span>
            </a>
            <a href="/ai-orchestration/faq" className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:bg-gray-800">
              <span className="font-medium">FAQ</span>
            </a>
            <button className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-50 dark:from-gray-900 dark:to-gray-8000 text-white p-3 rounded-lg">
              <Brain className="h-4 w-4" />
              <span className="font-medium">AI Guide</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Tutorial Progress</h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-50 dark:bg-blue-900/200 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Navigator */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Tutorial Steps</h3>
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  index === currentStep
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300'
                    : step.completed
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300'
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:bg-gray-800'
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/200 rounded-lg flex items-center justify-center text-white font-bold">
              {currentStep + 1}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentStepData.title}</h2>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {currentStepData.description}
          </p>

          {currentStepData.command && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
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
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <Code className="h-4 w-4" />
                {currentStepData.command ? 'Expected Response' : 'Configuration'}
              </h4>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                  {currentStepData.code}
                </pre>
              </div>
            </div>
          )}

          {currentStepData.tips && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">💡 Pro Tips</h4>
              <ul className="space-y-2">
                {currentStepData.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous Step
            </button>

            <button
              onClick={() => markStepComplete(currentStep)}
              disabled={currentStepData.completed}
              className="px-4 py-2 bg-green-50 dark:bg-green-900/200 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
            >
              {currentStepData.completed ? 'Completed ✓' : 'Mark Complete'}
            </button>

            <button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-900/200 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next Step
            </button>
          </div>
        </div>

        {/* Completion */}
        {steps.every(step => step.completed) && (
          <div className="bg-gradient-to-r from-green-50 dark:from-gray-900 dark:to-gray-8000 to-emerald-600 rounded-xl shadow-lg text-white p-6">
            <h3 className="text-xl font-bold mb-2">🎉 Tutorial Complete!</h3>
            <p className="mb-4">
              Congratulations! You've successfully completed the AI Orchestration tutorial. 
              You're now ready to leverage the full power of intelligent workflow automation.
            </p>
            <div className="flex gap-4">
              <a href="/ai-orchestration" className="bg-white dark:bg-gray-800 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors">
                Go to AI Orchestration
              </a>
              <a href="/ai-orchestration/docs" className="bg-white dark:bg-gray-800 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors">
                View Documentation
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
