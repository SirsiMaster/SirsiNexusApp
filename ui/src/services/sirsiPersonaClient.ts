/**
 * Sirsi Persona Client - Supreme AI Integration
 * Handles direct communication with the Sirsi Persona backend service
 */

import { AgentWebSocketService } from './websocket';

export interface SirsiNaturalLanguageRequest {
  userId: string;
  sessionId: string;
  request: string;
  context: Record<string, string>;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface SirsiInfrastructureResponse {
  requestId: string;
  responseType: 'infrastructure_generation' | 'system_analysis' | 'optimization' | 'monitoring' | 'troubleshooting';
  infrastructureCode?: string;
  explanation: string;
  recommendations: string[];
  costEstimate?: string;
  deploymentTime?: string;
  confidenceScore: number;
  alternativeApproaches: AlternativeApproach[];
}

export interface AlternativeApproach {
  provider: string;
  rationale: string;
  costImpact: string;
  complexity: string;
}

export interface SirsiSystemOverview {
  timestamp: Date;
  overallHealth: 'optimal' | 'good' | 'warning' | 'critical';
  activeSessions: number;
  activeAgents: number;
  infrastructureSummary: InfrastructureSummary;
  costOptimizationOpportunities: CostOptimization[];
  securityAlerts: SecurityAlert[];
  performanceMetrics: PerformanceMetrics;
  predictiveInsights: PredictiveInsight[];
}

export interface InfrastructureSummary {
  totalResources: number;
  cloudProviders: CloudProviderSummary[];
  monthlyCost: number;
  costTrend: 'decreasing' | 'stable' | 'increasing' | 'volatile';
  resourceUtilization: number;
}

export interface CloudProviderSummary {
  provider: string;
  resourceCount: number;
  monthlyCost: number;
  healthStatus: string;
}

export interface CostOptimization {
  opportunityId: string;
  description: string;
  potentialSavings: number;
  implementationEffort: string;
  riskLevel: string;
}

export interface SecurityAlert {
  alertId: string;
  severity: string;
  description: string;
  affectedResources: string[];
  recommendedAction: string;
}

export interface PerformanceMetrics {
  avgResponseTimeMs: number;
  successRate: number;
  resourceUtilization: number;
  throughputOpsPerSec: number;
}

export interface PredictiveInsight {
  insightId: string;
  category: string;
  prediction: string;
  confidence: number;
  timeline: string;
  recommendedActions: string[];
}

export interface SirsiActionPlan {
  planId: string;
  title: string;
  description: string;
  steps: ActionStep[];
  estimatedDuration: string;
  riskAssessment: RiskAssessment;
  successCriteria: string[];
}

export interface ActionStep {
  stepId: string;
  title: string;
  description: string;
  estimatedDuration: string;
  dependencies: string[];
  validationCriteria: string[];
}

export interface RiskAssessment {
  overallRisk: string;
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
}

export interface RiskFactor {
  factor: string;
  impact: string;
  probability: string;
  mitigation: string;
}

export interface SirsiPersonaConfig {
  websocketUrl?: string;
  grpcUrl?: string;
  apiUrl?: string;
  enableRealTimeUpdates?: boolean;
  enableOmniscientMode?: boolean;
}

export class SirsiPersonaClient {
  private websocketService: AgentWebSocketService;
  private config: SirsiPersonaConfig;
  private currentSessionId: string | null = null;
  private isOmniscientMode: boolean = false;
  private realTimeCallbacks: Map<string, ((data: any) => void)[]> = new Map();

