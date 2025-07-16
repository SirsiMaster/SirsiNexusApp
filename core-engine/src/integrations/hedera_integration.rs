use std::sync::Arc;
use crate::error::AppResult;
use crate::hedera::{HederaKnowledgeGraph, HederaNetworkConfig, ServiceAction, ServiceActionType, ActionResult};
use crate::hedera::knowledge_graph::{KnowledgeNodeData, KnowledgeQuery};
use crate::hedera::consensus::{DecisionRequest, ConsensusResult};
use crate::agent::Agent;

// Create a simple AgentConfiguration type for the integration
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AgentConfiguration {
    pub agent_type: String,
    pub capabilities: Vec<String>,
    pub max_concurrent_tasks: u32,
    pub timeout_seconds: u64,
    pub parameters: std::collections::HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone)]
pub struct HederaIntegration {
    pub knowledge_graph: Arc<HederaKnowledgeGraph>,
    pub enabled: bool,
}

impl HederaIntegration {
    /// Initialize Hedera integration
    pub async fn new(config: Option<HederaNetworkConfig>) -> AppResult<Self> {
        let hedera_config = config.unwrap_or_default();
        
        // Initialize Hedera knowledge graph
        let knowledge_graph = Arc::new(
            HederaKnowledgeGraph::new(hedera_config).await?
        );

        let enabled = std::env::var("ENABLE_HEDERA").unwrap_or_else(|_| "false".to_string()) == "true";

        tracing::info!("🌐 Hedera DLT integration initialized (enabled: {})", enabled);

        Ok(Self {
            knowledge_graph,
            enabled,
        })
    }

    /// Record agent action on Hedera network
    pub async fn record_agent_action(
        &self,
        agent_id: &str,
        action_type: ServiceActionType,
        target_resource: &str,
        parameters: serde_json::Value,
        result: Option<ActionResult>,
    ) -> AppResult<Option<String>> {
        if !self.enabled {
            return Ok(None);
        }

        let action = ServiceAction {
            action_id: uuid::Uuid::new_v4().to_string(),
            action_type,
            agent_id: agent_id.to_string(),
            target_resource: target_resource.to_string(),
            parameters: parameters.as_object().unwrap_or(&serde_json::Map::new()).clone().into_iter().collect(),
            result,
            timestamp: chrono::Utc::now(),
            transaction_id: None,
            consensus_timestamp: None,
        };

        let transaction_id = self.knowledge_graph.record_service_action(action).await?;
        Ok(Some(transaction_id))
    }

    /// Record agent spawn event
    pub async fn record_agent_spawn(
        &self,
        agent: &Agent,
        config: &AgentConfiguration,
    ) -> AppResult<Option<String>> {
        let parameters = serde_json::json!({
            "agent_type": config.agent_type,
            "capabilities": config.capabilities,
            "max_concurrent_tasks": config.max_concurrent_tasks,
            "timeout_seconds": config.timeout_seconds,
            "created_at": agent.created_at
        });

        let result = ActionResult {
            success: true,
            message: format!("Agent {} spawned successfully", agent.id),
            data: Some(serde_json::to_value(agent)?),
            error_code: None,
        };

        self.record_agent_action(
            &agent.id,
            ServiceActionType::AgentSpawn,
            &format!("agent:{}", agent.id),
            parameters,
            Some(result),
        ).await
    }

    /// Record agent termination
    pub async fn record_agent_termination(
        &self,
        agent_id: &str,
        reason: &str,
    ) -> AppResult<Option<String>> {
        let parameters = serde_json::json!({
            "termination_reason": reason,
            "terminated_at": chrono::Utc::now()
        });

        let result = ActionResult {
            success: true,
            message: format!("Agent {} terminated: {}", agent_id, reason),
            data: None,
            error_code: None,
        };

        self.record_agent_action(
            agent_id,
            ServiceActionType::AgentTerminate,
            &format!("agent:{}", agent_id),
            parameters,
            Some(result),
        ).await
    }

    /// Record knowledge discovery from agent
    pub async fn record_knowledge_discovery(
        &self,
        agent_id: &str,
        resource_id: &str,
        knowledge_type: &str,
        content: serde_json::Value,
        confidence: f64,
        tags: Vec<String>,
    ) -> AppResult<Option<String>> {
        if !self.enabled {
            return Ok(None);
        }

        let node_data = KnowledgeNodeData {
            node_id: uuid::Uuid::new_v4().to_string(),
            resource_id: resource_id.to_string(),
            source_agent: agent_id.to_string(),
            knowledge_type: knowledge_type.to_string(),
            content: content.clone(),
            confidence,
            timestamp: chrono::Utc::now(),
            tags,
            metadata: std::collections::HashMap::new(),
            version: 1,
            parent_node: None,
        };

        self.knowledge_graph.update_knowledge(node_data).await?;

        // Also record as a service action
        let parameters = serde_json::json!({
            "resource_id": resource_id,
            "knowledge_type": knowledge_type,
            "confidence": confidence
        });

        let result = ActionResult {
            success: true,
            message: format!("Knowledge discovered for resource {}", resource_id),
            data: Some(content),
            error_code: None,
        };

        self.record_agent_action(
            agent_id,
            ServiceActionType::KnowledgeUpdate,
            resource_id,
            parameters,
            Some(result),
        ).await
    }

