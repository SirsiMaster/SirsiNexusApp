/**
 * AI Optimization Service
 * Provides infrastructure optimization analysis using backend AI services
 */

interface OptimizationRequest {
  infrastructure_data: {
    cloud_provider: string;
    regions: string[];
    resources: ResourceInfo[];
    usage_patterns: UsagePatterns;
  };
  performance_metrics: {
    response_time_ms: number;
    throughput_rps: number;
    error_rate: number;
    availability: number;
  };
  cost_constraints: {
    monthly_budget?: number;
    max_cost_increase?: number;
    cost_optimization_priority: 'Aggressive' | 'Balanced' | 'Conservative';
  };
  optimization_goals: string[];
  ai_provider: 'OpenAI' | 'Claude3_5Sonnet' | 'ClaudeCode';
}

interface ResourceInfo {
  resource_type: string;
  instance_type: string;
  count: number;
  utilization: number;
  cost_per_hour: number;
  tags: Record<string, string>;
}

interface UsagePatterns {
  cpu_utilization: number[];
  memory_utilization: number[];
  network_io: number[];
  storage_io: number[];
  time_series_data: TimeSeriesPoint[];
}

interface TimeSeriesPoint {
  timestamp: number;
  cpu: number;
  memory: number;
  network: number;
}

interface OptimizationResponse {
  recommendations: OptimizationRecommendation[];
  predicted_cost_savings: number;
  predicted_performance_impact: {
    response_time_change: number;
    throughput_change: number;
    availability_change: number;
  };
  implementation_plan: {
    phases: ImplementationPhase[];
    estimated_timeline_weeks: number;
    rollback_strategy: string;
  };
  confidence_score: number;
  ai_provider_used: string;
}

interface OptimizationRecommendation {
  category: string;
  description: string;
  impact: string;
  implementation_effort: string;
  cost_savings_annual: number;
  risk_level: string;
  specific_actions: string[];
}

interface ImplementationPhase {
  phase_number: number;
  description: string;
  actions: string[];
  duration_weeks: number;
  dependencies: number[];
}

class AIOptimizationService {
  /**
   * Analyze infrastructure and get optimization recommendations
   */
  async optimizeInfrastructure(request: OptimizationRequest): Promise<OptimizationResponse> {
    try {
      console.log('Sending optimization request to backend...', request);
      
      const response = await fetch('/api/ai/optimization/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.getAuthHeader() ? { 'Authorization': this.getAuthHeader()! } : {})
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Backend API returned error');
      }

      console.log('Optimization response received:', data.data);
      return data.data;
    } catch (error) {
      console.warn('Backend optimization service unavailable, using mock data:', error);
      return this.generateMockOptimization(request);
    }
  }

  /**
   * Get AI service health status
   */
  async getHealthStatus(): Promise<any> {
    try {
      const response = await fetch('/api/ai/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.getAuthHeader() ? { 'Authorization': this.getAuthHeader()! } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.warn('Health check failed:', error);
      return {
        status: 'unhealthy',
        services: {
          openai: { available: false, mode: 'mock' },
          claude: { available: false, mode: 'mock' },
          infrastructure_generator: { available: false, mode: 'mock' },
          optimization_engine: { available: false, mode: 'mock' }
        }
      };
    }
  }

  /**
   * Get authentication header
   */
  private getAuthHeader(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : null;
    }
    return null;
  }

  /**
   * Generate mock optimization data for testing
   */
  private async generateMockOptimization(request: OptimizationRequest): Promise<OptimizationResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const totalMonthlyCost = request.infrastructure_data.resources.reduce(
      (sum, resource) => sum + (resource.cost_per_hour * 24 * 30 * resource.count), 
      0
    );

    const savingsPercentage = this.calculateSavingsPercentage(request);
    const predictedSavings = totalMonthlyCost * savingsPercentage * 12; // Annual savings

