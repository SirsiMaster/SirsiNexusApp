#!/usr/bin/env python3

import os
import re
import glob

def fix_css_issues(file_path):
    """Fix CSS issues in HTML files."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix broken CSS properties
        content = content.replace('display: d-flex;', 'display: flex;')
        content = content.replace('d-flex-wrap: wrap;', 'flex-wrap: wrap;')
        content = content.replace('d-grid-template-columns:', 'grid-template-columns:')
        content = content.replace('text-: uppercase;', 'text-transform: uppercase;')
        content = content.replace(': all 0.2s;', 'transition: all 0.2s;')
        content = content.replace('display: d-grid;', 'display: grid;')
        
        # Fix broken class names in CSS
        content = content.replace('.metrics-d-grid', '.metrics-grid')
        content = content.replace('.nav-actions {\\n        display: d-flex;', '.nav-actions {\\n        display: flex;')
        content = content.replace('.breadcrumb {\\n        display: d-flex;', '.breadcrumb {\\n        display: flex;')
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed CSS issues in: {file_path}")
            return True
        else:
            print(f"No CSS issues found in: {file_path}")
            return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    # Get all HTML files in the docs directory
    html_files = glob.glob('/Users/thekryptodragon/SirsiNexus/docs/**/*.html', recursive=True)
    
    fixed_count = 0
    for file_path in html_files:
        if fix_css_issues(file_path):
            fixed_count += 1
    
    print(f"\nFixed CSS issues in {fixed_count} out of {len(html_files)} HTML files")

if __name__ == "__main__":
    main()
