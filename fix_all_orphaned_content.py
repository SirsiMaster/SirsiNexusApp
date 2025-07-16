#!/usr/bin/env python3
"""
Comprehensive fix for orphaned content across all HTML files in GitHub Pages.
This script identifies and wraps orphaned content (headings, tables, lists, paragraphs)
that appears outside of proper container divs.
"""

import os
import re
import glob
from pathlib import Path

def has_orphaned_content(content):
    """Check if content has orphaned elements that need fixing."""
    # Look for patterns where content appears after </div> without proper container
    orphaned_patterns = [
        r'</div>\s*\n\s*<h[1-6][^>]*>',  # Orphaned headings
        r'</div>\s*\n\s*<table[^>]*>',   # Orphaned tables
        r'</div>\s*\n\s*<ul[^>]*>',      # Orphaned unordered lists
        r'</div>\s*\n\s*<ol[^>]*>',      # Orphaned ordered lists
        r'</div>\s*\n\s*<p[^>]*>',       # Orphaned paragraphs
        r'</div>\s*\n\s*<div class="highlight-box"', # Orphaned highlight boxes
    ]
    
    for pattern in orphaned_patterns:
        if re.search(pattern, content, re.MULTILINE):
            return True
    return False

def fix_orphaned_content(content):
    """Fix orphaned content by wrapping it in proper containers."""
    
    # Split content into lines for easier processing
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        fixed_lines.append(line)
        
        # Check if this line is a closing div
        if line.strip() == '</div>':
            # Look ahead to see if there's orphaned content
            j = i + 1
            orphaned_content = []
            
            # Skip empty lines
            while j < len(lines) and lines[j].strip() == '':
                orphaned_content.append(lines[j])
                j += 1
            
            # Check if next non-empty line is orphaned content
            if j < len(lines):
                next_line = lines[j].strip()
                
                # Check if it's an orphaned element
                is_orphaned = (
                    next_line.startswith('<h') or
                    next_line.startswith('<table') or
                    next_line.startswith('<ul') or
                    next_line.startswith('<ol') or
                    next_line.startswith('<p') or
                    next_line.startswith('<div class="highlight-box"')
                )
                
                # Also check if it's NOT already in a container
                already_in_container = (
                    next_line.startswith('<div class="max-w-7xl') or
                    next_line.startswith('<section') or
                    next_line.startswith('<footer') or
                    next_line.startswith('<script') or
                    next_line.startswith('</body')
                )
                
                if is_orphaned and not already_in_container:
                    # Collect all orphaned content until we hit a container or end
                    orphaned_content.append(lines[j])
                    k = j + 1
                    
                    # Continue collecting until we find a container div or major section
                    while k < len(lines):
                        line_content = lines[k].strip()
                        
                        # Stop if we hit a container or major section
                        if (line_content.startswith('<div class="max-w-7xl') or
                            line_content.startswith('<section') or
                            line_content.startswith('<footer') or
                            line_content.startswith('<script') or
                            line_content.startswith('</body') or
                            line_content.startswith('</html')):
                            break
                        
                        orphaned_content.append(lines[k])
                        k += 1
                    
                    # If we found orphaned content, wrap it
                    if orphaned_content:
                        fixed_lines.append('')
                        fixed_lines.append('    <div class="max-w-7xl mx-auto px-6 mb-12">')
                        
                        # Add the orphaned content with proper indentation
                        for orphaned_line in orphaned_content:
                            if orphaned_line.strip():
                                fixed_lines.append('        ' + orphaned_line.strip())
                            else:
                                fixed_lines.append(orphaned_line)
                        
                        fixed_lines.append('    </div>')
                        fixed_lines.append('')
                        
                        # Skip the processed lines
                        i = k - 1
        
        i += 1
    
    return '\n'.join(fixed_lines)

def process_html_file(filepath):
    """Process a single HTML file to fix orphaned content."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        # Check if file has orphaned content
        if not has_orphaned_content(original_content):
            return False
        
        # Apply fixes
        fixed_content = fix_orphaned_content(original_content)
        
        # Only write if changes were made
        if fixed_content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True
        
        return False
    
    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")
        return False

def main():
    """Process all HTML files in the docs directory."""
    docs_dir = Path("/Users/thekryptodragon/SirsiNexus/docs")
    
    if not docs_dir.exists():
        print(f"Error: Directory {docs_dir} does not exist.")
        return
    
    # Find all HTML files recursively
    html_files = list(docs_dir.glob("**/*.html"))
    
    if not html_files:
        print("No HTML files found in the docs directory.")
        return
    
    print(f"Scanning {len(html_files)} HTML files for orphaned content...")
    print("=" * 70)
    
    fixed_files = []
    
    for html_file in sorted(html_files):
        relative_path = html_file.relative_to(docs_dir)
        
        if process_html_file(html_file):
            print(f"✓ Fixed orphaned content in: {relative_path}")
            fixed_files.append(str(relative_path))
        else:
            print(f"- No orphaned content found in: {relative_path}")
    
    print("=" * 70)
    print(f"Processing complete! Fixed {len(fixed_files)} out of {len(html_files)} files.")
    
    if fixed_files:
        print("\nFiles with orphaned content that were fixed:")
        for file in fixed_files:
            print(f"  • {file}")
        
        print("\nAll orphaned content has been wrapped in proper containers:")
        print("  • Container class: max-w-7xl mx-auto px-6 mb-12")
        print("  • Proper responsive styling and spacing applied")
        print("  • Content now renders correctly within styled containers")
        
        print(f"\nReady to commit and push {len(fixed_files)} fixed files.")
    else:
        print("\nNo orphaned content found across all HTML files.")

if __name__ == "__main__":
    main()
