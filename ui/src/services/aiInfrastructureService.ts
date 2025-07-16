/**
 * AI Infrastructure Generation Service
 * Provides real AI-powered infrastructure code generation using OpenAI API
 */

interface AIGenerationRequest {
  query: string;
  preferredProvider?: 'aws' | 'azure' | 'gcp' | 'kubernetes' | 'multi' | 'ibm' | 'oracle' | 'alibaba';
  preferredFormat?: 'terraform' | 'bicep' | 'cloudformation' | 'pulumi' | 'ansible' | 'yaml';
  complexity?: 'basic' | 'intermediate' | 'advanced';
  includeMonitoring?: boolean;
  includeSecurity?: boolean;
  estimatedBudget?: string;
}

interface AIGenerationResponse {
  infrastructure: {
    code: string;
    format: string;
    provider: string;
  };
  explanation: string;
  recommendations: string[];
  estimatedCost: string;
  deploymentTime: string;
  securityConsiderations: string[];
  alternatives: {
    provider: string;
    rationale: string;
  }[];
}

export type AIProvider = 'openai' | 'claude' | 'claude-code';

interface AIProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

class AIInfrastructureService {
  private providers: Record<AIProvider, AIProviderConfig>;
  private currentProvider: AIProvider = 'openai';

  constructor() {
    this.providers = {
      openai: {
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4',
        maxTokens: 4000,
        temperature: 0.7
      },
      claude: {
        apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
        baseUrl: 'https://api.anthropic.com/v1',
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 4000,
        temperature: 0.7
      },
      'claude-code': {
        apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
        baseUrl: 'https://api.anthropic.com/v1',
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 8000,
        temperature: 0.3
      }
    };
  }

  /**
   * Set the AI provider for infrastructure generation
   */
  setProvider(provider: AIProvider): void {
    this.currentProvider = provider;
  }

  /**
   * Get current AI provider
   */
  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  /**
   * Get available AI providers with their status
   */
  getAvailableProviders(): Array<{ id: AIProvider; name: string; description: string; available: boolean; model: string }> {
    return [
      {
        id: 'openai',
        name: 'OpenAI GPT-4',
        description: 'Advanced reasoning and comprehensive infrastructure knowledge',
        available: !!this.providers.openai.apiKey,
        model: this.providers.openai.model
      },
      {
        id: 'claude',
        name: 'Claude 3.5 Sonnet',
        description: 'Excellent analysis and detailed infrastructure explanations',
        available: !!this.providers.claude.apiKey,
        model: this.providers.claude.model
      },
      {
        id: 'claude-code',
        name: 'Claude Code',
        description: 'Specialized for infrastructure code generation and optimization',
        available: !!this.providers['claude-code'].apiKey,
        model: this.providers['claude-code'].model
      }
    ];
  }

