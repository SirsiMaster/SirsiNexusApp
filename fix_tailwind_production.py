#!/usr/bin/env python3

import os
import re
import glob

def fix_tailwind_production(file_path):
    """Replace Tailwind CSS CDN with production version."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace Tailwind CDN with production build
        content = re.sub(
            r'<script src="https://cdn\.tailwindcss\.com"></script>',
            '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">',
            content
        )
        
        # Remove Tailwind config script since we're using production build
        content = re.sub(
            r'<script>\s*tailwind\.config = \{[^}]*\}[^<]*</script>',
            '',
            content,
            flags=re.DOTALL
        )
        
        # Clean up extra newlines
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
        
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
        if fix_tailwind_production(file_path):
            fixed_count += 1
    
    print(f"\nFixed {fixed_count} out of {len(html_files)} HTML files")

if __name__ == "__main__":
    main()
