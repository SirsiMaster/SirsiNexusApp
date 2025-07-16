#!/usr/bin/env python3
"""
Enhanced presentation script for investment-ready GitHub Pages.
Comprehensive styling improvements for professional presentation.
"""

import os
import re
import glob
from pathlib import Path

def add_enhanced_css(content):
    """Add comprehensive enhanced CSS for professional presentation."""
    
    # Enhanced CSS to be added after existing styles
    enhanced_css = '''
    <style>
        /* Investment-Ready Professional Styling */
        
        /* Base Typography */
        .font-inter {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-feature-settings: "cv03", "cv04", "cv11";
            font-variation-settings: "slnt" 0;
        }
        
        /* Enhanced Headers */
        .enhanced-header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
            position: relative;
            overflow: hidden;
        }
        
        .enhanced-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
            pointer-events: none;
        }
        
        /* Professional Typography Scale */
        .display-heading {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 700;
            line-height: 1.1;
            letter-spacing: -0.02em;
            margin-bottom: 1.5rem;
        }
        
        .section-heading {
            font-size: clamp(1.875rem, 4vw, 2.5rem);
            font-weight: 600;
            line-height: 1.2;
            letter-spacing: -0.01em;
            margin-bottom: 1rem;
        }
        
        .subsection-heading {
            font-size: clamp(1.25rem, 3vw, 1.5rem);
            font-weight: 600;
            line-height: 1.3;
            margin-bottom: 0.75rem;
        }
        
        .body-text {
            font-size: 1.125rem;
            line-height: 1.7;
            letter-spacing: 0.01em;
            margin-bottom: 1.5rem;
        }
        
        /* Enhanced Containers */
        .content-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        .section-container {
            padding: 4rem 0;
        }
        
        .tight-container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        /* Professional Tables */
        .professional-table {
            width: 100%;
            border-collapse: collapse;
            margin: 2rem 0;
            background: white;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .professional-table th {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 1rem 1.5rem;
            text-align: left;
            font-weight: 600;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .professional-table td {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.875rem;
            line-height: 1.5;
        }
        
        .professional-table tr:hover {
            background: #f8fafc;
        }
        
        /* Dark mode table styles */
        .dark .professional-table {
            background: #1e293b;
        }
        
        .dark .professional-table td {
            border-bottom-color: #334155;
            color: #e2e8f0;
        }
        
        .dark .professional-table tr:hover {
            background: #334155;
        }
        
        /* Enhanced Lists */
        .professional-list {
            list-style: none;
            padding: 0;
            margin: 1.5rem 0;
        }
        
        .professional-list li {
            position: relative;
            padding: 0.75rem 0 0.75rem 2rem;
            border-bottom: 1px solid #e2e8f0;
            font-size: 1rem;
            line-height: 1.6;
        }
        
        .professional-list li::before {
            content: '✓';
            position: absolute;
            left: 0;
            top: 0.75rem;
            width: 1.25rem;
            height: 1.25rem;
            background: #10b981;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        /* Card Enhancements */
        .enhanced-card {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
            margin-bottom: 2rem;
            transition: all 0.3s ease;
        }
        
        .enhanced-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .dark .enhanced-card {
            background: #1e293b;
            border-color: #334155;
        }
        
        /* Spacing Utilities */
        .section-padding {
            padding: 5rem 0;
        }
        
        .content-padding {
            padding: 3rem 0;
        }
        
        .tight-padding {
            padding: 2rem 0;
        }
        
        /* Professional Metrics */
        .metric-highlight {
            font-size: 3rem;
            font-weight: 700;
            color: #10b981;
            line-height: 1;
            margin-bottom: 0.5rem;
        }
        
        .metric-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .content-container {
                padding: 0 1rem;
            }
            
            .section-container {
                padding: 2rem 0;
            }
            
            .enhanced-card {
                padding: 1.5rem;
            }
            
            .professional-table th,
            .professional-table td {
                padding: 0.75rem;
            }
        }
        
        /* Print Styles */
        @media print {
            .enhanced-header {
                background: #1e293b !important;
                color: white !important;
            }
            
            .professional-table {
                break-inside: avoid;
            }
            
            .enhanced-card {
                break-inside: avoid;
                box-shadow: none;
                border: 1px solid #e2e8f0;
            }
        }
    </style>
    '''
    
    # Find the closing </head> tag and insert enhanced CSS before it
    head_close_pattern = r'</head>'
    if re.search(head_close_pattern, content):
        content = re.sub(head_close_pattern, enhanced_css + '\n</head>', content)
    
    return content

