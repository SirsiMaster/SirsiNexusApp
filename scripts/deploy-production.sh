#!/bin/bash

# SirsiNexus Production Deployment Script
# Automated deployment with health checks and rollback capability

set -euo pipefail

# Configuration
PROJECT_NAME="sirsi-nexus"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_INTERVAL=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
        exit 1
    fi
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "Compose file $COMPOSE_FILE not found"
        exit 1
    fi
    
    log "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating backup..."
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    if docker ps | grep -q cockroachdb; then
        log "Backing up CockroachDB..."
        docker exec sirsi-nexus-cockroachdb-1 cockroach dump sirsi_nexus --insecure > "$BACKUP_DIR/database.sql"
    fi
    
    # Backup Redis
    if docker ps | grep -q redis; then
        log "Backing up Redis..."
        docker exec sirsi-nexus-redis-1 redis-cli --rdb /data/dump.rdb
        docker cp sirsi-nexus-redis-1:/data/dump.rdb "$BACKUP_DIR/redis.rdb"
    fi
    
    log "Backup completed: $BACKUP_DIR"
}

# Health check function
health_check() {
    local service=$1
    local url=$2
    local retries=$HEALTH_CHECK_RETRIES
    
    log "Health checking $service..."
    
    while [ $retries -gt 0 ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            log "$service is healthy"
            return 0
        fi
        
        retries=$((retries - 1))
        if [ $retries -gt 0 ]; then
            log "Waiting for $service to be healthy... ($retries retries left)"
            sleep $HEALTH_CHECK_INTERVAL
        fi
    done
    
    error "$service failed health check"
    return 1
}

# Deploy services
deploy() {
    log "Starting production deployment..."
    
    # Build and start services
    log "Building and starting services..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to start
    log "Waiting for services to initialize..."
    sleep 30
    
    # Health checks
    log "Performing health checks..."
    
    # Check CockroachDB
    if ! health_check "CockroachDB" "http://localhost:8081/health"; then
        error "CockroachDB health check failed"
        return 1
    fi
    
    # Check Redis
    if ! redis-cli -h localhost -p 6379 ping > /dev/null 2>&1; then
        error "Redis health check failed"
        return 1
    fi
    log "Redis is healthy"
    
    # Check Core Engine
    if ! health_check "Core Engine" "http://localhost:8080/health"; then
        error "Core Engine health check failed"
        return 1
    fi
    
    # Check Frontend
    if ! health_check "Frontend" "http://localhost:3000/api/health"; then
        error "Frontend health check failed"
        return 1
    fi
    
    # Check Analytics
    if ! health_check "Analytics" "http://localhost:8000/health"; then
        error "Analytics health check failed"
        return 1
    fi
    
    # Check Nginx
    if ! health_check "Nginx" "http://localhost/health"; then
        error "Nginx health check failed"
        return 1
    fi
    
    log "All services are healthy!"
    return 0
}

# Rollback function
rollback() {
    warn "Initiating rollback..."
    
    # Stop current services
    docker-compose -f "$COMPOSE_FILE" down
    
    # Restore from backup if available
    if [ -d "$BACKUP_DIR" ]; then
        log "Restoring from backup: $BACKUP_DIR"
        
        # Restore database
        if [ -f "$BACKUP_DIR/database.sql" ]; then
            log "Restoring database..."
            docker-compose -f "$COMPOSE_FILE" up -d cockroachdb
            sleep 20
            docker exec -i sirsi-nexus-cockroachdb-1 cockroach sql --insecure --database=sirsi_nexus < "$BACKUP_DIR/database.sql"
        fi
        
        # Restore Redis
        if [ -f "$BACKUP_DIR/redis.rdb" ]; then
            log "Restoring Redis..."
            docker cp "$BACKUP_DIR/redis.rdb" sirsi-nexus-redis-1:/data/dump.rdb
        fi
    fi
    
    warn "Rollback completed"
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    docker image prune -f
    docker volume prune -f
    log "Cleanup completed"
}

# Main deployment process
main() {
    log "Starting SirsiNexus production deployment"
    
    check_prerequisites
    create_backup
    
    if deploy; then
        log "Deployment successful!"
        cleanup
        
        # Show service status
        log "Service status:"
        docker-compose -f "$COMPOSE_FILE" ps
        
        log "Deployment completed successfully!"
        log "Access the application at: https://localhost"
        log "Monitoring dashboard: http://localhost:3001 (admin/admin123)"
        log "Prometheus: http://localhost:9000"
    else
        error "Deployment failed!"
        rollback
        exit 1
    fi
}

# Handle script interruption
trap 'error "Deployment interrupted"; rollback; exit 1' INT TERM

# Run main function
main "$@"
