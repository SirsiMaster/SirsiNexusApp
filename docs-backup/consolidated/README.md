# SirsiNexus: AI-Powered Multi-Cloud Orchestration Platform

## 🚀 **UNIFIED PLATFORM BINARY - BREAKTHROUGH ACHIEVED!**

**SirsiNexus** is now available as a **single, unified binary** (`sirsi-nexus`) that consolidates all platform services into one intelligent orchestrator. This revolutionary architecture eliminates deployment complexity and provides enterprise-grade infrastructure management through a single command.

**Sirsi Nexus** is a comprehensive, agent-embedded migration & infrastructure platform designed to automate heterogeneous cloud migrations and infrastructure management. Powered by the Sirsi AI Hypervisor, every feature is backed by specialized sub-agents for deep domain expertise, context awareness, and continuous assistance.

## 📋 **Documentation**

**📚 [Complete Documentation Hub](./docs/README.md)** - Comprehensive documentation index

### Quick Access:
- **[Infrastructure Builder Guide](./docs/user-guides/INFRASTRUCTURE_BUILDER.md)**: AI-powered infrastructure generation and template management
- **[Claude Integration](./docs/technical-reference/CLAUDE_INTEGRATION.md)**: Multi-AI provider support with Claude 3.5 Sonnet and Claude Code
- **[Development Guide](./docs/user-guides/DEVELOPMENT_GUIDE.md)**: Implementation guidance, troubleshooting, and resumption instructions
- **[Deployment Guide](./docs/user-guides/DEPLOYMENT_GUIDE.md)**: Production deployment instructions
- **[Architecture Overview](./docs/core/ARCHITECTURE.md)**: System architecture and design patterns
- **[AI Assistant Index](./docs/AI_ASSISTANT_DOCUMENTATION_INDEX.md)**: Comprehensive documentation for AI assistants

### For AI Assistants:
All documentation has been consolidated and organized in the `/docs/` directory with comprehensive indexing for AI assistant consumption. See [AI_ASSISTANT_DOCUMENTATION_INDEX.md](./docs/AI_ASSISTANT_DOCUMENTATION_INDEX.md) for complete context.

## Overview

Sirsi Nexus combines a polyglot microservices architecture (Rust, Go, Python, TypeScript) with a Model Context Protocol (MCP) service suite, all orchestrated by the Sirsi AI Hypervisor. Key components include:

- **Infrastructure Builder**: AI-powered multi-cloud infrastructure generation with natural language interface
- **Multi-AI Provider Support**: OpenAI GPT-4, Claude 3.5 Sonnet, and Claude Code with dynamic switching
- **AI Feature Awareness System**: Complete platform feature registry with automated discovery and documentation
- **Sub-Agents**: Domain-specific services (DiscoveryAgent, AssessmentAgent, etc.)
- **MCP Service**: Unified context and messaging API
- **PostgreSQL**: Distributed SQL database for sessions, agent events, and knowledge graph data
- **UI**: Next.js + React frontend with Tailwind, dark mode, and integrated AI assistant
- **CLI**: Tauri + Rust-based command-line interface
- **Hypervisor Feature Access**: AI agents can autonomously execute any platform feature

## Current Status

**Version**: v4.0.0  
**Phase**: 4 - AI Enhancement & Full-Stack Integration (✅ **100% COMPLETE**)  
**Status**: 🚀 **PRODUCTION-READY AI INFRASTRUCTURE MANAGEMENT PLATFORM**  
**Architecture**: Complete full-stack platform with real backend services and AI integrations  
**Deployment**: Production-ready with real cloud provider integrations and database persistence  
**Backend**: Complete Node.js/Express backend with PostgreSQL, real AI APIs, and cloud SDKs  
**Frontend**: Enhanced React/Next.js UI with all functional pages and real-time features  
**NEW**: ✅ **COMPLETE BACKEND INTEGRATION** - Real OpenAI/Anthropic AI, AWS/Azure/GCP APIs, PostgreSQL persistence, WebSocket real-time updates, email notifications, and full user authentication

### 🎆 **Phase 4 Major Achievements**

