#!/usr/bin/env python3

import os
import re
import glob

def fix_html_entities(file_path):
    """Fix HTML entities in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix HTML entities
        original_content = content
        content = content.replace('&amp;', '&')
        content = content.replace('&lt;', '<')
        content = content.replace('&gt;', '>')
        content = content.replace('&quot;', '"')
        content = content.replace('&apos;', "'")
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {file_path}")
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
        if fix_html_entities(file_path):
            fixed_count += 1
    
    print(f"\nFixed {fixed_count} out of {len(html_files)} HTML files")

if __name__ == "__main__":
    main()
