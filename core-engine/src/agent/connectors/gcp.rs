use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use reqwest::Client as HttpClient;

// GCP SDK imports - Mock implementation for now
// TODO: Re-enable real GCP SDK when ready
type StorageClient = ();

use crate::error::{AppError, AppResult};
use crate::agent::sirsi_interface::{
    SirsiInterface, SirsiRequest, SirsiResponse, SirsiRequestType, SirsiResponseType,
    AgentSuggestion, AgentCapabilities, AgentHealthStatus, HealthStatusLevel,
    RequestPriority, QualityEnforcer
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GcpConfig {
    pub project_id: String,
    pub credentials_path: Option<String>,
    pub region: Option<String>,
    pub zone: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GcpResource {
    pub resource_type: String,
    pub resource_id: String,
    pub name: String,
    pub project_id: String,
    pub zone: Option<String>,
    pub region: Option<String>,
    pub tags: HashMap<String, String>,
    pub labels: HashMap<String, String>,
    pub metadata: HashMap<String, String>,
    pub cost_estimate: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GcpDiscoveryResult {
    pub resources: Vec<GcpResource>,
    pub total_count: usize,
    pub scan_time_ms: u64,
    pub errors: Vec<String>,
}

#[derive(Debug)]
pub struct GcpAgent {
    config: GcpConfig,
    #[allow(dead_code)] // Storage client for future GCP Storage integration
    storage_client: Option<StorageClient>,
    http_client: Option<HttpClient>,
    gcp_authenticated: bool,
    sirsi_interface: SirsiInterface,
}

impl GcpAgent {
pub fn new(config: GcpConfig, agent_id: String, agent_type: String) -> Self {
    let sirsi_interface = SirsiInterface::new(agent_id.clone(), agent_type.clone());
    Self {
        config,
        storage_client: None,
        http_client: None,
        gcp_authenticated: false,
        sirsi_interface,
    }
}

pub async fn initialize(&mut self) -> AppResult<()> {
    // Initialize HTTP client for Google Cloud APIs
    self.http_client = Some(HttpClient::new());
    
    // Initialize Sirsi communication
    self.sirsi_interface.initialize().await?;
    
    // For now, we'll use mock mode for GCP
    // TODO: Implement real GCP authentication in future iteration
    if let Some(credentials_path) = &self.config.credentials_path {
        if std::path::Path::new(credentials_path).exists() {
            self.gcp_authenticated = true;
            println!("GCP credentials file found - real SDK integration will be implemented");
        } else {
            println!("GCP credentials file not found - using mock mode");
        }
    } else if std::env::var("GOOGLE_APPLICATION_CREDENTIALS").is_ok() {
        self.gcp_authenticated = true;
        println!("GCP credentials found via environment - real SDK integration will be implemented");
    } else {
        println!("No GCP credentials provided - using mock mode");
    }

    Ok(())
}

    pub async fn discover_resources(&self, resource_types: Vec<String>) -> AppResult<GcpDiscoveryResult> {
        let start_time = std::time::Instant::now();
        let mut resources = Vec::new();
        let mut errors = Vec::new();

        for resource_type in resource_types {
            match resource_type.as_str() {
                "compute" | "instances" => {
                    match self.discover_compute_instances().await {
                        Ok(mut compute_resources) => resources.append(&mut compute_resources),
                        Err(e) => errors.push(format!("Compute instance discovery failed: {}", e)),
                    }
                }
                "storage" | "buckets" => {
                    match self.discover_storage_buckets().await {
                        Ok(mut storage_resources) => resources.append(&mut storage_resources),
                        Err(e) => errors.push(format!("Storage bucket discovery failed: {}", e)),
                    }
                }
                "disks" => {
                    match self.discover_disks().await {
                        Ok(mut disk_resources) => resources.append(&mut disk_resources),
                        Err(e) => errors.push(format!("Disk discovery failed: {}", e)),
                    }
                }
                _ => {
                    errors.push(format!("Unsupported resource type: {}", resource_type));
                }
            }
        }

        // Add artificial delay for mock to simulate real API call
        tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
        
        let scan_time_ms = start_time.elapsed().as_millis() as u64;

        Ok(GcpDiscoveryResult {
            total_count: resources.len(),
            resources,
            scan_time_ms,
            errors,
        })
    }

    async fn discover_compute_instances(&self) -> AppResult<Vec<GcpResource>> {
        // TODO: Implement actual GCP Compute Engine discovery
        // For now, return mock data
        let zone = self.config.zone.as_deref().unwrap_or("us-central1-a");
        let region = zone.rsplit_once('-').map(|(region, _)| region.to_string());
        
        let mut metadata = HashMap::new();
        metadata.insert("machine_type".to_string(), "n1-standard-1".to_string());
        metadata.insert("status".to_string(), "RUNNING".to_string());
        
        let resource = GcpResource {
            resource_type: "compute.googleapis.com/Instance".to_string(),
            resource_id: "mock-instance-123".to_string(),
            name: "mock-gcp-instance".to_string(),
            project_id: self.config.project_id.clone(),
            zone: Some(zone.to_string()),
            region,
            tags: HashMap::new(),
            labels: HashMap::new(),
            metadata,
            cost_estimate: None,
        };
        
        Ok(vec![resource])
    }

    async fn discover_storage_buckets(&self) -> AppResult<Vec<GcpResource>> {
        // Always use mock implementation for now
        // TODO: Implement real GCP storage bucket discovery when SDK is properly integrated
        self.discover_storage_buckets_mock().await
    }
    
    async fn discover_storage_buckets_mock(&self) -> AppResult<Vec<GcpResource>> {
        let mut metadata = HashMap::new();
        metadata.insert("storage_class".to_string(), "STANDARD".to_string());
        metadata.insert("location".to_string(), "US".to_string());
        
        let resource = GcpResource {
            resource_type: "storage.googleapis.com/Bucket".to_string(),
            resource_id: "mock-bucket-123".to_string(),
            name: "mock-gcp-bucket".to_string(),
            project_id: self.config.project_id.clone(),
            zone: None,
            region: Some("US".to_string()),
            tags: HashMap::new(),
            labels: HashMap::new(),
            metadata,
            cost_estimate: None,
        };
        
        Ok(vec![resource])
    }
    
    #[allow(dead_code)] // Helper method for future GCP Storage integration
    fn bucket_to_resource(&self, bucket_name: &str) -> Option<GcpResource> {
        let mut metadata = HashMap::new();
        metadata.insert("storage_class".to_string(), "STANDARD".to_string());
        metadata.insert("location".to_string(), "US".to_string());
        
        Some(GcpResource {
            resource_type: "storage.googleapis.com/Bucket".to_string(),
            resource_id: format!("projects/{}/buckets/{}", self.config.project_id, bucket_name),
            name: bucket_name.to_string(),
            project_id: self.config.project_id.clone(),
            zone: None,
            region: Some("US".to_string()),
            tags: HashMap::new(),
            labels: HashMap::new(),
            metadata,
            cost_estimate: None,
        })
    }

    async fn discover_disks(&self) -> AppResult<Vec<GcpResource>> {
        // TODO: Implement actual GCP Persistent Disk discovery
        // For now, return mock data
        let zone = self.config.zone.as_deref().unwrap_or("us-central1-a");
        let region = zone.rsplit_once('-').map(|(region, _)| region.to_string());
        
        let mut metadata = HashMap::new();
        metadata.insert("disk_type".to_string(), "pd-standard".to_string());
        metadata.insert("size_gb".to_string(), "100".to_string());
        metadata.insert("status".to_string(), "READY".to_string());
        
        let resource = GcpResource {
            resource_type: "compute.googleapis.com/Disk".to_string(),
            resource_id: "mock-disk-123".to_string(),
            name: "mock-gcp-disk".to_string(),
            project_id: self.config.project_id.clone(),
            zone: Some(zone.to_string()),
            region,
            tags: HashMap::new(),
            labels: HashMap::new(),
            metadata,
            cost_estimate: None,
        };
        
        Ok(vec![resource])
    }

    // Note: These helper methods are not needed for the mock implementation
    // TODO: Implement these when real GCP SDK integration is added

    pub async fn estimate_migration_cost(&self, resources: &[GcpResource]) -> AppResult<HashMap<String, f64>> {
        // TODO: Implement actual cost estimation using GCP Pricing API
        let mut cost_estimates = HashMap::new();

        for resource in resources {
            let estimated_cost = match resource.resource_type.as_str() {
                "compute.googleapis.com/Instance" => {
                    // Simple estimation based on machine type
                    match resource.metadata.get("machine_type") {
                        Some(machine_type) if machine_type.contains("f1-micro") => 5.11, // ~$5.11/month
                        Some(machine_type) if machine_type.contains("g1-small") => 14.23,
                        Some(machine_type) if machine_type.contains("n1-standard-1") => 24.27,
                        Some(machine_type) if machine_type.contains("n1-standard-2") => 48.55,
                        Some(machine_type) if machine_type.contains("n1-standard-4") => 97.09,
                        _ => 30.0, // Default estimation
                    }
                }
                "storage.googleapis.com/Bucket" => {
                    // Simple estimation for Cloud Storage
                    match resource.metadata.get("storage_class") {
                        Some(class) if class == "STANDARD" => 20.0, // ~$20/month
                        Some(class) if class == "NEARLINE" => 10.0,
                        Some(class) if class == "COLDLINE" => 4.0,
                        Some(class) if class == "ARCHIVE" => 1.2,
                        _ => 15.0, // Default estimation
                    }
                }
                "compute.googleapis.com/Disk" => {
                    // Simple estimation for persistent disks
                    let size_gb: f64 = resource.metadata.get("size_gb")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(100.0);
                    
                    match resource.metadata.get("disk_type") {
                        Some(disk_type) if disk_type.contains("pd-standard") => size_gb * 0.04, // $0.04/GB/month
                        Some(disk_type) if disk_type.contains("pd-ssd") => size_gb * 0.17, // $0.17/GB/month
                        Some(disk_type) if disk_type.contains("pd-balanced") => size_gb * 0.10, // $0.10/GB/month
                        _ => size_gb * 0.08, // Default estimation
                    }
                }
                _ => 0.0,
            };

            cost_estimates.insert(resource.resource_id.clone(), estimated_cost);
        }

        Ok(cost_estimates)
    }

    pub async fn generate_migration_recommendations(&self, resources: &[GcpResource]) -> AppResult<Vec<String>> {
        let mut recommendations = Vec::new();

        for resource in resources {
            match resource.resource_type.as_str() {
                "compute.googleapis.com/Instance" => {
                    if let Some(machine_type) = resource.metadata.get("machine_type") {
                        if machine_type.contains("n1-") {
                            recommendations.push(format!(
                                "Instance {} uses N1 machine type - consider upgrading to N2 or E2 for better performance/cost",
                                resource.name
                            ));
                        }
                        
                        if machine_type.contains("f1-micro") || machine_type.contains("g1-small") {
                            recommendations.push(format!(
                                "Instance {} uses shared-core machine type - consider standard machine types for production workloads",
                                resource.name
                            ));
                        }
                    }

                    if let Some(status) = resource.metadata.get("status") {
                        if status == "TERMINATED" {
                            recommendations.push(format!(
                                "Instance {} is terminated - consider deleting if no longer needed",
                                resource.name
                            ));
                        }
                    }
                }
                "storage.googleapis.com/Bucket" => {
                    if let Some(storage_class) = resource.metadata.get("storage_class") {
                        if storage_class == "STANDARD" {
                            recommendations.push(format!(
                                "Bucket {} uses Standard storage - consider Nearline/Coldline for infrequently accessed data",
                                resource.name
                            ));
                        }
                    }

                    if resource.metadata.get("versioning_enabled") == Some(&"false".to_string()) {
                        recommendations.push(format!(
                            "Bucket {} has versioning disabled - consider enabling for data protection",
                            resource.name
                        ));
                    }
                }
                "compute.googleapis.com/Disk" => {
                    if let Some(disk_type) = resource.metadata.get("disk_type") {
                        if disk_type.contains("pd-standard") {
                            recommendations.push(format!(
                                "Disk {} uses Standard persistent disk - consider SSD for better performance",
                                resource.name
                            ));
                        }
                    }

                    if resource.metadata.get("attached_to_count") == Some(&"0".to_string()) {
                        recommendations.push(format!(
                            "Disk {} is not attached to any instance - consider deleting if not needed",
                            resource.name
                        ));
                    }
                }
                _ => {}
            }
        }

        // General recommendations
        if resources.len() > 20 {
            recommendations.push("Consider using resource hierarchy (folders/projects) for better organization".to_string());
        }

        if resources.iter().any(|r| r.labels.is_empty()) {
            recommendations.push("Some resources lack labels - implement consistent labeling for cost allocation and management".to_string());
        }

        // Check for resources across multiple zones/regions
        let zones: std::collections::HashSet<_> = resources.iter()
            .filter_map(|r| r.zone.as_ref())
            .collect();
        if zones.len() > 3 {
            recommendations.push("Resources are spread across many zones - consider consolidating to reduce network costs".to_string());
        }

        Ok(recommendations)
    }

    pub async fn health_check(&self) -> AppResult<()> {
        // Check if we have HTTP client initialized
        if self.http_client.is_some() {
            if self.gcp_authenticated {
                // TODO: Perform actual GCP API health check (e.g., list projects)
                println!("GCP health check: Ready for real SDK integration");
            } else {
                // In mock mode (no credentials), we still consider it healthy
                println!("GCP health check: Running in mock mode");
            }
            Ok(())
        } else {
            Err(AppError::Configuration("GCP client not initialized".into()))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_gcp_agent_creation() {
        let config = GcpConfig {
            project_id: "test-project-id".to_string(),
            credentials_path: None,
            region: Some("us-central1".to_string()),
            zone: Some("us-central1-a".to_string()),
        };

        let agent = GcpAgent::new(config, "test-agent-id".to_string(), "gcp".to_string());
        assert_eq!(agent.config.project_id, "test-project-id");
    }

    #[tokio::test]
    async fn test_cost_estimation() {
        let config = GcpConfig {
            project_id: "test-project-id".to_string(),
            credentials_path: None,
            region: Some("us-central1".to_string()),
            zone: Some("us-central1-a".to_string()),
        };

        let agent = GcpAgent::new(config, "test-agent-id".to_string(), "gcp".to_string());

        let mut metadata = HashMap::new();
        metadata.insert("machine_type".to_string(), "n1-standard-1".to_string());

        let resources = vec![GcpResource {
            resource_type: "compute.googleapis.com/Instance".to_string(),
            resource_id: "1234567890123456789".to_string(),
            name: "test-instance".to_string(),
            project_id: "test-project-id".to_string(),
            zone: Some("us-central1-a".to_string()),
            region: Some("us-central1".to_string()),
            tags: HashMap::new(),
            labels: HashMap::new(),
            metadata,
            cost_estimate: None,
        }];

        let cost_estimates = agent.estimate_migration_cost(&resources).await.unwrap();
        assert!(cost_estimates.contains_key("1234567890123456789"));
        assert_eq!(cost_estimates["1234567890123456789"], 24.27);
    }

    #[tokio::test]
    async fn test_migration_recommendations() {
        let config = GcpConfig {
            project_id: "test-project-id".to_string(),
            credentials_path: None,
            region: Some("us-central1".to_string()),
            zone: Some("us-central1-a".to_string()),
        };

        let agent = GcpAgent::new(config, "test-agent-id".to_string(), "gcp".to_string());

        let mut metadata = HashMap::new();
        metadata.insert("machine_type".to_string(), "n1-standard-1".to_string());
        metadata.insert("status".to_string(), "RUNNING".to_string());

        let resources = vec![GcpResource {
            resource_type: "compute.googleapis.com/Instance".to_string(),
            resource_id: "1234567890123456789".to_string(),
            name: "test-instance".to_string(),
            project_id: "test-project-id".to_string(),
            zone: Some("us-central1-a".to_string()),
            region: Some("us-central1".to_string()),
            tags: HashMap::new(),
            labels: HashMap::new(),
            metadata,
            cost_estimate: None,
        }];

        let recommendations = agent.generate_migration_recommendations(&resources).await.unwrap();
        assert!(!recommendations.is_empty());
        assert!(recommendations.iter().any(|r| r.contains("N1 machine type")));
    }
}
