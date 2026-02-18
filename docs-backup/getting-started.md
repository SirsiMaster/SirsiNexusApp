---
layout: page
title: Getting Started
permalink: /getting-started/
---

# Getting Started with SirsiNexus

Welcome to SirsiNexus! This guide will help you get up and running with our AI-enhanced cloud infrastructure platform.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (20.10+)
- **Kubernetes** (1.24+) or **Docker Compose**
- **Git**
- **Node.js** (18+) for the UI
- **Rust** (1.70+) for the core engine
- **Python** (3.11+) for analytics

### 1. Clone the Repository

```bash
git clone https://github.com/SirsiNexusDev/SirsiNexus.git
cd SirsiNexus
```

### 2. Environment Setup

Create your environment configuration:

```bash
cp .env.example .env
# Edit .env with your specific configuration
```

Required environment variables:
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/sirsi_nexus
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key

# AI Services (Optional for development)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Cloud Providers (Optional)
AWS_ACCESS_KEY_ID=your-aws-key
AZURE_CLIENT_ID=your-azure-client-id
GCP_SERVICE_ACCOUNT_KEY=your-gcp-key
```

### 3. Quick Launch

#### Option A: Docker Compose (Recommended for Development)

```bash
# Start all services
./launch-full-stack.sh

# Or manually with docker-compose
docker-compose up -d
```

#### Option B: Kubernetes (Production)

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/
```

#### Option C: Local Development

```bash
# Start database
docker-compose up -d postgres redis

# Start core engine
cd core-engine
cargo run --bin combined-server

# Start UI (in another terminal)
cd ui
npm install
npm run dev

# Start analytics platform (in another terminal)
cd analytics-platform
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### 4. Verify Installation

Once everything is running, verify your installation:

1. **Core Engine**: http://localhost:8080/health
2. **UI**: http://localhost:3000
3. **Analytics**: http://localhost:8000
4. **Documentation**: http://localhost:3000/docs

## 📚 Core Concepts

### Architecture Overview

SirsiNexus follows a microservices architecture:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │────│   Core Engine    │────│  Analytics      │
│   (Next.js)     │    │   (Rust/Axum)    │    │  (Python)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │   Database       │
                    │   (PostgreSQL)  │
                    └──────────────────┘
```

### Key Components

1. **Core Engine**: Rust-based backend handling API requests, authentication, and business logic
2. **Frontend UI**: React/Next.js application providing the user interface
3. **Analytics Platform**: Python service for ML/AI analytics and predictions
4. **Database**: PostgreSQL for distributed data storage
5. **Cache**: Redis for session management and caching

## 🔧 Configuration

### Database Configuration

SirsiNexus uses PostgreSQL by default. To configure:

```yaml
# config/default.yaml
database:
  url: "postgresql://username:password@localhost:26257/sirsi_nexus"
  max_connections: 20
  ssl_mode: "require"
```

### Security Configuration

Configure security settings:

```yaml
security:
  jwt_expiry: "1h"
  refresh_token_expiry: "7d"
  rate_limit:
    requests_per_minute: 100
    burst: 20
  encryption:
    algorithm: "AES-256-GCM"
```

### AI Services Configuration

Configure AI service providers:

```yaml
ai:
  providers:
    openai:
      model: "gpt-4"
      max_tokens: 4000
    anthropic:
      model: "claude-3-opus"
      max_tokens: 4000
```

## 🎯 First Steps

### 1. Create Your First Project

```bash
# Using the CLI
curl -X POST http://localhost:8080/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Project",
    "description": "Learning SirsiNexus"
  }'
```

### 2. Set Up Cloud Credentials

1. Navigate to **Settings > Credentials** in the UI
2. Add your cloud provider credentials
3. Test the connection

### 3. Run Your First Migration

1. Go to **Migration** in the UI
2. Follow the step-by-step wizard
3. Monitor the progress in real-time

### 4. Explore Analytics

1. Visit the **Analytics** dashboard
2. View system metrics and predictions
3. Configure custom alerts

## 🛠️ Development Guide

### Building from Source

#### Core Engine (Rust)

```bash
cd core-engine
cargo build --release
```

#### Frontend (Node.js)

```bash
cd ui
npm install
npm run build
```

#### Analytics Platform (Python)

```bash
cd analytics-platform
pip install -r requirements.txt
python -m pytest
```

### Running Tests

```bash
# Run all tests
./scripts/run-tests.sh

# Individual components
cd core-engine && cargo test
cd ui && npm test
cd analytics-platform && python -m pytest
```

### Development Workflow

1. **Create a feature branch**: `git checkout -b feature/your-feature`
2. **Make your changes** with appropriate tests
3. **Run the full test suite**: `./scripts/run-tests.sh`
4. **Submit a pull request** with a clear description

## 📖 Next Steps

Now that you have SirsiNexus running, explore these areas:

- **[Features Guide]({{ '/features' | relative_url }})** - Learn about all available features
- **[Documentation]({{ '/documentation' | relative_url }})** - Comprehensive technical documentation  
- **[Demos]({{ '/demos' | relative_url }})** - Interactive demos and examples
- **[API Reference](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs)** - Complete API documentation

## 🆘 Getting Help

If you encounter any issues:

1. **Check the logs**: `docker-compose logs` or `kubectl logs`
2. **Search existing issues**: [GitHub Issues](https://github.com/SirsiNexusDev/SirsiNexus/issues)
3. **Join our community**: [Discord](https://discord.gg/sirsinexus) *(coming soon)*
4. **Contact support**: [support@sirsinexus.dev](mailto:support@sirsinexus.dev)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/SirsiNexusDev/SirsiNexus/blob/main/CONTRIBUTING.md) for details.

---

**Ready to build something amazing?** Let's get started! 🚀
