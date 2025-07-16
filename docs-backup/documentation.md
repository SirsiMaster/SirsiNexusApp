---
layout: page
title: Documentation
permalink: /documentation/
---

# Documentation Hub

Welcome to the SirsiNexus documentation center. Find everything you need to successfully deploy, configure, and use SirsiNexus.

## 🚀 Quick Start Guides

<div class="doc-grid">
  <div class="doc-card">
    <h3>🏃‍♂️ Getting Started</h3>
    <p>Complete setup guide from installation to first deployment</p>
    <a href="{{ '/getting-started' | relative_url }}">Start Here →</a>
  </div>
  
  <div class="doc-card">
    <h3>⚡ Quick Setup</h3>
    <p>Get SirsiNexus running in under 5 minutes with Docker</p>
    <a href="#quick-setup">Quick Setup →</a>
  </div>
  
  <div class="doc-card">
    <h3>🔧 Configuration</h3>
    <p>Detailed configuration options and best practices</p>
    <a href="#configuration">Configuration →</a>
  </div>
</div>

## 📚 Core Documentation

### Architecture & Design
- **[System Architecture](https://github.com/SirsiNexusDev/SirsiNexus/blob/main/docs/core/COMPREHENSIVE_DEVELOPMENT_BLUEPRINT.md)** - Complete architectural overview
- **[Technical Implementation](https://github.com/SirsiNexusDev/SirsiNexus/blob/main/docs/core/TECHNICAL_IMPLEMENTATION.md)** - Detailed technical specifications
- **[Database Schema](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/core-engine/migrations)** - Database design and migrations
- **[API Design](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/api)** - RESTful API documentation

### Development Guides
- **[Development Setup]({{ '/getting-started#development-guide' | relative_url }})** - Local development environment
- **[Contributing Guide](https://github.com/SirsiNexusDev/SirsiNexus/blob/main/CONTRIBUTING.md)** - How to contribute to SirsiNexus
- **[Code Standards](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/development)** - Coding standards and practices
- **[Testing Guide](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/testing)** - Testing strategies and examples

### Deployment & Operations
- **[Docker Deployment](https://github.com/SirsiNexusDev/SirsiNexus/blob/main/docker-compose.yml)** - Container-based deployment
- **[Kubernetes Deployment](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/k8s)** - Production Kubernetes setup
- **[Monitoring & Observability](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/monitoring)** - Monitoring and alerting setup
- **[Security Guide](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/security)** - Security best practices

## 🔧 Component Documentation

### Core Engine (Rust)
- **[Core Engine Overview](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/core-engine)** - Rust backend documentation
- **[API Endpoints](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/core-engine/src/routes)** - RESTful API reference
- **[Database Operations](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/core-engine/src/db)** - Database layer documentation
- **[Authentication](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/core-engine/src/auth)** - Authentication and authorization

### Analytics Platform (Python)
- **[Analytics Overview](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/analytics-platform)** - Python analytics documentation
- **[ML Models](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/analytics-platform/models)** - Machine learning models
- **[Data Processing](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/analytics-platform/processors)** - Data processing pipelines
- **[API Reference](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/analytics-platform/api)** - Analytics API documentation

### Frontend UI (TypeScript)
- **[UI Overview](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/ui)** - React/Next.js frontend
- **[Component Library](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/ui/src/components)** - Reusable UI components
- **[State Management](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/ui/src/store)** - Application state management
- **[Theming](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/ui/src/styles)** - UI theming and customization

### Cloud Connectors (Go)
- **[Connectors Overview](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/connectors)** - Go-based cloud integrations
- **[AWS Connector](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/connectors/aws)** - Amazon Web Services integration
- **[Azure Connector](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/connectors/azure)** - Microsoft Azure integration
- **[GCP Connector](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/connectors/gcp)** - Google Cloud Platform integration

## 🔍 API Reference

### REST API
- **[Authentication API](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/api/auth.md)** - User authentication endpoints
- **[Projects API](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/api/projects.md)** - Project management endpoints
- **[Infrastructure API](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/api/infrastructure.md)** - Infrastructure management endpoints
- **[Analytics API](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/api/analytics.md)** - Analytics and metrics endpoints

### GraphQL API
- **[GraphQL Schema](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/api/graphql-schema.md)** - Complete GraphQL schema
- **[Query Examples](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/api/graphql-examples.md)** - Common GraphQL queries
- **[Mutations](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/api/graphql-mutations.md)** - GraphQL mutations reference

### WebSocket API
- **[Real-time Events](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/api/websocket.md)** - WebSocket event documentation
- **[Client Integration](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/api/websocket-client.md)** - WebSocket client examples

## 📖 Tutorials & Examples

### Basic Tutorials
- **[Your First Deployment]({{ '/getting-started#first-steps' | relative_url }})** - Deploy your first application
- **[Setting Up Monitoring](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/tutorials/monitoring.md)** - Configure monitoring and alerting
- **[Multi-Cloud Setup](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/tutorials/multi-cloud.md)** - Configure multiple cloud providers

### Advanced Tutorials
- **[Custom AI Agents](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/tutorials/ai-agents.md)** - Build custom AI automation
- **[Cost Optimization](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/tutorials/cost-optimization.md)** - Optimize cloud costs with AI
- **[Security Hardening](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/tutorials/security.md)** - Advanced security configuration

### Integration Examples
- **[CI/CD Integration](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/examples/cicd)** - Integrate with CI/CD pipelines
- **[Terraform Integration](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/examples/terraform)** - Use with Terraform
- **[Slack Integration](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/examples/slack)** - Set up Slack notifications

## 📋 Reference Materials

### Configuration Reference
- **[Environment Variables](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/reference/env-vars.md)** - Complete environment variable reference
- **[Configuration Files](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/reference/config-files.md)** - Configuration file formats
- **[CLI Commands](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/reference/cli.md)** - Command-line interface reference

### Troubleshooting
- **[Common Issues](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/troubleshooting/common-issues.md)** - Frequently encountered problems
- **[Performance Tuning](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/troubleshooting/performance.md)** - Performance optimization guide
- **[Debug Mode](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/troubleshooting/debug.md)** - Enable debug logging and troubleshooting

## 🔄 Version History

- **[Changelog](https://github.com/SirsiNexusDev/SirsiNexus/blob/main/docs/core/CHANGELOG.md)** - Complete version history
- **[Migration Guides](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/migrations)** - Upgrade between versions
- **[Deprecation Notices](https://github.com/SirsiNexusDev/SirsiNexus/tree/main/docs/deprecations.md)** - Deprecated features and alternatives

## 🆘 Getting Help

### Community Support
- **[GitHub Issues](https://github.com/SirsiNexusDev/SirsiNexus/issues)** - Report bugs and request features
- **[Discussions](https://github.com/SirsiNexusDev/SirsiNexus/discussions)** - Community discussions and Q&A
- **[Discord](https://discord.gg/sirsinexus)** *(coming soon)* - Real-time community chat

### Professional Support
- **[Enterprise Support](mailto:enterprise@sirsinexus.dev)** - Priority support for enterprise customers
- **[Consulting Services](mailto:consulting@sirsinexus.dev)** - Professional services and custom development
- **[Training](mailto:training@sirsinexus.dev)** - Team training and workshops

---

<style>
.doc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.doc-card {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1.5rem;
  background: #fff;
  transition: box-shadow 0.2s ease;
}

.doc-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.doc-card h3 {
  margin-top: 0;
  color: #333;
}

.doc-card p {
  color: #666;
  margin: 0.5rem 0 1rem 0;
}

.doc-card a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.doc-card a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .doc-grid {
    grid-template-columns: 1fr;
  }
}
</style>

**Can't find what you're looking for?** [Contact our support team](mailto:support@sirsinexus.dev) and we'll help you get the answers you need.