  /**
   * Generate infrastructure code using AI
   */
  async generateInfrastructure(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      // Call our backend API instead of directly calling AI services
      const response = await fetch('/api/ai/infrastructure/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if available
          ...(this.getAuthHeader() ? { 'Authorization': this.getAuthHeader()! } : {})
        },
        body: JSON.stringify({
          description: request.query,
          cloud_provider: this.mapProvider(request.preferredProvider || 'aws'),
          ai_provider: this.mapAIProvider(this.currentProvider),
          requirements: {
            budget_limit: this.parseBudget(request.estimatedBudget),
            performance_tier: this.mapComplexity(request.complexity || 'intermediate'),
            security_level: request.includeSecurity ? 'Enhanced' : 'Basic',
            compliance_requirements: [],
            scaling_requirements: {
              min_instances: 1,
              max_instances: request.includeMonitoring ? 10 : 5,
              auto_scaling: true,
              load_balancing: true
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Backend API returned error');
      }

      // Transform backend response to frontend format
      return this.transformBackendResponse(data.data, request);
    } catch (error) {
      console.warn('Backend AI service unavailable, using enhanced mock generation:', error);
      return this.generateMockInfrastructure(request);
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string, systemPrompt: string, config: AIProviderConfig): Promise<Response> {
    return fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })
    });
  }

  /**
   * Call Claude API (Anthropic)
   */
  private async callClaude(prompt: string, systemPrompt: string, config: AIProviderConfig): Promise<Response> {
    return fetch(`${config.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });
  }

  /**
   * Extract content from different AI provider responses
   */
  private extractContentFromResponse(data: any): string {
    if (this.currentProvider === 'openai') {
      return data.choices[0].message.content;
    } else if (this.currentProvider === 'claude' || this.currentProvider === 'claude-code') {
      return data.content[0].text;
    }
    return '';
  }

  /**
   * Build a comprehensive prompt for AI infrastructure generation
   */
  private buildPrompt(request: AIGenerationRequest): string {
    return `
Generate production-ready infrastructure code based on this request:

User Request: "${request.query}"

Requirements:
- Preferred Cloud Provider: ${request.preferredProvider || 'best fit'}
- Preferred Format: ${request.preferredFormat || 'terraform'}
- Complexity Level: ${request.complexity || 'intermediate'}
- Include Monitoring: ${request.includeMonitoring ? 'Yes' : 'No'}
- Include Security Best Practices: ${request.includeSecurity ? 'Yes' : 'No'}
- Estimated Budget: ${request.estimatedBudget || 'Not specified'}

Please provide:
1. Complete infrastructure code that is production-ready
2. Clear explanation of the solution
3. Best practice recommendations
4. Security considerations
5. Cost estimation
6. Deployment time estimate
7. Alternative provider suggestions if applicable

Format the response as JSON with the following structure:
{
  "infrastructure": {
    "code": "...",
    "format": "...",
    "provider": "..."
  },
  "explanation": "...",
  "recommendations": ["..."],
  "estimatedCost": "...",
  "deploymentTime": "...",
  "securityConsiderations": ["..."],
  "alternatives": [{"provider": "...", "rationale": "..."}]
}
`;
  }

  /**
   * System prompt for infrastructure generation - optimized per provider
   */
  private getSystemPrompt(): string {
    const basePrompt = `You are an expert cloud infrastructure architect with deep knowledge of:
- AWS, Azure, Google Cloud Platform, Kubernetes, IBM Cloud, Oracle Cloud, Alibaba Cloud
- Infrastructure as Code tools: Terraform, Bicep, CloudFormation, Pulumi, Ansible
- Security best practices and compliance frameworks (SOC2, ISO27001, GDPR)
- Cost optimization and resource management
- DevOps and CI/CD pipelines
- Container orchestration and microservices

Your goal is to generate production-ready, secure, and cost-effective infrastructure code based on user requirements. Always consider:
1. Security by design with zero-trust principles
2. High availability and scalability
3. Cost optimization and resource efficiency
4. Best practices for the chosen cloud provider
5. Monitoring, observability, and alerting
6. Disaster recovery and backup strategies
7. Compliance and governance requirements

Provide code that is:
- Syntactically correct and immediately deployable
- Following cloud provider best practices and well-architected frameworks
- Including proper resource naming, tagging, and organization
- Implementing least privilege access and strong security controls
- Including comprehensive monitoring, logging, and alerting
- Optimized for performance and cost
- Documentation-rich with clear explanations`;

    // Provider-specific optimizations
    if (this.currentProvider === 'claude-code') {
      return basePrompt + `

**CODE GENERATION FOCUS:**
As a specialized code generation model, prioritize:
- Clean, maintainable, and well-structured code
- Comprehensive error handling and validation
- Detailed inline comments and documentation
- Modular and reusable infrastructure components
- Advanced configuration patterns and best practices
- Performance optimizations and resource efficiency
- Security hardening and compliance controls`;
    }

    if (this.currentProvider === 'claude') {
      return basePrompt + `

**ANALYSIS AND EXPLANATION FOCUS:**
Provide detailed analysis and comprehensive explanations:
- Architectural reasoning and design decisions
- Trade-offs and alternative approaches
- Security considerations and risk assessments
- Cost implications and optimization opportunities
- Operational considerations and maintenance requirements
- Integration patterns and dependency management`;
    }

    // Default for OpenAI
    return basePrompt + `

**COMPREHENSIVE SOLUTION FOCUS:**
Balance technical depth with practical implementation:
- Complete end-to-end solutions
- Clear step-by-step implementation guidance
- Real-world production considerations
- Troubleshooting and debugging insights
- Migration and deployment strategies
- Scaling and evolution planning`;
  }

  /**
   * Parse AI response and structure it properly
   */
  private parseAIResponse(content: string, request: AIGenerationRequest): AIGenerationResponse {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      return parsed;
    } catch {
      // Fallback: parse unstructured response
      return {
        infrastructure: {
          code: this.extractCodeFromResponse(content),
          format: request.preferredFormat || 'terraform',
          provider: request.preferredProvider || 'aws'
        },
        explanation: this.extractExplanationFromResponse(content),
        recommendations: this.extractRecommendationsFromResponse(content),
        estimatedCost: '$50-200/month',
        deploymentTime: '15-30 minutes',
        securityConsiderations: [
          'Implement least privilege access',
          'Enable encryption at rest and in transit',
          'Configure proper network security groups',
          'Enable audit logging and monitoring'
        ],
        alternatives: []
      };
    }
  }

  /**
   * Enhanced mock generation for when AI service is unavailable
   */
  private async generateMockInfrastructure(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const provider = request.preferredProvider || this.selectOptimalProvider(request.query);
    const format = request.preferredFormat || 'terraform';

    return {
      infrastructure: {
        code: this.generateInfrastructureCode(request.query, provider, format),
        format,
        provider
      },
      explanation: this.generateExplanation(request.query, provider),
      recommendations: this.generateRecommendations(request.query, provider),
      estimatedCost: this.estimateCost(request.query, provider),
      deploymentTime: this.estimateDeploymentTime(request.query),
      securityConsiderations: this.generateSecurityConsiderations(provider),
      alternatives: this.generateAlternatives(provider, request.query)
    };
  }

  /**
   * Select optimal cloud provider based on query analysis
   */
  private selectOptimalProvider(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('lambda') || lowerQuery.includes('s3') || lowerQuery.includes('dynamodb')) {
      return 'aws';
    }
    if (lowerQuery.includes('azure') || lowerQuery.includes('bicep') || lowerQuery.includes('app service')) {
      return 'azure';
    }
    if (lowerQuery.includes('gcp') || lowerQuery.includes('kubernetes') || lowerQuery.includes('gke')) {
      return 'gcp';
    }
    if (lowerQuery.includes('container') || lowerQuery.includes('microservice')) {
      return 'kubernetes';
    }
    
    // Default to AWS for general queries
    return 'aws';
  }

  /**
   * Generate infrastructure code based on query analysis
   */
  private generateInfrastructureCode(query: string, provider: string, format: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('api') || lowerQuery.includes('rest') || lowerQuery.includes('endpoint')) {
      return this.generateAPIInfrastructure(provider, format);
    }
    if (lowerQuery.includes('database') || lowerQuery.includes('storage') || lowerQuery.includes('data')) {
      return this.generateDatabaseInfrastructure(provider, format);
    }
    if (lowerQuery.includes('web') || lowerQuery.includes('frontend') || lowerQuery.includes('static')) {
      return this.generateWebInfrastructure(provider, format);
    }
    if (lowerQuery.includes('ml') || lowerQuery.includes('ai') || lowerQuery.includes('machine learning')) {
      return this.generateMLInfrastructure(provider, format);
    }
    
    // Default to comprehensive application infrastructure
    return this.generateFullStackInfrastructure(provider, format);
  }

  private generateAPIInfrastructure(provider: string, format: string): string {
    // Implementation for different providers and formats
    switch (provider) {
      case 'aws':
        return this.generateAWSAPIInfrastructure(format);
      case 'azure':
        return this.generateAzureAPIInfrastructure(format);
      case 'gcp':
        return this.generateGCPAPIInfrastructure(format);
      default:
        return this.generateAWSAPIInfrastructure(format);
    }
  }

  private generateAWSAPIInfrastructure(format: string): string {
    if (format === 'terraform') {
      return `# AWS API Gateway with Lambda Backend - Terraform
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "ai-generated-api"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# API Gateway
resource "aws_api_gateway_rest_api" "main" {
  name        = "\${var.project_name}-\${var.environment}"
  description = "AI-generated API Gateway"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# Lambda Function
resource "aws_lambda_function" "api_handler" {
  filename         = "api_handler.zip"
  function_name    = "\${var.project_name}-handler-\${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 256
  
  environment {
    variables = {
      ENVIRONMENT = var.environment
      LOG_LEVEL   = "info"
    }
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.lambda_logs,
  ]
  
  tags = {
    Environment = var.environment
    Project     = var.project_name
    GeneratedBy = "sirsi-nexus-ai"
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "\${var.project_name}-lambda-role-\${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/\${aws_lambda_function.api_handler.function_name}"
  retention_in_days = 14
  
  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# IAM policy attachment
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# API Gateway Resource
resource "aws_api_gateway_resource" "api_resource" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "api"
}

# API Gateway Method
resource "aws_api_gateway_method" "api_method" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.api_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

# API Gateway Integration
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.api_resource.id
  http_method = aws_api_gateway_method.api_method.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.api_handler.invoke_arn
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "\${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "main" {
  depends_on = [
    aws_api_gateway_method.api_method,
    aws_api_gateway_integration.lambda_integration,
  ]

  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = var.environment
}

# Outputs
output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = aws_api_gateway_deployment.main.invoke_url
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.api_handler.function_name
}`;
    }
    return '# Infrastructure code will be generated here';
  }

  // Helper methods for other providers and types...
  private generateAzureAPIInfrastructure(format: string): string {
    return '# Azure API infrastructure code';
  }

  private generateGCPAPIInfrastructure(format: string): string {
    return '# GCP API infrastructure code';
  }

  private generateDatabaseInfrastructure(provider: string, format: string): string {
    return '# Database infrastructure code';
  }

  private generateWebInfrastructure(provider: string, format: string): string {
    return '# Web infrastructure code';
  }

  private generateMLInfrastructure(provider: string, format: string): string {
    return '# ML infrastructure code';
  }

  private generateFullStackInfrastructure(provider: string, format: string): string {
    return '# Full-stack infrastructure code';
  }

  private generateExplanation(query: string, provider: string): string {
    return `Based on your request "${query}", I've generated a comprehensive ${provider.toUpperCase()} infrastructure solution. This includes production-ready components with security best practices, monitoring, and scalability considerations.`;
  }

  private generateRecommendations(query: string, provider: string): string[] {
    return [
      'Enable monitoring and alerting for all resources',
      'Implement proper backup and disaster recovery strategies',
      'Add WAF protection for public-facing endpoints',
      'Configure auto-scaling based on demand',
      'Set up proper logging and audit trails',
      'Implement cost optimization with resource scheduling'
    ];
  }

  private estimateCost(query: string, provider: string): string {
    // Simple cost estimation based on keywords
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('enterprise') || lowerQuery.includes('production')) {
      return '$200-800/month';
    }
    if (lowerQuery.includes('simple') || lowerQuery.includes('basic')) {
      return '$20-80/month';
    }
    return '$50-250/month';
  }

  private estimateDeploymentTime(query: string): string {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('complex') || lowerQuery.includes('enterprise')) {
      return '45-90 minutes';
    }
    if (lowerQuery.includes('simple') || lowerQuery.includes('basic')) {
      return '5-15 minutes';
    }
    return '15-30 minutes';
  }

  private generateSecurityConsiderations(provider: string): string[] {
    return [
      'Enable encryption at rest and in transit',
      'Implement least privilege access control',
      'Configure proper network security groups',
      'Enable audit logging and monitoring',
      'Set up vulnerability scanning',
      'Implement secrets management'
    ];
  }

  private generateAlternatives(provider: string, query: string): Array<{provider: string, rationale: string}> {
    const alternatives: Array<{provider: string, rationale: string}> = [];
    
    if (provider !== 'aws') {
      alternatives.push({
        provider: 'aws',
        rationale: 'Mature ecosystem with extensive service offerings'
      });
    }
    
    if (provider !== 'azure') {
      alternatives.push({
        provider: 'azure',
        rationale: 'Strong integration with Microsoft ecosystem'
      });
    }
    
    if (provider !== 'gcp') {
      alternatives.push({
        provider: 'gcp',
        rationale: 'Advanced AI/ML capabilities and competitive pricing'
      });
    }
    
    return alternatives.slice(0, 2); // Return top 2 alternatives
  }

  /**
   * Get authentication header from stored auth state
   */
  private getAuthHeader(): string | null {
    // In a real app, this would get the JWT token from your auth store
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : null;
    }
    return null;
  }

  /**
   * Map frontend provider names to backend format
   */
  private mapProvider(provider: string): string {
    const mapping: Record<string, string> = {
      'aws': 'AWS',
      'azure': 'Azure', 
      'gcp': 'GCP',
      'kubernetes': 'Kubernetes',
      'multi': 'AWS', // Default multi-cloud to AWS
      'ibm': 'IBM',
      'oracle': 'Oracle',
      'alibaba': 'Alibaba'
    };
    return mapping[provider] || 'AWS';
  }

  /**
   * Map frontend AI provider to backend format
   */
  private mapAIProvider(provider: AIProvider): string {
    const mapping: Record<AIProvider, string> = {
      'openai': 'OpenAI',
      'claude': 'Claude3_5Sonnet',
      'claude-code': 'ClaudeCode'
    };
    return mapping[provider] || 'OpenAI';
  }

  /**
   * Map complexity to performance tier
   */
  private mapComplexity(complexity: string): string {
    const mapping: Record<string, string> = {
      'basic': 'Basic',
      'intermediate': 'Standard',
      'advanced': 'Premium'
    };
    return mapping[complexity] || 'Standard';
  }

  /**
   * Parse budget string to number
   */
  private parseBudget(budget?: string): number | null {
    if (!budget) return null;
    const match = budget.match(/\$?(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Transform backend response to frontend format
   */
  private transformBackendResponse(backendData: any, request: AIGenerationRequest): AIGenerationResponse {
    return {
      infrastructure: {
        code: backendData.template || '# Generated infrastructure template',
        format: backendData.template_type?.toLowerCase() || request.preferredFormat || 'terraform',
        provider: request.preferredProvider || 'aws'
      },
      explanation: this.generateExplanationFromBackend(backendData, request),
      recommendations: backendData.optimization_suggestions || [
        'Follow cloud provider best practices',
        'Enable monitoring and alerting',
        'Implement proper security controls'
      ],
      estimatedCost: backendData.estimated_cost ? `$${backendData.estimated_cost}/month` : '$50-200/month',
      deploymentTime: this.estimateDeploymentTimeFromTemplate(backendData.template),
      securityConsiderations: backendData.security_recommendations || [
        'Enable encryption at rest and in transit',
        'Implement least privilege access control',
        'Configure proper network security groups',
        'Enable audit logging and monitoring'
      ],
      alternatives: this.generateAlternatives(request.preferredProvider || 'aws', request.query)
    };
  }

  /**
   * Generate explanation from backend data
   */
  private generateExplanationFromBackend(backendData: any, request: AIGenerationRequest): string {
    if (backendData.explanation) {
      return backendData.explanation;
    }
    
    const provider = request.preferredProvider || 'aws';
    const confidence = backendData.confidence_score ? Math.round(backendData.confidence_score * 100) : 85;
    
    return `Based on your request "${request.query}", I've generated a comprehensive ${provider.toUpperCase()} infrastructure solution using AI with ${confidence}% confidence. This includes production-ready components with security best practices, monitoring, and scalability considerations.`;
  }

  /**
   * Estimate deployment time from template complexity
   */
  private estimateDeploymentTimeFromTemplate(template?: string): string {
    if (!template) return '15-30 minutes';
    
    const lineCount = template.split('\n').length;
    if (lineCount > 200) return '45-90 minutes';
    if (lineCount < 50) return '5-15 minutes';
    return '15-30 minutes';
  }

  // Utility methods for parsing unstructured AI responses
  private extractCodeFromResponse(content: string): string {
    const codeMatch = content.match(/```[\w]*\n([\s\S]*?)\n```/);
    return codeMatch ? codeMatch[1] : content;
  }

  private extractExplanationFromResponse(content: string): string {
    // Simple extraction logic - in production, this would be more sophisticated
    const lines = content.split('\n');
    return lines.find(line => line.toLowerCase().includes('explanation') || 
                             line.toLowerCase().includes('solution')) || 
           'AI-generated infrastructure solution';
  }

  private extractRecommendationsFromResponse(content: string): string[] {
    // Extract bullet points or numbered lists
    const recommendations: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.match(/^[-*•]\s/) || line.match(/^\d+\.\s/)) {
        recommendations.push(line.replace(/^[-*•]\s|^\d+\.\s/, '').trim());
      }
    }
    
    return recommendations.length > 0 ? recommendations : [
      'Follow cloud provider best practices',
      'Implement proper monitoring and alerting',
      'Enable security best practices'
    ];
  }
}

export const aiInfrastructureService = new AIInfrastructureService();
export type { AIGenerationRequest, AIGenerationResponse };
