---
layout: default
title: Home
---

<!-- SirsiNexus Application Layout -->
<div id="app" class="min-h-screen bg-slate-50 dark:bg-slate-900">
  <!-- Header -->
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <div class="logo">
          <div class="logo-icon">
            <span>S</span>
          </div>
          <div class="logo-text">
            <h1>SirsiNexus</h1>
            <div class="version-info">
              <span class="version-badge">v0.7.9-alpha</span>
              <div class="status-indicator">
                <div class="status-dot"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="header-center">
        <div class="search-container">
          <div class="search-input">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span>Ask Sirsi anything...</span>
          </div>
        </div>
      </div>
      
      <div class="header-right">
        <button class="header-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
          </svg>
        </button>
        <button class="header-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <div class="user-menu">
          <div class="user-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span>Guest</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </div>
      </div>
    </div>
  </header>
  
  <!-- Main Layout -->
  <div class="main-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <button class="collapse-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <!-- Overview Section -->
        <div class="nav-section">
          <div class="nav-item active">
            <div class="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9,22 9,12 15,12 15,22"></polyline>
              </svg>
            </div>
            <div class="nav-content">
              <h3>Overview</h3>
              <p>Dashboard and insights</p>
            </div>
          </div>
        </div>
        
        <!-- Smart Wizards -->
        <div class="nav-section">
          <div class="section-header">
            <div class="section-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 4V2a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v2M7.5 4h9"></path>
                <path d="M7 10V8a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2"></path>
              </svg>
            </div>
            <span>Smart Wizards</span>
            <svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
          
          <div class="nav-items">
            <a href="https://app.sirsinexus.com/demo" class="nav-item">
              <div class="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="9,11 12,14 22,4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>
              <div class="nav-content">
                <h4>Live Demo</h4>
                <p>Experience SirsiNexus</p>
              </div>
            </a>
            
            <a href="https://app.sirsinexus.com/login" class="nav-item">
              <div class="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10,17 15,12 10,7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              </div>
              <div class="nav-content">
                <h4>Login / Register</h4>
                <p>Access the platform</p>
              </div>
            </a>
            
            <a href="/investor-login" class="nav-item">
              <div class="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div class="nav-content">
                <h4>Investor Portal</h4>
                <p>Investment information</p>
              </div>
            </a>
          </div>
        </div>
        
        <!-- Information Sections -->
        <div class="nav-section">
          <div class="section-title">Information</div>
          <div class="nav-items">
            <a href="#features" class="nav-item-simple">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
              </svg>
              <span>Features</span>
            </a>
            <a href="#use-cases" class="nav-item-simple">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
              </svg>
              <span>Use Cases</span>
            </a>
            <a href="#progress" class="nav-item-simple">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <span>Latest Progress</span>
            </a>
            <a href="#status" class="nav-item-simple">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <span>Current Status</span>
            </a>
          </div>
        </div>
        
        <!-- Quick Action CTA -->
        <div class="cta-container">
          <a href="https://app.sirsinexus.com" class="cta-button">
            <div class="cta-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="16,18 22,12 16,6"></polyline>
                <path d="M8 6H2v12h6"></path>
                <path d="M2 12h20"></path>
              </svg>
            </div>
            <div class="cta-content">
              <h4>Try SirsiNexus Live</h4>
              <p>Experience the platform</p>
            </div>
          </a>
        </div>
      </nav>
    </aside>
    
    <!-- Main Content -->
    <main class="main-content">
      <div class="content-container">

<div class="hero-section">
  <div class="hero-content">
    <h1 class="hero-title">Welcome to Sirsi</h1>
    <p class="hero-subtitle">World's First Generative AI Infrastructure Assistant</p>
    <p class="hero-description">
      Generate complete cloud infrastructure through natural language conversations. 
      Simply describe what you need - Sirsi creates it.
    </p>
    <div class="hero-buttons">
      <a href="https://app.sirsinexus.com" class="btn btn-primary">Try SirsiNexus Live</a>
      <a href="{{ '/sirsi-live-demo' | relative_url }}" class="btn btn-secondary">View Demos</a>
      <a href="{{ '/app-login' | relative_url }}" class="btn btn-outline">Login / Register</a>
    </div>
  </div>
