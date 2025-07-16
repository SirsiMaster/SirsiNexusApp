#!/usr/bin/env python3
"""
Professional presentation enhancement for investment-ready GitHub Pages.
This script will create a truly polished, high-quality presentation.
"""

import os
import re
from pathlib import Path

PROFESSIONAL_CSS = '''
<style>
/* Professional Investment-Ready Styling */

/* Typography & Font Loading */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* Global Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
    font-size: 16px;
    line-height: 1.5;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1, 'ss01' 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #1a1a1a;
    background-color: #ffffff;
    overflow-x: hidden;
}

/* Professional Typography Scale */
h1, h2, h3, h4, h5, h6 {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: #0a0a0a;
    margin-bottom: 1rem;
}

h1 {
    font-size: clamp(2.5rem, 4vw, 3.5rem);
    font-weight: 800;
    line-height: 1.1;
}

h2 {
    font-size: clamp(2rem, 3vw, 2.75rem);
    font-weight: 700;
    line-height: 1.15;
}

h3 {
    font-size: clamp(1.5rem, 2.5vw, 2rem);
    font-weight: 600;
    line-height: 1.3;
}

h4 {
    font-size: clamp(1.25rem, 2vw, 1.5rem);
    font-weight: 600;
}

p {
    font-size: 1.125rem;
    line-height: 1.7;
    color: #4a4a4a;
    margin-bottom: 1.5rem;
    font-weight: 400;
}

/* Professional Container System */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.section {
    padding: 5rem 0;
}

.section-sm {
    padding: 3rem 0;
}

/* Enhanced Tables */
table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e7eb;
}

th {
    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
    color: #ffffff;
    padding: 1.25rem 1.5rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid #374151;
}

td {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.95rem;
    line-height: 1.6;
    color: #374151;
}

tr:hover {
    background-color: #f8fafc;
    transition: background-color 0.2s ease;
}

tr:last-child td {
    border-bottom: none;
}

/* Professional Lists */
ul, ol {
    margin: 1.5rem 0;
    padding-left: 0;
}

li {
    position: relative;
    padding: 0.75rem 0 0.75rem 2.5rem;
    margin-bottom: 0.5rem;
    line-height: 1.6;
    color: #374151;
    font-size: 1.05rem;
}

ul li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 1.2rem;
    width: 6px;
    height: 6px;
    background: #059669;
    border-radius: 50%;
    transform: translateY(-50%);
}

/* Enhanced Cards */
.card {
    background: #ffffff;
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e7eb;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 2rem;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

/* Professional Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    padding: 0.875rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
}

.btn-primary {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: #ffffff;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #047857 0%, #065f46 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
}

.btn-secondary {
    background: transparent;
    color: #059669;
    border-color: #059669;
}

.btn-secondary:hover {
    background: #059669;
    color: #ffffff;
    transform: translateY(-2px);
}

/* Professional Spacing */
.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 2rem; }
.mb-5 { margin-bottom: 2.5rem; }
.mb-6 { margin-bottom: 3rem; }

.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
.mt-4 { margin-top: 2rem; }
.mt-5 { margin-top: 2.5rem; }
.mt-6 { margin-top: 3rem; }

/* Professional Colors */
.text-primary { color: #059669; }
.text-secondary { color: #6b7280; }
.text-muted { color: #9ca3af; }
.text-dark { color: #1f2937; }

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fadeInUp 0.6s ease-out;
}

/* Responsive Design */
@media (max-width: 768px) {
    .container {
        padding: 0 1rem;
    }
    
    .section {
        padding: 3rem 0;
    }
    
    h1 {
        font-size: 2.5rem;
    }
    
    h2 {
        font-size: 2rem;
    }
    
    h3 {
        font-size: 1.5rem;
    }
    
    p {
        font-size: 1rem;
    }
    
    .card {
        padding: 1.5rem;
    }
    
    table {
        font-size: 0.875rem;
    }
    
    th, td {
        padding: 1rem;
    }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
    body {
        background-color: #0f172a;
        color: #e2e8f0;
    }
    
    h1, h2, h3, h4, h5, h6 {
        color: #f1f5f9;
    }
    
    p {
        color: #cbd5e1;
    }
    
    .card {
        background: #1e293b;
        border-color: #334155;
    }
    
    table {
        background: #1e293b;
        border-color: #334155;
    }
    
    td {
        color: #e2e8f0;
        border-color: #374151;
    }
    
    tr:hover {
        background-color: #334155;
    }
}

/* Print Styles */
@media print {
    * {
        background: transparent !important;
        color: black !important;
        box-shadow: none !important;
        text-shadow: none !important;
    }
    
    .card {
        border: 1px solid #ccc;
        page-break-inside: avoid;
    }
    
    table {
        border-collapse: collapse;
        page-break-inside: avoid;
    }
    
    h1, h2, h3 {
        page-break-after: avoid;
    }
}
</style>
'''

def enhance_html_file(file_path):
    """Enhance a single HTML file with professional styling."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add professional CSS before closing head tag
        if '</head>' in content:
            content = content.replace('</head>', f'{PROFESSIONAL_CSS}\n</head>')
        
        # Enhance HTML structure
        content = re.sub(r'<div class="max-w-7xl mx-auto px-6 mb-12">', 
                        '<div class="container section">', content)
        
        # Add professional classes to existing elements
        content = re.sub(r'<table>', '<table class="professional-table">', content)
        content = re.sub(r'<div class="bg-white[^"]*"', '<div class="card"', content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True
    
    except Exception as e:
        print(f"Error enhancing {file_path}: {e}")
        return False

def main():
    """Enhance all HTML files with professional styling."""
    docs_dir = Path("/Users/thekryptodragon/SirsiNexus/docs")
    
    # Key files to enhance first
    key_files = [
        "index.html",
        "business-case.html", 
        "investor-portal.html",
        "market-analysis.html",
        "product-roadmap.html",
        "documentation.html"
    ]
    
    enhanced_count = 0
    
    print("🎨 Applying professional presentation enhancements...")
    
    # Enhance key files first
    for filename in key_files:
        file_path = docs_dir / filename
        if file_path.exists():
            if enhance_html_file(file_path):
                print(f"✅ Enhanced: {filename}")
                enhanced_count += 1
    
    # Then enhance all other HTML files
    for html_file in docs_dir.rglob("*.html"):
        if html_file.name not in key_files:
            if enhance_html_file(html_file):
                print(f"✅ Enhanced: {html_file.relative_to(docs_dir)}")
                enhanced_count += 1
    
    print(f"\n🎉 Successfully enhanced {enhanced_count} HTML files")
    print("\n✨ Professional enhancements applied:")
    print("   • Typography: Inter font with professional scale")
    print("   • Tables: Enhanced with hover effects and shadows")
    print("   • Cards: Subtle animations and professional spacing")
    print("   • Buttons: Gradient effects with smooth transitions")
    print("   • Responsive: Mobile-optimized breakpoints")
    print("   • Dark mode: Automatic theme detection")
    print("   • Print: Optimized for document generation")

if __name__ == "__main__":
    main()
