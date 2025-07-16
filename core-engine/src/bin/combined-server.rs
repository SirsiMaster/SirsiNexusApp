use clap::Parser;
use sirsi_core::server::{start_grpc_server, start_websocket_server, start_rest_server};
use tracing::{info, error};
use tracing_subscriber;
use tokio::signal;

#[derive(Parser)]
#[command(name = "combined-server")]
#[command(about = "Sirsi Nexus Combined gRPC and WebSocket Server")]
struct Cli {
    /// Port to run the gRPC server on
    #[arg(long, default_value_t = 50051)]
    grpc_port: u16,

    /// Port to run the WebSocket server on
    #[arg(long, default_value_t = 8080)]
    websocket_port: u16,

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

    info!("🚀 Starting Sirsi Nexus Combined Server");
    info!("📡 gRPC Server will listen on port {}", cli.grpc_port);
    info!("🌐 WebSocket Server will listen on port {}", cli.websocket_port);
    info!("🌐 REST API Server will listen on port 8081");
    info!("🔄 Redis URL: {}", cli.redis_url);

    // Graceful shutdown signal
    let shutdown_signal = async {
        signal::ctrl_c()
            .await
            .expect("Failed to install CTRL+C signal handler");
        info!("Received shutdown signal");
    };

// Start both servers concurrently
    let grpc_endpoint = format!("http://127.0.0.1:{}", cli.grpc_port);
    let grpc_server = start_grpc_server(cli.grpc_port, &cli.redis_url);
    let websocket_server = start_websocket_server(cli.websocket_port, grpc_endpoint);

    // Start REST API server
    let rest_server = start_rest_server("0.0.0.0:8081");

    // Run both servers with graceful shutdown
    tokio::select! {
        result = grpc_server => {
            match result {
                Ok(_) => info!("✅ gRPC server shut down gracefully"),
                Err(e) => error!("❌ gRPC server error: {}", e),
            }
        }
        result = websocket_server => {
            match result {
                Ok(_) => info!("✅ WebSocket server shut down gracefully"),
                Err(e) => error!("❌ WebSocket server error: {}", e),
            }
        }
_ = shutdown_signal => {
        info!("🛑 Shutdown signal received, stopping servers...");
    }
    result = rest_server => {
        match result {
            Ok(_) => info!("✅ REST API server shut down gracefully"),
            Err(e) => error!("❌ REST API server error: {}", e),
        }
    }
    }

    Ok(())
}
