#!/usr/bin/env python3
"""
Fix only the CSS issues in index.html while preserving all the rich content
"""

import re

def fix_index_css():
    """Fix CSS issues in index.html while keeping all content"""
    
    with open('/Users/thekryptodragon/SirsiNexus/docs/index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add Tailwind CDN and Font imports at the top
    tailwind_setup = '''<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        'inter': ['Inter', 'sans-serif'],
                    }
                }
            }
        }
    </script>'''
    
    # Add CSS overrides to fix readability issues
    css_fixes = '''
    <style>
        /* Fix readability issues */
        body {
            font-family: 'Inter', sans-serif !important;
            background-color: #ffffff !important;
            color: #1a1a1a !important;
        }
        
        /* Fix any light text on light backgrounds */
        .text-slate-600 { color: #475569 !important; }
        .text-slate-700 { color: #334155 !important; }
        .text-slate-900 { color: #0f172a !important; }
        .text-white { color: #ffffff !important; }
        
        /* Fix dark backgrounds to have white text */
        .bg-slate-800, .bg-slate-900, .bg-gray-800 {
            color: #ffffff !important;
        }
        
        /* Fix any problematic containers */
        .bg-slate-50 { background-color: #f8fafc !important; }
        .bg-white { background-color: #ffffff !important; }
        
        /* Ensure proper text contrast */
        p { color: #334155 !important; }
        h1, h2, h3, h4, h5, h6 { color: #0f172a !important; }
        
        /* Fix navigation */
        nav a { color: #475569 !important; }
        nav a:hover { color: #059669 !important; }
        
        /* Fix buttons */
        .bg-emerald-600 { background-color: #059669 !important; }
        .hover\\:bg-emerald-700:hover { background-color: #047857 !important; }
        
        /* Fix footer */
        footer { background-color: #1f2937 !important; color: #ffffff !important; }
        footer * { color: #ffffff !important; }
    </style>'''
    
    # Find the head section and add our fixes
    if '<head>' in content:
        # Add Tailwind and fonts after opening head tag
        content = content.replace('<head>', f'<head>\n    {tailwind_setup}')
        
        # Add CSS fixes before closing head tag
        content = content.replace('</head>', f'{css_fixes}\n</head>')
    
    # Write the fixed content
    with open('/Users/thekryptodragon/SirsiNexus/docs/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Fixed index.html CSS issues while preserving all content")

if __name__ == "__main__":
    fix_index_css()
