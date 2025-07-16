---
layout: page
title: SirsiNexus App Login
---

<div class="app-login-page">
  <h1>Welcome to SirsiNexus</h1>
  <p>Access your AI-powered cloud infrastructure management platform</p>
  <p class="app-description">Generate, deploy, and optimize cloud infrastructure through natural language conversations with Sirsi.</p>
</div>

<div class="login-buttons">
  <a href="https://app.sirsinexus.com/login" class="btn btn-primary">Login to Dashboard</a>
  <a href="https://app.sirsinexus.com/register" class="btn btn-secondary">Create Account</a>
  <a href="https://app.sirsinexus.com/demo" class="btn btn-outline">Try Demo First</a>
</div>

## 🚀 What You Get Access To

<div class="app-features">
  <div class="app-feature">
    <h3>🤖 Sirsi AI Assistant</h3>
    <p>Chat with Sirsi to generate and manage your cloud infrastructure using natural language.</p>
  </div>
  
  <div class="app-feature">
    <h3>☁️ Multi-Cloud Management</h3>
    <p>Unified dashboard for AWS, Azure, and GCP with real-time monitoring and optimization.</p>
  </div>
  
  <div class="app-feature">
    <h3>📊 Analytics & Insights</h3>
    <p>AI-powered cost optimization, performance monitoring, and predictive analytics.</p>
  </div>
  
  <div class="app-feature">
    <h3>🔧 Infrastructure as Code</h3>
    <p>Generate Terraform, CloudFormation, and Kubernetes manifests through conversation.</p>
  </div>
</div>

## 🛡️ Enterprise Security

<div class="security-info">
  <p>Your data is protected with:</p>
  <ul>
    <li>🔐 Enterprise-grade encryption (AES-256)</li>
    <li>🔑 Multi-factor authentication (MFA)</li>
    <li>🛡️ SOC 2 Type II compliance</li>
    <li>🏢 Private cloud deployment options</li>
  </ul>
</div>

<div class="help-section">
  <h2>Need Help Getting Started?</h2>
  <div class="help-buttons">
    <a href="{{ '/sirsi-live-demo' | relative_url }}" class="btn btn-outline">View Live Demo</a>
    <a href="{{ '/getting-started' | relative_url }}" class="btn btn-outline">Getting Started Guide</a>
    <a href="mailto:support@sirsinexus.com" class="btn btn-outline">Contact Support</a>
  </div>
</div>

<style>
.app-login-page {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(145deg, #1e3a8a 15%, #059669 85%);
  color: white;
  border-radius: 0.75rem;
  margin-bottom: 3rem;
}

.app-login-page h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.app-login-page p {
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.9;
}

.login-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.login-buttons .btn {
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn {
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-primary {
  background: #ffffff;
  color: #1e3a8a;
}

.btn-primary:hover {
  background: #f8fafc;
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: #1e3a8a;
  border: 2px solid #1e3a8a;
}

.btn-outline:hover {
  background: #1e3a8a;
  color: white;
  transform: translateY(-2px);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.app-description {
  font-size: 1.1rem;
  margin-top: 1rem;
  font-weight: 400;
}

.app-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

.app-feature {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 0.75rem;
  border-left: 4px solid #059669;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.app-feature:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.app-feature h3 {
  margin-bottom: 1rem;
  color: #1e3a8a;
  font-weight: 600;
}

.security-info {
  background: #f0f9ff;
  padding: 2rem;
  border-radius: 0.75rem;
  border: 1px solid #bae6fd;
  margin: 2rem 0;
}

.security-info ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
}

.security-info li {
  padding: 0.5rem 0;
  font-weight: 500;
}

.help-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e5e7eb 100%);
  padding: 3rem 2rem;
  border-radius: 0.75rem;
  text-align: center;
  margin: 3rem 0;
}

.help-section h2 {
  color: #1e3a8a;
  margin-bottom: 2rem;
}

.help-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.help-buttons .btn {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .app-login-page h1 {
    font-size: 2rem;
  }
  
  .login-buttons,
  .help-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .app-features {
    grid-template-columns: 1fr;
  }
}
</style>
