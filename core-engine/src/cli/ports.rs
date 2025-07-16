/// CLI commands for port registry management and discovery
/// 
/// Provides user-friendly commands to interact with the port registry

use clap::{Parser, Subcommand};
use reqwest::Client;
use serde_json::Value;
use std::collections::HashMap;
use anyhow::Result;

#[derive(Parser)]
#[command(name = "ports")]
#[command(about = "Port registry management and service discovery")]
pub struct PortsCommand {
    #[command(subcommand)]
    pub command: PortsSubcommand,
    
    #[arg(long, default_value = "http://localhost:8080")]
    pub base_url: String,
}

#[derive(Subcommand)]
pub enum PortsSubcommand {
    /// List all active ports and services
    List {
        #[arg(long)]
        service_type: Option<String>,
    },
    
    /// Get comprehensive port overview
    Overview,
    
    /// Get service information by name
    Service {
        name: String,
    },
    
    /// Get service information by port
    Port {
        port: u16,
    },
    
    /// Get all services of a specific type
    Type {
        service_type: String,
    },
    
    /// Get registry statistics
    Stats,
    
    /// Get registry health
    Health,
    
    /// Allocate a port for a service
    Allocate {
        service_name: String,
        service_type: String,
        #[arg(long)]
        preferred_port: Option<u16>,
        #[arg(long)]
        required: bool,
    },
    
    /// Release a port allocation
    Release {
        allocation_id: String,
    },
    
    /// Send heartbeat for an allocation
    Heartbeat {
        allocation_id: String,
    },
    
    /// Clean up expired allocations
    Cleanup,
}

impl PortsCommand {
    pub async fn execute(&self) -> Result<()> {
        let client = Client::new();
        
        match &self.command {
            PortsSubcommand::List { service_type } => {
                self.list_services(&client, service_type.as_deref()).await?;
            }
            PortsSubcommand::Overview => {
                self.show_overview(&client).await?;
            }
            PortsSubcommand::Service { name } => {
                self.show_service(&client, name).await?;
            }
            PortsSubcommand::Port { port } => {
                self.show_port(&client, *port).await?;
            }
            PortsSubcommand::Type { service_type } => {
                self.show_services_by_type(&client, service_type).await?;
            }
            PortsSubcommand::Stats => {
                self.show_stats(&client).await?;
            }
            PortsSubcommand::Health => {
                self.show_health(&client).await?;
            }
            PortsSubcommand::Allocate { service_name, service_type, preferred_port, required } => {
                self.allocate_port(&client, service_name, service_type, *preferred_port, *required).await?;
            }
            PortsSubcommand::Release { allocation_id } => {
                self.release_port(&client, allocation_id).await?;
            }
            PortsSubcommand::Heartbeat { allocation_id } => {
                self.send_heartbeat(&client, allocation_id).await?;
            }
            PortsSubcommand::Cleanup => {
                self.cleanup_expired(&client).await?;
            }
        }
        
        Ok(())
    }
    
    async fn list_services(&self, client: &Client, service_type: Option<&str>) -> Result<()> {
        let mut url = format!("{}/ports/directory", self.base_url);
        
        if let Some(stype) = service_type {
            url.push_str(&format!("?service_type={}", stype));
        }
        
        let response = client.get(&url).send().await?;
        let services: HashMap<String, Value> = response.json().await?;
        
        if services.is_empty() {
            println!("📭 No active services found");
            return Ok(());
        }
        
        println!("📋 Active Services:");
        println!("{:<20} {:<8} {:<15} {:<20} {:<10}", "SERVICE", "PORT", "TYPE", "ALLOCATION ID", "STATUS");
        println!("{}", "-".repeat(80));
        
        for (service_name, allocation) in services {
            let port = allocation["port"].as_u64().unwrap_or(0);
            let service_type = allocation["service_type"].as_str().unwrap_or("unknown");
            let allocation_id = allocation["allocation_id"].as_str().unwrap_or("unknown");
            let status = if allocation["last_heartbeat"].is_null() {
                "🔴 inactive"
            } else {
                "🟢 active"
            };
            
            println!("{:<20} {:<8} {:<15} {:<20} {:<10}", 
                service_name, port, service_type, allocation_id, status);
        }
        
        Ok(())
    }
    