def enhance_html_structure(content):
    """Enhance HTML structure for better presentation."""
    
    # Fix table classes
    content = re.sub(r'<table>', '<table class="professional-table">', content)
    content = re.sub(r'<table([^>]*)>', r'<table class="professional-table"\1>', content)
    
    # Fix list classes
    content = re.sub(r'<ul>', '<ul class="professional-list">', content)
    content = re.sub(r'<ul([^>]*)>', r'<ul class="professional-list"\1>', content)
    
    # Enhance headings
    content = re.sub(r'<h1([^>]*)>', r'<h1 class="display-heading"\1>', content)
    content = re.sub(r'<h2([^>]*)>', r'<h2 class="section-heading"\1>', content)
    content = re.sub(r'<h3([^>]*)>', r'<h3 class="subsection-heading"\1>', content)
    
    # Enhance paragraphs
    content = re.sub(r'<p([^>]*)>', r'<p class="body-text"\1>', content)
    
    # Fix container classes
    content = re.sub(r'class="max-w-7xl mx-auto px-6 mb-12"', 
                     'class="content-container section-container"', content)
    
    # Add enhanced card classes to existing cards
    content = re.sub(r'class="bg-white dark:bg-slate-800([^"]*)"', 
                     r'class="enhanced-card\1"', content)
    
    return content

def process_html_file(filepath):
    """Process a single HTML file for presentation enhancement."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        # Apply enhancements
        enhanced_content = add_enhanced_css(original_content)
        enhanced_content = enhance_html_structure(enhanced_content)
        
        # Only write if changes were made
        if enhanced_content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(enhanced_content)
            return True
        
        return False
    
    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")
        return False

def main():
    """Process all HTML files for investment-ready presentation."""
    docs_dir = Path("/Users/thekryptodragon/SirsiNexus/docs")
    
    if not docs_dir.exists():
        print(f"Error: Directory {docs_dir} does not exist.")
        return
    
    # Find all HTML files recursively
    html_files = list(docs_dir.glob("**/*.html"))
    
    if not html_files:
        print("No HTML files found in the docs directory.")
        return
    
    print(f"Enhancing presentation for {len(html_files)} HTML files...")
    print("=" * 70)
    
    enhanced_files = []
    
    for html_file in sorted(html_files):
        relative_path = html_file.relative_to(docs_dir)
        
        if process_html_file(html_file):
            print(f"✓ Enhanced presentation for: {relative_path}")
            enhanced_files.append(str(relative_path))
        else:
            print(f"- No changes needed for: {relative_path}")
    
    print("=" * 70)
    print(f"Presentation enhancement complete! {len(enhanced_files)} files updated.")
    
    if enhanced_files:
        print("\nFiles enhanced for investment-ready presentation:")
        for file in enhanced_files:
            print(f"  • {file}")
        
        print("\nEnhancements applied:")
        print("  • Professional typography scale with optimal spacing")
        print("  • Enhanced table styling with hover effects")
        print("  • Improved card design with subtle animations")
        print("  • Responsive design for all devices")
        print("  • Professional color scheme and contrast")
        print("  • Print-optimized styles for document generation")
        
        print(f"\nReady to commit and push {len(enhanced_files)} enhanced files.")

if __name__ == "__main__":
    main()
