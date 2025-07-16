use async_openai::{
    config::OpenAIConfig,
    types::{
        ChatCompletionRequestMessage, ChatCompletionRequestSystemMessage,
        ChatCompletionRequestUserMessage, ChatCompletionRequestUserMessageContent,
        CreateChatCompletionRequest, Role,
    },
    Client,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::error::{AppError, AppResult};

// New AI orchestration modules
pub mod decision;
pub mod orchestration;
pub mod feature_awareness;
pub mod hypervisor_integration;

// Phase 6.3: Sirsi-Centric AI Enhancement modules
pub mod consciousness;
pub mod persona;
pub mod communication;
pub mod multi_cloud_orchestration;

// Re-export key types from new modules
pub use decision::{
    DecisionEngine, DecisionContext, DecisionOption, Decision,
    UserPreferences, CloudState, DecisionError
};

pub use orchestration::{
    AIOrchestrationEngine, OrchestrationTask, TaskType, TaskStatus,
    OrchestrationError, PerformanceMetrics, OptimizationResults
};

pub use feature_awareness::{
    FeatureRegistry, Feature, FeatureCategory, FeatureStatus, 
    AIContext, Workflow, AutomationLevel
};

pub use hypervisor_integration::{
    HypervisorIntegration, HypervisorSession, ExecutionRequest, 
    ExecutionResult, ExecutionStatus, Priority, SafetyLevel, Permission
};

// Phase 6.3: Sirsi-Centric AI Enhancement re-exports
pub use consciousness::{
    SirsiConsciousness, SirsiIdentity, SirsiPersonality, MemorySystem, LearningEngine,
    IntentProcessor, ResponseGenerator, ContextAwareness, UserIntent, SirsiResponse,
    SirsiCapability, DomainExpertise, ExpertiseLevel, ConsciousnessLevel,
    ProactiveSuggestion, PredictiveInsight, ActionType, ImpactLevel, EffortLevel,
    IntentType, UrgencyLevel, ComplexityLevel, InsightCategory, TimeFrame,
};

pub use persona::{
    SirsiPersona, AgentScheduler, ContextManager, UserContext, GlobalContext,
    AgentTask, RecentInteraction, InteractionType,
    SystemStatus, SharedKnowledge,
};

pub use communication::{
    AgentCommunicator, AgentChannel, SirsiInterface, SirsiToAgentMessage, AgentToSirsiMessage,
    SirsiMessageType, AgentMessageType, MessagePriority, AgentType, CloudProvider,
    AgentCapability, AgentHealthStatus, HealthStatus, CommunicationMetrics,
    SirsiRequestHandler, SirsiResponseSender, SirsiContextSync, CapabilityReporter,
};

pub use multi_cloud_orchestration::{
    MultiCloudOrchestrator, OrchestrationSession, OrchestrationStrategy,
    CrossCloudKnowledgeSynthesizer, OrchestrationMetrics, MultiCloudCommunication,
    SessionStatus, TaskStatus as MultiCloudTaskStatus, TaskPriority, PerformanceRequirements,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIConfig {
    pub openai_api_key: Option<String>,
    pub model: String,
    pub max_tokens: u16,
    pub temperature: f32,
}

impl Default for AIConfig {
    fn default() -> Self {
        Self {
            openai_api_key: None,
            model: "gpt-4".to_string(),
            max_tokens: 500,
            temperature: 0.7,
        }
    }
}

#[derive(Debug, Clone)]
pub struct AIRecommendation {
    pub title: String,
    pub description: String,
    pub action_type: String,
    pub parameters: HashMap<String, String>,
    pub confidence: f32,
    pub priority: i32,
}

#[derive(Debug, Clone)]
pub struct AgentIntelligence {
    client: Option<Client<OpenAIConfig>>,
    config: AIConfig,
    agent_type: String,
}

impl AgentIntelligence {
    pub fn new(agent_type: String, config: AIConfig) -> Self {
        let client = if let Some(api_key) = &config.openai_api_key {
            let openai_config = OpenAIConfig::new().with_api_key(api_key);
            Some(Client::with_config(openai_config))
        } else {
            None
        };

        Self {
            client,
            config,
            agent_type,
        }
    }

    /// Generate intelligent response to user message based on agent context
    pub async fn generate_response(
        &self,
        message: &str,
        context: HashMap<String, String>,
    ) -> AppResult<String> {
        if let Some(client) = &self.client {
            let system_prompt = self.get_system_prompt(&context);
            let user_message = format!("User request: {}", message);

            let request = CreateChatCompletionRequest {
                model: self.config.model.clone(),
                messages: vec![
                    ChatCompletionRequestMessage::System(ChatCompletionRequestSystemMessage {
                        content: system_prompt,
                        role: Role::System,
                        name: None,
                    }),
                    ChatCompletionRequestMessage::User(ChatCompletionRequestUserMessage {
                        content: ChatCompletionRequestUserMessageContent::Text(user_message),
                        role: Role::User,
                        name: None,
                    }),
                ],
                max_tokens: Some(self.config.max_tokens),
                temperature: Some(self.config.temperature),
                ..Default::default()
            };

            let response = client
                .chat()
                .create(request)
                .await
                .map_err(|e| AppError::ExternalService(format!("OpenAI API error: {}", e)))?;

            if let Some(choice) = response.choices.first() {
                if let Some(content) = &choice.message.content {
                    return Ok(content.clone());
                }
            }

            Ok(self.get_fallback_response(message, &context))
        } else {
            // Fallback to enhanced deterministic responses when no API key
            Ok(self.get_fallback_response(message, &context))
        }
    }

    /// Generate intelligent recommendations based on context
    pub async fn generate_recommendations(
        &self,
        context_type: &str,
        context: HashMap<String, String>,
    ) -> AppResult<Vec<AIRecommendation>> {
        if let Some(client) = &self.client {
            let system_prompt = self.get_recommendations_system_prompt(context_type, &context);

            let request = CreateChatCompletionRequest {
                model: self.config.model.clone(),
                messages: vec![
                    ChatCompletionRequestMessage::System(ChatCompletionRequestSystemMessage {
                        content: system_prompt,
                        role: Role::System,
                        name: None,
                    }),
                    ChatCompletionRequestMessage::User(ChatCompletionRequestUserMessage {
                        content: ChatCompletionRequestUserMessageContent::Text(
                            format!("Generate specific, actionable recommendations for {} context", context_type)
                        ),
                        role: Role::User,
                        name: None,
                    }),
                ],
                max_tokens: Some(800),
                temperature: Some(0.3), // Lower temperature for more focused recommendations
                ..Default::default()
            };

            let response = client
                .chat()
                .create(request)
                .await
                .map_err(|e| AppError::ExternalService(format!("OpenAI API error: {}", e)))?;

            if let Some(choice) = response.choices.first() {
                if let Some(content) = &choice.message.content {
                    return Ok(self.parse_ai_recommendations(content));
                }
            }
        }

        // Fallback to deterministic recommendations
        Ok(self.get_fallback_recommendations(context_type, &context))
    }

    fn get_system_prompt(&self, context: &HashMap<String, String>) -> String {
        match self.agent_type.as_str() {
            "aws" => format!(
                "You are an expert AWS cloud architect and DevOps engineer. You help users manage AWS infrastructure, \
                optimize costs, improve security, and implement best practices. \
                Current context: {}. \
                Provide practical, actionable responses focused on AWS services and solutions. \
                Keep responses concise but comprehensive.",
                serde_json::to_string(context).unwrap_or_default()
            ),
            "azure" => format!(
                "You are an expert Microsoft Azure cloud architect. You specialize in Azure services, \
                resource management, cost optimization, and enterprise integration. \
                Current context: {}. \
                Provide specific Azure-focused guidance with practical implementation steps. \
                Reference specific Azure services and best practices.",
                serde_json::to_string(context).unwrap_or_default()
            ),
            "gcp" => format!(
                "You are an expert Google Cloud Platform engineer. You help with GCP services, \
                infrastructure management, data analytics, and machine learning deployments. \
                Current context: {}. \
                Provide GCP-specific recommendations with focus on Google Cloud services and tools.",
                serde_json::to_string(context).unwrap_or_default()
            ),
            "security" => format!(
                "You are a cybersecurity expert specializing in cloud security, compliance, and threat detection. \
                You help implement security best practices, audit configurations, and ensure compliance. \
                Current context: {}. \
                Focus on security implications, compliance requirements, and risk mitigation strategies.",
                serde_json::to_string(context).unwrap_or_default()
            ),
            "migration" => format!(
                "You are a cloud migration specialist with expertise in cross-cloud migrations, \
                application modernization, and infrastructure transformation. \
                Current context: {}. \
                Provide step-by-step migration guidance with focus on minimal downtime and risk reduction.",
                serde_json::to_string(context).unwrap_or_default()
            ),
            _ => format!(
                "You are a helpful cloud infrastructure assistant. Current context: {}. \
                Provide clear, actionable guidance based on the user's request.",
                serde_json::to_string(context).unwrap_or_default()
            ),
        }
    }

    fn get_recommendations_system_prompt(&self, context_type: &str, context: &HashMap<String, String>) -> String {
        format!(
            "You are an expert {} agent generating specific, actionable recommendations. \
            Context type: {}. Context data: {}. \
            Generate 3-5 specific recommendations in this format: \
            TITLE: [Brief title] \
            DESC: [Detailed description] \
            ACTION: [Specific action type] \
            CONFIDENCE: [0.1-1.0] \
            PRIORITY: [1-5] \
            Each recommendation should be practical and immediately actionable.",
            self.agent_type, context_type, serde_json::to_string(context).unwrap_or_default()
        )
    }

    fn parse_ai_recommendations(&self, content: &str) -> Vec<AIRecommendation> {
        // Parse AI-generated recommendations from structured format
        let mut recommendations = Vec::new();
        let lines: Vec<&str> = content.lines().collect();
        let mut current_rec: Option<HashMap<String, String>> = None;

        for line in lines {
            let line = line.trim();
            if line.starts_with("TITLE:") {
                if let Some(rec) = current_rec.take() {
                    if let Some(recommendation) = self.build_recommendation(rec) {
                        recommendations.push(recommendation);
                    }
                }
                current_rec = Some(HashMap::new());
                if let Some(ref mut rec) = current_rec {
                    rec.insert("title".to_string(), line[6..].trim().to_string());
                }
            } else if let Some(ref mut rec) = current_rec {
                if line.starts_with("DESC:") {
                    rec.insert("description".to_string(), line[5..].trim().to_string());
                } else if line.starts_with("ACTION:") {
                    rec.insert("action".to_string(), line[7..].trim().to_string());
                } else if line.starts_with("CONFIDENCE:") {
                    rec.insert("confidence".to_string(), line[11..].trim().to_string());
                } else if line.starts_with("PRIORITY:") {
                    rec.insert("priority".to_string(), line[9..].trim().to_string());
                }
            }
        }

        // Don't forget the last recommendation
        if let Some(rec) = current_rec {
            if let Some(recommendation) = self.build_recommendation(rec) {
                recommendations.push(recommendation);
            }
        }

        // If parsing failed, fall back to deterministic recommendations
        if recommendations.is_empty() {
            recommendations = self.get_fallback_recommendations("ai_generated", &HashMap::new());
        }

        recommendations
    }

    fn build_recommendation(&self, rec: HashMap<String, String>) -> Option<AIRecommendation> {
        Some(AIRecommendation {
            title: rec.get("title")?.clone(),
            description: rec.get("description")?.clone(),
            action_type: rec.get("action").cloned().unwrap_or_else(|| format!("{}_action", self.agent_type)),
            parameters: HashMap::new(),
            confidence: rec.get("confidence")?.parse().unwrap_or(0.8),
            priority: rec.get("priority")?.parse().unwrap_or(3),
        })
    }

    fn get_fallback_response(&self, message: &str, context: &HashMap<String, String>) -> String {
        match self.agent_type.as_str() {
            "aws" => format!(
                "AWS Agent received: '{}'. I can help you with AWS resource management, cost optimization, \
                security configuration, and best practices. Context: {:?}",
                message, context
            ),
            "azure" => format!(
                "Azure Agent received: '{}'. I can assist with Azure resource discovery, migration planning, \
                cost analysis, and service optimization. Context: {:?}",
                message, context
            ),
            "gcp" => format!(
                "GCP Agent received: '{}'. I can help with Google Cloud services, data analytics, \
                machine learning deployments, and infrastructure management. Context: {:?}",
                message, context
            ),
            "security" => format!(
                "Security Agent received: '{}'. I can analyze security configurations, identify vulnerabilities, \
                recommend compliance improvements, and implement security best practices. Context: {:?}",
                message, context
            ),
            _ => format!(
                "{} Agent received: '{}'. I'm ready to assist with your request. Context: {:?}",
                self.agent_type, message, context
            ),
        }
    }

    fn get_fallback_recommendations(&self, context_type: &str, context: &HashMap<String, String>) -> Vec<AIRecommendation> {
        match self.agent_type.as_str() {
            "aws" => vec![
                AIRecommendation {
                    title: "Optimize EC2 Instance Types".to_string(),
                    description: "Review and right-size EC2 instances based on actual usage patterns".to_string(),
                    action_type: "aws_optimize_instances".to_string(),
                    parameters: HashMap::new(),
                    confidence: 0.9,
                    priority: 2,
                },
                AIRecommendation {
                    title: "Enable Cost Anomaly Detection".to_string(),
                    description: "Set up AWS Cost Anomaly Detection to monitor unexpected cost spikes".to_string(),
                    action_type: "aws_enable_cost_monitoring".to_string(),
                    parameters: HashMap::new(),
                    confidence: 0.8,
                    priority: 3,
                },
            ],
            "azure" => vec![
                AIRecommendation {
                    title: "Implement Azure Advisor Recommendations".to_string(),
                    description: "Review and implement cost optimization suggestions from Azure Advisor".to_string(),
                    action_type: "azure_advisor_review".to_string(),
                    parameters: HashMap::new(),
                    confidence: 0.85,
                    priority: 2,
                },
                AIRecommendation {
                    title: "Enable Azure Monitor".to_string(),
                    description: "Set up comprehensive monitoring for Azure resources and applications".to_string(),
                    action_type: "azure_enable_monitoring".to_string(),
                    parameters: HashMap::new(),
                    confidence: 0.9,
                    priority: 1,
                },
            ],
            "security" => vec![
                AIRecommendation {
                    title: "Enable Multi-Factor Authentication".to_string(),
                    description: "Implement MFA for all administrative accounts across cloud platforms".to_string(),
                    action_type: "security_enable_mfa".to_string(),
                    parameters: HashMap::new(),
                    confidence: 0.95,
                    priority: 1,
                },
                AIRecommendation {
                    title: "Review IAM Policies".to_string(),
                    description: "Audit and optimize IAM policies following principle of least privilege".to_string(),
                    action_type: "security_audit_iam".to_string(),
                    parameters: HashMap::new(),
                    confidence: 0.9,
                    priority: 2,
                },
            ],
            _ => vec![
                AIRecommendation {
                    title: format!("Enhanced {} Configuration", self.agent_type),
                    description: format!("Optimize {} configuration based on current context: {}", self.agent_type, context_type),
                    action_type: format!("{}_optimize", self.agent_type),
                    parameters: context.clone(),
                    confidence: 0.7,
                    priority: 3,
                },
            ],
        }
    }
}