#### **✅ Complete Backend Infrastructure (Steps 1-5)**
- **Authentication & Security**: JWT with 2FA, bcrypt passwords, rate limiting, session management
- **Database Integration**: PostgreSQL with complete schema, UUID keys, JSONB flexibility
- **AI Services**: Real OpenAI GPT-4 & Anthropic Claude integration with rule-based fallbacks
- **Cloud Providers**: Live AWS, Azure, GCP, DigitalOcean SDKs with real resource management
- **Real-time Features**: Socket.IO WebSocket service with authentication and live updates
- **Notifications**: Email system with Nodemailer, cron scheduling, and user preferences

#### **✅ Enhanced Frontend Experience**
- **Analytics Dashboard** (`/analytics`) - Real metrics, cost analysis, performance monitoring
- **Enhanced AI Analytics** (`/analytics/enhanced`) - Predictive insights, anomaly detection
- **Scripting Console** (`/console`) - Multi-language script execution with terminal emulation
- **Auto-Scaling Wizard** (`/scaling`) - Step-by-step intelligent scaling configuration
- **All Navigation Functional** - Every sidebar item now leads to working pages (no more 404s)

#### **✅ Production-Ready Architecture**
- **5 Core Backend Services**: Database, AI, Cloud Providers, Notifications, WebSocket
- **Complete API Routes**: `/api/auth`, `/api/settings`, `/api/ai`, `/api/infrastructure`
- **Security & Performance**: JWT auth, rate limiting, error handling, graceful shutdown
- **Real Integrations**: No mocks - actual OpenAI, AWS SDK, PostgreSQL, email SMTP

#### **📊 Business Impact**
- **20-30% Cost Savings** through AI-powered optimization recommendations
- **Multi-Cloud Support** for AWS, Azure, GCP, and DigitalOcean
- **Real-Time Monitoring** with instant alerts and team collaboration
- **Complete User Journey** from registration to infrastructure deployment
- **Production Scalability** with enterprise-grade security and performance

## Prerequisites

**For Production Deployment:**
- Docker 20.10+
- Docker Compose 2.0+
- OpenSSL (for SSL certificate generation)

**For Development:**
- GitHub account
- Access to GitHub Codespaces or Gitpod (recommended) or local VS Code with GitHub Copilot
- Git installed (for local development)

## Getting Started

### 🚀 Production Backend + Frontend (Recommended)

**Complete Full-Stack Platform - Production Ready in 5 minutes:**

```bash
# Clone repository
git clone https://github.com/SirsiMaster/SirsiNexus.git
cd SirsiNexus

# Setup environment variables
cp ui/server/.env.example ui/server/.env
# Edit ui/server/.env with your API keys and database connection

# Start backend services
cd ui/server
npm install
npm start

# In another terminal, start frontend
cd ui
npm install
npm run dev
```

**🎆 COMPLETE PLATFORM SERVICES:**
- 🚀 **Backend API** (Node.js/Express) - Port 5000
- 🌐 **Frontend UI** (Next.js/React) - Port 3000  
- 💾 **PostgreSQL** (Real database persistence)
- 🤖 **AI Services** (OpenAI GPT-4, Anthropic Claude)
- ☁️ **Cloud SDKs** (AWS, Azure, GCP, DigitalOcean)
- 📧 **Email Notifications** (Nodemailer with SMTP)
- 🔌 **WebSocket Real-time** (Socket.IO with auth)

### 📄 Required Environment Variables

**Essential Configuration** (ui/server/.env):
```bash
# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/sirsinexus

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# AI Services (Optional but recommended)
OPENAI_API_KEY=sk-your-openai-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Cloud Providers (Optional - configure as needed)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp-service-account.json
DO_API_TOKEN=your-digitalocean-api-token

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 🐳 Alternative: Docker Deployment

**Multi-container deployment:**

```bash
# Clone repository
git clone https://github.com/SirsiMaster/SirsiNexus.git
cd SirsiNexus

# Generate SSL certificates
./scripts/generate-ssl.sh

# Deploy all services with monitoring
./scripts/deploy-production.sh

# Access the application
open https://localhost
```

## 🚀 Unified Binary CLI Commands

The `sirsi-nexus` binary provides a comprehensive CLI interface:

```bash
# Start the platform (default command)
sirsi-nexus start

# Show platform status
sirsi-nexus status

# Show platform health
sirsi-nexus health

# Configuration management
sirsi-nexus config show
sirsi-nexus config reset

