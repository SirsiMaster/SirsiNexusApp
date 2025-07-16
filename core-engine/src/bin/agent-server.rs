use clap::Parser;
use sirsi_core::server::start_grpc_server;
use tracing::{info, error};
use tracing_subscriber;

#[derive(Parser)]
#[command(name = "agent-server")]
#[command(about = "Sirsi Nexus AI Agent gRPC Server")]
struct Cli {
    /// Port to run the gRPC server on
    #[arg(short, long, default_value_t = 50051)]
    port: u16,

    /// Redis URL for context storage
    #[arg(short, long, default_value = "redis://127.0.0.1:6379")]
    redis_url: String,

    /// Log level
    #[arg(short, long, default_value = "info")]
    log_level: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();

    // Initialize tracing
    let log_level = cli.log_level.parse().unwrap_or(tracing::Level::INFO);
    tracing_subscriber::fmt()
        .with_max_level(log_level)
        .with_target(false)
        .init();

    info!("🚀 Starting Sirsi Nexus AI Agent Server");
    info!("📡 gRPC Server will listen on port {}", cli.port);
    info!("🔄 Redis URL: {}", cli.redis_url);

    // Start the gRPC server
    match start_grpc_server(cli.port, &cli.redis_url).await {
        Ok(_) => {
            info!("✅ Agent server shut down gracefully");
            Ok(())
        }
        Err(e) => {
            error!("❌ Agent server failed: {}", e);
            Err(e.into())
        }
    }
}
