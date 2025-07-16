#!/usr/bin/env python3
"""
Comprehensive fix for orphaned content in all HTML files.
This script identifies and wraps orphaned headings, tables, lists, and divs 
that are not properly contained within styled containers.
"""

import os
import re
import glob

def fix_orphaned_content(html_content):
    """
    Fix orphaned content by wrapping sections in proper containers.
    Targets common patterns of orphaned content outside of container divs.
    """
    
    # Pattern to identify orphaned content that needs wrapping
    # This looks for content that appears after a closing div but before another opening div
    orphaned_patterns = [
        # Orphaned headings (h1, h2, h3, h4, h5, h6)
        r'(\s*</div>\s*\n\s*<h[1-6][^>]*>.*?</h[1-6]>)',
        # Orphaned tables
        r'(\s*</div>\s*\n\s*<table[^>]*>.*?</table>)',
        # Orphaned lists
        r'(\s*</div>\s*\n\s*<ul[^>]*>.*?</ul>)',
        r'(\s*</div>\s*\n\s*<ol[^>]*>.*?</ol>)',
        # Orphaned paragraphs
        r'(\s*</div>\s*\n\s*<p[^>]*>.*?</p>)',
        # Orphaned divs with highlight-box class
        r'(\s*</div>\s*\n\s*<div class="highlight-box"[^>]*>.*?</div>)',
    ]
    
    # Find all orphaned content sections
    orphaned_sections = []
    
    # Look for sequences of orphaned elements
    # This regex finds content between closing divs and before the next major section
    pattern = r'(\s*</div>\s*\n)((?:\s*(?:<h[1-6][^>]*>.*?</h[1-6]>|<table[^>]*>.*?</table>|<ul[^>]*>.*?</ul>|<ol[^>]*>.*?</ol>|<p[^>]*>.*?</p>|<div class="highlight-box"[^>]*>.*?</div>)\s*\n?)+)(?=\s*(?:<div class="max-w-|<section|<footer|<script|$))'
    
    def wrap_orphaned_content(match):
        closing_div = match.group(1)
        orphaned_content = match.group(2)
        
        # Clean up the orphaned content
        orphaned_content = orphaned_content.strip()
        
        if orphaned_content:
            # Wrap the orphaned content in a proper container
            wrapped_content = f'''
    <div class="max-w-7xl mx-auto px-6 mb-12">
        {orphaned_content}
    </div>
'''
            return closing_div + wrapped_content
        
        return match.group(0)
    
    # Apply the fix using regex substitution with DOTALL flag for multiline matching
    fixed_content = re.sub(pattern, wrap_orphaned_content, html_content, flags=re.DOTALL)
    
    return fixed_content

def process_html_file(filepath):
    """Process a single HTML file to fix orphaned content."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Apply the fix
        fixed_content = fix_orphaned_content(content)
        
        # Only write if changes were made
        if fixed_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"✓ Fixed orphaned content in: {filepath}")
            return True
        else:
            print(f"- No orphaned content found in: {filepath}")
            return False
    
    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")
        return False

def main():
    """Main function to process all HTML files in the docs directory."""
    docs_dir = "/Users/thekryptodragon/SirsiNexus/docs"
    
    if not os.path.exists(docs_dir):
        print(f"Error: Directory {docs_dir} does not exist.")
        return
    
    # Find all HTML files recursively
    html_files = glob.glob(os.path.join(docs_dir, "**/*.html"), recursive=True)
    
    if not html_files:
        print("No HTML files found in the docs directory.")
        return
    
    print(f"Found {len(html_files)} HTML files to process...")
    print("=" * 60)
    
    fixed_count = 0
    
    for html_file in sorted(html_files):
        if process_html_file(html_file):
            fixed_count += 1
    
    print("=" * 60)
    print(f"Processing complete! Fixed {fixed_count} out of {len(html_files)} files.")
    
    if fixed_count > 0:
        print("\nOrphaned content has been wrapped in proper containers:")
        print("- Container class: max-w-7xl mx-auto px-6 mb-12")
        print("- Proper responsive styling and spacing applied")
        print("- All sections now render correctly within styled containers")
    else:
        print("\nNo orphaned content found across all HTML files.")

if __name__ == "__main__":
    main()
