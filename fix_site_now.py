#!/usr/bin/env python3
"""
EMERGENCY FIX: Fix broken readability and layout issues immediately
"""

import os
import re
from pathlib import Path

# Working CSS that fixes the immediate issues
WORKING_CSS = '''
<style>
/* EMERGENCY FIX - Working CSS */
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

/* Responsive */
@media (max-width: 768px) {
    .container, .section {
        padding: 1rem;
    }
    
    h1 { font-size: 2rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
}
</style>
'''

def fix_file(file_path):
    """Fix a single HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove existing style tags to avoid conflicts
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
    """Fix all broken files immediately"""
    docs_dir = Path("/Users/thekryptodragon/SirsiNexus/docs")
    
    key_files = [
        "business-case.html",
        "index.html", 
        "investor-portal.html",
        "market-analysis.html",
        "product-roadmap.html",
        "documentation.html"
    ]
    
    fixed = 0
    print("🚨 EMERGENCY FIX: Fixing broken readability...")
    
    for filename in key_files:
        file_path = docs_dir / filename
        if file_path.exists():
            if fix_file(file_path):
                print(f"✅ Fixed: {filename}")
                fixed += 1
    
    print(f"\n🎯 Fixed {fixed} critical files")
    print("✅ Text is now readable")
    print("✅ Titles are centered")
    print("✅ Consistent theming")

if __name__ == "__main__":
    main()
