#!/bin/bash
set -e

# Check if running inside Docker
if [ -f /.dockerenv ]; then
    echo "This script should not be run inside a Docker container"
    exit 1
fi

# Create development database
create_dev_db() {
    echo "Creating development database..."
    PGPASSWORD=postgres psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'sirsi'" | grep -q 1 || \
        PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE sirsi"
    
    echo "Creating test database..."
    PGPASSWORD=postgres psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'sirsi_test'" | grep -q 1 || \
        PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE sirsi_test"
}

# Start dependencies with Docker Compose
start_dependencies() {
    echo "Starting dependencies..."
    docker-compose up -d
    
    # Wait for PostgreSQL to be ready
    until PGPASSWORD=postgres psql -h localhost -U postgres -c '\q' > /dev/null 2>&1; do
        echo "Waiting for PostgreSQL to be ready..."
        sleep 1
    done
}

# Install development tools
install_tools() {
    echo "Installing development tools..."
    
    # Install sqlx-cli if not present
    if ! command -v sqlx &> /dev/null; then
        cargo install sqlx-cli --no-default-features --features native-tls,postgres
    fi
    
    # Install protobuf compiler if not present
    if ! command -v protoc &> /dev/null; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install protobuf
        else
            sudo apt-get update && sudo apt-get install -y protobuf-compiler
        fi
    fi
}

# Run database migrations
run_migrations() {
    echo "Running database migrations..."
    sqlx database create
    sqlx migrate run
    
    # Also run migrations on test database
    DATABASE_URL=postgres://postgres:postgres@localhost:5432/sirsi_test sqlx migrate run
}

# Build protobufs
build_protos() {
    echo "Building protobufs..."
    mkdir -p src/proto
    
    # Use tonic-build to generate Rust code from proto files
    cargo build
}

# Main execution
echo "Setting up development environment..."

install_tools
start_dependencies
create_dev_db
run_migrations
build_protos

echo "Development environment is ready!"
echo "You can now run:"
echo "  cargo run     - to start the server"
echo "  cargo test    - to run tests"