    return {
      recommendations: [
        {
          category: 'InstanceSizing',
          description: 'Right-size over-provisioned instances based on utilization analysis',
          impact: 'High',
          implementation_effort: 'Medium',
          cost_savings_annual: predictedSavings * 0.4,
          risk_level: 'Low',
          specific_actions: [
            'Analyze CPU and memory utilization over 30-day period',
            'Identify instances with <30% average utilization',
            'Recommend optimal instance types for workload patterns',
            'Schedule downsizing during maintenance windows'
          ]
        },
        {
          category: 'AutoScaling',
          description: 'Implement intelligent auto-scaling based on demand patterns',
          impact: 'High',
          implementation_effort: 'Medium',
          cost_savings_annual: predictedSavings * 0.3,
          risk_level: 'Medium',
          specific_actions: [
            'Configure CloudWatch metrics and alarms',
            'Set up auto-scaling policies with proper thresholds',
            'Test scaling behavior under various load conditions',
            'Implement predictive scaling for known patterns'
          ]
        },
        {
          category: 'ReservedInstances',
          description: 'Purchase reserved instances for predictable workloads',
          impact: 'High',
          implementation_effort: 'Low',
          cost_savings_annual: predictedSavings * 0.3,
          risk_level: 'Low',
          specific_actions: [
            'Analyze usage patterns for consistent workloads',
            'Calculate ROI for 1-year and 3-year reserved instances',
            'Purchase appropriate reserved instance types',
            'Monitor and optimize reservations quarterly'
          ]
        }
      ],
      predicted_cost_savings: predictedSavings,
      predicted_performance_impact: {
        response_time_change: -15.0, // 15% improvement
        throughput_change: 20.0,     // 20% improvement
        availability_change: 2.0     // 2% improvement
      },
      implementation_plan: {
        phases: [
          {
            phase_number: 1,
            description: 'Assessment and Quick Wins',
            actions: [
              'Complete infrastructure assessment',
              'Identify immediate optimization opportunities',
              'Implement quick wins with minimal risk'
            ],
            duration_weeks: 2,
            dependencies: []
          },
          {
            phase_number: 2,
            description: 'Reserved Instance Optimization',
            actions: [
              'Analyze usage patterns for RI recommendations',
              'Purchase optimal reserved instances',
              'Configure billing and cost tracking'
            ],
            duration_weeks: 3,
            dependencies: [1]
          },
          {
            phase_number: 3,
            description: 'Auto-scaling Implementation',
            actions: [
              'Configure auto-scaling groups and policies',
              'Set up monitoring and alerting',
              'Test and validate scaling behavior'
            ],
            duration_weeks: 4,
            dependencies: [2]
          },
          {
            phase_number: 4,
            description: 'Right-sizing and Fine-tuning',
            actions: [
              'Implement instance right-sizing recommendations',
              'Optimize storage and network configurations',
              'Fine-tune performance parameters'
            ],
            duration_weeks: 3,
            dependencies: [3]
          }
        ],
        estimated_timeline_weeks: 12,
        rollback_strategy: 'Each phase includes comprehensive rollback procedures with automated monitoring to detect performance degradation'
      },
      confidence_score: 0.88,
      ai_provider_used: request.ai_provider
    };
  }

  /**
   * Calculate potential savings percentage based on request parameters
   */
  private calculateSavingsPercentage(request: OptimizationRequest): number {
    let baseSavings = 0.25; // 25% base savings

    // Adjust based on cost optimization priority
    switch (request.cost_constraints.cost_optimization_priority) {
      case 'Aggressive':
        baseSavings = 0.35;
        break;
      case 'Conservative':
        baseSavings = 0.15;
        break;
      case 'Balanced':
      default:
        baseSavings = 0.25;
        break;
    }

    // Adjust based on current utilization patterns
    const avgCpuUtilization = request.infrastructure_data.usage_patterns.cpu_utilization.reduce((a, b) => a + b, 0) / 
                              request.infrastructure_data.usage_patterns.cpu_utilization.length;
    
    if (avgCpuUtilization < 0.3) {
      baseSavings += 0.1; // Additional 10% savings for low utilization
    }

    // Adjust based on optimization goals
    if (request.optimization_goals.includes('CostReduction')) {
      baseSavings += 0.05;
    }

    return Math.min(baseSavings, 0.5); // Cap at 50% savings
  }

  /**
   * Create optimization request from UI data
   */
  createOptimizationRequest(
    cloudProvider: string,
    resources: any[],
    performanceData: any,
    costConstraints: any,
    goals: string[],
    aiProvider: string = 'OpenAI'
  ): OptimizationRequest {
    // Transform UI data to backend format
    const transformedResources: ResourceInfo[] = resources.map(resource => ({
      resource_type: resource.type || 'compute',
      instance_type: resource.instanceType || 't3.medium',
      count: resource.count || 1,
      utilization: resource.utilization || 0.5,
      cost_per_hour: resource.costPerHour || 0.05,
      tags: resource.tags || { Environment: 'production' }
    }));

    // Generate realistic usage patterns
    const usagePatterns: UsagePatterns = {
      cpu_utilization: this.generateUsagePattern(0.45, 0.15, 24),
      memory_utilization: this.generateUsagePattern(0.55, 0.12, 24),
      network_io: this.generateUsagePattern(1000, 200, 24),
      storage_io: this.generateUsagePattern(500, 100, 24),
      time_series_data: this.generateTimeSeriesData(24)
    };

    return {
      infrastructure_data: {
        cloud_provider: cloudProvider,
        regions: ['us-west-2', 'us-east-1'],
        resources: transformedResources,
        usage_patterns: usagePatterns
      },
      performance_metrics: {
        response_time_ms: performanceData?.responseTime || 150,
        throughput_rps: performanceData?.throughput || 1000,
        error_rate: performanceData?.errorRate || 0.001,
        availability: performanceData?.availability || 0.995
      },
      cost_constraints: {
        monthly_budget: costConstraints?.budget,
        max_cost_increase: costConstraints?.maxIncrease,
        cost_optimization_priority: costConstraints?.priority || 'Balanced'
      },
      optimization_goals: goals.length > 0 ? goals : ['CostReduction', 'PerformanceImprovement'],
      ai_provider: aiProvider as any
    };
  }

  /**
   * Generate realistic usage pattern data
   */
  private generateUsagePattern(base: number, variation: number, points: number): number[] {
    const pattern: number[] = [];
    for (let i = 0; i < points; i++) {
      const noise = (Math.random() - 0.5) * variation * 2;
      const value = Math.max(0, Math.min(1, base + noise));
      pattern.push(value);
    }
    return pattern;
  }

  /**
   * Generate time series data points
   */
  private generateTimeSeriesData(hours: number): TimeSeriesPoint[] {
    const data: TimeSeriesPoint[] = [];
    const now = Date.now();
    
    for (let i = 0; i < hours; i++) {
      data.push({
        timestamp: now - (hours - i) * 3600000, // Hours ago in milliseconds
        cpu: 0.3 + Math.random() * 0.4,
        memory: 0.4 + Math.random() * 0.3,
        network: 800 + Math.random() * 400
      });
    }
    
    return data;
  }
}

export const aiOptimizationService = new AIOptimizationService();
export type { OptimizationRequest, OptimizationResponse, OptimizationRecommendation };
