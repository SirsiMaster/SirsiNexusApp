#!/usr/bin/env python3
"""
Fast fix for orphaned content divs in HTML files.
Wraps orphaned headings, tables, lists, and paragraphs in proper containers.
"""

import os
import re
import glob

def fix_orphaned_divs(content):
    """Fix orphaned content by wrapping it in proper containers."""
    
    # Simple pattern to find orphaned content after closing divs
    # Look for h1-h6, table, ul, ol, p tags that appear after </div> but before next <div class="max-w-
    pattern = r'(</div>\s*\n)((?:\s*(?:<h[1-6][^>]*>.*?</h[1-6]>|<table[^>]*>.*?</table>|<ul[^>]*>.*?</ul>|<ol[^>]*>.*?</ol>|<p[^>]*>.*?</p>|<div class="highlight-box"[^>]*>.*?</div>)\s*\n?)+)(?=\s*(?:<div class="max-w-|<section|<footer|<script|</body|$))'
    
    def wrap_content(match):
        closing_div = match.group(1)
        orphaned_content = match.group(2).strip()
        
        if orphaned_content:
            # Wrap in container div
            wrapped = f'{closing_div}\n\n    <div class="max-w-7xl mx-auto px-6 mb-12">\n        {orphaned_content}\n    </div>\n\n'
            return wrapped
        
        return match.group(0)
    
    # Apply fix with DOTALL flag for multiline matching
    fixed_content = re.sub(pattern, wrap_content, content, flags=re.DOTALL)
    
    return fixed_content

def process_file(filepath):
    """Process a single HTML file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        fixed_content = fix_orphaned_divs(content)
        
        if fixed_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"✓ Fixed: {os.path.basename(filepath)}")
            return True
        else:
            print(f"- OK: {os.path.basename(filepath)}")
            return False
    
    except Exception as e:
        print(f"✗ Error: {os.path.basename(filepath)} - {e}")
        return False

def main():
    """Process all HTML files in docs directory."""
    docs_dir = "/Users/thekryptodragon/SirsiNexus/docs"
    
    # Get all HTML files
    html_files = glob.glob(os.path.join(docs_dir, "**/*.html"), recursive=True)
    
    print(f"Processing {len(html_files)} HTML files...")
    print("=" * 50)
    
    fixed_count = 0
    
    for html_file in sorted(html_files):
        if process_file(html_file):
            fixed_count += 1
    
    print("=" * 50)
    print(f"Complete! Fixed {fixed_count} files.")

if __name__ == "__main__":
    main()