    async fn show_overview(&self, client: &Client) -> Result<()> {
        let url = format!("{}/ports/overview", self.base_url);
        let response = client.get(&url).send().await?;
        let overview: Value = response.json().await?;
        
        println!("🔌 Port Registry Overview");
        println!("{}", "=".repeat(50));
        
        let total_ports = overview["total_ports"].as_u64().unwrap_or(0);
        let active_services = overview["active_services"].as_u64().unwrap_or(0);
        
        println!("📊 Summary:");
        println!("  • Total Ports: {}", total_ports);
        println!("  • Active Services: {}", active_services);
        
        if let Some(port_usage) = overview["port_usage"].as_object() {
            println!("\n🚪 Port Usage:");
            let mut ports: Vec<_> = port_usage.iter().collect();
            ports.sort_by_key(|(port, _)| port.parse::<u16>().unwrap_or(0));
            
            for (port, service) in ports {
                println!("  • Port {}: {}", port, service.as_str().unwrap_or("unknown"));
            }
        }
        
        if let Some(service_types) = overview["service_types"].as_object() {
            println!("\n🏷️  Service Types:");
            for (stype, services) in service_types {
                let service_list = services.as_array()
                    .map(|arr| arr.iter()
                        .map(|s| s.as_str().unwrap_or("unknown"))
                        .collect::<Vec<_>>()
                        .join(", "))
                    .unwrap_or_else(|| "none".to_string());
                
                println!("  • {}: {}", stype, service_list);
            }
        }
        
        Ok(())
    }
    
    async fn show_service(&self, client: &Client, name: &str) -> Result<()> {
        let url = format!("{}/ports/service/{}", self.base_url, name);
        let response = client.get(&url).send().await?;
        let allocation: Option<Value> = response.json().await?;
        
        match allocation {
            Some(alloc) => {
                println!("🔍 Service Information: {}", name);
                println!("{}", "=".repeat(30));
                println!("Port: {}", alloc["port"].as_u64().unwrap_or(0));
                println!("Type: {}", alloc["service_type"].as_str().unwrap_or("unknown"));
                println!("Allocation ID: {}", alloc["allocation_id"].as_str().unwrap_or("unknown"));
                println!("Allocated At: {}", alloc["allocated_at"].as_str().unwrap_or("unknown"));
                
                if let Some(heartbeat) = alloc["last_heartbeat"].as_str() {
                    println!("Last Heartbeat: {}", heartbeat);
                } else {
                    println!("Last Heartbeat: No heartbeat received");
                }
            }
            None => {
                println!("❌ Service '{}' not found in registry", name);
            }
        }
        
        Ok(())
    }
    
    async fn show_port(&self, client: &Client, port: u16) -> Result<()> {
        let url = format!("{}/ports/port/{}", self.base_url, port);
        let response = client.get(&url).send().await?;
        let allocation: Option<Value> = response.json().await?;
        
        match allocation {
            Some(alloc) => {
                println!("🔍 Port Information: {}", port);
                println!("{}", "=".repeat(30));
                println!("Service: {}", alloc["service_name"].as_str().unwrap_or("unknown"));
                println!("Type: {}", alloc["service_type"].as_str().unwrap_or("unknown"));
                println!("Allocation ID: {}", alloc["allocation_id"].as_str().unwrap_or("unknown"));
                println!("Allocated At: {}", alloc["allocated_at"].as_str().unwrap_or("unknown"));
                
                if let Some(heartbeat) = alloc["last_heartbeat"].as_str() {
                    println!("Last Heartbeat: {}", heartbeat);
                } else {
                    println!("Last Heartbeat: No heartbeat received");
                }
            }
            None => {
                println!("❌ Port {} not found in registry", port);
            }
        }
        
        Ok(())
    }
    
    async fn show_services_by_type(&self, client: &Client, service_type: &str) -> Result<()> {
        let url = format!("{}/ports/type/{}", self.base_url, service_type);
        let response = client.get(&url).send().await?;
        let services: HashMap<String, Value> = response.json().await?;
        
        if services.is_empty() {
            println!("📭 No services found for type '{}'", service_type);
            return Ok(());
        }
        
        println!("🏷️  Services of type '{}':", service_type);
        println!("{:<20} {:<8} {:<20} {:<10}", "SERVICE", "PORT", "ALLOCATION ID", "STATUS");
        println!("{}", "-".repeat(60));
        
        for (service_name, allocation) in services {
            let port = allocation["port"].as_u64().unwrap_or(0);
            let allocation_id = allocation["allocation_id"].as_str().unwrap_or("unknown");
            let status = if allocation["last_heartbeat"].is_null() {
                "🔴 inactive"
            } else {
                "🟢 active"
            };
            
            println!("{:<20} {:<8} {:<20} {:<10}", 
                service_name, port, allocation_id, status);
        }
        
        Ok(())
    }
    
