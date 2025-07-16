pub mod aws;
pub mod azure;
pub mod gcp;

pub use aws::{AwsAgent, AwsConfig, AwsResource, DiscoveryResult};
pub use azure::{AzureAgent, AzureConfig, AzureDiscoveryResult};
pub use gcp::{GcpAgent, GcpConfig, GcpDiscoveryResult};

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CloudProvider {
    AWS,
    Azure,
    GCP,
    VSphere,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectorConfig {
    pub provider: CloudProvider,
    pub region: String,
    pub credentials: HashMap<String, String>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudResource {
    pub provider: CloudProvider,
    pub resource_type: String,
    pub resource_id: String,
    pub name: Option<String>,
    pub arn: Option<String>,
    pub region: String,
    pub tags: HashMap<String, String>,
    pub metadata: HashMap<String, String>,
    pub cost_estimate: Option<f64>,
}

#[derive(Debug)]
pub struct ConnectorManager {
    aws_agents: HashMap<String, AwsAgent>,
    azure_agents: HashMap<String, AzureAgent>,
    gcp_agents: HashMap<String, GcpAgent>,
}

impl ConnectorManager {
    pub fn new() -> Self {
        Self {
            aws_agents: HashMap::new(),
            azure_agents: HashMap::new(),
            gcp_agents: HashMap::new(),
        }
    }

    pub async fn create_aws_connector(&mut self, config: AwsConfig) -> AppResult<String> {
        let connector_id = uuid::Uuid::new_v4().to_string();
        let mut agent = AwsAgent::new(config);
        
        agent.initialize().await.map_err(|e| {
            AppError::Configuration(format!("Failed to initialize AWS connector: {}", e))
        })?;

        // Perform health check
        agent.health_check().await.map_err(|e| {
            AppError::ExternalService(format!("AWS connector health check failed: {}", e))
        })?;

        self.aws_agents.insert(connector_id.clone(), agent);
        Ok(connector_id)
    }

    pub async fn create_azure_connector(&mut self, config: AzureConfig) -> AppResult<String> {
        let connector_id = uuid::Uuid::new_v4().to_string();
        let agent_id = format!("azure-agent-{}", connector_id);
        let agent_type = "azure".to_string();
        let mut agent = AzureAgent::new(config, agent_id, agent_type);
        
        agent.initialize().await.map_err(|e| {
            AppError::Configuration(format!("Failed to initialize Azure connector: {}", e))
        })?;

        // Perform health check
        agent.health_check().await.map_err(|e| {
            AppError::ExternalService(format!("Azure connector health check failed: {}", e))
        })?;

        self.azure_agents.insert(connector_id.clone(), agent);
        Ok(connector_id)
    }

    pub async fn create_gcp_connector(&mut self, config: GcpConfig) -> AppResult<String> {
        let connector_id = uuid::Uuid::new_v4().to_string();
        let agent_id = format!("gcp-agent-{}", connector_id);
        let agent_type = "gcp".to_string();
        let mut agent = GcpAgent::new(config, agent_id, agent_type);
        
        agent.initialize().await.map_err(|e| {
            AppError::Configuration(format!("Failed to initialize GCP connector: {}", e))
        })?;

        // Perform health check
        agent.health_check().await.map_err(|e| {
            AppError::ExternalService(format!("GCP connector health check failed: {}", e))
        })?;

        self.gcp_agents.insert(connector_id.clone(), agent);
        Ok(connector_id)
    }

    pub async fn discover_aws_resources(
        &self,
        connector_id: &str,
        resource_types: Vec<String>,
    ) -> AppResult<DiscoveryResult> {
        let agent = self.aws_agents.get(connector_id)
            .ok_or_else(|| AppError::NotFound("AWS connector not found".into()))?;

        agent.discover_resources(resource_types).await
    }

    pub async fn discover_azure_resources(
        &self,
        connector_id: &str,
        resource_types: Vec<String>,
    ) -> AppResult<AzureDiscoveryResult> {
        let agent = self.azure_agents.get(connector_id)
            .ok_or_else(|| AppError::NotFound("Azure connector not found".into()))?;

        agent.discover_resources(resource_types).await
    }

    pub async fn discover_gcp_resources(
        &self,
        connector_id: &str,
        resource_types: Vec<String>,
    ) -> AppResult<GcpDiscoveryResult> {
        let agent = self.gcp_agents.get(connector_id)
            .ok_or_else(|| AppError::NotFound("GCP connector not found".into()))?;

        agent.discover_resources(resource_types).await
    }

    pub async fn estimate_aws_costs(
        &self,
        connector_id: &str,
        resources: &[AwsResource],
    ) -> AppResult<HashMap<String, f64>> {
        let agent = self.aws_agents.get(connector_id)
            .ok_or_else(|| AppError::NotFound("AWS connector not found".into()))?;

        agent.estimate_migration_cost(resources).await
    }

    pub async fn get_aws_recommendations(
        &self,
        connector_id: &str,
        resources: &[AwsResource],
    ) -> AppResult<Vec<String>> {
        let agent = self.aws_agents.get(connector_id)
            .ok_or_else(|| AppError::NotFound("AWS connector not found".into()))?;

        agent.generate_migration_recommendations(resources).await
    }

    pub async fn health_check_connector(&self, connector_id: &str) -> AppResult<()> {
        if let Some(agent) = self.aws_agents.get(connector_id) {
            agent.health_check().await
        } else if let Some(agent) = self.azure_agents.get(connector_id) {
            agent.health_check().await
        } else if let Some(agent) = self.gcp_agents.get(connector_id) {
            agent.health_check().await
        } else {
            Err(AppError::NotFound("Connector not found".into()))
        }
    }

    pub fn list_connectors(&self) -> Vec<String> {
        let mut connectors = Vec::new();
        connectors.extend(self.aws_agents.keys().cloned());
        connectors.extend(self.azure_agents.keys().cloned());
        connectors.extend(self.gcp_agents.keys().cloned());
        connectors
    }

    pub async fn remove_connector(&mut self, connector_id: &str) -> AppResult<()> {
        if self.aws_agents.remove(connector_id).is_some() {
            Ok(())
        } else if self.azure_agents.remove(connector_id).is_some() {
            Ok(())
        } else if self.gcp_agents.remove(connector_id).is_some() {
            Ok(())
        } else {
            Err(AppError::NotFound("Connector not found".into()))
        }
    }
}

impl Default for ConnectorManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_connector_manager() {
        let mut manager = ConnectorManager::new();
        assert!(manager.list_connectors().is_empty());

        let config = AwsConfig {
            region: "us-east-1".to_string(),
            access_key_id: None,
            secret_access_key: None,
            role_arn: None,
            external_id: None,
        };

        // Note: This test will fail without valid AWS credentials
        // In a real environment, you would either:
        // 1. Skip this test if credentials are not available
        // 2. Use mocked AWS clients
        // 3. Run in an environment with valid credentials

        if std::env::var("AWS_ACCESS_KEY_ID").is_ok() {
            let connector_id = manager.create_aws_connector(config).await.unwrap();
            assert!(!connector_id.is_empty());
            assert_eq!(manager.list_connectors().len(), 1);

            manager.remove_connector(&connector_id).await.unwrap();
            assert!(manager.list_connectors().is_empty());
        }
    }
}
