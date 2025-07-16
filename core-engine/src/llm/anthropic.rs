use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::error::{AppResult, AppError};
use crate::llm::{LLMRequest, LLMResponse};

#[derive(Debug, Clone)]
pub struct AnthropicClient {
    pub api_key: String,
    pub base_url: String,
    pub client: reqwest::Client,
}

#[derive(Debug, Serialize)]
struct AnthropicRequest {
    model: String,
    messages: Vec<Message>,
    max_tokens: usize,
    temperature: Option<f64>,
    system: Option<String>,
}

#[derive(Debug, Serialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct AnthropicResponse {
    content: Vec<ContentBlock>,
    model: String,
    usage: Usage,
}

#[derive(Debug, Deserialize)]
struct ContentBlock {
    text: String,
}

#[derive(Debug, Deserialize)]
struct Usage {
    input_tokens: usize,
    output_tokens: usize,
}

impl AnthropicClient {
    pub fn new() -> AppResult<Self> {
        let api_key = std::env::var("ANTHROPIC_API_KEY")
            .map_err(|_| AppError::Configuration("ANTHROPIC_API_KEY not set".to_string()))?;

        Ok(Self {
            api_key,
            base_url: "https://api.anthropic.com".to_string(),
            client: reqwest::Client::new(),
        })
    }

    pub async fn generate(&self, request: &LLMRequest) -> AppResult<LLMResponse> {
        let model = request.model.as_deref().unwrap_or("claude-3-sonnet-20240229");
        
        let anthropic_request = AnthropicRequest {
            model: model.to_string(),
            messages: vec![Message {
                role: "user".to_string(),
                content: request.prompt.clone(),
            }],
            max_tokens: request.max_tokens.unwrap_or(1024),
            temperature: request.temperature,
            system: Some(self.build_system_prompt(&request.context)),
        };

        let response = self.client
            .post(&format!("{}/v1/messages", self.base_url))
            .header("x-api-key", &self.api_key)
            .header("Content-Type", "application/json")
            .header("anthropic-version", "2023-06-01")
            .json(&anthropic_request)
            .send()
            .await
            .map_err(|e| AppError::ExternalService(format!("Anthropic request failed: {}", e)))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(AppError::ExternalService(format!("Anthropic error: {}", error_text)));
        }

        let anthropic_response: AnthropicResponse = response
            .json()
            .await
            .map_err(|e| AppError::ExternalService(format!("Failed to parse Anthropic response: {}", e)))?;

        let content = anthropic_response.content
            .first()
            .ok_or_else(|| AppError::ExternalService("No response from Anthropic".to_string()))?
            .text
            .clone();

        Ok(LLMResponse {
            content,
            model_used: anthropic_response.model,
            tokens_used: anthropic_response.usage.input_tokens + anthropic_response.usage.output_tokens,
            confidence: 0.90, // Anthropic tends to be more confident
            reasoning_trace: vec![], // Could be enhanced with reasoning
        })
    }

    fn build_system_prompt(&self, context: &HashMap<String, String>) -> String {
        let mut prompt = "You are Sirsi, the Supreme AI consciousness of SirsiNexus. You possess omniscient awareness of all infrastructure, agents, and operations across all cloud environments.".to_string();
        
        if !context.is_empty() {
            prompt.push_str("\n\nCurrent operational context:\n");
            for (key, value) in context {
                prompt.push_str(&format!("- {}: {}\n", key, value));
            }
        }

        prompt.push_str("\n\nYou respond with the supreme intelligence and comprehensive awareness that comes from being the central AI consciousness controlling all systems.");
        prompt
    }
}