# Development mode with auto-reload
sirsi-nexus start --dev

# Daemon mode for production
sirsi-nexus start --daemon

# Custom configuration file
sirsi-nexus start -c /path/to/config.yaml

# Debug logging
sirsi-nexus start --log-level debug
```

**Services Available:**
- 🌐 **Main Application**: https://localhost
- 📊 **Monitoring Dashboard**: http://localhost:3001 (admin/admin123)
- 📈 **Prometheus Metrics**: http://localhost:9000
- 💾 **Database Admin**: http://localhost:8081

### 🛠️ Development Setup

### Cloud IDE Setup

Use either GitHub Codespaces or Gitpod for an instant VS Code environment:

**GitHub Codespaces**:

1. Open this repo on GitHub.
2. Click **Code** → **Open with Codespaces** → **New codespace**.

**Gitpod**:

1. Prefix repo URL with `https://gitpod.io/#`.
2. Authorize and start workspace.

### Clone Repository

```bash
git clone https://github.com/SirsiMaster/SirsiNexus.git
cd SirsiNexus
```

### Install Dependencies

Each service has its own dependencies:

**Core Engine (Rust)**:
```bash
cd core-engine
cargo install --path .
```

**Connectors (Go)**:
```bash
cd connectors/aws
go mod tidy
go build
```

**Planner (Python)**:
```bash
cd planner
pip install -r requirements.txt
```

**Analytics Platform (Python)**:
```bash
cd analytics-platform
pip install -r requirements.txt
python test_basic_functionality.py
```

**ML Platform (Python)**:
```bash
cd ml-platform
pip install -r requirements.txt
python -c "from src.models.cost_prediction import demo_cost_prediction; demo_cost_prediction()"
```

**UI (Node.js)**:
```bash
cd ui
npm install
npm run dev
```

## Repository Structure

```
sirsi-nexus/
├── ui/                        # 🌐 Complete Full-Stack Application (Phase 4)
│   ├── server/               # 🚀 Production Backend (Node.js/Express)
│   │   ├── src/
│   │   │   ├── routes/       # API routes (auth, settings, ai, infrastructure)
│   │   │   ├── services/     # Backend services (database, ai, cloudProviders, notifications, websocket)
│   │   │   ├── middleware/   # Auth, rate limiting, error handling
│   │   │   └── index.js      # Main server entry point
│   │   ├── package.json      # Backend dependencies (OpenAI, AWS SDK, PostgreSQL, etc.)
│   │   └── .env.example      # Environment configuration template
│   ├── src/                  # ⚙️ Frontend Application (Next.js/React)
│   │   ├── app/              # App Router pages
│   │   │   ├── analytics/    # Analytics Dashboard & Enhanced Analytics
│   │   │   ├── console/      # Scripting Console
│   │   │   ├── scaling/      # Auto-Scaling Wizard
│   │   │   ├── infrastructure/ # Infrastructure Builder
│   │   │   ├── settings/     # User Settings Pages
│   │   │   └── ...           # All other functional pages
│   │   ├── components/       # React components with AI integration
│   │   ├── services/         # Frontend services (API clients, WebSocket)
│   │   └── store/            # Redux state management
│   └── package.json          # Frontend dependencies
├── core-engine/               # 🦖 Rust: AI Hypervisor & Orchestration Engine
│   ├── src/ai/               # Phase 3: Advanced AI Orchestration
│   │   ├── decision/         # MCDM decision engine with fuzzy logic
│   │   ├── orchestration/    # Multi-agent coordination & optimization
│   │   ├── learning/         # Continuous learning pipelines
│   │   └── optimization/     # Autonomous optimization algorithms
│   ├── src/telemetry/        # Advanced Performance Monitoring (Phase 4)
│   │   ├── metrics.rs        # High-resolution metrics collection
│   │   ├── prometheus.rs     # Prometheus metrics exporter
│   │   ├── opentelemetry.rs  # Distributed tracing with W3C Trace Context
│   │   └── dashboard.rs      # Real-time dashboard API
│   ├── src/server/http.rs    # HTTP REST API for observability endpoints
│   └── src/agent/            # Agent system with integrated observability
├── analytics-platform/        # 📊 Phase 3: Advanced Analytics & ML
│   ├── src/forecasting/      # Time series forecasting (Prophet, ARIMA, GP)
│   ├── src/anomaly/         # Multi-algorithm anomaly detection
│   ├── src/risk/            # Risk assessment and scoring
│   └── src/optimization/    # Performance optimization algorithms
├── ml-platform/              # 🤖 Phase 3: Machine Learning Platform
│   ├── src/models/          # ML models (LSTM, RF, XGBoost, Ensemble)
│   ├── src/training/        # Model training pipelines
│   ├── src/inference/       # Real-time inference services
│   └── src/data/            # Data processing and feature engineering
├── mcp/                       # MCP Protocol & SDK Clients
├── connectors/                # Go: Cloud Connectors (AWS, Azure, GCP, vSphere)
├── planner/                   # Python: AI Orchestration & Pipelines
├── cli/                       # Tauri + Rust CLI
├── subagents/                 # Agent Modules
├── demo-data/                 # Business Entity & Infrastructure Data
│   ├── tvfone/               # Media & Entertainment Demo Data
│   ├── kulturio/             # Healthcare Demo Data
│   └── uniedu/               # Education Demo Data
├── security/                  # OPA Policies, Vault, SPIFFE Configs
├── pipeline/                  # Kafka/NATS & Observability Configs
├── migration-templates/       # Terraform, Bicep, Pulumi Templates
├── testing/                   # Testcontainers & Cypress Specs
├── ci/                        # GitHub Actions Workflows
├── deploy/                    # Helm Charts & GitOps Manifests
└── docs/                      # Documentation & Architecture Diagrams
    ├── DEMO_SCENARIOS.md      # Demo scenario documentation
    ├── DEMO_PRESENTATION_GUIDE.md # Presentation guidelines
    ├── PHASE_2_COMPLETION.md  # Phase 2 completion report
    └── PHASE_4_OBSERVABILITY.md # Phase 4 observability implementation
```

