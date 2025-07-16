use std::collections::HashMap;
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentContext {
    pub session_id: String,
    pub agent_id: String,
    pub agent_type: String,
    pub status: String,
    pub metadata: HashMap<String, String>,
    pub conversation_history: Vec<ConversationEntry>,
    pub last_activity: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationEntry {
    pub id: String,
    pub message: String,
    pub response: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub suggestions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionContext {
    pub session_id: String,
    pub user_id: String,
    pub agents: Vec<String>,
    pub metadata: HashMap<String, String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub last_activity: chrono::DateTime<chrono::Utc>,
    // pub config: Option<crate::proto::sirsi::agent::v1::SessionConfig>, // Removed for serialization
}

pub struct ContextStore {
    redis_client: redis::Client,
}

impl ContextStore {
    pub fn new(redis_url: &str) -> AppResult<Self> {
        let redis_client = redis::Client::open(redis_url)
            .map_err(|e| AppError::Connection(format!("Failed to connect to Redis: {}", e)))?;
        
        Ok(Self { redis_client })
    }

    pub async fn get_connection(&self) -> AppResult<redis::aio::Connection> {
        self.redis_client
            .get_async_connection()
            .await
            .map_err(|e| AppError::Connection(format!("Failed to get Redis connection: {}", e)))
    }

    // Session context operations
    pub async fn create_session_context(
        &self,
        user_id: &str,
        metadata: HashMap<String, String>,
    ) -> AppResult<SessionContext> {
        let session_id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now();

        let session_context = SessionContext {
            session_id: session_id.clone(),
            user_id: user_id.to_string(),
            agents: Vec::new(),
            metadata,
            created_at: now,
            last_activity: now,
        };

        self.store_session_context(&session_context).await?;
        Ok(session_context)
    }

    pub async fn get_session_context(&self, session_id: &str) -> AppResult<SessionContext> {
        let mut conn = self.get_connection().await?;
        let key = format!("session:{}", session_id);
        
        let data: String = conn.get(&key).await.map_err(|e| {
            if e.kind() == redis::ErrorKind::TypeError {
                AppError::NotFound("Session not found".into())
            } else {
                AppError::Connection(format!("Redis error: {}", e))
            }
        })?;

        serde_json::from_str(&data)
            .map_err(|e| AppError::Serialization(format!("Failed to deserialize session context: {}", e)))
    }

    pub async fn store_session_context(&self, context: &SessionContext) -> AppResult<()> {
        let mut conn = self.get_connection().await?;
        let key = format!("session:{}", context.session_id);
        let data = serde_json::to_string(context)
            .map_err(|e| AppError::Serialization(format!("Failed to serialize session context: {}", e)))?;

        let _: () = conn.set_ex(&key, data, 3600 * 24).await // 24 hour TTL
            .map_err(|e| AppError::Connection(format!("Failed to store session context: {}", e)))?;

        Ok(())
    }
    
    // Helper method for storing session context with individual parameters
    pub async fn store_session_info(
        &self,
        session_id: &str,
        user_id: &str,
        metadata: HashMap<String, String>,
    ) -> AppResult<()> {
        let now = chrono::Utc::now();
        let session_context = SessionContext {
            session_id: session_id.to_string(),
            user_id: user_id.to_string(),
            agents: Vec::new(),
            metadata,
            created_at: now,
            last_activity: now,
        };
        
        self.store_session_context(&session_context).await
    }

    pub async fn update_session_activity(&self, session_id: &str) -> AppResult<()> {
        let mut context = self.get_session_context(session_id).await?;
        context.last_activity = chrono::Utc::now();
        self.store_session_context(&context).await
    }

    pub async fn add_agent_to_session(&self, session_id: &str, agent_id: &str) -> AppResult<()> {
        let mut context = self.get_session_context(session_id).await?;
        if !context.agents.contains(&agent_id.to_string()) {
            context.agents.push(agent_id.to_string());
            context.last_activity = chrono::Utc::now();
            self.store_session_context(&context).await?;
        }
        Ok(())
    }

    pub async fn remove_session(&self, session_id: &str) -> AppResult<()> {
        let mut conn = self.get_connection().await?;
        let key = format!("session:{}", session_id);
        
        let _: () = conn.del(&key).await
            .map_err(|e| AppError::Connection(format!("Failed to delete session: {}", e)))?;

        Ok(())
    }

    // Agent context operations
    pub async fn create_agent_context(
        &self,
        session_id: &str,
        agent_type: &str,
        metadata: HashMap<String, String>,
    ) -> AppResult<AgentContext> {
        let agent_id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now();

        let agent_context = AgentContext {
            session_id: session_id.to_string(),
            agent_id: agent_id.clone(),
            agent_type: agent_type.to_string(),
            status: "initializing".to_string(),
            metadata,
            conversation_history: Vec::new(),
            last_activity: now,
        };

        self.store_agent_context(&agent_context).await?;
        self.add_agent_to_session(session_id, &agent_id).await?;
        
        Ok(agent_context)
    }

    pub async fn get_agent_context(&self, agent_id: &str) -> AppResult<AgentContext> {
        let mut conn = self.get_connection().await?;
        let key = format!("agent:{}", agent_id);
        
        let data: String = conn.get(&key).await.map_err(|e| {
            if e.kind() == redis::ErrorKind::TypeError {
                AppError::NotFound("Agent not found".into())
            } else {
                AppError::Connection(format!("Redis error: {}", e))
            }
        })?;

        serde_json::from_str(&data)
            .map_err(|e| AppError::Serialization(format!("Failed to deserialize agent context: {}", e)))
    }

    pub async fn store_agent_context(&self, context: &AgentContext) -> AppResult<()> {
        let mut conn = self.get_connection().await?;
        let key = format!("agent:{}", context.agent_id);
        let data = serde_json::to_string(context)
            .map_err(|e| AppError::Serialization(format!("Failed to serialize agent context: {}", e)))?;

        let _: () = conn.set_ex(&key, data, 3600 * 24).await // 24 hour TTL
            .map_err(|e| AppError::Connection(format!("Failed to store agent context: {}", e)))?;

        Ok(())
    }

    pub async fn update_agent_status(&self, agent_id: &str, status: &str) -> AppResult<()> {
        let mut context = self.get_agent_context(agent_id).await?;
        context.status = status.to_string();
        context.last_activity = chrono::Utc::now();
        self.store_agent_context(&context).await
    }

    pub async fn add_conversation_entry(
        &self,
        agent_id: &str,
        message: &str,
        response: &str,
        suggestions: Vec<String>,
    ) -> AppResult<String> {
        let mut context = self.get_agent_context(agent_id).await?;
        let entry_id = Uuid::new_v4().to_string();
        
        let entry = ConversationEntry {
            id: entry_id.clone(),
            message: message.to_string(),
            response: response.to_string(),
            timestamp: chrono::Utc::now(),
            suggestions,
        };

        context.conversation_history.push(entry);
        context.last_activity = chrono::Utc::now();
        
        // Keep only last 100 conversations to prevent memory bloat
        if context.conversation_history.len() > 100 {
            context.conversation_history.drain(0..context.conversation_history.len() - 100);
        }

        self.store_agent_context(&context).await?;
        Ok(entry_id)
    }

    pub async fn get_conversation_history(&self, agent_id: &str, limit: Option<usize>) -> AppResult<Vec<ConversationEntry>> {
        let context = self.get_agent_context(agent_id).await?;
        let limit = limit.unwrap_or(20);
        
        Ok(context.conversation_history
            .into_iter()
            .rev()
            .take(limit)
            .collect::<Vec<_>>()
            .into_iter()
            .rev()
            .collect())
    }

    pub async fn remove_agent(&self, agent_id: &str) -> AppResult<()> {
        let mut conn = self.get_connection().await?;
        let key = format!("agent:{}", agent_id);
        
        let _: () = conn.del(&key).await
            .map_err(|e| AppError::Connection(format!("Failed to delete agent: {}", e)))?;

        Ok(())
    }

    // Health check
    pub async fn health_check(&self) -> AppResult<()> {
        let mut conn = self.get_connection().await?;
        let _: String = redis::cmd("PING").query_async(&mut conn).await
            .map_err(|e| AppError::Connection(format!("Redis health check failed: {}", e)))?;
        Ok(())
    }

    // Analytics and monitoring
    pub async fn get_active_sessions_count(&self) -> AppResult<usize> {
        let mut conn = self.get_connection().await?;
        let keys: Vec<String> = conn.keys("session:*").await
            .map_err(|e| AppError::Connection(format!("Failed to get session keys: {}", e)))?;
        Ok(keys.len())
    }

    pub async fn get_active_agents_count(&self) -> AppResult<usize> {
        let mut conn = self.get_connection().await?;
        let keys: Vec<String> = conn.keys("agent:*").await
            .map_err(|e| AppError::Connection(format!("Failed to get agent keys: {}", e)))?;
        Ok(keys.len())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[tokio::test]
    async fn test_session_lifecycle() {
        // This test requires a running Redis instance
        // Skip if Redis is not available
        let store = match ContextStore::new("redis://127.0.0.1/") {
            Ok(store) => store,
            Err(_) => {
                println!("Redis not available, skipping test");
                return;
            }
        };

        if store.health_check().await.is_err() {
            println!("Redis not available, skipping test");
            return;
        }

        // Create session
        let session = store.create_session_context("test-user", HashMap::new()).await.unwrap();
        assert!(!session.session_id.is_empty());
        assert_eq!(session.user_id, "test-user");

        // Retrieve session
        let retrieved = store.get_session_context(&session.session_id).await.unwrap();
        assert_eq!(retrieved.session_id, session.session_id);
        assert_eq!(retrieved.user_id, session.user_id);

        // Update activity
        tokio::time::sleep(std::time::Duration::from_millis(100)).await;
        store.update_session_activity(&session.session_id).await.unwrap();
        
        let updated = store.get_session_context(&session.session_id).await.unwrap();
        assert!(updated.last_activity > session.last_activity);

        // Clean up
        store.remove_session(&session.session_id).await.unwrap();
        assert!(store.get_session_context(&session.session_id).await.is_err());
    }

    #[tokio::test]
    async fn test_agent_lifecycle() {
        let store = match ContextStore::new("redis://127.0.0.1/") {
            Ok(store) => store,
            Err(_) => {
                println!("Redis not available, skipping test");
                return;
            }
        };

        if store.health_check().await.is_err() {
            println!("Redis not available, skipping test");
            return;
        }

        // Create session first
        let session = store.create_session_context("test-user", HashMap::new()).await.unwrap();

        // Create agent
        let agent = store.create_agent_context(&session.session_id, "aws", HashMap::new()).await.unwrap();
        assert!(!agent.agent_id.is_empty());
        assert_eq!(agent.agent_type, "aws");
        assert_eq!(agent.status, "initializing");

        // Update status
        store.update_agent_status(&agent.agent_id, "ready").await.unwrap();
        let updated = store.get_agent_context(&agent.agent_id).await.unwrap();
        assert_eq!(updated.status, "ready");

        // Add conversation
        let entry_id = store.add_conversation_entry(
            &agent.agent_id,
            "test message",
            "test response",
            vec!["suggestion1".to_string()],
        ).await.unwrap();
        assert!(!entry_id.is_empty());

        // Get history
        let history = store.get_conversation_history(&agent.agent_id, Some(10)).await.unwrap();
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].message, "test message");
        assert_eq!(history[0].response, "test response");

        // Clean up
        store.remove_agent(&agent.agent_id).await.unwrap();
        store.remove_session(&session.session_id).await.unwrap();
    }
}
