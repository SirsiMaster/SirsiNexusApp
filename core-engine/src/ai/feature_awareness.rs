use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// AI Feature Awareness System
/// This system enables AI agents and hypervisors to have complete understanding
/// of all platform features, their relationships, and capabilities.

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureRegistry {
    features: HashMap<String, Feature>,
    relationships: Vec<FeatureRelationship>,
    capabilities: HashMap<String, Capability>,
    workflows: HashMap<String, Workflow>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Feature {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: FeatureCategory,
    pub phase: u8,
    pub status: FeatureStatus,
    pub api_endpoints: Vec<ApiEndpoint>,
    pub dependencies: Vec<String>,
    pub capabilities: Vec<String>,
    pub documentation_url: String,
    pub tutorial_url: String,
    pub faq_url: String,
    pub ai_guide_url: String,
    pub technical_specs: TechnicalSpecs,
    pub usage_metrics: UsageMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FeatureCategory {
    CorePlatform,
    AIOrchestration,
    AnalyticsMonitoring,
    OptimizationScaling,
    SecurityCompliance,
    SupportDocs,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FeatureStatus {
    Stable,
    Beta,
    Experimental,
    Deprecated,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiEndpoint {
    pub method: String,
    pub path: String,
    pub description: String,
    pub parameters: Vec<Parameter>,
    pub response_schema: String,
    pub auth_required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Parameter {
    pub name: String,
    pub param_type: String,
    pub required: bool,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechnicalSpecs {
    pub version: String,
    pub min_requirements: ResourceRequirements,
    pub recommended_requirements: ResourceRequirements,
    pub supported_platforms: Vec<String>,
    pub integrations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceRequirements {
    pub cpu_cores: u32,
    pub memory_gb: u32,
    pub storage_gb: u32,
    pub network_bandwidth: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageMetrics {
    pub total_invocations: u64,
    pub success_rate: f64,
    pub avg_response_time_ms: u64,
    pub error_rate: f64,
    pub last_used: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureRelationship {
    pub source_feature: String,
    pub target_feature: String,
    pub relationship_type: RelationshipType,
    pub strength: f64, // 0.0 to 1.0
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RelationshipType {
    DependsOn,
    Integrates,
    Conflicts,
    Enhances,
    Requires,
    Optional,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Capability {
    pub id: String,
    pub name: String,
    pub description: String,
    pub actions: Vec<String>,
    pub required_features: Vec<String>,
    pub complexity_level: ComplexityLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplexityLevel {
    Simple,
    Moderate,
    Complex,
    Advanced,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workflow {
    pub id: String,
    pub name: String,
    pub description: String,
    pub steps: Vec<WorkflowStep>,
    pub required_features: Vec<String>,
    pub estimated_duration: chrono::Duration,
    pub automation_level: AutomationLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStep {
    pub id: String,
    pub name: String,
    pub action: String,
    pub required_feature: String,
    pub prerequisites: Vec<String>,
    pub outputs: Vec<String>,
    pub ai_automatable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AutomationLevel {
    Manual,
    SemiAutomated,
    FullyAutomated,
    AIOptimized,
}

impl FeatureRegistry {
    pub fn new() -> Self {
        Self {
            features: HashMap::new(),
            relationships: Vec::new(),
            capabilities: HashMap::new(),
            workflows: HashMap::new(),
        }
    }

    /// Initialize the registry with all SirsiNexus features
    pub fn initialize_sirsi_features(&mut self) {
        self.add_core_platform_features();
        self.add_ai_orchestration_features();
        self.add_analytics_monitoring_features();
        self.add_optimization_scaling_features();
        self.add_security_compliance_features();
        self.add_support_doc_features();
        self.establish_relationships();
        self.define_capabilities();
        self.create_workflows();
    }

    fn add_core_platform_features(&mut self) {
        // Migration Wizard
        let migration_feature = Feature {
            id: "migration".to_string(),
            name: "Migration Wizard".to_string(),
            description: "Guided cloud migration with AI-powered planning".to_string(),
            category: FeatureCategory::CorePlatform,
            phase: 1,
            status: FeatureStatus::Stable,
            api_endpoints: vec![
                ApiEndpoint {
                    method: "POST".to_string(),
                    path: "/api/migration/discover".to_string(),
                    description: "Start infrastructure discovery".to_string(),
                    parameters: vec![],
                    response_schema: "DiscoveryResult".to_string(),
                    auth_required: true,
                },
                ApiEndpoint {
                    method: "GET".to_string(),
                    path: "/api/migration/plan/{id}".to_string(),
                    description: "Get migration plan details".to_string(),
                    parameters: vec![Parameter {
                        name: "id".to_string(),
                        param_type: "string".to_string(),
                        required: true,
                        description: "Migration plan ID".to_string(),
                    }],
                    response_schema: "MigrationPlan".to_string(),
                    auth_required: true,
                },
            ],
            dependencies: vec!["core-engine".to_string(), "agent-manager".to_string()],
            capabilities: vec!["discovery".to_string(), "planning".to_string(), "execution".to_string()],
            documentation_url: "/migration/docs".to_string(),
            tutorial_url: "/migration/tutorial".to_string(),
            faq_url: "/migration/faq".to_string(),
            ai_guide_url: "/migration/ai-guide".to_string(),
            technical_specs: TechnicalSpecs {
                version: "v2.1.0".to_string(),
                min_requirements: ResourceRequirements {
                    cpu_cores: 4,
                    memory_gb: 8,
                    storage_gb: 100,
                    network_bandwidth: "1Gbps".to_string(),
                },
                recommended_requirements: ResourceRequirements {
                    cpu_cores: 8,
                    memory_gb: 16,
                    storage_gb: 500,
                    network_bandwidth: "10Gbps".to_string(),
                },
                supported_platforms: vec!["AWS".to_string(), "Azure".to_string(), "GCP".to_string()],
                integrations: vec!["Kubernetes".to_string(), "Docker".to_string()],
            },
            usage_metrics: UsageMetrics {
                total_invocations: 0,
                success_rate: 0.98,
                avg_response_time_ms: 1500,
                error_rate: 0.02,
                last_used: chrono::Utc::now(),
            },
        };

        self.features.insert("migration".to_string(), migration_feature);

        // Add more core platform features...
    }

    fn add_ai_orchestration_features(&mut self) {
        // AI Orchestration Engine
        let ai_orchestration = Feature {
            id: "ai-orchestration".to_string(),
            name: "AI Orchestration Engine".to_string(),
            description: "Intelligent workflow automation and decision making".to_string(),
            category: FeatureCategory::AIOrchestration,
            phase: 3,
            status: FeatureStatus::Beta,
            api_endpoints: vec![
                ApiEndpoint {
                    method: "POST".to_string(),
                    path: "/api/ai/orchestrate".to_string(),
                    description: "Start AI-driven orchestration".to_string(),
                    parameters: vec![],
                    response_schema: "OrchestrationResult".to_string(),
                    auth_required: true,
                },
            ],
            dependencies: vec!["core-engine".to_string(), "ml-platform".to_string()],
            capabilities: vec!["automation".to_string(), "decision-making".to_string(), "optimization".to_string()],
            documentation_url: "/ai-orchestration/docs".to_string(),
            tutorial_url: "/ai-orchestration/tutorial".to_string(),
            faq_url: "/ai-orchestration/faq".to_string(),
            ai_guide_url: "/ai-orchestration/ai-guide".to_string(),
            technical_specs: TechnicalSpecs {
                version: "v1.0.0-beta".to_string(),
                min_requirements: ResourceRequirements {
                    cpu_cores: 8,
                    memory_gb: 16,
                    storage_gb: 200,
                    network_bandwidth: "10Gbps".to_string(),
                },
                recommended_requirements: ResourceRequirements {
                    cpu_cores: 16,
                    memory_gb: 32,
                    storage_gb: 1000,
                    network_bandwidth: "25Gbps".to_string(),
                },
                supported_platforms: vec!["Kubernetes".to_string(), "Docker".to_string()],
                integrations: vec!["TensorFlow".to_string(), "PyTorch".to_string()],
            },
            usage_metrics: UsageMetrics {
                total_invocations: 0,
                success_rate: 0.95,
                avg_response_time_ms: 2500,
                error_rate: 0.05,
                last_used: chrono::Utc::now(),
            },
        };

        self.features.insert("ai-orchestration".to_string(), ai_orchestration);
    }

    fn add_analytics_monitoring_features(&mut self) {
        // Similar implementation for analytics and monitoring features
    }

    fn add_optimization_scaling_features(&mut self) {
        // Similar implementation for optimization and scaling features
    }

    fn add_security_compliance_features(&mut self) {
        // Similar implementation for security and compliance features
    }

    fn add_support_doc_features(&mut self) {
        // Similar implementation for support and documentation features
    }

    fn establish_relationships(&mut self) {
        self.relationships.push(FeatureRelationship {
            source_feature: "migration".to_string(),
            target_feature: "ai-orchestration".to_string(),
            relationship_type: RelationshipType::Enhances,
            strength: 0.8,
            description: "AI orchestration enhances migration planning and execution".to_string(),
        });

        self.relationships.push(FeatureRelationship {
            source_feature: "migration".to_string(),
            target_feature: "analytics".to_string(),
            relationship_type: RelationshipType::Integrates,
            strength: 0.9,
            description: "Migration uses analytics for performance monitoring".to_string(),
        });
    }

    fn define_capabilities(&mut self) {
        let discovery_capability = Capability {
            id: "discovery".to_string(),
            name: "Infrastructure Discovery".to_string(),
            description: "Automatically discover and analyze infrastructure components".to_string(),
            actions: vec![
                "scan_network".to_string(),
                "analyze_dependencies".to_string(),
                "assess_security".to_string(),
            ],
            required_features: vec!["migration".to_string()],
            complexity_level: ComplexityLevel::Moderate,
        };

        self.capabilities.insert("discovery".to_string(), discovery_capability);
    }

    fn create_workflows(&mut self) {
        let migration_workflow = Workflow {
            id: "complete-migration".to_string(),
            name: "Complete Migration Workflow".to_string(),
            description: "End-to-end migration from discovery to validation".to_string(),
            steps: vec![
                WorkflowStep {
                    id: "step-1".to_string(),
                    name: "Discovery".to_string(),
                    action: "discover_infrastructure".to_string(),
                    required_feature: "migration".to_string(),
                    prerequisites: vec![],
                    outputs: vec!["infrastructure_map".to_string()],
                    ai_automatable: true,
                },
                WorkflowStep {
                    id: "step-2".to_string(),
                    name: "Planning".to_string(),
                    action: "create_migration_plan".to_string(),
                    required_feature: "migration".to_string(),
                    prerequisites: vec!["infrastructure_map".to_string()],
                    outputs: vec!["migration_plan".to_string()],
                    ai_automatable: true,
                },
            ],
            required_features: vec!["migration".to_string(), "analytics".to_string()],
            estimated_duration: chrono::Duration::hours(24),
            automation_level: AutomationLevel::AIOptimized,
        };

        self.workflows.insert("complete-migration".to_string(), migration_workflow);
    }

    /// Get feature by ID
    pub fn get_feature(&self, id: &str) -> Option<&Feature> {
        self.features.get(id)
    }

    /// Get all features in a category
    pub fn get_features_by_category(&self, category: &FeatureCategory) -> Vec<&Feature> {
        self.features
            .values()
            .filter(|f| std::mem::discriminant(&f.category) == std::mem::discriminant(category))
            .collect()
    }

    /// Get feature dependencies
    pub fn get_feature_dependencies(&self, feature_id: &str) -> Vec<&Feature> {
        if let Some(feature) = self.features.get(feature_id) {
            feature
                .dependencies
                .iter()
                .filter_map(|dep_id| self.features.get(dep_id))
                .collect()
        } else {
            Vec::new()
        }
    }

    /// Get features that depend on a given feature
    pub fn get_dependent_features(&self, feature_id: &str) -> Vec<&Feature> {
        self.features
            .values()
            .filter(|f| f.dependencies.contains(&feature_id.to_string()))
            .collect()
    }

    /// Get all relationships for a feature
    pub fn get_feature_relationships(&self, feature_id: &str) -> Vec<&FeatureRelationship> {
        self.relationships
            .iter()
            .filter(|r| r.source_feature == feature_id || r.target_feature == feature_id)
            .collect()
    }

    /// Check if a workflow can be executed with current feature availability
    pub fn can_execute_workflow(&self, workflow_id: &str) -> bool {
        if let Some(workflow) = self.workflows.get(workflow_id) {
            workflow.required_features.iter().all(|feature_id| {
                self.features
                    .get(feature_id)
                    .map(|f| matches!(f.status, FeatureStatus::Stable | FeatureStatus::Beta))
                    .unwrap_or(false)
            })
        } else {
            false
        }
    }

    /// Get AI automation suggestions for a given task
    pub fn get_ai_automation_suggestions(&self, task: &str) -> Vec<String> {
        let mut suggestions = Vec::new();

        // Find workflows that can handle this task
        for workflow in self.workflows.values() {
            if workflow.name.to_lowercase().contains(&task.to_lowercase()) {
                if workflow.automation_level == AutomationLevel::AIOptimized {
                    suggestions.push(format!(
                        "Use {} workflow for AI-optimized automation",
                        workflow.name
                    ));
                }
            }
        }

        // Find features with relevant capabilities
        for feature in self.features.values() {
            if feature.description.to_lowercase().contains(&task.to_lowercase()) {
                suggestions.push(format!(
                    "Feature '{}' can help with: {}",
                    feature.name, feature.description
                ));
            }
        }

        suggestions
    }

    /// Update feature usage metrics
    pub fn update_usage_metrics(&mut self, feature_id: &str, success: bool, response_time_ms: u64) {
        if let Some(feature) = self.features.get_mut(feature_id) {
            feature.usage_metrics.total_invocations += 1;
            feature.usage_metrics.last_used = chrono::Utc::now();
            
            // Update success rate
            let total = feature.usage_metrics.total_invocations as f64;
            let current_successes = feature.usage_metrics.success_rate * (total - 1.0);
            let new_successes = if success { current_successes + 1.0 } else { current_successes };
            feature.usage_metrics.success_rate = new_successes / total;
            
            // Update error rate
            feature.usage_metrics.error_rate = 1.0 - feature.usage_metrics.success_rate;
            
            // Update average response time
            let current_avg = feature.usage_metrics.avg_response_time_ms as f64;
            let new_avg = ((current_avg * (total - 1.0)) + response_time_ms as f64) / total;
            feature.usage_metrics.avg_response_time_ms = new_avg as u64;
        }
    }

    /// Generate AI context for hypervisor decision making
    pub fn generate_ai_context(&self) -> AIContext {
        AIContext {
            available_features: self.features.keys().cloned().collect(),
            feature_health: self.get_feature_health_summary(),
            workflow_capabilities: self.get_workflow_summary(),
            optimization_opportunities: self.identify_optimization_opportunities(),
        }
    }

    fn get_feature_health_summary(&self) -> HashMap<String, f64> {
        self.features
            .iter()
            .map(|(id, feature)| {
                let health_score = feature.usage_metrics.success_rate * 0.7
                    + (1.0 - (feature.usage_metrics.avg_response_time_ms as f64 / 10000.0).min(1.0)) * 0.3;
                (id.clone(), health_score)
            })
            .collect()
    }

    fn get_workflow_summary(&self) -> HashMap<String, AutomationLevel> {
        self.workflows
            .iter()
            .map(|(id, workflow)| (id.clone(), workflow.automation_level.clone()))
            .collect()
    }

    fn identify_optimization_opportunities(&self) -> Vec<String> {
        let mut opportunities = Vec::new();

        for feature in self.features.values() {
            if feature.usage_metrics.error_rate > 0.1 {
                opportunities.push(format!(
                    "Feature '{}' has high error rate: {:.2}%",
                    feature.name,
                    feature.usage_metrics.error_rate * 100.0
                ));
            }

            if feature.usage_metrics.avg_response_time_ms > 5000 {
                opportunities.push(format!(
                    "Feature '{}' has slow response time: {}ms",
                    feature.name,
                    feature.usage_metrics.avg_response_time_ms
                ));
            }
        }

        opportunities
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIContext {
    pub available_features: Vec<String>,
    pub feature_health: HashMap<String, f64>,
    pub workflow_capabilities: HashMap<String, AutomationLevel>,
    pub optimization_opportunities: Vec<String>,
}

impl Default for FeatureRegistry {
    fn default() -> Self {
        let mut registry = Self::new();
        registry.initialize_sirsi_features();
        registry
    }
}
