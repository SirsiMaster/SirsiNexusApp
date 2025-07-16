#!/usr/bin/env python3

import os
import re
import glob

def fix_body_text_styling(file_path):
    """Fix body text styling for proper readability and contrast."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Find the closing </style> tag and add body text fixes before it
        body_text_fixes = '''
        /* BODY TEXT FIXES - Ensure Readability */
        
        /* Body and Container Improvements */
        body {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
            color: #1e293b !important;
            line-height: 1.6;
        }
        
        /* Main Content Areas */
        .max-w-7xl {
            background: rgba(255, 255, 255, 0.9) !important;
            border-radius: 20px;
            padding: 30px;
            margin: 20px auto;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        
        /* Text Readability */
        p, span, div, td {
            color: #334155 !important;
            font-weight: 400;
            line-height: 1.6;
        }
        
        /* Headings */
        h1, h2, h3, h4, h5, h6 {
            color: #0f172a !important;
            font-weight: 700;
            margin-bottom: 16px;
        }
        
        /* Tables */
        table {
            background: rgba(255, 255, 255, 0.95) !important;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        th {
            background: linear-gradient(135deg, #1e293b 0%, #475569 100%) !important;
            color: #ffffff !important;
            font-weight: 600;
            padding: 16px;
            text-align: left;
        }
        
        td {
            background: rgba(255, 255, 255, 0.9) !important;
            color: #374151 !important;
            padding: 12px 16px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        /* Executive Summary */
        .executive-summary {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
            color: #065f46 !important;
            border: 1px solid rgba(16, 185, 129, 0.2);
        }
        
        .executive-summary h2 {
            color: #065f46 !important;
            font-size: 1.875rem;
            font-weight: 800;
            margin-bottom: 20px;
        }
        
        .executive-summary p {
            color: #047857 !important;
            font-size: 1.1rem;
            line-height: 1.7;
            margin-bottom: 16px;
        }
        
        .executive-summary strong {
            color: #064e3b !important;
            font-weight: 700;
        }
        
        /* Content Sections */
        .content-section {
            background: rgba(255, 255, 255, 0.95) !important;
            border-radius: 16px;
            padding: 32px;
            margin: 24px 0;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }
        
        /* Lists */
        ul, ol {
            color: #374151 !important;
            padding-left: 24px;
        }
        
        li {
            color: #374151 !important;
            margin-bottom: 8px;
            line-height: 1.6;
        }
        
        /* Links */
        a {
            color: #059669 !important;
            text-decoration: none;
            font-weight: 500;
        }
        
        a:hover {
            color: #047857 !important;
            text-decoration: underline;
        }
        
        /* Form Elements */
        input, textarea, select {
            background: rgba(255, 255, 255, 0.9) !important;
            border: 1px solid rgba(0, 0, 0, 0.2) !important;
            color: #374151 !important;
            padding: 12px 16px;
            border-radius: 8px;
        }
        
        /* Buttons */
        button, .btn {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
            color: #ffffff !important;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }
        
        button:hover, .btn:hover {
            background: linear-gradient(135deg, #047857 0%, #059669 100%) !important;
        }
        
        /* Status Indicators */
        .text-emerald-600 {
            color: #059669 !important;
        }
        
        .text-blue-600 {
            color: #2563eb !important;
        }
        
        .text-red-600 {
            color: #dc2626 !important;
        }
        
        .text-yellow-600 {
            color: #d97706 !important;
        }
        
        /* Card Content */
        .bg-white.dark\\:bg-slate-800 {
            background: rgba(255, 255, 255, 0.95) !important;
            color: #334155 !important;
        }
        
        .bg-white.dark\\:bg-slate-800 h3 {
            color: #1e293b !important;
        }
        
        .bg-white.dark\\:bg-slate-800 p {
            color: #475569 !important;
        }
        
        /* Navigation */
        nav a {
            color: #475569 !important;
            font-weight: 500;
        }
        
        nav a:hover {
            color: #1e293b !important;
        }
        
        /* Strong emphasis */
        strong, b {
            color: #1e293b !important;
            font-weight: 700;
        }
        
        /* Code blocks */
        code, pre {
            background: rgba(15, 23, 42, 0.1) !important;
            color: #334155 !important;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Consolas', monospace;
        }
        
        /* Ensure dark mode compatibility */
        @media (prefers-color-scheme: dark) {
            body {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
                color: #e2e8f0 !important;
            }
            
            .max-w-7xl {
                background: rgba(30, 41, 59, 0.9) !important;
            }
            
            p, span, div, td {
                color: #cbd5e1 !important;
            }
            
            h1, h2, h3, h4, h5, h6 {
                color: #f1f5f9 !important;
            }
        }
        
        /* Responsive text sizing */
        @media (max-width: 768px) {
            body {
                font-size: 16px;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            h2 {
                font-size: 1.5rem;
            }
            
            .max-w-7xl {
                padding: 20px;
                margin: 10px;
            }
        }'''
        
        # Insert the body text fixes before the closing </style> tag
        if '</style>' in content:
            content = content.replace('</style>', f'{body_text_fixes}\n    </style>')
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed body text styling: {file_path}")
            return True
        else:
            print(f"No changes needed: {file_path}")
            return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    # Get all HTML files in the docs directory
    html_files = glob.glob('/Users/thekryptodragon/SirsiNexus/docs/**/*.html', recursive=True)
    
    fixed_count = 0
    for file_path in html_files:
        if fix_body_text_styling(file_path):
            fixed_count += 1
    
    print(f"\nFixed body text styling on {fixed_count} out of {len(html_files)} HTML files")

if __name__ == "__main__":
    main()
