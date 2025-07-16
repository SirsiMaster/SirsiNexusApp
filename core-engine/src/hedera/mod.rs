use std::collections::HashMap;
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use crate::error::AppResult;

pub mod client;
pub mod knowledge_graph;
pub mod consensus;

#[derive(Debug, Clone)]
pub struct HederaKnowledgeGraph {
    pub hedera_client: Arc<client::HederaClient>,
    pub knowledge_nodes: Arc<RwLock<knowledge_graph::KnowledgeNodes>>,
    pub service_actions: Arc<RwLock<ServiceActionLog>>,
    pub consensus_engine: Arc<tokio::sync::RwLock<consensus::ConsensusEngine>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceActionLog {
    pub actions: Vec<ServiceAction>,
    pub topic_id: Option<String>,
    pub last_sequence: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceAction {
    pub action_id: String,
    pub action_type: ServiceActionType,
    pub agent_id: String,
    pub target_resource: String,
    pub parameters: HashMap<String, serde_json::Value>,
    pub result: Option<ActionResult>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub transaction_id: Option<String>,
    pub consensus_timestamp: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ServiceActionType {
    AgentSpawn,
    AgentTerminate,
    ResourceDiscovery,
    ResourceModification,
    KnowledgeUpdate,
    ContextShare,
    DecisionMade,
    ErrorOccurred,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionResult {
    pub success: bool,
    pub message: String,
    pub data: Option<serde_json::Value>,
    pub error_code: Option<i32>,
}

impl HederaKnowledgeGraph {
    pub async fn new(network_config: HederaNetworkConfig) -> AppResult<Self> {
        let hedera_client = Arc::new(client::HederaClient::new(network_config).await?);
        let knowledge_nodes = Arc::new(RwLock::new(knowledge_graph::KnowledgeNodes::new()));
        let service_actions = Arc::new(RwLock::new(ServiceActionLog {
            actions: Vec::new(),
            topic_id: None,
            last_sequence: 0,
        }));
        let consensus_engine = Arc::new(tokio::sync::RwLock::new(consensus::ConsensusEngine::new()));

        Ok(Self {
            hedera_client,
            knowledge_nodes,
            service_actions,
            consensus_engine,
        })
    }

    /// Record a service action on the Hedera network
    pub async fn record_service_action(&self, action: ServiceAction) -> AppResult<String> {
        // Submit to Hedera consensus service (topic message)
        let transaction_id = self.hedera_client.submit_topic_message(
            &action.action_id,
            &serde_json::to_string(&action)?
        ).await?;

        // Update local log
        let mut actions = self.service_actions.write().await;
        let mut updated_action = action.clone();
        updated_action.transaction_id = Some(transaction_id.clone());
        actions.actions.push(updated_action);
        actions.last_sequence += 1;

        tracing::info!("🌐 Service action recorded on Hedera: {}", action.action_id);
        Ok(transaction_id)
    }

    /// Update knowledge graph with new information
    pub async fn update_knowledge(&self, node_data: knowledge_graph::KnowledgeNodeData) -> AppResult<()> {
        // Store in distributed knowledge graph
        let mut nodes = self.knowledge_nodes.write().await;
        nodes.add_node(node_data.clone()).await?;

        // Record the knowledge update action
        let action = ServiceAction {
            action_id: uuid::Uuid::new_v4().to_string(),
            action_type: ServiceActionType::KnowledgeUpdate,
            agent_id: node_data.source_agent.clone(),
            target_resource: node_data.resource_id.clone(),
            parameters: HashMap::from([
                ("knowledge_type".to_string(), serde_json::Value::String(node_data.knowledge_type.clone())),
                ("confidence".to_string(), serde_json::json!(node_data.confidence)),
            ]),
            result: Some(ActionResult {
                success: true,
                message: "Knowledge updated successfully".to_string(),
                data: Some(serde_json::to_value(&node_data)?),
                error_code: None,
            }),
            timestamp: chrono::Utc::now(),
            transaction_id: None,
            consensus_timestamp: None,
        };

        self.record_service_action(action).await?;
        Ok(())
    }

    /// Query knowledge graph for relevant information
    pub async fn query_knowledge(&self, query: &knowledge_graph::KnowledgeQuery) -> AppResult<Vec<knowledge_graph::KnowledgeNodeData>> {
        let nodes = self.knowledge_nodes.read().await;
        nodes.query(query).await
    }

    /// Get consensus on a decision across agents
    pub async fn get_consensus(&self, decision_request: consensus::DecisionRequest) -> AppResult<consensus::ConsensusResult> {
        let mut consensus_engine = self.consensus_engine.write().await;
        let result = consensus_engine.request_consensus(decision_request.clone()).await?;

        // Record the decision on Hedera
        let action = ServiceAction {
            action_id: uuid::Uuid::new_v4().to_string(),
            action_type: ServiceActionType::DecisionMade,
            agent_id: "sirsi_hypervisor".to_string(),
            target_resource: decision_request.decision_topic.clone(),
            parameters: HashMap::from([
                ("decision_type".to_string(), serde_json::Value::String(decision_request.decision_type.clone())),
                ("consensus_threshold".to_string(), serde_json::json!(decision_request.consensus_threshold)),
            ]),
            result: Some(ActionResult {
                success: result.consensus_reached,
                message: format!("Consensus result: {}", result.decision_outcome),
                data: Some(serde_json::to_value(&result)?),
                error_code: None,
            }),
            timestamp: chrono::Utc::now(),
            transaction_id: None,
            consensus_timestamp: None,
        };

        self.record_service_action(action).await?;
        Ok(result)
    }

    /// Sync knowledge with other Hedera nodes
    pub async fn sync_knowledge(&self) -> AppResult<()> {
        // Pull latest messages from Hedera topic
        let messages = self.hedera_client.get_topic_messages().await?;
        
        let mut actions = self.service_actions.write().await;
        let mut nodes = self.knowledge_nodes.write().await;

        for message in messages {
            if let Ok(action) = serde_json::from_str::<ServiceAction>(&message.contents) {
                // Update local state based on consensus
                match action.action_type {
                    ServiceActionType::KnowledgeUpdate => {
                        if let Some(data) = &action.result {
                            if let Some(node_data) = &data.data {
                                if let Ok(knowledge_data) = serde_json::from_value::<knowledge_graph::KnowledgeNodeData>(node_data.clone()) {
                                    nodes.add_node(knowledge_data).await?;
                                }
                            }
                        }
                    }
                    _ => {
                        // Handle other action types
                    }
                }

                actions.actions.push(action);
            }
        }

        tracing::info!("🔄 Knowledge synchronized with Hedera network");
        Ok(())
    }

    /// Get service action history
    pub async fn get_action_history(&self, filter: Option<ActionFilter>) -> AppResult<Vec<ServiceAction>> {
        let actions = self.service_actions.read().await;
        
        if let Some(filter) = filter {
            let filtered = actions.actions.iter()
                .filter(|action| filter.matches(action))
                .cloned()
                .collect();
            Ok(filtered)
        } else {
            Ok(actions.actions.clone())
        }
    }
}

#[derive(Debug, Clone)]
pub struct HederaNetworkConfig {
    pub network: HederaNetwork,
    pub operator_id: String,
    pub operator_key: String,
    pub topic_id: Option<String>,
}

#[derive(Debug, Clone)]
pub enum HederaNetwork {
    Mainnet,
    Testnet,
    Previewnet,
    Local,
}

#[derive(Debug, Clone)]
pub struct ActionFilter {
    pub agent_id: Option<String>,
    pub action_type: Option<ServiceActionType>,
    pub time_range: Option<(chrono::DateTime<chrono::Utc>, chrono::DateTime<chrono::Utc>)>,
    pub success_only: bool,
}

impl ActionFilter {
    pub fn matches(&self, action: &ServiceAction) -> bool {
        if let Some(agent_id) = &self.agent_id {
            if action.agent_id != *agent_id {
                return false;
            }
        }

        if let Some(action_type) = &self.action_type {
            if std::mem::discriminant(&action.action_type) != std::mem::discriminant(action_type) {
                return false;
            }
        }

        if let Some((start, end)) = &self.time_range {
            if action.timestamp < *start || action.timestamp > *end {
                return false;
            }
        }

        if self.success_only {
            if let Some(result) = &action.result {
                if !result.success {
                    return false;
                }
            } else {
                return false;
            }
        }

        true
    }
}

impl Default for HederaNetworkConfig {
    fn default() -> Self {
        Self {
            network: HederaNetwork::Testnet,
            operator_id: std::env::var("HEDERA_OPERATOR_ID").unwrap_or_default(),
            operator_key: std::env::var("HEDERA_OPERATOR_KEY").unwrap_or_default(),
            topic_id: None,
        }
    }
}
