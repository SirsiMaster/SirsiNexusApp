'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Zap,
  TrendingUp,
  Activity,
  Server,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Settings,
  Play,
  Pause,
  BarChart3,
  Cpu,
  HardDrive,
  Network,
  DollarSign,
  Shield,
  Sparkles,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';

interface ScalingRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  action: 'scale_up' | 'scale_down';
  cooldown: number;
  enabled: boolean;
}

interface ScalingPolicy {
  name: string;
  minInstances: number;
  maxInstances: number;
  targetCapacity: number;
  rules: ScalingRule[];
  enabled: boolean;
}

interface WizardData {
  resourceType: string;
  resourceSelection: string[];
  scalingObjectives: string[];
  predictiveScaling: boolean;
  costOptimization: boolean;
  performanceTarget: number;
}

const AutoScalingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [wizardData, setWizardData] = useState<WizardData>({
    resourceType: 'ec2',
    resourceSelection: [],
    scalingObjectives: [],
    predictiveScaling: false,
    costOptimization: true,
    performanceTarget: 80
  });

  const [scalingPolicies, setScalingPolicies] = useState<ScalingPolicy[]>([
    {
      name: 'Web Tier Auto-scaling',
      minInstances: 2,
      maxInstances: 10,
      targetCapacity: 4,
      enabled: true,
      rules: [
        {
          id: '1',
          name: 'High CPU Scale Up',
          metric: 'cpu_utilization',
          threshold: 80,
          action: 'scale_up',
          cooldown: 300,
          enabled: true
        },
        {
          id: '2',
          name: 'Low CPU Scale Down',
          metric: 'cpu_utilization',
          threshold: 30,
          action: 'scale_down',
          cooldown: 600,
          enabled: true
        }
      ]
    }
  ]);

  const [scalingMetrics, setScalingMetrics] = useState({
    currentInstances: 4,
    targetInstances: 4,
    cpuUtilization: 65,
    memoryUtilization: 58,
    networkUtilization: 23,
    costPerHour: 4.80,
    scalingEvents: [
      { time: '10:30 AM', action: 'Scale Up', instances: '3 → 4', reason: 'CPU > 80%' },
      { time: '2:15 PM', action: 'Scale Down', instances: '5 → 4', reason: 'CPU < 30%' },
      { time: '6:45 PM', action: 'Scale Up', instances: '4 → 6', reason: 'Traffic spike' }
    ]
  });

  const steps = [
    { number: 1, title: 'Resource Selection', description: 'Choose resources to scale' },
    { number: 2, title: 'Scaling Objectives', description: 'Define scaling goals' },
    { number: 3, title: 'Rules Configuration', description: 'Set scaling rules' },
    { number: 4, title: 'Review & Deploy', description: 'Finalize configuration' }
  ];

  const resourceTypes = [
    { id: 'ec2', name: 'EC2 Instances', icon: Server, description: 'Auto-scale EC2 instances' },
    { id: 'ecs', name: 'ECS Services', icon: Activity, description: 'Auto-scale container services' },
    { id: 'lambda', name: 'Lambda Functions', icon: Zap, description: 'Configure Lambda concurrency' },
    { id: 'rds', name: 'RDS Read Replicas', icon: Server, description: 'Scale database read replicas' }
  ];

  const scalingObjectives = [
    { id: 'performance', name: 'Performance Optimization', icon: TrendingUp, description: 'Maintain optimal performance' },
    { id: 'cost', name: 'Cost Optimization', icon: DollarSign, description: 'Minimize infrastructure costs' },
    { id: 'availability', name: 'High Availability', icon: Shield, description: 'Ensure service availability' },
    { id: 'predictive', name: 'Predictive Scaling', icon: Sparkles, description: 'AI-powered scaling predictions' }
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResourceTypeChange = (type: string) => {
    setWizardData(prev => ({ ...prev, resourceType: type }));
  };

  const handleObjectiveToggle = (objective: string) => {
    setWizardData(prev => ({
      ...prev,
      scalingObjectives: prev.scalingObjectives.includes(objective)
        ? prev.scalingObjectives.filter(o => o !== objective)
        : [...prev.scalingObjectives, objective]
    }));
  };

  const addScalingRule = (policyIndex: number) => {
    const newRule: ScalingRule = {
      id: Date.now().toString(),
      name: 'New Scaling Rule',
      metric: 'cpu_utilization',
      threshold: 70,
      action: 'scale_up',
      cooldown: 300,
      enabled: true
    };

    setScalingPolicies(prev => 
      prev.map((policy, index) => 
        index === policyIndex 
          ? { ...policy, rules: [...policy.rules, newRule] }
          : policy
      )
    );
  };

  const togglePolicy = (policyIndex: number) => {
    setScalingPolicies(prev =>
      prev.map((policy, index) =>
        index === policyIndex
          ? { ...policy, enabled: !policy.enabled }
          : policy
      )
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Resource Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resourceTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        wizardData.resourceType === type.id 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => handleResourceTypeChange(type.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <Icon className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{type.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Scaling Objectives</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scalingObjectives.map((objective) => {
                  const Icon = objective.icon;
                  const isSelected = wizardData.scalingObjectives.includes(objective.id);
                  return (
                    <Card
                      key={objective.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => handleObjectiveToggle(objective.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <Icon className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{objective.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{objective.description}</p>
                          </div>
                          {isSelected && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>Performance Target (%)</Label>
                <Slider
                  value={[wizardData.performanceTarget]}
                  onValueChange={(value) => setWizardData(prev => ({ ...prev, performanceTarget: value[0] }))}
                  max={100}
                  min={50}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Target CPU utilization: {wizardData.performanceTarget}%
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Cost Optimization</Label>
                  <Switch
                    checked={wizardData.costOptimization}
                    onCheckedChange={(checked) => setWizardData(prev => ({ ...prev, costOptimization: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Predictive Scaling</Label>
                  <Switch
                    checked={wizardData.predictiveScaling}
                    onCheckedChange={(checked) => setWizardData(prev => ({ ...prev, predictiveScaling: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Scaling Rules Configuration</h3>
              <Button onClick={() => addScalingRule(0)} size="sm">
                Add Rule
              </Button>
            </div>

            {scalingPolicies.map((policy, policyIndex) => (
              <Card key={policyIndex}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      {policy.name}
                    </CardTitle>
                    <Switch
                      checked={policy.enabled}
                      onCheckedChange={() => togglePolicy(policyIndex)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <Label>Min Instances</Label>
                      <Input type="number" value={policy.minInstances} className="mt-1" />
                    </div>
                    <div>
                      <Label>Max Instances</Label>
                      <Input type="number" value={policy.maxInstances} className="mt-1" />
                    </div>
                    <div>
                      <Label>Target Capacity</Label>
                      <Input type="number" value={policy.targetCapacity} className="mt-1" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Scaling Rules</h4>
                    {policy.rules.map((rule) => (
                      <div key={rule.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Rule Name</Label>
                            <Input value={rule.name} className="mt-1" />
                          </div>
                          <div>
                            <Label>Metric</Label>
                            <select className="w-full mt-1 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2">
                              <option value="cpu_utilization">CPU Utilization</option>
                              <option value="memory_utilization">Memory Utilization</option>
                              <option value="network_in">Network In</option>
                              <option value="request_count">Request Count</option>
                            </select>
                          </div>
                          <div>
                            <Label>Threshold</Label>
                            <Input type="number" value={rule.threshold} className="mt-1" />
                          </div>
                          <div>
                            <Label>Action</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={rule.action === 'scale_up' ? 'default' : 'outline'}>
                                {rule.action === 'scale_up' ? (
                                  <ArrowUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDown className="h-3 w-3 mr-1" />
                                )}
                                {rule.action === 'scale_up' ? 'Scale Up' : 'Scale Down'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review & Deploy Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Resource Type:</span>
                      <span className="capitalize">{wizardData.resourceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Objectives:</span>
                      <span>{wizardData.scalingObjectives.length} selected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Performance Target:</span>
                      <span>{wizardData.performanceTarget}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Cost Optimization:</span>
                      <span>{wizardData.costOptimization ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Predictive Scaling:</span>
                      <span>{wizardData.predictiveScaling ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estimated Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Cost Savings</p>
                        <p className="text-sm text-green-700 dark:text-green-300">20-30% reduction</p>
                      </div>
                      <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">High</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Performance</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">15% improvement</p>
                      </div>
                      <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">Medium</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div>
                        <p className="font-medium text-purple-900 dark:text-purple-100">Response Time</p>
                        <p className="text-sm text-purple-700 dark:text-purple-300">2-3 minutes</p>
                      </div>
                      <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">Fast</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-emerald-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              Auto-Scaling Wizard
              <Badge className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Configure intelligent auto-scaling for your infrastructure
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                autoRefresh 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-800' 
                  : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Steps */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Configuration Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div
                      key={step.number}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        currentStep === step.number
                          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700'
                          : currentStep > step.number
                          ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200'
                          : 'bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-300'
                      }`}
                      onClick={() => setCurrentStep(step.number)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          currentStep === step.number
                            ? 'bg-emerald-600 dark:bg-emerald-50 dark:bg-emerald-900/200 text-white'
                            : currentStep > step.number
                            ? 'bg-green-600 dark:bg-green-50 dark:bg-green-900/200 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 dark:text-gray-300'
                        }`}>
                          {currentStep > step.number ? <CheckCircle className="h-4 w-4" /> : step.number}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{step.title}</p>
                          <p className="text-xs opacity-75">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Metrics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Instances</span>
                    <Badge variant="outline">{scalingMetrics.currentInstances}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CPU Usage</span>
                    <Badge variant={scalingMetrics.cpuUtilization > 80 ? 'destructive' : 'outline'}>
                      {scalingMetrics.cpuUtilization}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cost/Hour</span>
                    <Badge variant="outline">${scalingMetrics.costPerHour}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Step {currentStep}: {steps[currentStep - 1].title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {currentStep} of {steps.length}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderStepContent()}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t dark:border-gray-700">
                  <Button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {currentStep === steps.length ? (
                      <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-50 dark:bg-emerald-900/200 dark:hover:bg-emerald-600">
                        <Play className="h-4 w-4 mr-2" />
                        Deploy Configuration
                      </Button>
                    ) : (
                      <Button onClick={nextStep} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-50 dark:bg-emerald-900/200 dark:hover:bg-emerald-600">
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Scaling Events */}
            {currentStep === 4 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Recent Scaling Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scalingMetrics.scalingEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            event.action === 'Scale Up' ? 'bg-green-50 dark:bg-green-900/200' : 'bg-blue-50 dark:bg-blue-900/200'
                          }`}></div>
                          <div>
                            <p className="font-medium text-sm dark:text-gray-200">{event.action}: {event.instances}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{event.reason}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{event.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoScalingWizard;
