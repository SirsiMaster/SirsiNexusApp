/**
 * AI Context Service - Provides intelligent, context-aware assistance throughout SirsiNexus
 * Similar to Warp AI but customized for infrastructure management
 */

export interface AIContext {
  feature: string;
  page: string;
  userAction?: string;
  formData?: Record<string, any>;
  systemState?: Record<string, any>;
  userRole?: string;
  previousActions?: string[];
  errorContext?: string;
  performanceMetrics?: Record<string, any>;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  actions?: AIAction[];
  documentation?: string[];
  warnings?: string[];
  tips?: string[];
}

export interface AIAction {
  id: string;
  label: string;
  description: string;
  type: 'execute' | 'navigate' | 'configure' | 'explain';
  action: () => void | Promise<void>;
  icon?: string;
}

export class AIContextService {
  private static instance: AIContextService;
  private context: AIContext | null = null;
  private knowledgeBase: Record<string, any> = {};

  static getInstance(): AIContextService {
    if (!AIContextService.instance) {
      AIContextService.instance = new AIContextService();
    }
    return AIContextService.instance;
  }

  private constructor() {
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase() {
    this.knowledgeBase = {
      features: {
        'ai-orchestration': {
          description: 'Autonomous AI decision-making and workflow orchestration',
          capabilities: ['Decision engines', 'Workflow automation', 'Multi-criteria optimization'],
          commonTasks: ['Configure decision trees', 'Set up workflows', 'Monitor AI accuracy'],
          apis: ['/api/ai/orchestration', '/api/ai/decisions', '/api/ai/workflows'],
          metrics: { accuracy: '88%', responseTime: '120ms', decisions: '15k/day' }
        },
        'analytics': {
          description: 'Real-time analytics with ML-powered insights',
          capabilities: ['TensorFlow integration', 'Prophet forecasting', 'Anomaly detection'],
          commonTasks: ['Setup dashboards', 'Configure alerts', 'View predictions'],
          apis: ['/api/analytics/data', '/api/analytics/forecast', '/api/analytics/anomalies'],
          metrics: { accuracy: '94%', dataPoints: '50k+', uptime: '99.9%' }
        },
        'optimization': {
          description: 'AI-driven performance and cost optimization',
          capabilities: ['Predictive scaling', 'Cost optimization', 'Performance tuning'],
          commonTasks: ['Configure policies', 'Review recommendations', 'Monitor savings'],
          apis: ['/api/optimization/policies', '/api/optimization/recommendations'],
          metrics: { savings: '31%', accuracy: '91%', optimizations: '200+/day' }
        },
        'migration': {
          description: 'Intelligent cloud migration planning and execution',
          capabilities: ['Discovery', 'Assessment', 'Automated migration'],
          commonTasks: ['Start migration', 'Review plan', 'Monitor progress'],
          apis: ['/api/migration/plan', '/api/migration/execute', '/api/migration/status'],
          metrics: { successRate: '97%', avgDowntime: '2.3min', migrations: '500+' }
        },
        'security': {
          description: 'Comprehensive security and compliance management',
          capabilities: ['Threat detection', 'Compliance monitoring', 'Security automation'],
          commonTasks: ['Review alerts', 'Update policies', 'Generate reports'],
          apis: ['/api/security/threats', '/api/security/compliance', '/api/security/policies'],
          metrics: { threatsBlocked: '99.8%', compliance: '100%', incidents: '0 critical' }
        },
        'hypervisor': {
          description: 'Autonomous AI hypervisor for infrastructure management',
          capabilities: ['Resource management', 'Autonomous scaling', 'Policy enforcement'],
          commonTasks: ['Configure resources', 'Set policies', 'Monitor automation'],
          apis: ['/api/hypervisor/resources', '/api/hypervisor/policies'],
          metrics: { efficiency: '95%', automation: '80%', availability: '99.99%' }
        }
      },
      commonPatterns: {
        configuration: {
          tips: [
            'Start with conservative settings and gradually optimize',
            'Always test configurations in non-production environments first',
            'Use AI recommendations as a starting point, not absolute truth'
          ],
          warnings: [
            'Backup configurations before making changes',
            'Consider dependencies when modifying settings',
            'Monitor metrics after configuration changes'
          ]
        },
        troubleshooting: {
          steps: [
            'Check system health dashboard',
            'Review recent changes and deployments',
            'Examine error logs and metrics',
            'Verify resource availability',
            'Test connectivity and permissions'
          ]
        }
      }
    };
  }

  setContext(context: Partial<AIContext>) {
    this.context = { ...this.context, ...context } as AIContext;
  }

  getContext(): AIContext | null {
    return this.context;
  }

  async getContextualHelp(query?: string): Promise<AIResponse> {
    if (!this.context) {
      return {
        message: "I'm ready to help! What would you like to know about SirsiNexus?",
        suggestions: [
          "How do I get started?",
          "Show me the features overview",
          "What are the system requirements?"
        ]
      };
    }

    const feature = this.knowledgeBase.features[this.context.feature];
    
    if (query) {
      return this.processQuery(query, feature);
    }

    return this.getPageSpecificHelp(feature);
  }

  private async processQuery(query: string, feature: any): Promise<AIResponse> {
    const queryLower = query.toLowerCase();
    
    // Error help
    if (queryLower.includes('error') || queryLower.includes('issue') || queryLower.includes('problem')) {
      return this.getErrorHelp(query, feature);
    }

    // Configuration help
    if (queryLower.includes('configure') || queryLower.includes('setup') || queryLower.includes('config')) {
      return this.getConfigurationHelp(feature);
    }

    // Getting started help
    if (queryLower.includes('start') || queryLower.includes('begin') || queryLower.includes('first')) {
      return this.getGettingStartedHelp(feature);
    }

    // API/Technical help
    if (queryLower.includes('api') || queryLower.includes('endpoint') || queryLower.includes('integration')) {
      return this.getAPIHelp(feature);
    }

    // Performance/Metrics help
    if (queryLower.includes('performance') || queryLower.includes('metric') || queryLower.includes('monitor')) {
      return this.getPerformanceHelp(feature);
    }

    // Default contextual response
    return this.getContextualResponse(query, feature);
  }

  private getPageSpecificHelp(feature: any): AIResponse {
    if (!feature) {
      return {
        message: "I can help you with any aspect of SirsiNexus. What would you like to know?",
        suggestions: [
          "Show me available features",
          "How do I navigate the platform?",
          "What are the key capabilities?"
        ]
      };
    }

    const page = this.context?.page || '';
    
    if (page.includes('docs')) {
      return {
        message: `You're viewing the ${feature.description} documentation. Here's what I can help you with:`,
        suggestions: [
          "Explain the key concepts",
          "Show me configuration examples",
          "What are the API endpoints?",
          "How do I get started?"
        ],
        tips: [
          "Use Ctrl+F to search within the documentation",
          "Check the 'Related Resources' section for additional guides",
          "Try the tutorial for hands-on learning"
        ]
      };
    }

    if (page.includes('tutorial')) {
      return {
        message: `I can guide you through the ${this.context?.feature} tutorial step by step.`,
        suggestions: [
          "Explain the current step",
          "What's the next action I should take?",
          "Show me the prerequisites",
          "Help me troubleshoot this step"
        ],
        actions: [
          {
            id: 'next-step',
            label: 'Next Step',
            description: 'Move to the next tutorial step',
            type: 'navigate',
            action: () => console.log('Navigate to next step')
          }
        ]
      };
    }

    return {
      message: `I'm here to help with ${feature.description}. Current metrics: ${Object.entries(feature.metrics).map(([k, v]) => `${k}: ${v}`).join(', ')}`,
      suggestions: feature.commonTasks.map((task: string) => `Help me ${task.toLowerCase()}`),
      documentation: [`${this.context?.feature}/docs`, `${this.context?.feature}/tutorial`, `${this.context?.feature}/faq`]
    };
  }

  private getErrorHelp(query: string, feature: any): AIResponse {
    const troubleshootingSteps = this.knowledgeBase.commonPatterns.troubleshooting.steps;
    
    return {
      message: "I can help you troubleshoot this issue. Let's work through it systematically.",
      suggestions: [
        "What error message are you seeing?",
        "When did this issue start occurring?",
        "What were you trying to do when it happened?"
      ],
      actions: [
        {
          id: 'check-health',
          label: 'Check System Health',
          description: 'View system health dashboard',
          type: 'navigate',
          action: () => { window.open('/observability', '_blank'); }
        },
        {
          id: 'view-logs',
          label: 'View Logs',
          description: 'Open recent system logs',
          type: 'navigate', 
          action: () => console.log('Open logs')
        }
      ],
      tips: troubleshootingSteps
    };
  }

  private getConfigurationHelp(feature: any): AIResponse {
    const configTips = this.knowledgeBase.commonPatterns.configuration.tips;
    const warnings = this.knowledgeBase.commonPatterns.configuration.warnings;

    return {
      message: `I can help you configure ${feature.description}. Here are some best practices:`,
      suggestions: [
        "Show me the recommended settings",
        "How do I backup my current configuration?",
        "What are the security considerations?",
        "Can I test this configuration safely?"
      ],
      tips: configTips,
      warnings: warnings,
      actions: [
        {
          id: 'backup-config',
          label: 'Backup Configuration',
          description: 'Save current settings',
          type: 'execute',
          action: () => console.log('Backup configuration')
        }
      ]
    };
  }

  private getGettingStartedHelp(feature: any): AIResponse {
    return {
      message: `Let me help you get started with ${feature.description}. Here's a quick overview:`,
      suggestions: [
        "Show me the tutorial",
        "What are the prerequisites?",
        "Give me a quick demo",
        "How long does setup take?"
      ],
      actions: [
        {
          id: 'start-tutorial',
          label: 'Start Tutorial',
          description: 'Begin the step-by-step guide',
          type: 'navigate',
          action: () => { window.location.href = `/${this.context?.feature}/tutorial`; }
        },
        {
          id: 'quick-setup',
          label: 'Quick Setup',
          description: 'Auto-configure with recommended settings',
          type: 'execute',
          action: () => console.log('Quick setup')
        }
      ],
      documentation: [`${this.context?.feature}/tutorial`, `${this.context?.feature}/docs`]
    };
  }

  private getAPIHelp(feature: any): AIResponse {
    return {
      message: `Here are the available API endpoints for ${feature.description}:`,
      suggestions: feature.apis.map((api: string) => `Show me examples for ${api}`),
      actions: [
        {
          id: 'api-docs',
          label: 'View API Documentation',
          description: 'Open complete API reference',
          type: 'navigate',
          action: () => { window.open(`/${this.context?.feature}/docs#api-reference`, '_blank'); }
        },
        {
          id: 'test-api',
          label: 'Test API',
          description: 'Try API calls in sandbox',
          type: 'execute',
          action: () => console.log('Open API testing tool')
        }
      ],
      tips: [
        "All APIs require authentication with Bearer tokens",
        "Rate limits apply: 1000 requests per minute",
        "Use pagination for large result sets"
      ]
    };
  }

  private getPerformanceHelp(feature: any): AIResponse {
    return {
      message: `Current ${feature.description} performance metrics:`,
      suggestions: [
        "How can I improve performance?",
        "What do these metrics mean?",
        "Show me historical trends",
        "Set up performance alerts"
      ],
      actions: [
        {
          id: 'view-metrics',
          label: 'View Detailed Metrics',
          description: 'Open performance dashboard',
          type: 'navigate',
          action: () => { window.open('/analytics', '_blank'); }
        },
        {
          id: 'optimize',
          label: 'Auto-Optimize',
          description: 'Apply AI recommendations',
          type: 'execute',
          action: () => console.log('Apply optimizations')
        }
      ],
      tips: Object.entries(feature.metrics).map(([key, value]) => `${key}: ${value}`)
    };
  }

  private getContextualResponse(query: string, feature: any): AIResponse {
    return {
      message: `I understand you're asking about "${query}" in the context of ${feature.description}. Let me help you with that.`,
      suggestions: [
        "Can you be more specific?",
        "Show me related documentation",
        "What are you trying to accomplish?",
        "Walk me through this step by step"
      ],
      documentation: [`${this.context?.feature}/docs`, `${this.context?.feature}/faq`],
      tips: [
        "Try asking more specific questions for better help",
        "I have access to all platform documentation and real-time metrics",
        "I can provide code examples, configurations, and troubleshooting steps"
      ]
    };
  }

  // Field-specific context awareness
  getFieldHelp(fieldName: string, fieldType: string, currentValue?: any): AIResponse {
    const fieldHelp = this.getFieldSpecificHelp(fieldName, fieldType, currentValue);
    return fieldHelp;
  }

  private getFieldSpecificHelp(fieldName: string, fieldType: string, currentValue?: any): AIResponse {
    const fieldPatterns = {
      cpu: {
        message: "CPU allocation affects performance and cost. Recommendations based on workload type:",
        tips: [
          "Web applications: 2-4 vCPUs for moderate traffic",
          "Database servers: 4-8 vCPUs for OLTP workloads", 
          "ML/Analytics: 8+ vCPUs for compute-intensive tasks"
        ],
        warnings: currentValue > 16 ? ["High CPU allocation may increase costs significantly"] : []
      },
      memory: {
        message: "Memory configuration impacts application performance and stability:",
        tips: [
          "Allocate 2-4x your application's base memory requirement",
          "Database servers typically need 8-32GB depending on dataset size",
          "Consider memory-to-CPU ratio: typically 2-8GB per vCPU"
        ],
        warnings: currentValue > 64 ? ["Very high memory allocation - ensure this is needed"] : []
      },
      timeout: {
        message: "Timeout values balance responsiveness with reliability:",
        tips: [
          "API timeouts: 30-60 seconds for most operations",
          "Database connections: 5-30 seconds",
          "Long-running processes: Consider async patterns"
        ],
        warnings: currentValue > 300 ? ["Very long timeouts may impact user experience"] : []
      }
    };

    const pattern = fieldPatterns[fieldName.toLowerCase() as keyof typeof fieldPatterns];
    
    if (pattern) {
      return {
        message: pattern.message,
        tips: pattern.tips,
        warnings: pattern.warnings,
        suggestions: [
          "What's the recommended value?",
          "Show me best practices",
          "How does this affect performance?"
        ]
      };
    }

    return {
      message: `I can help you configure the ${fieldName} field. What would you like to know?`,
      suggestions: [
        "What should I enter here?",
        "What are the valid options?",
        "Show me an example",
        "How does this affect the system?"
      ]
    };
  }

  // Form validation assistance
  validateField(fieldName: string, value: any, rules?: any): { isValid: boolean; aiHelp?: AIResponse } {
    // Basic validation logic
    const isValid = this.performBasicValidation(fieldName, value, rules);
    
    if (!isValid) {
      const aiHelp = this.getValidationHelp(fieldName, value, rules);
      return { isValid: false, aiHelp };
    }

    return { isValid: true };
  }

  private performBasicValidation(fieldName: string, value: any, rules?: any): boolean {
    if (rules?.required && !value) return false;
    if (rules?.min && value < rules.min) return false;
    if (rules?.max && value > rules.max) return false;
    if (rules?.pattern && !rules.pattern.test(value)) return false;
    return true;
  }

  private getValidationHelp(fieldName: string, value: any, rules?: any): AIResponse {
    let message = `There's an issue with the ${fieldName} field. `;
    const suggestions: string[] = [];

    if (rules?.required && !value) {
      message += "This field is required.";
      suggestions.push("What should I enter here?");
    } else if (rules?.min && value < rules.min) {
      message += `Value must be at least ${rules.min}.`;
      suggestions.push("What's the minimum allowed value?");
    } else if (rules?.max && value > rules.max) {
      message += `Value cannot exceed ${rules.max}.`;
      suggestions.push("What's the maximum allowed value?");
    } else if (rules?.pattern) {
      message += "The format is invalid.";
      suggestions.push("Show me the correct format", "Give me an example");
    }

    return {
      message,
      suggestions,
      tips: ["Check the field requirements", "Hover over the field for more information"]
    };
  }
}

export const aiContextService = AIContextService.getInstance();