</div>

## 🌟 Experience Generative Infrastructure

<div class="lead-section">
  <h2>The Future of Infrastructure is Conversational</h2>
  <p>First-of-its-kind Generative AI that creates infrastructure from simple descriptions. No more complex configurations.</p>

  <div class="lead-buttons">
    <a href="/sirsi-live-demo" class="btn btn-primary">Explore the Live Demo</a>
    <a href="/app-login" class="btn btn-secondary">Login / Register</a>
    <a href="/investor-login" class="btn btn-outline">Investor Portal</a>
  </div>
</div>

## 🚀 Key Features

<div class="features-grid">
  <div class="feature-card">
    <h3>🎯 Generate Infrastructure</h3>
    <p>Describe what you need in plain English. Sirsi generates complete cloud environments instantly.</p>
  </div>
  
  <div class="feature-card">
    <h3>💬 Natural Language Operations</h3>
    <p>No more YAML or complex configurations. Talk to your infrastructure like a conversation.</p>
  </div>
  
  <div class="feature-card">
    <h3>🔮 Predictive Intelligence</h3>
    <p>Sirsi learns from operations and proactively optimizes your cloud environment.</p>
  </div>
  
  <div class="feature-card">
    <h3>☁️ Multi-Cloud Generation</h3>
    <p>Generate AWS, Azure, GCP infrastructure from simple descriptions. One conversation, any cloud.</p>
  </div>
  
  <div class="feature-card">
    <h3>⚡ Instant Deployment</h3>
    <p>From idea to deployed infrastructure in minutes. Revolutionary speed through generative AI.</p>
  </div>
  
  <div class="feature-card">
    <h3>🚀 Production Grade</h3>
    <p>Enterprise-ready infrastructure generation with security, compliance, and best practices built-in.</p>
  </div>
</div>

## 🛠️ Get Connected
<div class="cta-section">
  <h2>Stay Updated with SirsiNexus</h2>
  <p>Join our mailing list to receive the latest news and updates.</p>
  <a href="/signup-newsletter" class="btn btn-primary btn-large">Sign Up for Updates</a>
</div>

## 🛠️ Latest Progress: Phase 6.4 Complete!

<div class="achievement-banner">
  <h3>✅ Security Hardening & Professional GitHub Pages Portal</h3>
  <p>Implemented comprehensive security hardening, fixed all critical vulnerabilities, and enhanced GitHub Pages with professional lead generation capabilities. Production-ready platform.</p>
  <span class="version-badge">v0.7.9-alpha</span>
  <span class="timestamp-badge">Updated: July 14, 2025</span>
</div>

## 📈 Current Status

<div class="stats-section">
  <div class="stat-item">
    <span class="stat-number">172K+</span>
    <span class="stat-label">Lines of Code</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">5/5</span>
    <span class="stat-label">Services Starting</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">Alpha</span>
    <span class="stat-label">Development Stage</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">Active</span>
    <span class="stat-label">Development</span>
  </div>
</div>

## 🎯 Use Cases

- **Cloud Migration**: Automated migration with AI-powered optimization
- **Infrastructure Management**: Intelligent resource allocation and scaling
- **Cost Optimization**: ML-driven cost prediction and reduction
- **Security Monitoring**: Real-time threat detection and response
- **DevOps Automation**: Streamlined CI/CD with intelligent workflows

## 🏢 Trusted By

SirsiNexus is designed for organizations that demand:
- **Scalability**: Handle enterprise-level workloads
- **Reliability**: 99.9% uptime with robust failover
- **Security**: Enterprise-grade security and compliance
- **Innovation**: Cutting-edge AI and ML capabilities

<div class="cta-section">
  <h2>Ready to Get Started?</h2>
  <p>Join the next generation of cloud infrastructure management</p>
  <div class="cta-buttons">
    <a href="{{ '/getting-started' | relative_url }}" class="btn btn-primary btn-large">Start Your Journey</a>
    <a href="{{ '/contact' | relative_url }}" class="btn btn-secondary btn-large">Contact Sales</a>
      </div>
    </main>
  </div>
