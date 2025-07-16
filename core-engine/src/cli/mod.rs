/// CLI module for SirsiNexus
/// 
/// Provides command-line interface for port management and service discovery

pub mod ports;

use clap::{Parser, Subcommand};
use anyhow::Result;

#[derive(Parser)]
#[command(name = "sirsi-nexus")]
#[command(about = "SirsiNexus AI Platform - Port Management & Service Discovery")]
#[command(version = "0.5.0-alpha")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Port registry management and service discovery
    Ports(ports::PortsCommand),
}

impl Cli {
    pub async fn execute(self) -> Result<()> {
        match self.command {
            Commands::Ports(ports_cmd) => {
                ports_cmd.execute().await?;
            }
        }
        Ok(())
    }
}
