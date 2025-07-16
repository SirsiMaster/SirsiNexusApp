use std::collections::HashMap;
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use crate::error::AppResult;

pub mod openai;
pub mod anthropic;
pub mod conversation;

#[derive(Debug, Clone)]
pub struct LLMEngine {
    pub openai_client: Arc<openai::OpenAIClient>,
    pub anthropic_client: Arc<anthropic::AnthropicClient>,
    pub conversation_memory: Arc<RwLock<conversation::ConversationMemory>>,
    pub reasoning_engine: Arc<ReasoningEngine>,
}

#[derive(Debug, Clone)]
pub struct ReasoningEngine {
    pub context_window: usize,
    pub reasoning_models: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMRequest {
    pub prompt: String,
    pub context: HashMap<String, String>,
    pub max_tokens: Option<usize>,
    pub temperature: Option<f64>,
    pub model: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMResponse {
    pub content: String,
    pub model_used: String,
    pub tokens_used: usize,
    pub confidence: f64,
    pub reasoning_trace: Vec<String>,
}

impl LLMEngine {
    pub fn new() -> AppResult<Self> {
        Ok(Self {
            openai_client: Arc::new(openai::OpenAIClient::new()?),
            anthropic_client: Arc::new(anthropic::AnthropicClient::new()?),
            conversation_memory: Arc::new(RwLock::new(conversation::ConversationMemory::new())),
            reasoning_engine: Arc::new(ReasoningEngine {
                context_window: 16384,
                reasoning_models: vec![
                    "gpt-4".to_string(),
                    "claude-3-sonnet".to_string(),
                ],
            }),
        })
    }

    /// Generate response using the best available LLM
    pub async fn generate_response(&self, request: LLMRequest) -> AppResult<LLMResponse> {
        // Try OpenAI first, fallback to Anthropic
        match self.openai_client.generate(&request).await {
            Ok(response) => Ok(response),
            Err(_) => {
                tracing::warn!("OpenAI failed, falling back to Anthropic");
                self.anthropic_client.generate(&request).await
            }
        }
    }

    /// Generate reasoning trace for complex decisions
    pub async fn reason_through_problem(&self, problem: &str, context: HashMap<String, String>) -> AppResult<LLMResponse> {
        let reasoning_prompt = format!(
            "Problem: {}\nContext: {:?}\nThink through this step by step and provide your reasoning:",
            problem, context
        );

        let request = LLMRequest {
            prompt: reasoning_prompt,
            context,
            max_tokens: Some(2048),
            temperature: Some(0.3),
            model: Some("gpt-4".to_string()),
        };

        self.generate_response(request).await
    }

    /// Update conversation memory with new interaction
    pub async fn update_memory(&self, user_input: &str, ai_response: &str) -> AppResult<()> {
        let mut memory = self.conversation_memory.write().await;
        memory.add_interaction(user_input, ai_response).await?;
        Ok(())
    }
}

impl Default for LLMEngine {
    fn default() -> Self {
        Self::new().expect("Failed to create LLM engine")
    }
}
