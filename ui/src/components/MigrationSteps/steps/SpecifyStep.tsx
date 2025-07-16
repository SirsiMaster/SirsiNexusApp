'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, Database, Server, Network, Clock, Bot, 
  Sparkles, TrendingUp, Shield, DollarSign, Zap, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Resource, RiskAssessment } from '@/types/migration';
import { aiService, type AIRecommendation } from '@/lib/ai-services';
import { trackMigrationStep, trackOptimizationRecommendation, trackUserInteraction, trackError } from '@/lib/analytics';
import ResourceDependencyGraph from '@/components/ui/resource-dependency-graph';

interface SpecifyStepProps {
  resources: Resource[];
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

interface MigrationRequirements {
  downtime: string;
  networkBandwidth: string;
  targetSpecs: {
    cpu: string;
    memory: string;
    storage: string;
  };
  schedulePreference: 'weekend' | 'weekday' | 'any';
  compliance: string[];
}

export const SpecifyStep: React.FC<SpecifyStepProps> = ({ resources, onComplete }) => {
  const [requirements, setRequirements] = useState<MigrationRequirements>({
    downtime: '4h',
    networkBandwidth: '1Gbps',
    targetSpecs: {
      cpu: '8 vCPU',
      memory: '32GB',
      storage: '500GB',
    },
    schedulePreference: 'weekend',
    compliance: ['GDPR', 'SOC2'],
  });
  
  const [showAssessmentAgent, setShowAssessmentAgent] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [costEstimate, setCostEstimate] = useState({
    oneTime: 12500,
    monthly: 2800,
    savings: 15,
  });
  const [backendAnalysis, setBackendAnalysis] = useState<any>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment>({
    score: 75,
    level: 'medium',
    findings: [
      {
        category: 'Performance',
        description: 'Network bandwidth might be insufficient for large databases',
        impact: 'Could extend migration duration',
        recommendation: 'Consider upgrading network capacity or splitting migration batches',
      },
      {
        category: 'Compliance',
        description: 'Data transfer across regions requires encryption',
        impact: 'Additional security measures needed',
        recommendation: 'Enable in-transit encryption and verify compliance requirements',
      },
    ],
  });

  const runBackendAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    trackMigrationStep('specify_analysis_started', { resourceCount: resources.length });
    
    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Enhanced AI analysis
      const aiAnalysis = await aiService.analyzeResources({
        resources,
        requirements,
        context: {
          entity: new URLSearchParams(window.location.search).get('entity') || 'default',
          journey: new URLSearchParams(window.location.search).get('demo') || 'migration',
          environment: 'specification'
        }
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      // Update state with AI analysis results
      setAiRecommendations(aiAnalysis.recommendations);
      setCostEstimate(aiAnalysis.costEstimate);
      setRiskAssessment({
        score: aiAnalysis.riskScore,
        level: aiAnalysis.riskScore > 80 ? 'high' : aiAnalysis.riskScore > 60 ? 'medium' : 'low',
        findings: riskAssessment.findings // Keep existing for UI consistency
      });
      setBackendAnalysis(aiAnalysis);
      
      trackMigrationStep('specify_analysis_completed', { 
        recommendationsCount: aiAnalysis.recommendations.length,
        riskScore: aiAnalysis.riskScore,
        estimatedCost: aiAnalysis.costEstimate.monthly
      });
      
    } catch (error) {
      console.warn('AI analysis failed, using fallback:', error);
      trackError(error as Error, { component: 'SpecifyStep', action: 'runBackendAnalysis' });
      setAnalysisProgress(100);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const artifact = {
      name: 'Requirements Specification',
      type: 'JSON',
      size: '156 KB',
      content: JSON.stringify({
        requirements,
        backendAnalysis,
        timestamp: new Date().toISOString()
      }, null, 2)
    };
    onComplete(artifact);
  };

  return (
    <div className="space-y-6">
      {/* Requirements Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-medium dark:text-gray-100">Migration Requirements</h3>

          {/* Resource Summary */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
              <Server className="mr-3 h-6 w-6 text-sirsi-500" />
              <div>
                <p className="font-medium dark:text-gray-100">Resources</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{resources.length} total</p>
              </div>
            </div>

            <div className="flex items-center rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
              <Clock className="mr-3 h-6 w-6 text-sirsi-500" />
              <div>
                <p className="font-medium dark:text-gray-100">Estimated Duration</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">4-6 hours</p>
              </div>
            </div>

            <div className="flex items-center rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
              <Network className="mr-3 h-6 w-6 text-sirsi-500" />
              <div>
                <p className="font-medium dark:text-gray-100">Network Required</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{requirements.networkBandwidth}</p>
              </div>
            </div>
          </div>

          {/* Target Specifications */}
          <div className="mb-6">
            <h4 className="mb-2 font-medium dark:text-gray-100">Target Environment Specifications</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPU</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 shadow-sm focus:border-sirsi-500 focus:outline-none dark:text-gray-100"
                  value={requirements.targetSpecs.cpu}
                  onChange={(e) =>
                    setRequirements({
                      ...requirements,
                      targetSpecs: { ...requirements.targetSpecs, cpu: e.target.value },
                    })
                  }
                >
                  <option>4 vCPU</option>
                  <option>8 vCPU</option>
                  <option>16 vCPU</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Memory</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 shadow-sm focus:border-sirsi-500 focus:outline-none dark:text-gray-100"
                  value={requirements.targetSpecs.memory}
                  onChange={(e) =>
                    setRequirements({
                      ...requirements,
                      targetSpecs: { ...requirements.targetSpecs, memory: e.target.value },
                    })
                  }
                >
                  <option>16GB</option>
                  <option>32GB</option>
                  <option>64GB</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Storage</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 shadow-sm focus:border-sirsi-500 focus:outline-none dark:text-gray-100"
                  value={requirements.targetSpecs.storage}
                  onChange={(e) =>
                    setRequirements({
                      ...requirements,
                      targetSpecs: { ...requirements.targetSpecs, storage: e.target.value },
                    })
                  }
                >
                  <option>250GB</option>
                  <option>500GB</option>
                  <option>1TB</option>
                </select>
              </div>
            </div>
          </div>

          {/* Schedule Preference */}
          <div className="mb-6">
            <h4 className="mb-2 font-medium">Schedule Preference</h4>
            <div className="flex space-x-4">
              {['weekend', 'weekday', 'any'].map((pref) => (
                <label
                  key={pref}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="radio"
                    name="schedule"
                    value={pref}
                    checked={requirements.schedulePreference === pref}
                    onChange={(e) =>
                      setRequirements({
                        ...requirements,
                        schedulePreference: e.target.value as any,
                      })
                    }
                    className="h-4 w-4 text-sirsi-500 focus:ring-sirsi-500"
                  />
                  <span className="text-sm capitalize">{pref}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-medium">Risk Assessment</h3>
          
          <div className="mb-6 flex items-center">
            <div
              className={`mr-4 h-16 w-16 rounded-full ${
                riskAssessment.level === 'low'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : riskAssessment.level === 'medium'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              } flex items-center justify-center`}
            >
              <span
                className={`text-2xl font-bold ${
                  riskAssessment.level === 'low'
                    ? 'text-green-600'
                    : riskAssessment.level === 'medium'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {riskAssessment.score}
              </span>
            </div>
            <div>
              <h4 className="font-medium capitalize">{riskAssessment.level} Risk</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall assessment score</p>
            </div>
          </div>

          <div className="space-y-4">
            {riskAssessment.findings.map((finding, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4"
              >
                <div className="flex items-start">
                  <AlertCircle className="mr-3 h-5 w-5 text-yellow-500" />
                  <div>
                    <h5 className="font-medium">{finding.category}</h5>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{finding.description}</p>
                    <p className="mt-2 text-sm">
                      <strong>Impact:</strong> {finding.impact}
                    </p>
                    <p className="text-sm text-sirsi-600">
                      <strong>Recommendation:</strong> {finding.recommendation}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Assessment Agent Panel */}
        <div className="rounded-lg border border-sirsi-200 bg-sirsi-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-sirsi-500 rounded-full">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-sirsi-900">Assessment Agent</h4>
                <p className="text-sm text-sirsi-600">AI-powered cost and risk analysis</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={runBackendAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAssessmentAgent(!showAssessmentAgent)}
              >
                {showAssessmentAgent ? 'Hide Analysis' : 'Show Analysis'}
              </Button>
            </div>
          </div>
          
          <AnimatePresence>
            {showAssessmentAgent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                {/* Cost Estimation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-sirsi-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">One-time Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">${costEstimate.oneTime.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Migration execution</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-sirsi-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">Monthly Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">${costEstimate.monthly.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Infrastructure running</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-sirsi-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">Savings</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{costEstimate.savings}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Estimated reduction</p>
                  </div>
                </div>
                
                {/* AI Recommendations */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-sirsi-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">AI Recommendations</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <p>Consider using spot instances for development workloads to reduce costs by 60%</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <p>Schedule migration during weekend hours to minimize business impact</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <p>Enable auto-scaling to optimize resource utilization and costs</p>
                    </div>
                  </div>
                </div>
                
                {/* AI Recommendations */}
                {aiRecommendations.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-sirsi-100">
                    <div className="flex items-center space-x-2 mb-3">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">AI-Powered Recommendations</span>
                    </div>
                    <div className="space-y-3">
                      {aiRecommendations.slice(0, 3).map((rec) => (
                        <div key={rec.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h6 className="font-medium text-gray-900 dark:text-gray-100">{rec.title}</h6>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              {rec.priority}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Impact: {rec.impact}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500 dark:text-gray-400">Confidence: {Math.round(rec.confidence * 100)}%</span>
                              <button
                                onClick={() => {
                                  const isSelected = selectedRecommendations.includes(rec.id);
                                  setSelectedRecommendations(prev => 
                                    isSelected ? prev.filter(id => id !== rec.id) : [...prev, rec.id]
                                  );
                                  trackOptimizationRecommendation(rec, !isSelected);
                                }}
                                className={`px-2 py-1 rounded text-xs ${
                                  selectedRecommendations.includes(rec.id) 
                                    ? 'bg-sirsi-500 text-white' 
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                                }`}
                              >
                                {selectedRecommendations.includes(rec.id) ? 'Selected' : 'Select'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Performance Insights */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-sirsi-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Performance & Security Insights</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Performance</h6>
                      <p className="text-gray-700 dark:text-gray-300">Current configuration will handle 2x traffic growth</p>
                      <p className="text-gray-700 dark:text-gray-300">Expected 25% performance improvement</p>
                    </div>
                    <div>
                      <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Security</h6>
                      <p className="text-gray-700 dark:text-gray-300">Encryption at rest and in transit enabled</p>
                      <p className="text-gray-700 dark:text-gray-300">Compliance requirements satisfied</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setShowAssessmentAgent(!showAssessmentAgent)}
            className="flex items-center space-x-2"
          >
            <Bot className="h-4 w-4" />
            <span>AI Assessment</span>
          </Button>
          
          <button
            type="submit"
            className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600"
          >
            Continue to Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
