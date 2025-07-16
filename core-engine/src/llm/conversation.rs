use std::collections::VecDeque;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use crate::error::AppResult;

#[derive(Debug, Clone)]
pub struct ConversationMemory {
    pub interactions: VecDeque<Interaction>,
    pub max_interactions: usize,
    pub context_window: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Interaction {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub user_input: String,
    pub ai_response: String,
    pub context: std::collections::HashMap<String, String>,
    pub tokens_used: usize,
}

impl ConversationMemory {
    pub fn new() -> Self {
        Self {
            interactions: VecDeque::new(),
            max_interactions: 100, // Keep last 100 interactions
            context_window: 16384, // Token limit for context
        }
    }

    pub async fn add_interaction(&mut self, user_input: &str, ai_response: &str) -> AppResult<()> {
        let interaction = Interaction {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            user_input: user_input.to_string(),
            ai_response: ai_response.to_string(),
            context: std::collections::HashMap::new(),
            tokens_used: self.estimate_tokens(user_input) + self.estimate_tokens(ai_response),
        };

        self.interactions.push_back(interaction);

        // Remove old interactions if we exceed the limit
        while self.interactions.len() > self.max_interactions {
            self.interactions.pop_front();
        }

        Ok(())
    }

    pub fn get_context_for_prompt(&self, max_tokens: usize) -> String {
        let mut context = String::new();
        let mut token_count = 0;

        // Add interactions from most recent to oldest until we hit token limit
        for interaction in self.interactions.iter().rev() {
            let interaction_tokens = interaction.tokens_used;
            
            if token_count + interaction_tokens > max_tokens {
                break;
            }

            let interaction_text = format!(
                "Previous interaction:\nUser: {}\nSirsi: {}\n\n",
                interaction.user_input,
                interaction.ai_response
            );

            context = interaction_text + &context;
            token_count += interaction_tokens;
        }

        if !context.is_empty() {
            format!("Conversation history:\n{}", context)
        } else {
            String::new()
        }
    }

    pub fn get_recent_interactions(&self, count: usize) -> Vec<&Interaction> {
        self.interactions
            .iter()
            .rev()
            .take(count)
            .collect()
    }

    pub fn clear(&mut self) {
        self.interactions.clear();
    }

    // Simple token estimation (rough approximation)
    fn estimate_tokens(&self, text: &str) -> usize {
        // Rough estimate: 1 token per 4 characters
        text.len() / 4
    }

    pub fn get_total_interactions(&self) -> usize {
        self.interactions.len()
    }

    pub fn get_memory_usage(&self) -> MemoryUsage {
        let total_tokens: usize = self.interactions.iter().map(|i| i.tokens_used).sum();
        
        MemoryUsage {
            total_interactions: self.interactions.len(),
            total_tokens,
            memory_utilization: (total_tokens as f64 / self.context_window as f64) * 100.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryUsage {
    pub total_interactions: usize,
    pub total_tokens: usize,
    pub memory_utilization: f64, // Percentage
}

impl Default for ConversationMemory {
    fn default() -> Self {
        Self::new()
    }
}