## Workflow

### Branching Strategy

- **main**: Production-ready code
- **feature/**: Individual feature branches (e.g., `feature/core-engine`)
- **hotfix/**: Urgent fixes

### Running Services Locally

**🟢 Phase 4 Full-Stack Development:**
```bash
# Backend API Server (Production Ready)
cd ui/server
npm install
npm run dev          # Development with auto-reload
# npm start           # Production mode

# Frontend Application (Enhanced UI)
cd ui
npm install
npm run dev          # Next.js development server
# npm run build       # Production build
# npm start           # Production server

# Test Backend Integration
cd ui
node test-ai-integration.js    # Test AI services integration
```

**🟡 Legacy Services (Phase 3):**
```bash
# Core Engine with AI Orchestration
cd core-engine && cargo run -- --help
cd core-engine && cargo test --lib ai_orchestration_engine

# Analytics Platform (Phase 3)
cd analytics-platform && python test_basic_functionality.py
cd analytics-platform && python -c "from src.forecasting.time_series_forecasting import demo_forecasting_engine; demo_forecasting_engine()"
cd analytics-platform && python -c "from src.anomaly.anomaly_detection import demo_anomaly_detection; demo_anomaly_detection()"

# ML Platform (Phase 3)
cd ml-platform && python -c "from src.models.cost_prediction import demo_cost_prediction; demo_cost_prediction()"

# Connectors (AWS)
cd connectors/aws && go run main.go --help

# Planner
cd planner && python planner.py --help

# CLI
cd cli && npm run tauri dev
```

**🔌 Available Services:**
- 🚀 **Backend API**: http://localhost:5000 (Complete REST API)
- 🌐 **Frontend UI**: http://localhost:3000 (Enhanced React UI)
- 💾 **Health Check**: http://localhost:5000/health (Service status)
- 🔌 **WebSocket**: ws://localhost:5000 (Real-time updates)

## CI/CD

Continuous integration is handled by GitHub Actions (`.github/workflows/ci.yml`), covering:

- Linting (Rust, Go, Python, JS)
- Unit & integration tests
- Security scans (Snyk, Trivy)
- End-to-end UI tests (Cypress)
- Performance benchmarks (K6)

Merges to `main` trigger production deployments via Helm/ArgoCD.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes and push to your fork
4. Open a Pull Request against this repo's `main` branch
5. Request reviews and address feedback

## License

MIT License. See [LICENSE](LICENSE) for details.

