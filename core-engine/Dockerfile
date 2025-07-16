# Multi-stage Docker build for SirsiNexus Core Engine
# Optimized for production deployment with minimal attack surface

# Build stage
FROM rust:1.75-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libpq-dev \
    protobuf-compiler \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency files first for better caching
COPY Cargo.toml Cargo.lock ./
COPY proto/ proto/

# Create a dummy main.rs to build dependencies
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    echo "[lib]\nname = \"sirsi_core\"\npath = \"src/lib.rs\"" >> Cargo.toml

# Build dependencies
RUN cargo build --release && \
    rm -rf src/

# Copy source code
COPY src/ src/
COPY build.rs ./

# Build the application
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 sirsi && \
    mkdir -p /app/config /app/logs && \
    chown -R sirsi:sirsi /app

# Copy binary from builder stage
COPY --from=builder /app/target/release/sirsi-nexus /app/sirsi-nexus
COPY --chown=sirsi:sirsi config/ /app/config/

# Set working directory and user
WORKDIR /app
USER sirsi

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose ports
EXPOSE 8080 50051 9090

# Environment variables
ENV RUST_LOG=info
ENV RUST_BACKTRACE=1
ENV CONFIG_PATH=/app/config/production.yaml

# Run the application
CMD ["/app/sirsi-nexus", "start"]
