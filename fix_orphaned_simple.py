#!/usr/bin/env python3
"""
Simple fix for orphaned content in HTML files.
Targets specific patterns without complex regex.
"""

import os
import glob

def fix_business_case_orphans(content):
    """Fix orphaned content in business case files."""
    
    # Look for the specific orphaned sections we know about
    orphaned_markers = [
        '<h3>Quantified Business Impact</h3>',
        '<h2>Market Validation</h2>',
        '<h1>SirsiNexus Solution Value Proposition</h1>',
        '<h2>Competitive Advantages</h2>',
        '<h3>Competitive Differentiation Against AI Infrastructure Startups</h3>'
    ]
    
    for marker in orphaned_markers:
        # Find the marker and check if it's orphaned (not inside a container div)
        if marker in content:
            # Split content at the marker
            parts = content.split(marker, 1)
            if len(parts) == 2:
                before, after = parts
                
                # Check if this marker is orphaned (comes after </div> without container)
                if before.strip().endswith('</div>') and not before.strip().endswith('</div>\n    <div class="max-w-7xl mx-auto px-6 mb-12">'):
                    # Find the end of the orphaned section
                    # Look for the next container div or major section
                    end_markers = ['<div class="max-w-7xl', '<section', '<footer', '<script', '</body']
                    
                    end_pos = len(after)
                    for end_marker in end_markers:
                        pos = after.find(end_marker)
                        if pos != -1 and pos < end_pos:
                            end_pos = pos
                    
                    # Extract the orphaned content
                    orphaned_content = after[:end_pos].strip()
                    remaining_content = after[end_pos:]
                    
                    # Wrap the orphaned content
                    wrapped_content = f'''
    <div class="max-w-7xl mx-auto px-6 mb-12">
        {marker}
        {orphaned_content}
    </div>

'''
                    
                    # Reconstruct the content
                    content = before + wrapped_content + remaining_content
    
    return content

def process_file(filepath):
    """Process a single HTML file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        fixed_content = fix_business_case_orphans(original_content)
        
        if fixed_content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"✓ Fixed orphaned content in: {os.path.basename(filepath)}")
            return True
        else:
            print(f"- No orphaned content in: {os.path.basename(filepath)}")
            return False
    
    except Exception as e:
        print(f"✗ Error processing {os.path.basename(filepath)}: {e}")
        return False

def main():
    """Process all HTML files in docs directory."""
    docs_dir = "/Users/thekryptodragon/SirsiNexus/docs"
    
    # Get all HTML files
    html_files = glob.glob(os.path.join(docs_dir, "**/*.html"), recursive=True)
    
    print(f"Processing {len(html_files)} HTML files...")
    print("=" * 60)
    
    fixed_count = 0
    
    for html_file in sorted(html_files):
        if process_file(html_file):
            fixed_count += 1
    
    print("=" * 60)
    print(f"Processing complete! Fixed {fixed_count} files.")
    print("\nOrphaned content sections have been wrapped in proper containers.")

if __name__ == "__main__":
    main()