</div>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

:root {
  /* SirsiNexus Color System - Light Mode */
  --background: 250 250% 98%;
  --foreground: 220 9% 46%;
  --card: 0 0% 100%;
  --card-foreground: 220 9% 46%;
  --primary: 142 76% 36%; /* Emerald Green */
  --primary-foreground: 0 0% 100%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 142 76% 36%;
  
  /* Glass Morphism Variables */
  --glass-bg: rgba(255, 255, 255, 0.88);
  --glass-border: rgba(34, 197, 94, 0.12);
  --glass-shadow: 0 25px 55px rgba(0, 0, 0, 0.15);
  --glass-backdrop: blur(25px) saturate(220%);
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark Mode Colors */
    --background: 220 20% 8%;
    --foreground: 210 40% 98%;
    --card: 220 15% 12%;
    --card-foreground: 210 40% 98%;
    --primary: 142 76% 36%;
    --primary-foreground: 0 0% 100%;
    --secondary: 215 25% 15%;
    --secondary-foreground: 210 40% 98%;
    --muted: 215 25% 15%;
    --muted-foreground: 217.9 10.6% 64.9%;
    --accent: 215 25% 15%;
    --accent-foreground: 210 40% 98%;
    --border: 215 27.9% 16.9%;
    --input: 215 27.9% 16.9%;
    --ring: 142 76% 36%;
    
    /* Dark Glass Variables */
    --glass-bg: rgba(30, 41, 59, 0.88);
    --glass-border: rgba(139, 69, 195, 0.12);
    --glass-shadow: 0 25px 55px rgba(0, 0, 0, 0.4);
    --glass-backdrop: blur(25px) saturate(220%);
  }
}

body {
  font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  line-height: 1.6;
  letter-spacing: -0.01em;
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "tnum" 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}

nav {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  border-bottom: 1px solid hsl(var(--border));
  color: hsl(var(--foreground));
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  box-shadow: var(--glass-shadow);
  position: sticky;
  top: 0;
  z-index: 50;
}

nav h1 {
  color: hsl(var(--foreground));
  font-weight: 700;
  margin: 0;
}

nav a {
  color: hsl(var(--foreground));
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

nav a:hover {
  background: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
  transform: translateY(-1px);
}

.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 20px;
}

.lead-section {
  text-align: center;
  margin-bottom: 3rem;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: var(--glass-shadow);
}

.lead-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.lead-buttons .btn {
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  box-shadow: var(--glass-shadow);
  backdrop-filter: var(--glass-backdrop);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta-section {
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(142 76% 45%) 100%);
  color: hsl(var(--primary-foreground));
  text-align: center;
  padding: 3rem 2rem;
  border-radius: 1rem;
  box-shadow: var(--glass-shadow);
  margin-top: 2rem;
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
}

