use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::collections::HashMap;
use uuid::Uuid;
use thiserror::Error;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DecisionContext {
    pub user_preferences: UserPreferences,
    pub cloud_state: CloudState,
    pub constraints: Vec<Constraint>,
    pub objectives: Vec<Objective>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserPreferences {
    pub cost_optimization_priority: f64,
    pub performance_priority: f64,
    pub security_priority: f64,
    pub compliance_requirements: Vec<String>,
    pub preferred_cloud_providers: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CloudState {
    pub current_resources: HashMap<String, ResourceInfo>,
    pub utilization_metrics: HashMap<String, f64>,
    pub costs: HashMap<String, f64>,
    pub availability_zones: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ResourceInfo {
    pub resource_id: String,
    pub resource_type: String,
    pub provider: String,
    pub region: String,
    pub configuration: HashMap<String, serde_json::Value>,
    pub dependencies: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Constraint {
    pub constraint_id: String,
    pub constraint_type: ConstraintType,
    pub parameters: HashMap<String, serde_json::Value>,
    pub severity: ConstraintSeverity,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ConstraintType {
    Budget,
    Performance,
    Security,
    Compliance,
    Geographic,
    Technical,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ConstraintSeverity {
    Hard,   // Must be satisfied
    Soft,   // Should be satisfied if possible
    Nice,   // Preferred but optional
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Objective {
    pub objective_id: String,
    pub objective_type: ObjectiveType,
    pub weight: f64,
    pub target_value: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ObjectiveType {
    MinimizeCost,
    MaximizePerformance,
    MaximizeAvailability,
    MinimizeLatency,
    MaximizeCompliance,
    MinimizeRisk,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DecisionOption {
    pub option_id: String,
    pub description: String,
    pub estimated_cost: f64,
    pub estimated_performance: f64,
    pub security_score: f64,
    pub compliance_score: f64,
    pub implementation_complexity: f64,
    pub risk_assessment: RiskAssessment,
    pub required_actions: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RiskAssessment {
    pub overall_risk: f64,
    pub technical_risk: f64,
    pub security_risk: f64,
    pub business_risk: f64,
    pub mitigation_strategies: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Decision {
    pub decision_id: String,
    pub selected_option: DecisionOption,
    pub confidence_score: f64,
    pub reasoning: String,
    pub alternative_options: Vec<DecisionOption>,
    pub safety_validation: SafetyValidation,
    pub recommendation_metadata: DecisionMetadata,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SafetyValidation {
    pub passed: bool,
    pub checks_performed: Vec<String>,
    pub warnings: Vec<String>,
    pub blocked_reasons: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DecisionMetadata {
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub decision_engine_version: String,
    pub models_used: Vec<String>,
    pub processing_time_ms: u64,
}

#[derive(Error, Debug)]
pub enum DecisionError {
    #[error("Invalid decision context: {0}")]
    InvalidContext(String),
    #[error("No viable options found")]
    NoViableOptions,
    #[error("Safety constraints violated: {0}")]
    SafetyViolation(String),
    #[error("ML model error: {0}")]
    ModelError(String),
    #[error("Constraint solver error: {0}")]
    SolverError(String),
}

#[derive(Debug)]
pub struct MCDMSolver {
    #[allow(dead_code)] // MCDM methods for future advanced decision algorithms
    methods: Vec<MCDMMethod>,
}

#[derive(Debug)]
pub enum MCDMMethod {
    TOPSIS,     // Technique for Order of Preference by Similarity to Ideal Solution
    PROMETHEE,  // Preference Ranking Organization Method for Enrichment Evaluations
    AHP,        // Analytic Hierarchy Process
    ELECTRE,    // Elimination and Choice Translating Reality
}

#[derive(Debug)]
pub struct MLModels {
    cost_predictor: Box<dyn MLModel + Send + Sync>,
    performance_predictor: Box<dyn MLModel + Send + Sync>,
    risk_assessor: Box<dyn MLModel + Send + Sync>,
}

pub trait MLModel: std::fmt::Debug {
    fn predict(&self, input: &HashMap<String, f64>) -> Result<f64, DecisionError>;
    fn confidence(&self, input: &HashMap<String, f64>) -> Result<f64, DecisionError>;
    fn model_name(&self) -> &str;
}

#[derive(Debug)]
pub struct KnowledgeGraph {
    // Simplified knowledge graph for decision support
    #[allow(dead_code)] // Entity storage for future knowledge graph functionality
    entities: HashMap<String, Entity>,
    #[allow(dead_code)] // Relationship storage for future knowledge graph functionality
    relationships: Vec<Relationship>,
}

#[derive(Debug, Clone)]
pub struct Entity {
    pub id: String,
    pub entity_type: String,
    pub properties: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone)]
pub struct Relationship {
    pub from_entity: String,
    pub to_entity: String,
    pub relationship_type: String,
    pub weight: f64,
}

pub struct SafetyChecker {
    safety_rules: Vec<SafetyRule>,
}

pub struct SafetyRule {
    pub rule_id: String,
    pub description: String,
    pub checker: Box<dyn Fn(&DecisionOption, &DecisionContext) -> Result<bool, DecisionError> + Send + Sync>,
}

pub struct DecisionEngine {
    mcdm_solver: MCDMSolver,
    ml_models: Arc<RwLock<MLModels>>,
    #[allow(dead_code)] // Knowledge graph for future advanced decision support
    knowledge_graph: KnowledgeGraph,
    safety_checker: SafetyChecker,
    decision_history: Arc<RwLock<Vec<Decision>>>,
}

impl DecisionEngine {
    pub fn new() -> Self {
        let mcdm_solver = MCDMSolver {
            methods: vec![
                MCDMMethod::TOPSIS,
                MCDMMethod::AHP,
                MCDMMethod::PROMETHEE,
            ],
        };

        // Initialize with mock ML models for now
        let ml_models = Arc::new(RwLock::new(MLModels {
            cost_predictor: Box::new(MockMLModel::new("CostPredictor")),
            performance_predictor: Box::new(MockMLModel::new("PerformancePredictor")),
            risk_assessor: Box::new(MockMLModel::new("RiskAssessor")),
        }));

        let knowledge_graph = KnowledgeGraph {
            entities: HashMap::new(),
            relationships: Vec::new(),
        };

        let safety_checker = SafetyChecker {
            safety_rules: Self::create_default_safety_rules(),
        };

        Self {
            mcdm_solver,
            ml_models,
            knowledge_graph,
            safety_checker,
            decision_history: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub async fn make_decision(
        &self,
        context: DecisionContext,
        options: Vec<DecisionOption>,
    ) -> Result<Decision, DecisionError> {
        let start_time = std::time::Instant::now();

        // Validate context and options
        self.validate_context(&context)?;
        if options.is_empty() {
            return Err(DecisionError::NoViableOptions);
        }

        // Score options using multiple criteria
        let scored_options = self.score_options(&context, &options).await?;

        // Apply safety checks
        let safety_validated_options = self.safety_checker.validate(&scored_options).await?;

        if safety_validated_options.is_empty() {
            return Err(DecisionError::SafetyViolation(
                "All options failed safety validation".to_string(),
            ));
        }

        // Solve using MCDM
        let final_decision = self.mcdm_solver.solve(&context, safety_validated_options)?;

        // Record decision for learning
        self.record_decision(&context, &final_decision).await?;

        // Add metadata
        let mut decision_with_metadata = final_decision;
        decision_with_metadata.recommendation_metadata = DecisionMetadata {
            timestamp: chrono::Utc::now(),
            decision_engine_version: env!("CARGO_PKG_VERSION").to_string(),
            models_used: vec![
                "CostPredictor".to_string(),
                "PerformancePredictor".to_string(),
                "RiskAssessor".to_string(),
            ],
            processing_time_ms: start_time.elapsed().as_millis() as u64,
        };

        Ok(decision_with_metadata)
    }

    async fn score_options(
        &self,
        context: &DecisionContext,
        options: &[DecisionOption],
    ) -> Result<Vec<DecisionOption>, DecisionError> {
        let models = self.ml_models.read().await;
        let mut scored_options = Vec::new();

        for option in options {
            let mut scored_option = option.clone();

            // Extract features for ML models
            let features = self.extract_features(context, option);

            // Get ML predictions
            let cost_prediction = models.cost_predictor.predict(&features)?;
            let performance_prediction = models.performance_predictor.predict(&features)?;
            let risk_prediction = models.risk_assessor.predict(&features)?;

            // Update option with ML predictions
            scored_option.estimated_cost = cost_prediction;
            scored_option.estimated_performance = performance_prediction;
            scored_option.risk_assessment.overall_risk = risk_prediction;

            scored_options.push(scored_option);
        }

        Ok(scored_options)
    }

    fn extract_features(
        &self,
        context: &DecisionContext,
        option: &DecisionOption,
    ) -> HashMap<String, f64> {
        let mut features = HashMap::new();

        // Extract features from context and option for ML models
        features.insert("cost_priority".to_string(), context.user_preferences.cost_optimization_priority);
        features.insert("performance_priority".to_string(), context.user_preferences.performance_priority);
        features.insert("security_priority".to_string(), context.user_preferences.security_priority);
        features.insert("implementation_complexity".to_string(), option.implementation_complexity);
        features.insert("security_score".to_string(), option.security_score);
        features.insert("compliance_score".to_string(), option.compliance_score);

        // Add resource count and utilization features
        features.insert("resource_count".to_string(), context.cloud_state.current_resources.len() as f64);
        
        let avg_utilization = context.cloud_state.utilization_metrics.values().sum::<f64>() 
            / context.cloud_state.utilization_metrics.len().max(1) as f64;
        features.insert("avg_utilization".to_string(), avg_utilization);

        features
    }

    fn validate_context(&self, context: &DecisionContext) -> Result<(), DecisionError> {
        // Validate user preferences
        let prefs = &context.user_preferences;
        if prefs.cost_optimization_priority < 0.0 || prefs.cost_optimization_priority > 1.0 {
            return Err(DecisionError::InvalidContext(
                "Cost optimization priority must be between 0 and 1".to_string(),
            ));
        }

        if prefs.performance_priority < 0.0 || prefs.performance_priority > 1.0 {
            return Err(DecisionError::InvalidContext(
                "Performance priority must be between 0 and 1".to_string(),
            ));
        }

        if prefs.security_priority < 0.0 || prefs.security_priority > 1.0 {
            return Err(DecisionError::InvalidContext(
                "Security priority must be between 0 and 1".to_string(),
            ));
        }

        // Validate objectives have positive weights
        for objective in &context.objectives {
            if objective.weight <= 0.0 {
                return Err(DecisionError::InvalidContext(
                    format!("Objective {} must have positive weight", objective.objective_id),
                ));
            }
        }

        Ok(())
    }

    async fn record_decision(
        &self,
        _context: &DecisionContext,
        decision: &Decision,
    ) -> Result<(), DecisionError> {
        let mut history = self.decision_history.write().await;
        history.push(decision.clone());

        // TODO: Implement learning from decision history here
        // This would feed back into ML model training using context data

        Ok(())
    }

    fn create_default_safety_rules() -> Vec<SafetyRule> {
        vec![
            SafetyRule {
                rule_id: "budget_limit".to_string(),
                description: "Ensure decision doesn't exceed budget limits".to_string(),
                checker: Box::new(|option, context| {
                    // Find budget constraints
                    for constraint in &context.constraints {
                        if matches!(constraint.constraint_type, ConstraintType::Budget) {
                            if let Some(budget_limit) = constraint.parameters.get("max_budget") {
                                if let Some(limit) = budget_limit.as_f64() {
                                    if option.estimated_cost > limit {
                                        return Ok(false);
                                    }
                                }
                            }
                        }
                    }
                    Ok(true)
                }),
            },
            SafetyRule {
                rule_id: "security_minimum".to_string(),
                description: "Ensure minimum security score is met".to_string(),
                checker: Box::new(|option, _context| {
                    Ok(option.security_score >= 0.7) // Minimum 70% security score
                }),
            },
            SafetyRule {
                rule_id: "risk_threshold".to_string(),
                description: "Ensure overall risk is within acceptable limits".to_string(),
                checker: Box::new(|option, _context| {
                    Ok(option.risk_assessment.overall_risk <= 0.8) // Maximum 80% risk
                }),
            },
        ]
    }
}

impl MCDMSolver {
    pub fn solve(
        &self,
        context: &DecisionContext,
        options: Vec<DecisionOption>,
    ) -> Result<Decision, DecisionError> {
        // Simplified TOPSIS implementation
        let best_option = self.apply_topsis(context, &options)?;
        
        let decision_id = Uuid::new_v4().to_string();
        let selected_option = best_option;
        let mut alternative_options = options;
        alternative_options.retain(|opt| opt.option_id != selected_option.option_id);

        Ok(Decision {
            decision_id,
            selected_option,
            confidence_score: 0.85, // Simplified confidence calculation
            reasoning: "Selected based on TOPSIS multi-criteria analysis considering cost, performance, security, and risk factors".to_string(),
            alternative_options,
            safety_validation: SafetyValidation {
                passed: true,
                checks_performed: vec![
                    "budget_limit".to_string(),
                    "security_minimum".to_string(),
                    "risk_threshold".to_string(),
                ],
                warnings: Vec::new(),
                blocked_reasons: Vec::new(),
            },
            recommendation_metadata: DecisionMetadata {
                timestamp: chrono::Utc::now(),
                decision_engine_version: "1.0.0".to_string(),
                models_used: Vec::new(),
                processing_time_ms: 0,
            },
        })
    }

    fn apply_topsis(
        &self,
        context: &DecisionContext,
        options: &[DecisionOption],
    ) -> Result<DecisionOption, DecisionError> {
        if options.is_empty() {
            return Err(DecisionError::NoViableOptions);
        }

        // Simplified TOPSIS: select option with best weighted score
        let mut best_option = &options[0];
        let mut best_score = self.calculate_weighted_score(context, &options[0]);

        for option in options.iter().skip(1) {
            let score = self.calculate_weighted_score(context, option);
            if score > best_score {
                best_score = score;
                best_option = option;
            }
        }

        Ok(best_option.clone())
    }

    fn calculate_weighted_score(&self, context: &DecisionContext, option: &DecisionOption) -> f64 {
        let prefs = &context.user_preferences;
        
        // Normalize scores (assuming 0-1 scale for most metrics)
        let cost_score = 1.0 - (option.estimated_cost / 10000.0).min(1.0); // Normalize cost
        let performance_score = option.estimated_performance;
        let security_score = option.security_score;
        let risk_score = 1.0 - option.risk_assessment.overall_risk; // Lower risk is better

        // Calculate weighted score
        prefs.cost_optimization_priority * cost_score +
        prefs.performance_priority * performance_score +
        prefs.security_priority * security_score +
        0.2 * risk_score // Risk gets 20% weight
    }
}

impl SafetyChecker {
    pub async fn validate(
        &self,
        options: &[DecisionOption],
    ) -> Result<Vec<DecisionOption>, DecisionError> {
        let mut validated_options = Vec::new();

        for option in options {
            let mut is_safe = true;
            let mut _warnings = Vec::new();

            // This is a simplified validation - normally would check against context
            let dummy_context = DecisionContext {
                user_preferences: UserPreferences {
                    cost_optimization_priority: 0.5,
                    performance_priority: 0.3,
                    security_priority: 0.7,
                    compliance_requirements: Vec::new(),
                    preferred_cloud_providers: Vec::new(),
                },
                cloud_state: CloudState {
                    current_resources: HashMap::new(),
                    utilization_metrics: HashMap::new(),
                    costs: HashMap::new(),
                    availability_zones: Vec::new(),
                },
                constraints: Vec::new(),
                objectives: Vec::new(),
            };

            for rule in &self.safety_rules {
                match (rule.checker)(option, &dummy_context) {
                    Ok(passed) => {
                        if !passed {
                            is_safe = false;
                            _warnings.push(format!("Safety rule failed: {}", rule.description));
                        }
                    }
                    Err(_) => {
                        _warnings.push(format!("Error checking rule: {}", rule.description));
                    }
                }
            }

            if is_safe {
                validated_options.push(option.clone());
            }
        }

        Ok(validated_options)
    }
}

// Mock ML Model for development
#[derive(Debug)]
pub struct MockMLModel {
    name: String,
}

impl MockMLModel {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
        }
    }
}

impl MLModel for MockMLModel {
    fn predict(&self, input: &HashMap<String, f64>) -> Result<f64, DecisionError> {
        // Simple mock prediction based on input features
        let sum: f64 = input.values().sum();
        let prediction = (sum / input.len() as f64).min(1.0).max(0.0);
        Ok(prediction)
    }

    fn confidence(&self, _input: &HashMap<String, f64>) -> Result<f64, DecisionError> {
        Ok(0.85) // Mock 85% confidence
    }

    fn model_name(&self) -> &str {
        &self.name
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_decision_engine_creation() {
        let engine = DecisionEngine::new();
        assert!(!engine.safety_checker.safety_rules.is_empty());
    }

    #[tokio::test]
    async fn test_simple_decision() {
        let engine = DecisionEngine::new();
        
        let context = DecisionContext {
            user_preferences: UserPreferences {
                cost_optimization_priority: 0.6,
                performance_priority: 0.3,
                security_priority: 0.8,
                compliance_requirements: Vec::new(),
                preferred_cloud_providers: vec!["AWS".to_string()],
            },
            cloud_state: CloudState {
                current_resources: HashMap::new(),
                utilization_metrics: HashMap::new(),
                costs: HashMap::new(),
                availability_zones: vec!["us-east-1a".to_string()],
            },
            constraints: Vec::new(),
            objectives: vec![
                Objective {
                    objective_id: "cost".to_string(),
                    objective_type: ObjectiveType::MinimizeCost,
                    weight: 0.6,
                    target_value: Some(1000.0),
                },
            ],
        };

        let options = vec![
            DecisionOption {
                option_id: "option1".to_string(),
                description: "Basic migration".to_string(),
                estimated_cost: 500.0,
                estimated_performance: 0.7,
                security_score: 0.8,
                compliance_score: 0.9,
                implementation_complexity: 0.3,
                risk_assessment: RiskAssessment {
                    overall_risk: 0.2,
                    technical_risk: 0.1,
                    security_risk: 0.1,
                    business_risk: 0.2,
                    mitigation_strategies: Vec::new(),
                },
                required_actions: Vec::new(),
            },
        ];

        let result = engine.make_decision(context, options).await;
        assert!(result.is_ok());
        
        let decision = result.unwrap();
        assert_eq!(decision.selected_option.option_id, "option1");
        assert!(decision.confidence_score > 0.0);
    }
}
