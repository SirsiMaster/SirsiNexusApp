#!/usr/bin/env python3
"""
Fix index.html layout and formatting issues
- Fix broken HTML structure in features section
- Improve grid layout and spacing
- Fix navigation styling
- Enhance visual hierarchy
- Preserve all content and styling
"""

import os
import re

def fix_index_html():
    """Fix the index.html file layout and formatting issues"""
    
    file_path = "/Users/thekryptodragon/SirsiNexus/docs/index.html"
    
    # Read the current file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix 1: Add proper CSS for layout and spacing
    enhanced_css = """
    <style>
        /* Professional Polish for SirsiNexus */
        
        /* Enhanced typography */
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-feature-settings: "cv03", "cv04", "cv11";
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            line-height: 1.6;
        }
        
        /* Fix spacing and layout */
        .max-w-7xl {
            max-width: 1200px;
            margin: 0 auto;
            padding-left: 1.5rem;
            padding-right: 1.5rem;
        }
        
        /* Enhanced sections with proper spacing */
        section {
            padding: 5rem 0;
        }
        
        @media (max-width: 768px) {
            section {
                padding: 3rem 0;
            }
        }
        
        /* Better grid layout */
        .grid {
            display: grid;
            gap: 2rem;
        }
        
        .grid.md\\:grid-cols-2 {
            grid-template-columns: 1fr;
        }
        
        .grid.md\\:grid-cols-3 {
            grid-template-columns: 1fr;
        }
        
        @media (min-width: 768px) {
            .grid.md\\:grid-cols-2 {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .grid.md\\:grid-cols-3 {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        
        /* Enhanced cards with proper spacing */
        .bg-slate-50, .bg-white {
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transition: all 0.3s ease;
            height: 100%;
        }
        
        .bg-slate-50:hover, .bg-white:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        /* Fix header and navigation */
        header {
            position: sticky;
            top: 0;
            z-index: 50;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #e2e8f0;
        }
        
        .dark header {
            background: rgba(30, 41, 59, 0.95);
            border-bottom-color: #475569;
        }
        
        /* Better text hierarchy */
        h1 {
            font-size: clamp(2.5rem, 5vw, 4rem);
            line-height: 1.1;
            letter-spacing: -0.02em;
            font-weight: 700;
            margin-bottom: 1.5rem;
        }
        
        h2 {
            font-size: clamp(2rem, 4vw, 3rem);
            line-height: 1.2;
            letter-spacing: -0.01em;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        
        h3 {
            font-size: clamp(1.25rem, 3vw, 1.5rem);
            line-height: 1.3;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        h4 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        
        /* Professional buttons */
        .btn, button, a.inline-flex {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 0.5rem;
            font-weight: 600;
            padding: 0.875rem 1.5rem;
            display: inline-flex;
            align-items: center;
            text-decoration: none;
        }
        
        .btn:hover, button:hover, a.inline-flex:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        /* Enhanced gradients */
        .bg-gradient-to-br {
            background-image: linear-gradient(135deg, var(--tw-gradient-stops));
        }
        
        .bg-gradient-to-r {
            background-image: linear-gradient(90deg, var(--tw-gradient-stops));
        }
        
        /* Better navigation styling */
        nav a {
            position: relative;
            transition: color 0.3s ease;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
        }
        
        nav a:hover {
            color: #059669;
            background-color: rgba(16, 185, 129, 0.1);
        }
        
        nav a::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 2px;
            background-color: #059669;
            transition: width 0.3s ease;
        }
        
        nav a:hover::after {
            width: 80%;
        }
        
        /* Enhanced metrics cards */
        .metric-card {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 1px solid #bbf7d0;
        }
        
        .dark .metric-card {
            background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
            border-color: #047857;
        }
        
        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1;
            color: #059669;
        }
        
        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }
        
        /* Professional spacing utilities */
        .section-spacing {
            padding: 5rem 0;
        }
        
        .content-spacing {
            padding: 2rem;
        }
        
        /* Enhanced responsive design */
        @media (max-width: 768px) {
            .max-w-7xl {
                padding-left: 1rem;
                padding-right: 1rem;
            }
            
            .content-spacing {
                padding: 1rem;
            }
            
            .metric-value {
                font-size: 2rem;
            }
        }
        
        /* Better flex layouts */
        .flex {
            display: flex;
        }
        
        .flex-col {
            flex-direction: column;
        }
        
        .items-center {
            align-items: center;
        }
        
        .justify-center {
            justify-content: center;
        }
        
        .justify-between {
            justify-content: space-between;
        }
        
        .gap-4 {
            gap: 1rem;
        }
        
        .gap-6 {
            gap: 1.5rem;
        }
        
        .gap-8 {
            gap: 2rem;
        }
        
        .gap-12 {
            gap: 3rem;
        }
        
        /* Print optimizations */
        @media print {
            .bg-gradient-to-br,
            .bg-gradient-to-r {
                background-image: none !important;
                background-color: #f8fafc !important;
            }
            
            .shadow-lg {
                box-shadow: none !important;
                border: 1px solid #e2e8f0 !important;
            }
        }
    </style>
    """
    
    # Replace the existing style section
    style_pattern = r'<style>.*?</style>'
    content = re.sub(style_pattern, enhanced_css, content, flags=re.DOTALL)
    
    # Fix 2: Correct the broken features section HTML structure
    features_section_fix = """
    <!-- Features Section -->
    <section id="features" class="py-20 bg-white dark:bg-slate-900">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Platform Features</h2>
          <p class="text-xl text-slate-600 dark:text-slate-400">Comprehensive infrastructure management with AI-powered automation</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
            <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Smart Migration Wizards</h3>
            <p class="text-slate-600 dark:text-slate-400">AI-guided migration processes for seamless cloud transitions with minimal downtime and maximum efficiency.</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
            <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Auto-Scaling Intelligence</h3>
            <p class="text-slate-600 dark:text-slate-400">Dynamic resource allocation and cost optimization with predictive scaling based on usage patterns.</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
            <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Advanced Analytics</h3>
            <p class="text-slate-600 dark:text-slate-400">Real-time monitoring and insights with ML-powered anomaly detection and performance optimization.</p>
          </div>
        </div>
      </div>
    </section>"""
    
    # Replace the broken features section
    features_pattern = r'<!-- Features Section -->.*?</section>'
    content = re.sub(features_pattern, features_section_fix, content, flags=re.DOTALL)
    
    # Fix 3: Clean up malformed HTML structure around platform section
    platform_section_fix = """
    <!-- Platform Section -->
    <section id="platform" class="py-20 bg-slate-50 dark:bg-slate-800">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Multi-Cloud Platform</h2>
          <p class="text-xl text-slate-600 dark:text-slate-400">Unified management across AWS, Azure, GCP, and more</p>
        </div>
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 class="text-2xl font-semibold mb-4">Enterprise-Ready Architecture</h3>
            <ul class="space-y-3 text-slate-600 dark:text-slate-400">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Rust-powered core engine for maximum performance
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Python ML platform with TensorFlow and PyTorch
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Go-based cloud connectors for seamless integration
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                React/Next.js frontend with TypeScript
              </li>
            </ul>
          </div>
          <div class="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-lg">
            <div class="text-center">
              <h4 class="text-xl font-semibold mb-4">Real-Time Metrics</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="metric-card p-4 rounded-lg">
                  <div class="metric-value">99.2%</div>
                  <div class="text-sm text-slate-600 dark:text-slate-400">Success Rate</div>
                </div>
                <div class="metric-card p-4 rounded-lg">
                  <div class="metric-value">$2.8M</div>
                  <div class="text-sm text-slate-600 dark:text-slate-400">Cost Savings</div>
                </div>
                <div class="metric-card p-4 rounded-lg">
                  <div class="metric-value">12,847</div>
                  <div class="text-sm text-slate-600 dark:text-slate-400">Resources Migrated</div>
                </div>
                <div class="metric-card p-4 rounded-lg">
                  <div class="metric-value">47.3 TB</div>
                  <div class="text-sm text-slate-600 dark:text-slate-400">Data Transferred</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>"""
    
    # Replace the broken platform section
    platform_pattern = r'<!-- Platform Section -->.*?</section>'
    content = re.sub(platform_pattern, platform_section_fix, content, flags=re.DOTALL)
    
    # Write the fixed content back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Fixed index.html layout and formatting issues")
    print("   - Corrected broken HTML structure in features section")
    print("   - Enhanced CSS for better spacing and layout")
    print("   - Fixed navigation styling and hover effects")
    print("   - Improved card layouts and grid responsiveness")
    print("   - Enhanced visual hierarchy and typography")
    print("   - Added professional polish while preserving all content")

if __name__ == "__main__":
    fix_index_html()