    async fn show_stats(&self, client: &Client) -> Result<()> {
        let url = format!("{}/ports/stats", self.base_url);
        let response = client.get(&url).send().await?;
        let stats: Value = response.json().await?;
        
        println!("📊 Registry Statistics:");
        println!("{}", "=".repeat(30));
        println!("Total Allocations: {}", stats["total_allocations"].as_u64().unwrap_or(0));
        println!("Active Allocations: {}", stats["active_allocations"].as_u64().unwrap_or(0));
        println!("Reserved Allocations: {}", stats["reserved_allocations"].as_u64().unwrap_or(0));
        println!("Expired Allocations: {}", stats["expired_allocations"].as_u64().unwrap_or(0));
        
        Ok(())
    }
    
    async fn show_health(&self, client: &Client) -> Result<()> {
        let url = format!("{}/ports/health", self.base_url);
        let response = client.get(&url).send().await?;
        let health: Value = response.json().await?;
        
        let health_status = health["health_status"].as_str().unwrap_or("unknown");
        let status_emoji = match health_status {
            "healthy" => "🟢",
            "warning" => "🟡",
            "critical" => "🔴",
            _ => "❓",
        };
        
        println!("🏥 Registry Health: {} {}", status_emoji, health_status);
        println!("{}", "=".repeat(30));
        println!("Status: {}", health["status"].as_str().unwrap_or("unknown"));
        println!("Version: {}", health["version"].as_str().unwrap_or("unknown"));
        println!("Total Allocations: {}", health["total_allocations"].as_str().unwrap_or("0"));
        println!("Active Allocations: {}", health["active_allocations"].as_str().unwrap_or("0"));
        println!("Reserved Allocations: {}", health["reserved_allocations"].as_str().unwrap_or("0"));
        
        Ok(())
    }
    
    async fn allocate_port(&self, client: &Client, service_name: &str, service_type: &str, 
                          preferred_port: Option<u16>, required: bool) -> Result<()> {
        let url = format!("{}/ports/allocate", self.base_url);
        
        let mut payload = serde_json::json!({
            "service_name": service_name,
            "service_type": service_type,
            "required": required
        });
        
        if let Some(port) = preferred_port {
            payload["preferred_port"] = serde_json::Value::Number(port.into());
        }
        
        let response = client.post(&url)
            .json(&payload)
            .send()
            .await?;
        
        let result: Value = response.json().await?;
        
        if result["success"].as_bool().unwrap_or(false) {
            if let Some(allocation) = result["allocation"].as_object() {
                println!("✅ Port allocated successfully!");
                println!("Service: {}", service_name);
                println!("Port: {}", allocation["port"].as_u64().unwrap_or(0));
                println!("Allocation ID: {}", allocation["allocation_id"].as_str().unwrap_or("unknown"));
            }
        } else {
            println!("❌ Port allocation failed: {}", result["message"].as_str().unwrap_or("unknown error"));
        }
        
        Ok(())
    }
    
    async fn release_port(&self, client: &Client, allocation_id: &str) -> Result<()> {
        let url = format!("{}/ports/release", self.base_url);
        
        let payload = serde_json::json!({
            "allocation_id": allocation_id
        });
        
        let response = client.post(&url)
            .json(&payload)
            .send()
            .await?;
        
        let result: Value = response.json().await?;
        
        if result["success"].as_str() == Some("true") {
            println!("✅ Port released successfully!");
        } else {
            println!("❌ Port release failed: {}", result.get("message").unwrap_or(&Value::String("unknown error".to_string())));
        }
        
        Ok(())
    }
    
    async fn send_heartbeat(&self, client: &Client, allocation_id: &str) -> Result<()> {
        let url = format!("{}/ports/heartbeat/{}", self.base_url, allocation_id);
        
        let response = client.post(&url).send().await?;
        let result: Value = response.json().await?;
        
        if result["success"].as_str() == Some("true") {
            println!("✅ Heartbeat sent successfully!");
        } else {
            println!("❌ Heartbeat failed: {}", result.get("message").unwrap_or(&Value::String("unknown error".to_string())));
        }
        
        Ok(())
    }
    
    async fn cleanup_expired(&self, client: &Client) -> Result<()> {
        let url = format!("{}/ports/cleanup", self.base_url);
        
        let response = client.post(&url).send().await?;
        let result: Value = response.json().await?;
        
        if result["success"].as_str() == Some("true") {
            let cleaned_count = result["cleaned_count"].as_str().unwrap_or("0");
            println!("🧹 Cleanup completed! Removed {} expired allocations", cleaned_count);
        } else {
            println!("❌ Cleanup failed: {}", result.get("message").unwrap_or(&Value::String("unknown error".to_string())));
        }
        
        Ok(())
    }
}
