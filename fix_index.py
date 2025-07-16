#!/usr/bin/env python3
"""
Fix index.html page specifically
"""

import re

def fix_index():
    """Fix the index.html page"""
    
    # Create a clean, working index.html
    clean_index = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SirsiNexus - Agent-Embedded Infrastructure Platform</title>
    <style>
        /* Clean, working CSS */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #ffffff;
            color: #1a1a1a;
            line-height: 1.6;
        }
        
        /* Header */
        header {
            background-color: #ffffff;
            border-bottom: 1px solid #e5e7eb;
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 50;
        }
        
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .logo-icon {
            width: 2rem;
            height: 2rem;
            background-color: #1a1a1a;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: bold;
        }
        
        .logo-text {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1a1a1a;
        }
        
        .version {
            font-size: 0.75rem;
            color: #6b7280;
            background-color: #f3f4f6;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
        }
        
        nav {
            display: flex;
            gap: 2rem;
        }
        
        nav a {
            color: #374151;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }
        
        nav a:hover {
            color: #059669;
        }
        
        /* Main content */
        main {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .hero {
            text-align: center;
            padding: 4rem 0;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            margin: 2rem 0;
            border-radius: 1rem;
        }
        
        .hero h1 {
            font-size: 3rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 1rem;
        }
        
        .hero p {
            font-size: 1.25rem;
            color: #4b5563;
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .hero-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.2s;
        }
        
        .btn-primary {
            background-color: #059669;
            color: #ffffff;
        }
        
        .btn-primary:hover {
            background-color: #047857;
        }
        
        .btn-secondary {
            background-color: transparent;
            color: #059669;
            border: 2px solid #059669;
        }
        
        .btn-secondary:hover {
            background-color: #059669;
            color: #ffffff;
        }
        
        /* Features section */
        .features {
            padding: 4rem 0;
        }
        
        .features h2 {
            text-align: center;
            font-size: 2.5rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 3rem;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .feature-card {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .feature-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 1rem;
        }
        
        .feature-card p {
            color: #4b5563;
            line-height: 1.6;
        }
        
        /* Footer */
        footer {
            background-color: #1f2937;
            color: #ffffff;
            text-align: center;
            padding: 2rem 0;
            margin-top: 4rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .header-content {
                padding: 0 1rem;
            }
            
            nav {
                display: none;
            }
            
            main {
                padding: 1rem;
            }
            
            .hero h1 {
                font-size: 2rem;
            }
            
            .hero-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="header-content">
            <div class="logo">
                <div class="logo-icon">S</div>
                <div>
                    <div class="logo-text">SirsiNexus</div>
                    <div class="version">v0.7.9-alpha</div>
                </div>
            </div>
            <nav>
                <a href="index.html">Home</a>
                <a href="documentation.html">Documentation</a>
                <a href="investor-portal.html">Investor Portal</a>
                <a href="signup.html">Sign Up</a>
            </nav>
        </div>
    </header>

    <main>
        <section class="hero">
            <h1>Agent-Embedded Infrastructure Platform</h1>
            <p>SirsiNexus revolutionizes cloud infrastructure management with AI-powered agents, seamless migration tools, and intelligent automation for enterprise-scale deployments.</p>
            <div class="hero-buttons">
                <a href="documentation.html" class="btn btn-primary">View Documentation</a>
                <a href="signup.html" class="btn btn-secondary">Get Updates</a>
            </div>
        </section>

        <section class="features">
            <h2>Platform Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <h3>Smart Migration Wizards</h3>
                    <p>AI-guided migration processes for seamless cloud transitions with minimal downtime and maximum efficiency.</p>
                </div>
                <div class="feature-card">
                    <h3>Auto-Scaling Intelligence</h3>
                    <p>Dynamic resource allocation and cost optimization with predictive scaling based on usage patterns.</p>
                </div>
                <div class="feature-card">
                    <h3>Advanced Analytics</h3>
                    <p>Real-time monitoring and insights with ML-powered anomaly detection and performance optimization.</p>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <p>&copy; 2025 SirsiNexus. All rights reserved.</p>
    </footer>
</body>
</html>'''
    
    # Write the clean index.html
    with open('/Users/thekryptodragon/SirsiNexus/docs/index.html', 'w', encoding='utf-8') as f:
        f.write(clean_index)
    
    print("✅ Fixed index.html with clean, working HTML and CSS")

if __name__ == "__main__":
    fix_index()
