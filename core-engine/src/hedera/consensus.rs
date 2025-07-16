use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::error::{AppResult, AppError};

#[derive(Debug, Clone)]
pub struct ConsensusEngine {
    pub active_decisions: HashMap<String, DecisionContext>,
    pub consensus_history: Vec<ConsensusResult>,
    pub agent_weights: HashMap<String, f64>,
    pub default_threshold: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionRequest {
    pub decision_id: String,
    pub decision_topic: String,
    pub decision_type: String,
    pub context: serde_json::Value,
    pub options: Vec<DecisionOption>,
    pub consensus_threshold: f64,
    pub timeout: chrono::Duration,
    pub required_agents: Option<Vec<String>>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionOption {
    pub option_id: String,
    pub name: String,
    pub description: String,
    pub parameters: HashMap<String, serde_json::Value>,
    pub estimated_impact: Option<f64>,
    pub risk_level: RiskLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentVote {
    pub agent_id: String,
    pub decision_id: String,
    pub selected_option: String,
    pub confidence: f64,
    pub reasoning: String,
    pub additional_data: Option<serde_json::Value>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone)]
pub struct DecisionContext {
    pub request: DecisionRequest,
    pub votes: Vec<AgentVote>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub status: DecisionStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DecisionStatus {
    Pending,
    InProgress,
    ConsensusReached,
    Failed,
    Timeout,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusResult {
    pub decision_id: String,
    pub decision_topic: String,
    pub consensus_reached: bool,
    pub decision_outcome: String,
    pub support_percentage: f64,
    pub participating_agents: Vec<String>,
    pub total_votes: usize,
    pub winning_option: Option<DecisionOption>,
    pub vote_distribution: HashMap<String, usize>,
    pub weighted_scores: HashMap<String, f64>,
    pub execution_metadata: Option<serde_json::Value>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub decision_duration: chrono::Duration,
}

impl ConsensusEngine {
    pub fn new() -> Self {
        Self {
            active_decisions: HashMap::new(),
            consensus_history: Vec::new(),
            agent_weights: HashMap::new(),
            default_threshold: 0.67, // 67% consensus required by default
        }
    }

    /// Submit a decision request for consensus
    pub async fn request_consensus(&mut self, request: DecisionRequest) -> AppResult<ConsensusResult> {
        let decision_id = request.decision_id.clone();
        
        tracing::info!("🤝 Starting consensus process for decision: {}", decision_id);

        // Create decision context
        let context = DecisionContext {
            request: request.clone(),
            votes: Vec::new(),
            created_at: chrono::Utc::now(),
            status: DecisionStatus::Pending,
        };

        self.active_decisions.insert(decision_id.clone(), context);

        // For simulation, immediately process with synthetic votes
        // In production, this would wait for real agent votes
        self.simulate_agent_votes(&decision_id).await?;

        // Calculate consensus
        let result = self.calculate_consensus(&decision_id).await?;

        // Remove from active decisions and add to history
        self.active_decisions.remove(&decision_id);
        self.consensus_history.push(result.clone());

        tracing::info!("✅ Consensus completed for decision: {} - Result: {}", 
                      decision_id, result.decision_outcome);

        Ok(result)
    }

    /// Submit a vote for a decision
    pub async fn submit_vote(&mut self, vote: AgentVote) -> AppResult<()> {
        let decision_id = vote.decision_id.clone();
        
        if let Some(context) = self.active_decisions.get_mut(&decision_id) {
            // Check if agent already voted
            if context.votes.iter().any(|v| v.agent_id == vote.agent_id) {
                return Err(AppError::Validation(
                    format!("Agent {} has already voted on decision {}", vote.agent_id, decision_id)
                ));
            }

            context.votes.push(vote.clone());
            context.status = DecisionStatus::InProgress;
            
            tracing::debug!("🗳️ Vote submitted by agent {} for decision {}", 
                           vote.agent_id, decision_id);

            // Check if we have enough votes to reach consensus
            if self.can_calculate_consensus(&decision_id).await? {
                let result = self.calculate_consensus(&decision_id).await?;
                
                // Remove from active and add to history
                self.active_decisions.remove(&decision_id);
                self.consensus_history.push(result);
            }
        } else {
            return Err(AppError::NotFound(
                format!("Decision {} not found or already completed", decision_id)
            ));
        }

        Ok(())
    }

    /// Calculate consensus for a decision
    async fn calculate_consensus(&self, decision_id: &str) -> AppResult<ConsensusResult> {
        let context = self.active_decisions.get(decision_id)
            .ok_or_else(|| AppError::NotFound(format!("Decision {} not found", decision_id)))?;

        let start_time = context.created_at;
        let current_time = chrono::Utc::now();
        let decision_duration = current_time - start_time;

        // Calculate vote distribution
        let mut vote_distribution: HashMap<String, usize> = HashMap::new();
        let mut weighted_scores: HashMap<String, f64> = HashMap::new();
        let mut participating_agents = Vec::new();

        for vote in &context.votes {
            participating_agents.push(vote.agent_id.clone());
            
            // Count votes
            *vote_distribution.entry(vote.selected_option.clone()).or_insert(0) += 1;
            
            // Calculate weighted scores (agent weight * confidence)
            let agent_weight = self.agent_weights.get(&vote.agent_id).unwrap_or(&1.0);
            let weighted_score = agent_weight * vote.confidence;
            
            *weighted_scores.entry(vote.selected_option.clone()).or_insert(0.0) += weighted_score;
        }

        // Find winning option
        let winning_option_id = weighted_scores
            .iter()
            .max_by(|a, b| a.1.partial_cmp(b.1).unwrap_or(std::cmp::Ordering::Equal))
            .map(|(option_id, _)| option_id.clone());

        let winning_option = if let Some(option_id) = &winning_option_id {
            context.request.options.iter()
                .find(|opt| opt.option_id == *option_id)
                .cloned()
        } else {
            None
        };

        // Calculate support percentage
        let total_weighted_score: f64 = weighted_scores.values().sum();
        let winning_score = winning_option_id.as_ref()
            .and_then(|id| weighted_scores.get(id))
            .unwrap_or(&0.0);
        
        let support_percentage = if total_weighted_score > 0.0 {
            winning_score / total_weighted_score
        } else {
            0.0
        };

        // Check if consensus is reached
        let consensus_reached = support_percentage >= context.request.consensus_threshold;
        
        let decision_outcome = if consensus_reached {
            if let Some(option) = &winning_option {
                format!("Consensus reached: {}", option.name)
            } else {
                "Consensus reached with no clear option".to_string()
            }
        } else {
            "No consensus reached".to_string()
        };

        Ok(ConsensusResult {
            decision_id: decision_id.to_string(),
            decision_topic: context.request.decision_topic.clone(),
            consensus_reached,
            decision_outcome,
            support_percentage,
            participating_agents,
            total_votes: context.votes.len(),
            winning_option,
            vote_distribution,
            weighted_scores,
            execution_metadata: None,
            timestamp: current_time,
            decision_duration,
        })
    }

    /// Check if we have enough information to calculate consensus
    async fn can_calculate_consensus(&self, decision_id: &str) -> AppResult<bool> {
        let context = self.active_decisions.get(decision_id)
            .ok_or_else(|| AppError::NotFound(format!("Decision {} not found", decision_id)))?;

        // Check if we have required agents
        if let Some(required_agents) = &context.request.required_agents {
            let voted_agents: std::collections::HashSet<_> = context.votes.iter()
                .map(|v| &v.agent_id)
                .collect();
            
            let required_set: std::collections::HashSet<_> = required_agents.iter().collect();
            
            if !required_set.iter().all(|agent| voted_agents.contains(agent)) {
                return Ok(false);
            }
        }

        // Check timeout
        let elapsed = chrono::Utc::now() - context.created_at;
        if elapsed > context.request.timeout {
            return Ok(true); // Force consensus calculation on timeout
        }

        // For now, assume we can calculate if we have any votes
        Ok(!context.votes.is_empty())
    }

    /// Simulate agent votes for testing/demo purposes
    async fn simulate_agent_votes(&mut self, decision_id: &str) -> AppResult<()> {
        let options = {
            let context = self.active_decisions.get(decision_id)
                .ok_or_else(|| AppError::NotFound(format!("Decision {} not found", decision_id)))?;
            context.request.options.clone()
        };

        if options.is_empty() {
            return Ok(());
        }

        let agents = vec!["agent_1", "agent_2", "agent_3", "cost_optimizer", "performance_monitor"];

        for agent in agents {
            // Simulate different voting patterns
            let selected_option = if agent == "cost_optimizer" {
                // Cost optimizer prefers low-risk options
                options.iter()
                    .filter(|opt| matches!(opt.risk_level, RiskLevel::Low | RiskLevel::Medium))
                    .next()
                    .unwrap_or(&options[0])
            } else {
                // Other agents vote randomly
                &options[fastrand::usize(..options.len())]
            };

            let confidence = 0.7 + (fastrand::f64() * 0.3); // 70-100% confidence
            
            let vote = AgentVote {
                agent_id: agent.to_string(),
                decision_id: decision_id.to_string(),
                selected_option: selected_option.option_id.clone(),
                confidence,
                reasoning: format!("Automated vote by {}", agent),
                additional_data: None,
                timestamp: chrono::Utc::now(),
            };

            self.submit_vote(vote).await?;
        }

        Ok(())
    }

    /// Set agent voting weight
    pub fn set_agent_weight(&mut self, agent_id: String, weight: f64) {
        self.agent_weights.insert(agent_id, weight.clamp(0.0, 10.0));
    }

    /// Get consensus history
    pub fn get_consensus_history(&self, limit: Option<usize>) -> Vec<ConsensusResult> {
        let mut history = self.consensus_history.clone();
        history.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        
        if let Some(limit) = limit {
            history.truncate(limit);
        }
        
        history
    }

    /// Get active decisions
    pub fn get_active_decisions(&self) -> Vec<&DecisionContext> {
        self.active_decisions.values().collect()
    }
}

impl Default for ConsensusEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_decision_request() -> DecisionRequest {
        DecisionRequest {
            decision_id: "test_decision".to_string(),
            decision_topic: "Test Decision".to_string(),
            decision_type: "resource_scaling".to_string(),
            context: serde_json::json!({"test": "context"}),
            options: vec![
                DecisionOption {
                    option_id: "option_1".to_string(),
                    name: "Scale Up".to_string(),
                    description: "Increase resources".to_string(),
                    parameters: HashMap::new(),
                    estimated_impact: Some(0.8),
                    risk_level: RiskLevel::Medium,
                },
                DecisionOption {
                    option_id: "option_2".to_string(),
                    name: "Scale Down".to_string(),
                    description: "Decrease resources".to_string(),
                    parameters: HashMap::new(),
                    estimated_impact: Some(0.6),
                    risk_level: RiskLevel::Low,
                },
            ],
            consensus_threshold: 0.6,
            timeout: chrono::Duration::minutes(5),
            required_agents: None,
            metadata: HashMap::new(),
        }
    }

    #[tokio::test]
    async fn test_consensus_engine_creation() {
        let engine = ConsensusEngine::new();
        assert_eq!(engine.default_threshold, 0.67);
        assert!(engine.active_decisions.is_empty());
    }

    #[tokio::test]
    async fn test_request_consensus() {
        let mut engine = ConsensusEngine::new();
        let request = create_test_decision_request();
        
        let result = engine.request_consensus(request).await;
        assert!(result.is_ok());
        
        let consensus_result = result.unwrap();
        assert_eq!(consensus_result.decision_id, "test_decision");
        assert!(consensus_result.total_votes > 0);
    }

    #[tokio::test]
    async fn test_agent_weights() {
        let mut engine = ConsensusEngine::new();
        engine.set_agent_weight("important_agent".to_string(), 2.0);
        
        assert_eq!(engine.agent_weights.get("important_agent"), Some(&2.0));
    }
}
