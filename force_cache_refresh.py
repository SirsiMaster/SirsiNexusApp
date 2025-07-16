#!/usr/bin/env python3

import os
import re
import glob
import time

def add_cache_buster(file_path):
    """Add cache-busting timestamp to HTML files."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add timestamp to cache buster comment
        timestamp = str(int(time.time()))
        
        # Replace existing cache buster or add new one
        if 'Cache buster:' in content:
            content = re.sub(r'Cache buster: [^\s]*', f'Cache buster: v{timestamp}', content)
        else:
            # Add after the viewport meta tag
            content = re.sub(
                r'(<meta name="viewport"[^>]*>)',
                f'\\1\n    <!-- Cache buster: v{timestamp} -->',
                content
            )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Added cache buster to: {file_path}")
        return True
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    # Get all HTML files in the docs directory
    html_files = glob.glob('/Users/thekryptodragon/SirsiNexus/docs/**/*.html', recursive=True)
    
    updated_count = 0
    for file_path in html_files:
        if add_cache_buster(file_path):
            updated_count += 1
    
    print(f"\nUpdated {updated_count} out of {len(html_files)} HTML files")

if __name__ == "__main__":
    main()
