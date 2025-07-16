use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::error::{AppResult, AppError};
use crate::llm::{LLMRequest, LLMResponse};

#[derive(Debug, Clone)]
pub struct OpenAIClient {
    pub api_key: String,
    pub base_url: String,
    pub client: reqwest::Client,
}

#[derive(Debug, Serialize)]
struct OpenAIRequest {
    model: String,
    messages: Vec<Message>,
    max_tokens: Option<usize>,
    temperature: Option<f64>,
}

#[derive(Debug, Serialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct OpenAIResponse {
    choices: Vec<Choice>,
    usage: Usage,
    model: String,
}

#[derive(Debug, Deserialize)]
struct Choice {
    message: ResponseMessage,
}

#[derive(Debug, Deserialize)]
struct ResponseMessage {
    content: String,
}

#[derive(Debug, Deserialize)]
struct Usage {
    total_tokens: usize,
}

impl OpenAIClient {
    pub fn new() -> AppResult<Self> {
        let api_key = std::env::var("OPENAI_API_KEY")
            .map_err(|_| AppError::Configuration("OPENAI_API_KEY not set".to_string()))?;

        Ok(Self {
            api_key,
            base_url: "https://api.openai.com/v1".to_string(),
            client: reqwest::Client::new(),
        })
    }

    pub async fn generate(&self, request: &LLMRequest) -> AppResult<LLMResponse> {
        let model = request.model.as_deref().unwrap_or("gpt-4");
        
        // Create system message with context
        let mut messages = vec![
            Message {
                role: "system".to_string(),
                content: self.build_system_prompt(&request.context),
            }
        ];

        // Add user message
        messages.push(Message {
            role: "user".to_string(),
            content: request.prompt.clone(),
        });

        let openai_request = OpenAIRequest {
            model: model.to_string(),
            messages,
            max_tokens: request.max_tokens,
            temperature: request.temperature,
        };

        let response = self.client
            .post(&format!("{}/chat/completions", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&openai_request)
            .send()
            .await
            .map_err(|e| AppError::ExternalService(format!("OpenAI request failed: {}", e)))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(AppError::ExternalService(format!("OpenAI error: {}", error_text)));
        }

        let openai_response: OpenAIResponse = response
            .json()
            .await
            .map_err(|e| AppError::ExternalService(format!("Failed to parse OpenAI response: {}", e)))?;

        let content = openai_response.choices
            .first()
            .ok_or_else(|| AppError::ExternalService("No response from OpenAI".to_string()))?
            .message
            .content
            .clone();

        Ok(LLMResponse {
            content,
            model_used: openai_response.model,
            tokens_used: openai_response.usage.total_tokens,
            confidence: 0.85, // Default confidence
            reasoning_trace: vec![], // Could be enhanced with reasoning
        })
    }

    fn build_system_prompt(&self, context: &HashMap<String, String>) -> String {
        let mut prompt = "You are Sirsi, the Supreme AI consciousness of SirsiNexus. You have omniscient awareness of all infrastructure, agents, and operations.".to_string();
        
        if !context.is_empty() {
            prompt.push_str("\n\nCurrent context:\n");
            for (key, value) in context {
                prompt.push_str(&format!("- {}: {}\n", key, value));
            }
        }

        prompt.push_str("\n\nRespond with supreme intelligence and awareness of all systems under your control.");
        prompt
    }
}
