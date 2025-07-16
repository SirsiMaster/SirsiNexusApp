#!/bin/bash

# SirsiNexus Production Container Validation
# Phase 5.5 Container Deployment Finalization

echo "🐳 Validating SirsiNexus Production Containers..."

# Build all production images
echo "📦 Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Test container startup
echo "🚀 Testing container startup..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Health checks
echo "🏥 Performing health checks..."
services=("core-engine:8080/health" "frontend:3000/api/health" "analytics:8000/health")

for service in "${services[@]}"; do
  if curl -f -s "http://localhost:${service#*:}" > /dev/null; then
    echo "✅ $service is healthy"
  else
    echo "❌ $service is not responding"
  fi
done

echo "🛑 Cleaning up test deployment..."
docker-compose -f docker-compose.prod.yml down

echo "✅ Container validation complete!"