    /// Query knowledge for agent decision making
    pub async fn query_knowledge_for_agent(
        &self,
        agent_id: &str,
        resource_filter: Option<String>,
        knowledge_type: Option<String>,
        confidence_threshold: Option<f64>,
    ) -> AppResult<Vec<KnowledgeNodeData>> {
        if !self.enabled {
            return Ok(Vec::new());
        }

        let query = KnowledgeQuery {
            resource_filter,
            agent_filter: Some(agent_id.to_string()),
            type_filter: knowledge_type,
            tag_filter: None,
            confidence_threshold,
            time_range: None,
            content_search: None,
            limit: Some(50),
            include_edges: false,
        };

        self.knowledge_graph.query_knowledge(&query).await
    }

    /// Request consensus from agent network
    pub async fn request_agent_consensus(
        &self,
        decision_topic: &str,
        decision_type: &str,
        context: serde_json::Value,
        options: Vec<crate::hedera::consensus::DecisionOption>,
        required_agents: Option<Vec<String>>,
    ) -> AppResult<Option<ConsensusResult>> {
        if !self.enabled {
            return Ok(None);
        }

        let decision_request = DecisionRequest {
            decision_id: uuid::Uuid::new_v4().to_string(),
            decision_topic: decision_topic.to_string(),
            decision_type: decision_type.to_string(),
            context,
            options,
            consensus_threshold: 0.6, // 60% consensus required
            timeout: chrono::Duration::minutes(5),
            required_agents,
            metadata: std::collections::HashMap::new(),
        };

        let result = self.knowledge_graph.get_consensus(decision_request).await?;
        Ok(Some(result))
    }

    /// Sync knowledge across the network
    pub async fn sync_distributed_knowledge(&self) -> AppResult<()> {
        if !self.enabled {
            return Ok(());
        }

        self.knowledge_graph.sync_knowledge().await?;
        tracing::info!("🔄 Distributed knowledge synchronized via Hedera");
        Ok(())
    }

    /// Get network consensus history
    pub async fn get_consensus_history(&self, limit: Option<usize>) -> AppResult<Vec<ConsensusResult>> {
        if !self.enabled {
            return Ok(Vec::new());
        }

        let consensus_engine = self.knowledge_graph.consensus_engine.read().await;
        Ok(consensus_engine.get_consensus_history(limit))
    }

    /// Get service action history
    pub async fn get_service_action_history(
        &self,
        agent_filter: Option<String>,
        action_type_filter: Option<ServiceActionType>,
        limit: Option<usize>,
    ) -> AppResult<Vec<ServiceAction>> {
        if !self.enabled {
            return Ok(Vec::new());
        }

        let filter = if agent_filter.is_some() || action_type_filter.is_some() {
            Some(crate::hedera::ActionFilter {
                agent_id: agent_filter,
                action_type: action_type_filter,
                time_range: None,
                success_only: false,
            })
        } else {
            None
        };

        let mut actions = self.knowledge_graph.get_action_history(filter).await?;
        
        if let Some(limit) = limit {
            actions.truncate(limit);
        }

        Ok(actions)
    }

    /// Get knowledge statistics
    pub async fn get_knowledge_statistics(&self) -> AppResult<Option<crate::hedera::knowledge_graph::KnowledgeStatistics>> {
        if !self.enabled {
            return Ok(None);
        }

        let nodes = self.knowledge_graph.knowledge_nodes.read().await;
        let stats = nodes.get_statistics().await?;
        Ok(Some(stats))
    }

    /// Validate Hedera network connection
    pub async fn validate_network_connection(&self) -> AppResult<bool> {
        if !self.enabled {
            return Ok(false);
        }

        self.knowledge_graph.hedera_client.validate_connection().await
    }

    /// Record error event
    pub async fn record_error_event(
        &self,
        agent_id: &str,
        resource: &str,
        error_message: &str,
        error_code: Option<i32>,
        context: Option<serde_json::Value>,
    ) -> AppResult<Option<String>> {
        let parameters = context.unwrap_or(serde_json::json!({}));

        let result = ActionResult {
            success: false,
            message: error_message.to_string(),
            data: None,
            error_code,
        };

        self.record_agent_action(
            agent_id,
            ServiceActionType::ErrorOccurred,
            resource,
            parameters,
            Some(result),
        ).await
    }

    /// Create topic for specific agent or service
    pub async fn create_service_topic(&self, memo: &str) -> AppResult<Option<String>> {
        if !self.enabled {
            return Ok(None);
        }

        // Clone the client and create topic
        let mut client = (*self.knowledge_graph.hedera_client).clone();
        let topic_id = client.create_topic(Some(memo.to_string())).await?;
        
        tracing::info!("📋 Created Hedera topic: {} for {}", topic_id, memo);
        Ok(Some(topic_id))
    }
}

impl Default for HederaIntegration {
    fn default() -> Self {
        Self {
            knowledge_graph: Arc::new(
                // This will fail at runtime if called, but allows compilation
                tokio::runtime::Handle::current().block_on(async {
                    HederaKnowledgeGraph::new(HederaNetworkConfig::default()).await
                }).expect("Failed to initialize default Hedera integration")
            ),
            enabled: false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_hedera_integration_creation() {
        let integration = HederaIntegration::new(None).await;
        assert!(integration.is_ok());
    }

    #[tokio::test]
    async fn test_disabled_integration() {
        let integration = HederaIntegration::new(None).await.unwrap();
        
        let result = integration.record_agent_action(
            "test_agent",
            ServiceActionType::AgentSpawn,
            "test_resource",
            serde_json::json!({}),
            None,
        ).await;
        
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), None);
    }
}
