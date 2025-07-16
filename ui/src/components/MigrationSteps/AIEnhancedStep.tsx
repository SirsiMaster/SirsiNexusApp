'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Cpu,
  Database,
  Network,
  Shield,
  Zap,
  BarChart3,
  Clock,
  Target
} from 'lucide-react';
import { 
  aiAnalyticsService,
  AIMetrics,
  AnomalyAlert,
  ForecastData,
  formatMetricValue,
  getSeverityColor
} from '@/services/aiAnalyticsService';

interface AIEnhancedStepProps {
  stepName: string;
  stepData?: any;
  discoveredResources?: any[];
  onAIInsight?: (insight: any) => void;
  onComplete?: (artifact?: any) => void;
}

interface AIInsight {
  type: 'cost_prediction' | 'anomaly_detection' | 'optimization_recommendation' | 'risk_assessment';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  data: any;
}

export const AIEnhancedStep: React.FC<AIEnhancedStepProps> = ({
  stepName,
  stepData,
  discoveredResources = [],
  onAIInsight,
  onComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [costPrediction, setCostPrediction] = useState<any>(null);
  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyAlert[]>([]);
  const [optimizationScore, setOptimizationScore] = useState<number>(0);
  const [aiMetrics, setAiMetrics] = useState<AIMetrics | null>(null);

  const runAIAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    const insights: AIInsight[] = [];

    try {
      // Get current AI metrics
      const overviewResponse = await aiAnalyticsService.getOverview();
      if (overviewResponse.success) {
        setAiMetrics(overviewResponse.data.metrics);
      }

      // Run cost prediction analysis
      if (stepName === 'plan' || stepName === 'specify') {
        try {
          const costResponse = await aiAnalyticsService.predictCosts({
            horizon: '30d',
            features: ['cpu_usage', 'memory_usage', 'network_io', 'storage_usage']
          });

          if (costResponse.success) {
            setCostPrediction(costResponse.data.predictions);
            insights.push({
              type: 'cost_prediction',
              title: 'Cost Prediction Analysis',
              description: `Predicted monthly cost: $${costResponse.data.predictions.next_month_cost.toLocaleString()}. Potential savings: $${costResponse.data.predictions.savings_opportunities.toLocaleString()}`,
              confidence: costResponse.data.predictions.confidence,
              impact: costResponse.data.predictions.cost_trend === 'increasing' ? 'high' : 'medium',
              data: costResponse.data
            });
          }
        } catch (error) {
          console.error('Cost prediction failed:', error);
        }
      }

      // Run anomaly detection for validation steps
      if (stepName === 'validate' || stepName === 'transfer') {
        try {
          const anomalyResponse = await aiAnalyticsService.runAnomalyDetection({
            algorithm: 'isolation_forest',
            contamination: 0.05
          });

          if (anomalyResponse.success) {
            setAnomalyAlerts(anomalyResponse.data.alerts);
            if (anomalyResponse.data.alerts.length > 0) {
              const highSeverityAlerts = anomalyResponse.data.alerts.filter(a => a.severity === 'high' || a.severity === 'critical');
              insights.push({
                type: 'anomaly_detection',
                title: 'Anomaly Detection Results',
                description: `Detected ${anomalyResponse.data.anomalies_detected} anomalies. ${highSeverityAlerts.length} require immediate attention.`,
                confidence: anomalyResponse.data.f1_score * 100,
                impact: highSeverityAlerts.length > 0 ? 'critical' : 'low',
                data: anomalyResponse.data
              });
            }
          }
        } catch (error) {
          console.error('Anomaly detection failed:', error);
        }
      }

      // Generate optimization recommendations
      if (stepName === 'optimize') {
        const score = Math.floor(Math.random() * 30) + 70; // Simulate 70-100 score
        setOptimizationScore(score);
        
        insights.push({
          type: 'optimization_recommendation',
          title: 'AI Optimization Recommendations',
          description: `Current optimization score: ${score}%. ${score < 80 ? 'Several improvements identified.' : 'Good optimization level achieved.'}`,
          confidence: 85,
          impact: score < 70 ? 'high' : score < 85 ? 'medium' : 'low',
          data: { score, recommendations: generateOptimizationRecommendations(score) }
        });
      }

      // Risk assessment for all steps
      const riskLevel = calculateRiskLevel(stepName, discoveredResources.length);
      insights.push({
        type: 'risk_assessment',
        title: 'Migration Risk Assessment',
        description: `Risk level: ${riskLevel.level}. ${riskLevel.description}`,
        confidence: riskLevel.confidence,
        impact: riskLevel.impact,
        data: riskLevel
      });

      setAiInsights(insights);
      
      // Notify parent component
      if (onAIInsight) {
        insights.forEach(insight => onAIInsight(insight));
      }

    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [stepName, discoveredResources, onAIInsight]);

  useEffect(() => {
    // Auto-run AI analysis when step data changes
    if (stepData || discoveredResources.length > 0) {
      runAIAnalysis();
    }
  }, [stepData, discoveredResources, runAIAnalysis]);

  const generateOptimizationRecommendations = (score: number): string[] => {
    const recommendations: string[] = [];
    
    if (score < 70) {
      recommendations.push('Consider right-sizing instances to reduce costs');
      recommendations.push('Enable auto-scaling for better resource utilization');
      recommendations.push('Review storage classes for cost optimization');
    } else if (score < 85) {
      recommendations.push('Fine-tune auto-scaling policies');
      recommendations.push('Consider reserved instances for stable workloads');
    } else {
      recommendations.push('Monitor continuously for further optimization opportunities');
      recommendations.push('Consider advanced cost optimization strategies');
    }
    
    return recommendations;
  };

  const calculateRiskLevel = (step: string, resourceCount: number) => {
    const riskFactors = {
      environment: { base: 10, description: 'Configuration errors possible' },
      plan: { base: 20, description: 'Discovery completeness affects planning' },
      specify: { base: 15, description: 'Specification errors can cascade' },
      test: { base: 25, description: 'Testing may reveal compatibility issues' },
      build: { base: 30, description: 'Infrastructure build complexity' },
      transfer: { base: 40, description: 'Data transfer is the highest risk phase' },
      validate: { base: 20, description: 'Validation may reveal transfer issues' },
      optimize: { base: 10, description: 'Optimization is generally low risk' },
      support: { base: 5, description: 'Ongoing support has minimal risk' }
    };

    const stepRisk = riskFactors[step as keyof typeof riskFactors] || { base: 15, description: 'Standard migration risk' };
    const resourceRisk = Math.min(resourceCount * 2, 30); // Up to 30% additional risk
    const totalRisk = stepRisk.base + resourceRisk;

    let level, impact: 'low' | 'medium' | 'high' | 'critical';
    if (totalRisk < 20) {
      level = 'Low';
      impact = 'low';
    } else if (totalRisk < 40) {
      level = 'Medium';
      impact = 'medium';
    } else if (totalRisk < 60) {
      level = 'High';
      impact = 'high';
    } else {
      level = 'Critical';
      impact = 'critical';
    }

    return {
      level,
      impact,
      confidence: 85,
      score: totalRisk,
      description: stepRisk.description,
      resourceCount
    };
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'cost_prediction': return DollarSign;
      case 'anomaly_detection': return AlertTriangle;
      case 'optimization_recommendation': return TrendingUp;
      case 'risk_assessment': return Shield;
      default: return Brain;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <Card className="card-action-premium border-2 border-purple-500/30 hover:border-purple-500/60 group relative overflow-hidden">
        <div className="card-action-glow bg-purple-50 dark:bg-purple-900/200/10"></div>
        <div className="relative z-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:text-purple-600 transition-colors">
              <Brain className="h-5 w-5 text-purple-500" />
              AI-Powered Migration Analysis
            </CardTitle>
            <CardDescription className="group-hover:text-slate-700 transition-colors">
              Phase 3 Advanced Analytics for {STEPS[stepName as keyof typeof STEPS]?.title || stepName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={runAIAnalysis}
                  disabled={isAnalyzing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Run AI Analysis
                    </>
                  )}
                </Button>
                
                {aiMetrics && (
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {aiMetrics.decision_accuracy}% Accuracy
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      <Clock className="h-3 w-3 mr-1" />
                      {aiMetrics.response_time}s Response
                    </Badge>
                  </div>
                )}
              </div>
              
              {aiMetrics && (
                <div className="text-right">
                  <div className="text-sm text-slate-600">AI System Status</div>
                  <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                    <Shield className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">AI Insights & Recommendations</h3>
          {aiInsights.map((insight, index) => {
            const IconComponent = getInsightIcon(insight.type);
            return (
              <Alert key={index} className={`border-2 ${getImpactColor(insight.impact)}`}>
                <IconComponent className="h-4 w-4" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{insight.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confidence
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getImpactColor(insight.impact)}`}>
                        {insight.impact.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <AlertDescription>{insight.description}</AlertDescription>
                  
                  {/* Additional details for specific insight types */}
                  {insight.type === 'cost_prediction' && costPrediction && (
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-slate-600">Compute</div>
                        <div className="font-semibold">${costPrediction.breakdown.compute.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-slate-600">Storage</div>
                        <div className="font-semibold">${costPrediction.breakdown.storage.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-slate-600">Network</div>
                        <div className="font-semibold">${costPrediction.breakdown.network.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                  
                  {insight.type === 'optimization_recommendation' && insight.data.recommendations && (
                    <div className="mt-3">
                      <div className="mb-2">
                        <Progress value={insight.data.score} className="h-2" />
                        <div className="text-xs text-slate-600 mt-1">Optimization Score: {insight.data.score}%</div>
                      </div>
                      <ul className="text-sm space-y-1">
                        {insight.data.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-blue-500" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Alert>
            );
          })}
        </div>
      )}

      {/* Anomaly Alerts for validation steps */}
      {anomalyAlerts.length > 0 && (
        <Card className="border-2 border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Anomaly Alerts
            </CardTitle>
            <CardDescription>
              Real-time anomaly detection results for this step
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomalyAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{alert.type}</Badge>
                        <Badge variant="outline" className="text-xs">{alert.source}</Badge>
                      </div>
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        Confidence: {alert.confidence}% • {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI-Enhanced Completion */}
      {aiInsights.length > 0 && (
        <Card className="border-2 border-emerald-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">AI Analysis Complete</h4>
                <p className="text-sm text-slate-600">
                  {aiInsights.length} insights generated • Ready to proceed with AI-guided recommendations
                </p>
              </div>
              <Button 
                onClick={() => onComplete && onComplete({
                  name: `AI Analysis Report - ${stepName}`,
                  type: 'json',
                  size: '2.4 KB',
                  content: JSON.stringify({ insights: aiInsights, metrics: aiMetrics }, null, 2)
                })}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete with AI Insights
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper constant for step definitions (reused from migration page)
const STEPS = {
  environment: { title: 'Environment Setup' },
  plan: { title: 'Plan Migration' },
  specify: { title: 'Specify Requirements' },
  test: { title: 'Test Configuration' },
  build: { title: 'Build Infrastructure' },
  transfer: { title: 'Transfer Resources' },
  validate: { title: 'Validate Migration' },
  optimize: { title: 'Optimize Resources' },
  support: { title: 'Support & Monitor' }
};