  constructor(config: SirsiPersonaConfig = {}) {
    this.config = {
      websocketUrl: config.websocketUrl || 'ws://localhost:8080',
      grpcUrl: config.grpcUrl || 'http://localhost:50051',
      apiUrl: config.apiUrl || 'http://localhost:3001/api',
      enableRealTimeUpdates: config.enableRealTimeUpdates ?? true,
      enableOmniscientMode: config.enableOmniscientMode ?? true,
      ...config,
    };

    this.websocketService = new AgentWebSocketService({
      url: this.config.websocketUrl!,
      reconnectAttempts: 10,
      reconnectDelay: 2000,
      heartbeatInterval: 30000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.websocketService.on('message', (message) => {
      this.handleRealTimeUpdate(message);
    });

    this.websocketService.on('connection', () => {
      console.log('🎯 Sirsi Persona Client connected to backend');
    });

    this.websocketService.on('error', (error) => {
      console.error('❌ Sirsi Persona Client error:', error);
    });
  }

  private handleRealTimeUpdate(message: any): void {
    if (message.metadata?.sirsiUpdate) {
      const updateType = message.metadata.updateType;
      const callbacks = this.realTimeCallbacks.get(updateType) || [];
      callbacks.forEach(callback => callback(message.content));
    }
  }

  /**
   * Initialize connection to Sirsi Persona backend
   */
  async connect(): Promise<void> {
    await this.websocketService.connect();
    
    if (this.config.enableOmniscientMode) {
      this.isOmniscientMode = true;
      console.log('🔮 Sirsi Omniscient Mode activated');
    }
  }

  /**
   * Disconnect from Sirsi Persona backend
   */
  disconnect(): void {
    this.websocketService.disconnect();
    this.currentSessionId = null;
    this.isOmniscientMode = false;
    this.realTimeCallbacks.clear();
  }

  /**
   * Start a new session with Sirsi Persona
   */
  async startSession(userId: string, context: Record<string, string> = {}): Promise<string> {
    try {
      const session = await this.websocketService.createSession(userId, {
        ...context,
        sirsiPersona: 'true',
        omniscientMode: this.isOmniscientMode.toString(),
      });

      this.currentSessionId = session.sessionId;
      console.log('🎯 Sirsi Persona session started:', this.currentSessionId);
      
      return this.currentSessionId;
    } catch (error) {
      console.error('Failed to start Sirsi session:', error);
      throw new Error('Failed to connect to Supreme AI Sirsi');
    }
  }

  /**
   * Process natural language request with Sirsi's Supreme AI capabilities
   */
  async processNaturalLanguageRequest(
    request: string,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal',
    context: Record<string, string> = {}
  ): Promise<SirsiInfrastructureResponse> {
    if (!this.currentSessionId) {
      throw new Error('No active Sirsi session. Please start a session first.');
    }

    try {
      const sirsiRequest: SirsiNaturalLanguageRequest = {
        userId: 'current-user', // This should be from auth context
        sessionId: this.currentSessionId,
        request,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          omniscientMode: this.isOmniscientMode.toString(),
        },
        priority,
      };

      // Send to Sirsi Persona backend via WebSocket
      const response = await this.sendSirsiRequest('process_natural_language', sirsiRequest);
      
      return {
        requestId: response.requestId,
        responseType: response.responseType,
        infrastructureCode: response.infrastructureCode,
        explanation: response.explanation,
        recommendations: response.recommendations || [],
        costEstimate: response.costEstimate,
        deploymentTime: response.deploymentTime,
        confidenceScore: response.confidenceScore || 0.9,
        alternativeApproaches: response.alternativeApproaches || [],
      };
    } catch (error) {
      console.error('Sirsi natural language processing failed:', error);
      throw new Error('Supreme AI Sirsi is temporarily unavailable');
    }
  }

  /**
   * Get omniscient overview of the entire system
   */
  async getOmniscientOverview(): Promise<SirsiSystemOverview> {
    if (!this.currentSessionId) {
      throw new Error('No active Sirsi session. Please start a session first.');
    }

    try {
      const response = await this.sendSirsiRequest('get_omniscient_overview', {
        sessionId: this.currentSessionId,
        includeRealTimeData: true,
        includeThreats: true,
        includePredictions: true,
      });

      return {
        timestamp: new Date(response.timestamp),
        overallHealth: response.overallHealth,
        activeSessions: response.activeSessions,
        activeAgents: response.activeAgents,
        infrastructureSummary: response.infrastructureSummary,
        costOptimizationOpportunities: response.costOptimizationOpportunities || [],
        securityAlerts: response.securityAlerts || [],
        performanceMetrics: response.performanceMetrics || {
          avgResponseTimeMs: 0,
          successRate: 1.0,
          resourceUtilization: 0,
          throughputOpsPerSec: 0,
        },
        predictiveInsights: response.predictiveInsights || [],
      };
    } catch (error) {
      console.error('Failed to get omniscient overview:', error);
      throw new Error('Supreme AI Sirsi omniscient capabilities temporarily unavailable');
    }
  }

  /**
   * Execute supreme decision with AI-powered intelligence
   */
  async executeSupremeDecision(context: string): Promise<SirsiActionPlan> {
    if (!this.currentSessionId) {
      throw new Error('No active Sirsi session. Please start a session first.');
    }

    try {
      const response = await this.sendSirsiRequest('execute_supreme_decision', {
        sessionId: this.currentSessionId,
        context,
        omniscientAnalysis: true,
        realTimeFactors: true,
      });

      return {
        planId: response.planId,
        title: response.title,
        description: response.description,
        steps: response.steps || [],
        estimatedDuration: response.estimatedDuration,
        riskAssessment: response.riskAssessment || {
          overallRisk: 'low',
          riskFactors: [],
          mitigationStrategies: [],
        },
        successCriteria: response.successCriteria || [],
      };
    } catch (error) {
      console.error('Supreme decision execution failed:', error);
      throw new Error('Supreme AI decision engine temporarily unavailable');
    }
  }

  /**
   * Subscribe to real-time updates for specific data types
   */
  subscribeToRealTimeUpdates(
    updateType: 'system_health' | 'cost_optimization' | 'security_alerts' | 'performance_metrics' | 'predictive_insights',
    callback: (data: any) => void
  ): () => void {
    if (!this.realTimeCallbacks.has(updateType)) {
      this.realTimeCallbacks.set(updateType, []);
    }
    
    this.realTimeCallbacks.get(updateType)!.push(callback);

    // Send subscription request to backend
    this.sendSirsiRequest('subscribe_real_time', {
      sessionId: this.currentSessionId,
      updateType,
      omniscientMode: this.isOmniscientMode,
    }).catch(error => {
      console.error('Failed to subscribe to real-time updates:', error);
    });

    // Return unsubscribe function
    return () => {
      const callbacks = this.realTimeCallbacks.get(updateType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    sessionId: string | null;
    omniscientMode: boolean;
    lastActivity: Date | null;
  } {
    return {
      connected: this.websocketService.isConnected(),
      sessionId: this.currentSessionId,
      omniscientMode: this.isOmniscientMode,
      lastActivity: new Date(),
    };
  }

  /**
   * Enable or disable omniscient mode
   */
  async setOmniscientMode(enabled: boolean): Promise<void> {
    this.isOmniscientMode = enabled;
    
    if (this.currentSessionId) {
      await this.sendSirsiRequest('update_session_config', {
        sessionId: this.currentSessionId,
        omniscientMode: enabled,
      });
    }

    console.log(`🔮 Sirsi Omniscient Mode ${enabled ? 'activated' : 'deactivated'}`);
  }

  /**
   * Send request to Sirsi Persona backend
   */
  private async sendSirsiRequest(action: string, data: any): Promise<any> {
    try {
      // Use WebSocket service for real-time communication
      const requestMessage = {
        type: 'agent' as const,
        content: JSON.stringify({
          action: `sirsi_persona_${action}`,
          data,
          timestamp: new Date().toISOString(),
        }),
        metadata: {
          sirsiPersona: true,
          omniscientMode: this.isOmniscientMode,
          sessionId: this.currentSessionId || undefined,
        },
      };

      this.websocketService.sendRawMessage(requestMessage);

      // For now, return a Promise that resolves with mock data
      // In production, this would wait for the actual response
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.generateMockResponse(action, data));
        }, 1000 + Math.random() * 2000);
      });
    } catch (error) {
      console.error('Sirsi request failed:', error);
      throw error;
    }
  }

  /**
   * Generate mock responses for development
   */
  private generateMockResponse(action: string, data: any): any {
    const requestId = `sirsi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    switch (action) {
      case 'process_natural_language':
        return {
          requestId,
          responseType: 'infrastructure_generation',
          explanation: `Supreme AI Sirsi has processed your request: "${data.request}". I have omniscient awareness of your entire infrastructure and can provide the optimal solution.`,
          recommendations: [
            'Follow cloud provider best practices',
            'Implement auto-scaling for optimal performance',
            'Enable comprehensive monitoring and alerting',
            'Apply security hardening configurations',
          ],
          confidenceScore: 0.92,
          infrastructureCode: this.generateMockInfrastructureCode(data.request),
          costEstimate: '$75-250/month',
          deploymentTime: '15-30 minutes',
          alternativeApproaches: [
            {
              provider: 'aws',
              rationale: 'Optimal performance and mature ecosystem',
              costImpact: 'Standard',
              complexity: 'Medium',
            },
            {
              provider: 'azure',
              rationale: 'Strong enterprise integration',
              costImpact: '+10-15%',
              complexity: 'Medium',
            },
          ],
        };

      case 'get_omniscient_overview':
        return {
          timestamp: new Date().toISOString(),
          overallHealth: 'optimal',
          activeSessions: 5,
          activeAgents: 12,
          infrastructureSummary: {
            totalResources: 45,
            cloudProviders: [
              {
                provider: 'AWS',
                resourceCount: 28,
                monthlyCost: 1250.75,
                healthStatus: 'Healthy',
              },
              {
                provider: 'Azure',
                resourceCount: 12,
                monthlyCost: 680.30,
                healthStatus: 'Healthy',
              },
              {
                provider: 'GCP',
                resourceCount: 5,
                monthlyCost: 195.45,
                healthStatus: 'Healthy',
              },
            ],
            monthlyCost: 2126.50,
            costTrend: 'stable',
            resourceUtilization: 0.78,
          },
          costOptimizationOpportunities: [
            {
              opportunityId: 'opt_1',
              description: 'Right-size overprovisioned EC2 instances',
              potentialSavings: 185.50,
              implementationEffort: 'Low',
              riskLevel: 'Low',
            },
            {
              opportunityId: 'opt_2',
              description: 'Migrate to Reserved Instances',
              potentialSavings: 420.00,
              implementationEffort: 'Medium',
              riskLevel: 'Low',
            },
          ],
          securityAlerts: [],
          performanceMetrics: {
            avgResponseTimeMs: 95.5,
            successRate: 0.9995,
            resourceUtilization: 0.78,
            throughputOpsPerSec: 2450.0,
          },
          predictiveInsights: [
            {
              insightId: 'insight_1',
              category: 'Cost',
              prediction: 'Infrastructure costs will increase by 12% next month due to projected usage growth',
              confidence: 0.87,
              timeline: 'Next 30 days',
              recommendedActions: [
                'Implement proactive auto-scaling',
                'Consider Reserved Instance purchases',
                'Review storage lifecycle policies',
              ],
            },
          ],
        };

      case 'execute_supreme_decision':
        return {
          planId: `plan_${requestId}`,
          title: `Supreme Decision: ${data.context}`,
          description: 'AI-powered strategic decision based on omniscient analysis of all systems and predictive modeling',
          steps: [
            {
              stepId: 'step_1',
              title: 'Omniscient Analysis',
              description: 'Comprehensive analysis of current system state and predictive modeling',
              estimatedDuration: '3 minutes',
              dependencies: [],
              validationCriteria: ['Analysis completed with 95%+ confidence'],
            },
            {
              stepId: 'step_2',
              title: 'Strategic Implementation',
              description: 'Execute optimized solution with real-time monitoring',
              estimatedDuration: '12 minutes',
              dependencies: ['step_1'],
              validationCriteria: ['Implementation successful', 'No system degradation'],
            },
            {
              stepId: 'step_3',
              title: 'Validation & Optimization',
              description: 'Validate results and apply real-time optimizations',
              estimatedDuration: '5 minutes',
              dependencies: ['step_2'],
              validationCriteria: ['Performance improved', 'Objectives achieved'],
            },
          ],
          estimatedDuration: '20 minutes',
          riskAssessment: {
            overallRisk: 'Low',
            riskFactors: [],
            mitigationStrategies: [
              'Continuous real-time monitoring',
              'Automatic rollback capabilities',
              'Multi-layer validation',
            ],
          },
          successCriteria: [
            'Primary objectives achieved',
            'No service disruption',
            'Performance metrics improved',
            'Cost optimization realized',
          ],
        };

      default:
        return {
          requestId,
          success: true,
          message: `Sirsi Persona action ${action} completed`,
          timestamp: new Date().toISOString(),
        };
    }
  }

  /**
   * Generate mock infrastructure code based on request
   */
  private generateMockInfrastructureCode(request: string): string {
    if (request.toLowerCase().includes('api') || request.toLowerCase().includes('rest')) {
      return `# Supreme AI Sirsi Generated Infrastructure
# Optimized API Gateway with Lambda Backend

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "api_name" {
  description = "Name of the API"
  type        = string
  default     = "sirsi-optimized-api"
}

# API Gateway with Sirsi optimizations
resource "aws_api_gateway_rest_api" "main" {
  name        = var.api_name
  description = "AI-optimized API Gateway by Supreme AI Sirsi"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# Lambda function with optimal configuration
resource "aws_lambda_function" "api_handler" {
  filename         = "api_handler.zip"
  function_name    = "\${var.api_name}-handler"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 512  # Sirsi-optimized memory allocation
  
  environment {
    variables = {
      SIRSI_OPTIMIZATION = "enabled"
      PERFORMANCE_MODE  = "optimal"
    }
  }
}

# CloudWatch monitoring with Sirsi intelligence
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/\${aws_lambda_function.api_handler.function_name}"
  retention_in_days = 30  # Sirsi-optimized retention
}

# Output with Sirsi metadata
output "api_endpoint" {
  description = "Sirsi-optimized API Gateway endpoint"
  value       = aws_api_gateway_rest_api.main.execution_arn
}`;
    }

    if (request.toLowerCase().includes('database') || request.toLowerCase().includes('storage')) {
      return `# Supreme AI Sirsi Generated Database Infrastructure
# Optimized RDS with backup and monitoring

resource "aws_db_instance" "main" {
  identifier = "sirsi-optimized-db"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.medium"  # Sirsi-optimized instance size
  
  allocated_storage     = 100
  max_allocated_storage = 1000  # Auto-scaling enabled
  
  db_name  = "sirsi_app"
  username = "admin"
  password = var.db_password
  
  backup_retention_period = 7    # Sirsi-optimized backup
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  monitoring_interval = 60
  performance_insights_enabled = true
  
  # Sirsi security optimizations
  encrypted = true
  
  tags = {
    Environment = "production"
    GeneratedBy = "Supreme-AI-Sirsi"
    Optimization = "cost-performance-balanced"
  }
}`;
    }

    // Default infrastructure template
    return `# Supreme AI Sirsi Generated Infrastructure
# Multi-service architecture with AI optimizations

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Sirsi-optimized VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "sirsi-optimized-vpc"
    GeneratedBy = "Supreme-AI-Sirsi"
  }
}

# Auto-scaling group with Sirsi intelligence
resource "aws_autoscaling_group" "main" {
  name                = "sirsi-optimized-asg"
  vpc_zone_identifier = aws_subnet.private[*].id
  target_group_arns   = [aws_lb_target_group.main.arn]
  health_check_type   = "ELB"
  
  min_size         = 2
  max_size         = 10
  desired_capacity = 3  # Sirsi-predicted optimal capacity
  
  tag {
    key                 = "Name"
    value               = "sirsi-optimized-instance"
    propagate_at_launch = true
  }
}

# Load balancer with Sirsi performance optimizations
resource "aws_lb" "main" {
  name               = "sirsi-optimized-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = aws_subnet.public[*].id
  
  # Sirsi optimization settings
  enable_deletion_protection = false
  enable_http2              = true
  idle_timeout              = 300
}

# Outputs with Sirsi metadata
output "infrastructure_summary" {
  value = {
    optimization_level = "Supreme-AI-Enhanced"
    predicted_performance = "Optimal"
    cost_efficiency = "95%"
    sirsi_confidence = "92%"
  }
}`;
  }
}

// Export singleton instance
export const sirsiPersonaClient = new SirsiPersonaClient();
export default SirsiPersonaClient;
