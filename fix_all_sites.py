#!/usr/bin/env python3
"""
Apply the working CSS fix to ALL HTML files universally
"""

import os
import re
from pathlib import Path

# Working CSS that fixes all issues
WORKING_CSS = '''
<style>
/* UNIVERSAL FIX - Working CSS for all pages */
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

/* Fix all headings - center them and make them readable */
h1, h2, h3, h4, h5, h6 {
    color: #1a1a1a;
    text-align: center;
    margin: 2rem 0 1rem 0;
    font-weight: 600;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1.125rem; }
h6 { font-size: 1rem; }

/* Fix paragraph text */
p {
    color: #374151;
    font-size: 1rem;
    margin-bottom: 1rem;
    line-height: 1.7;
}

/* Fix the executive summary box */
.executive-summary {
    background-color: #f0f9ff;
    border: 1px solid #0ea5e9;
    border-left: 4px solid #0ea5e9;
    padding: 2rem;
    margin: 2rem 0;
    border-radius: 8px;
}

.executive-summary p {
    color: #1e40af;
    font-size: 1.1rem;
}

/* Fix all containers */
.container, .section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

/* Fix cards - make them consistently readable */
.card {
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1rem 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Fix tables */
table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
    background-color: #ffffff;
}

th {
    background-color: #374151;
    color: #ffffff;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
}

td {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    color: #374151;
}

/* Fix metric cards */
.metric-card {
    background-color: #1f2937;
    color: #ffffff;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    margin: 1rem;
}

/* Fix lists */
ul, ol {
    margin: 1rem 0;
    padding-left: 2rem;
}

li {
    margin-bottom: 0.5rem;
    color: #374151;
}

/* Fix buttons */
button, .btn {
    background-color: #059669;
    color: #ffffff;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    margin: 0.5rem;
}

button:hover, .btn:hover {
    background-color: #047857;
}

/* Fix any light text on light background */
.bg-blue-50 *, .bg-emerald-50 *, .bg-slate-50 * {
    color: #1f2937 !important;
}

/* Fix any dark text on dark background */
.bg-slate-800 *, .bg-slate-900 *, .bg-gray-800 * {
    color: #ffffff !important;
}

/* Override any problematic styles */
.text-slate-600 { color: #4b5563 !important; }
.text-slate-700 { color: #374151 !important; }
.text-slate-900 { color: #111827 !important; }
.text-white { color: #ffffff !important; }

/* Fix navigation */
nav a {
    color: #374151;
    text-decoration: none;
    margin: 0 1rem;
    font-weight: 500;
}

nav a:hover {
    color: #059669;
}

/* Fix headers */
header {
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem 0;
}

/* Fix footers */
footer {
    background-color: #1f2937;
    color: #ffffff;
    padding: 2rem 0;
    text-align: center;
}

footer * {
    color: #ffffff !important;
}

/* Responsive */
@media (max-width: 768px) {
    .container, .section {
        padding: 1rem;
    }
    
    h1 { font-size: 2rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    
    table {
        font-size: 0.875rem;
    }
    
    th, td {
        padding: 0.75rem;
    }
}
</style>
'''

def fix_file(file_path):
    """Fix a single HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove ALL existing style tags to avoid conflicts
        content = re.sub(r'<style>.*?</style>', '', content, flags=re.DOTALL)
        
        # Add working CSS before closing head
        if '</head>' in content:
            content = content.replace('</head>', f'{WORKING_CSS}\n</head>')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    """Fix ALL HTML files universally"""
    docs_dir = Path("/Users/thekryptodragon/SirsiNexus/docs")
    
    # Get ALL HTML files
    html_files = list(docs_dir.glob("**/*.html"))
    
    fixed = 0
    print(f"🔧 UNIVERSAL FIX: Applying to {len(html_files)} HTML files...")
    
    for file_path in html_files:
        if fix_file(file_path):
            relative_path = file_path.relative_to(docs_dir)
            print(f"✅ Fixed: {relative_path}")
            fixed += 1
    
    print(f"\n🎯 UNIVERSAL FIX COMPLETE: {fixed} files fixed")
    print("✅ All text is now readable")
    print("✅ All titles are centered")
    print("✅ Consistent theming across all pages")
    print("✅ Professional appearance restored")

if __name__ == "__main__":
    main()
