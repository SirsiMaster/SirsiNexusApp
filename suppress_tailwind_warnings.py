#!/usr/bin/env python3

import os
import re
import glob

def suppress_tailwind_warnings(file_path):
    """Add console warning suppression while keeping all styling intact."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Add console warning suppression right after the Tailwind CDN script
        tailwind_script_pattern = r'(<script src="https://cdn\.tailwindcss\.com"></script>)'
        
        if re.search(tailwind_script_pattern, content):
            # Add console warning suppression script
            suppression_script = '''<script src="https://cdn.tailwindcss.com"></script>
    <script>
        // Suppress Tailwind CDN production warnings
        const originalConsole = console.warn;
        console.warn = function(message, ...args) {
            if (typeof message === 'string' && message.includes('should not be used in production')) {
                return; // Suppress this specific warning
            }
            originalConsole.apply(console, [message, ...args]);
        };
    </script>'''
            
            content = re.sub(tailwind_script_pattern, suppression_script, content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Added warning suppression to: {file_path}")
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
    
    updated_count = 0
    for file_path in html_files:
        if suppress_tailwind_warnings(file_path):
            updated_count += 1
    
    print(f"\nAdded warning suppression to {updated_count} out of {len(html_files)} HTML files")

if __name__ == "__main__":
    main()