.cta-section h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.cta-section a {
  margin-top: 1.5rem;
  display: inline-block;
}
.hero-section {
  background: linear-gradient(145deg, hsl(220 91% 36%) 15%, hsl(var(--primary)) 85%);
  color: hsl(var(--primary-foreground));
  padding: 4rem 2rem;
  text-align: center;
  margin: -2rem -2rem 3rem -2rem;
  border-radius: 1rem;
  backdrop-filter: var(--glass-backdrop);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 500;
  color: #e5e7eb;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 2rem auto;
  line-height: 1.6;
}
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-primary {
  background: #ffffff;
  color: #1e3a8a;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #f8fafc;
  color: #1d4ed8;
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

.feature-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid var(--glass-border);
  border-left: 4px solid hsl(var(--primary));
  box-shadow: var(--glass-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-left-color: hsl(var(--ring));
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
  text-align: center;
}

.stat-item {
  padding: 1.5rem;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  box-shadow: var(--glass-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: hsl(var(--primary));
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: hsl(var(--muted-foreground));
  margin-top: 0.5rem;
}


.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.achievement-banner {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 2rem;
  border-radius: 0.75rem;
  margin: 2rem 0;
  text-align: center;
  position: relative;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.achievement-banner h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.achievement-banner p {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  opacity: 0.95;
  line-height: 1.5;
}

.version-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.3);
  margin-right: 1rem;
}

.timestamp-badge {
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Application Layout Styles */
.header {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  border-bottom: 1px solid hsl(var(--border));
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: var(--glass-shadow);
}

.header-content {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  height: 4rem;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  background: hsl(var(--foreground));
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon span {
  font-size: 0.875rem;
  font-weight: 700;
  color: hsl(var(--background));
}

.logo-text h1 {
  font-size: 1.125rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.version-badge {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted));
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.status-dot {
  width: 0.375rem;
  height: 0.375rem;
  background: hsl(var(--primary));
  border-radius: 50%;
}

.status-indicator span {
  font-size: 0.75rem;
  color: hsl(var(--foreground));
}

.header-center {
  flex: 1;
  max-width: 28rem;
  margin: 0 2rem;
}

.search-container {
  position: relative;
}

.search-input {
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input:hover {
  background: hsl(var(--accent));
  border-color: hsl(var(--primary));
}

.search-icon {
  color: hsl(var(--muted-foreground));
}

.search-input span {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-btn {
  padding: 0.5rem;
  color: hsl(var(--muted-foreground));
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-btn:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted));
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  color: hsl(var(--foreground));
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-menu:hover {
  background: hsl(var(--muted));
}

.user-avatar {
  width: 1.5rem;
  height: 1.5rem;
  background: hsl(var(--muted));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-menu span {
  font-size: 0.875rem;
  color: hsl(var(--foreground));
}

.main-layout {
  display: flex;
  min-height: calc(100vh - 4rem);
}

.sidebar {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  border-right: 1px solid hsl(var(--border));
  width: 16rem;
  position: fixed;
  left: 0;
  top: 4rem;
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  box-shadow: var(--glass-shadow);
}

.sidebar-header {
  padding: 0.5rem;
  border-bottom: 1px solid hsl(var(--border));
}

.collapse-btn {
  width: 100%;
  padding: 0.5rem;
  color: hsl(var(--muted-foreground));
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  background: hsl(var(--muted));
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-item {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: hsl(var(--foreground));
}

.nav-item.active {
  background: hsl(var(--accent));
  color: hsl(var(--primary));
  border: 1px solid hsl(var(--primary) / 0.2);
}

.nav-item:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
  transform: translateY(-1px);
}

.nav-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--muted));
}

.nav-item.active .nav-icon {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.nav-content h3, .nav-content h4 {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

.nav-content p {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  margin: 0;
}

.section-header {
  width: 100%;
  padding: 0.75rem;
  background: hsl(var(--muted));
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.section-header:hover {
  background: hsl(var(--accent));
}

.section-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.section-header span {
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin-left: 0.75rem;
  flex: 1;
  text-align: left;
}

.chevron {
  color: hsl(var(--muted-foreground));
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.nav-item-simple {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  color: hsl(var(--foreground));
}

.nav-item-simple:hover {
  background: hsl(var(--muted));
  transform: translateY(-1px);
}

.nav-item-simple span {
  font-size: 0.875rem;
  font-weight: 500;
}

.cta-container {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid hsl(var(--border));
}

.cta-button {
  width: 100%;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  margin-bottom: 0.75rem;
}

.cta-button:hover {
  background: hsl(var(--primary) / 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px hsl(var(--primary) / 0.3);
}

.cta-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--primary-foreground) / 0.2);
}

.cta-content h4 {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

.cta-content p {
  font-size: 0.75rem;
  opacity: 0.8;
  margin: 0;
}

.main-content {
  flex: 1;
  margin-left: 16rem;
  min-height: calc(100vh - 4rem);
}

.content-container {
  padding: 1.5rem;
  max-width: none;
  margin: 0;
}

@media (max-width: 1024px) {
  .sidebar {
    width: 4rem;
  }
  
  .main-content {
    margin-left: 4rem;
  }
  
  .nav-content,
  .section-header span,
  .cta-content {
    display: none;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-buttons,
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .sidebar {
    display: none;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .header-center {
    display: none;
  }
}
</style>
