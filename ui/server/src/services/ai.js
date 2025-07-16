const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const database = require('./database');

class AIService {
  constructor() {
    // Initialize AI clients
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;

    this.anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    }) : null;

    this.jobQueue = new Map();
    this.activeJobs = new Map();
    
    console.log('AI service initialized');
  }

  // Infrastructure optimization recommendations
  async generateInfrastructureOptimizations(userId, resourceData) {
    try {
      const jobId = await this.createAIJob(userId, 'infrastructure_optimization', { resources: resourceData });
      
      // Process in background
      setImmediate(() => this.processInfrastructureOptimization(jobId, userId, resourceData));
      
      return { jobId, status: 'processing' };
    } catch (error) {
      console.error('Failed to generate infrastructure optimizations:', error);
      throw new Error('Failed to start optimization analysis');
    }
  }

  async processInfrastructureOptimization(jobId, userId, resourceData) {
    try {
      await this.updateAIJobStatus(jobId, 'running', 10);

      const prompt = this.buildInfrastructureOptimizationPrompt(resourceData);
      
      let recommendations = null;

      // Try OpenAI first, fall back to Anthropic
      if (this.openai) {
        recommendations = await this.getOpenAIRecommendations(prompt);
      } else if (this.anthropic) {
        recommendations = await this.getAnthropicRecommendations(prompt);
      } else {
        // Fallback to rule-based optimization if no AI APIs available
        recommendations = await this.getRuleBasedOptimizations(resourceData);
      }

      await this.updateAIJobStatus(jobId, 'completed', 100, recommendations);

      // Trigger notifications for significant savings
      if (recommendations.potentialSavings > 1000) {
        // This would integrate with the notification service
        console.log(`Significant savings found: $${recommendations.potentialSavings}`);
      }

      return recommendations;
    } catch (error) {
      console.error('Infrastructure optimization failed:', error);
      await this.updateAIJobStatus(jobId, 'failed', 0, null, error.message);
    }
  }

  buildInfrastructureOptimizationPrompt(resources) {
    const resourceSummary = resources.map(r => ({
      type: r.type,
      provider: r.provider,
      region: r.region,
      size: r.size,
      utilization: r.utilization || 'unknown',
      monthlyCost: r.cost || 'unknown',
      uptime: r.uptime || 'unknown'
    }));

    return `
Analyze the following cloud infrastructure and provide optimization recommendations:

Resources:
${JSON.stringify(resourceSummary, null, 2)}

Please provide:
1. Cost optimization opportunities
2. Performance improvements
3. Security enhancements
4. Scalability recommendations
5. Estimated monthly savings

Respond in JSON format with the following structure:
{
  "recommendations": [
    {
      "type": "cost|performance|security|scalability",
      "title": "Brief title",
      "description": "Detailed explanation",
      "impact": "high|medium|low",
      "effort": "high|medium|low",
      "monthlySavings": 0
    }
  ],
  "potentialSavings": 0,
  "riskLevel": "low|medium|high",
  "summary": "Overall summary of recommendations"
}
`;
  }

  async getOpenAIRecommendations(prompt) {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert cloud infrastructure consultant. Provide practical, actionable recommendations for cost optimization and performance improvement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (e) {
      // If JSON parsing fails, create a structured response
      return {
        recommendations: [{
          type: "analysis",
          title: "AI Analysis",
          description: content,
          impact: "medium",
          effort: "medium",
          monthlySavings: 0
        }],
        potentialSavings: 0,
        riskLevel: "low",
        summary: "AI-generated infrastructure analysis"
      };
    }
  }

  async getAnthropicRecommendations(prompt) {
    const message = await this.anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const content = message.content[0].text;
    
    try {
      return JSON.parse(content);
    } catch (e) {
      return {
        recommendations: [{
          type: "analysis",
          title: "AI Analysis",
          description: content,
          impact: "medium",
          effort: "medium",
          monthlySavings: 0
        }],
        potentialSavings: 0,
        riskLevel: "low",
        summary: "AI-generated infrastructure analysis"
      };
    }
  }

  // Rule-based fallback optimization
  async getRuleBasedOptimizations(resources) {
    const recommendations = [];
    let totalSavings = 0;

    resources.forEach(resource => {
      // Check for oversized instances
      if (resource.utilization && parseFloat(resource.utilization) < 30) {
        const saving = Math.floor((resource.cost || 0) * 0.3);
        recommendations.push({
          type: "cost",
          title: `Downsize ${resource.name}`,
          description: `Resource utilization is ${resource.utilization}%. Consider downsizing to reduce costs.`,
          impact: "high",
          effort: "low",
          monthlySavings: saving
        });
        totalSavings += saving;
      }

      // Check for unused resources
      if (resource.uptime && parseFloat(resource.uptime) < 50) {
        const saving = Math.floor(resource.cost || 0);
        recommendations.push({
          type: "cost",
          title: `Remove unused ${resource.name}`,
          description: `Resource has ${resource.uptime}% uptime. Consider removing if not needed.`,
          impact: "high",
          effort: "low",
          monthlySavings: saving
        });
        totalSavings += saving;
      }

      // Regional optimization
      if (resource.provider === 'aws' && resource.region.includes('us-east-1')) {
        recommendations.push({
          type: "cost",
          title: `Consider regional optimization for ${resource.name}`,
          description: "Moving to other regions might offer cost savings.",
          impact: "medium",
          effort: "high",
          monthlySavings: Math.floor((resource.cost || 0) * 0.1)
        });
      }
    });

    return {
      recommendations,
      potentialSavings: totalSavings,
      riskLevel: "low",
      summary: `Found ${recommendations.length} optimization opportunities with potential savings of $${totalSavings}/month`
    };
  }

  // Security analysis
  async generateSecurityAnalysis(userId, resourceData, configuration) {
    try {
      const jobId = await this.createAIJob(userId, 'security_analysis', { resources: resourceData, config: configuration });
      
      setImmediate(() => this.processSecurityAnalysis(jobId, userId, resourceData, configuration));
      
      return { jobId, status: 'processing' };
    } catch (error) {
      console.error('Failed to generate security analysis:', error);
      throw new Error('Failed to start security analysis');
    }
  }

  async processSecurityAnalysis(jobId, userId, resourceData, configuration) {
    try {
      await this.updateAIJobStatus(jobId, 'running', 20);

      const prompt = this.buildSecurityAnalysisPrompt(resourceData, configuration);
      
      let analysis = null;

      if (this.openai) {
        analysis = await this.getOpenAISecurityAnalysis(prompt);
      } else if (this.anthropic) {
        analysis = await this.getAnthropicSecurityAnalysis(prompt);
      } else {
        analysis = await this.getRuleBasedSecurityAnalysis(resourceData, configuration);
      }

      await this.updateAIJobStatus(jobId, 'completed', 100, analysis);

      // Trigger security alerts for high-risk findings
      if (analysis.riskLevel === 'high') {
        console.log('High-risk security issues found');
      }

      return analysis;
    } catch (error) {
      console.error('Security analysis failed:', error);
      await this.updateAIJobStatus(jobId, 'failed', 0, null, error.message);
    }
  }

  buildSecurityAnalysisPrompt(resources, configuration) {
    return `
Analyze the following cloud infrastructure for security vulnerabilities and compliance issues:

Resources: ${JSON.stringify(resources, null, 2)}
Configuration: ${JSON.stringify(configuration, null, 2)}

Please identify:
1. Security vulnerabilities
2. Compliance issues
3. Best practice violations
4. Recommended remediation steps

Respond in JSON format with:
{
  "findings": [
    {
      "severity": "critical|high|medium|low",
      "category": "access|network|encryption|compliance|monitoring",
      "title": "Brief title",
      "description": "Detailed description",
      "remediation": "Step-by-step remediation",
      "resources": ["affected resource IDs"]
    }
  ],
  "riskLevel": "low|medium|high|critical",
  "complianceScore": 85,
  "summary": "Overall security assessment"
}
`;
  }

  async getOpenAISecurityAnalysis(prompt) {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system", 
          content: "You are a cybersecurity expert specializing in cloud infrastructure security. Provide thorough security analysis and actionable remediation steps."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2500
    });

    const content = completion.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (e) {
      return {
        findings: [{
          severity: "medium",
          category: "analysis",
          title: "Security Analysis",
          description: content,
          remediation: "Review the analysis and implement recommended security measures",
          resources: []
        }],
        riskLevel: "medium",
        complianceScore: 70,
        summary: "AI-generated security analysis"
      };
    }
  }

  async getAnthropicSecurityAnalysis(prompt) {
    const message = await this.anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 2500,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const content = message.content[0].text;
    
    try {
      return JSON.parse(content);
    } catch (e) {
      return {
        findings: [{
          severity: "medium",
          category: "analysis",
          title: "Security Analysis",
          description: content,
          remediation: "Review the analysis and implement recommended security measures",
          resources: []
        }],
        riskLevel: "medium",
        complianceScore: 70,
        summary: "AI-generated security analysis"
      };
    }
  }

  async getRuleBasedSecurityAnalysis(resources, configuration) {
    const findings = [];
    let riskLevel = "low";
    let complianceScore = 90;

    resources.forEach(resource => {
      // Check for public access
      if (resource.publicAccess === true) {
        findings.push({
          severity: "high",
          category: "access",
          title: `Public access detected on ${resource.name}`,
          description: "Resource is publicly accessible which may pose security risks",
          remediation: "Review access controls and restrict public access if not required",
          resources: [resource.id]
        });
        riskLevel = "high";
        complianceScore -= 10;
      }

      // Check for encryption
      if (resource.encrypted === false) {
        findings.push({
          severity: "medium",
          category: "encryption",
          title: `Encryption not enabled on ${resource.name}`,
          description: "Data at rest is not encrypted",
          remediation: "Enable encryption for data at rest",
          resources: [resource.id]
        });
        complianceScore -= 5;
      }

      // Check for monitoring
      if (!resource.monitoring) {
        findings.push({
          severity: "low",
          category: "monitoring",
          title: `Monitoring not configured for ${resource.name}`,
          description: "No monitoring or logging is configured",
          remediation: "Configure monitoring and logging for security visibility",
          resources: [resource.id]
        });
        complianceScore -= 3;
      }
    });

    return {
      findings,
      riskLevel,
      complianceScore: Math.max(complianceScore, 0),
      summary: `Security analysis complete. Found ${findings.length} issues with overall risk level: ${riskLevel}`
    };
  }

  // Performance recommendations
  async generatePerformanceRecommendations(userId, metrics) {
    try {
      const jobId = await this.createAIJob(userId, 'performance_analysis', { metrics });
      
      setImmediate(() => this.processPerformanceAnalysis(jobId, userId, metrics));
      
      return { jobId, status: 'processing' };
    } catch (error) {
      console.error('Failed to generate performance recommendations:', error);
      throw new Error('Failed to start performance analysis');
    }
  }

  async processPerformanceAnalysis(jobId, userId, metrics) {
    try {
      await this.updateAIJobStatus(jobId, 'running', 30);

      // Analyze performance metrics and generate recommendations
      const recommendations = await this.analyzePerformanceMetrics(metrics);

      await this.updateAIJobStatus(jobId, 'completed', 100, recommendations);

      return recommendations;
    } catch (error) {
      console.error('Performance analysis failed:', error);
      await this.updateAIJobStatus(jobId, 'failed', 0, null, error.message);
    }
  }

  async analyzePerformanceMetrics(metrics) {
    const recommendations = [];

    // CPU utilization analysis
    if (metrics.cpu && metrics.cpu.average > 80) {
      recommendations.push({
        type: "performance",
        title: "High CPU Utilization",
        description: `Average CPU utilization is ${metrics.cpu.average}%. Consider scaling up or optimizing workloads.`,
        impact: "high",
        effort: "medium"
      });
    }

    // Memory analysis
    if (metrics.memory && metrics.memory.average > 85) {
      recommendations.push({
        type: "performance",
        title: "High Memory Usage",
        description: `Memory usage is ${metrics.memory.average}%. Consider increasing memory or optimizing applications.`,
        impact: "high",
        effort: "medium"
      });
    }

    // Network latency analysis
    if (metrics.network && metrics.network.latency > 100) {
      recommendations.push({
        type: "performance",
        title: "High Network Latency",
        description: `Network latency is ${metrics.network.latency}ms. Consider CDN or regional optimization.`,
        impact: "medium",
        effort: "high"
      });
    }

    return {
      recommendations,
      overallScore: this.calculatePerformanceScore(metrics),
      summary: `Performance analysis identified ${recommendations.length} areas for improvement`
    };
  }

  calculatePerformanceScore(metrics) {
    let score = 100;
    
    if (metrics.cpu && metrics.cpu.average > 80) score -= 20;
    if (metrics.memory && metrics.memory.average > 85) score -= 20;
    if (metrics.network && metrics.network.latency > 100) score -= 15;
    if (metrics.disk && metrics.disk.io > 90) score -= 15;

    return Math.max(score, 0);
  }

  // AI job management
  async createAIJob(userId, type, data) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job = {
      id: jobId,
      user_id: userId,
      type,
      status: 'pending',
      progress: 0,
      data: JSON.stringify(data),
      result: null,
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await database.createAIJob(job);
    this.activeJobs.set(jobId, job);

    return jobId;
  }

  async updateAIJobStatus(jobId, status, progress, result = null, errorMessage = null) {
    const updates = {
      status,
      progress,
      result: result ? JSON.stringify(result) : null,
      error_message: errorMessage,
      updated_at: new Date().toISOString()
    };

    await database.updateAIJob(jobId, updates);

    // Update local cache
    if (this.activeJobs.has(jobId)) {
      const job = this.activeJobs.get(jobId);
      Object.assign(job, updates);
    }

    // Notify via WebSocket if available
    if (global.webSocketService) {
      global.webSocketService.broadcastAIJobUpdate({
        jobId,
        type: this.activeJobs.get(jobId)?.type,
        status,
        progress,
        result,
        priority: 'normal'
      });
    }
  }

  async getAIJob(jobId) {
    if (this.activeJobs.has(jobId)) {
      return this.activeJobs.get(jobId);
    }
    
    return await database.getAIJob(jobId);
  }

  async getUserAIJobs(userId, limit = 50) {
    return await database.getUserAIJobs(userId, limit);
  }

  // Chat/conversation with AI
  async chatWithAI(userId, message, context = {}) {
    try {
      let response = null;

      if (this.openai) {
        response = await this.getChatResponseOpenAI(message, context);
      } else if (this.anthropic) {
        response = await this.getChatResponseAnthropic(message, context);
      } else {
        response = "AI services are not currently available. Please check your API key configuration.";
      }

      // Store conversation history
      await this.storeChatMessage(userId, message, response, context);

      return { response, timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('Chat with AI failed:', error);
      throw new Error('Failed to get AI response');
    }
  }

  async getChatResponseOpenAI(message, context) {
    const systemPrompt = `You are an AI assistant for SirsiNexus, a cloud infrastructure management platform. 
    Help users with cloud infrastructure questions, optimization, security, and best practices.
    
    Current context: ${JSON.stringify(context)}`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return completion.choices[0].message.content;
  }

  async getChatResponseAnthropic(message, context) {
    const systemPrompt = `You are an AI assistant for SirsiNexus, a cloud infrastructure management platform. 
    Help users with cloud infrastructure questions, optimization, security, and best practices.
    
    Current context: ${JSON.stringify(context)}`;

    const response = await this.anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `${systemPrompt}\n\nUser question: ${message}`
        }
      ]
    });

    return response.content[0].text;
  }

  async storeChatMessage(userId, message, response, context) {
    // Store in database for conversation history
    await database.storeChatMessage({
      user_id: userId,
      message,
      response,
      context: JSON.stringify(context),
      created_at: new Date().toISOString()
    });
  }

  // Health check
  isHealthy() {
    return this.openai !== null || this.anthropic !== null;
  }

  getAvailableServices() {
    return {
      openai: this.openai !== null,
      anthropic: this.anthropic !== null
    };
  }
}

module.exports = AIService;
