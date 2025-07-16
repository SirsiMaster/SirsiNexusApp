#!/usr/bin/env python3
"""
Refine HTML and CSS styling across all GitHub Pages.
Enhance typography, spacing, and layout for a polished presentation.
"""

import os
import re
import glob
from pathlib import Path

# Function to refine HTML and CSS

def refine_html_css(content):
    """Refine HTML and CSS for better presentation."""
    
    # Define replacements for typography improvements
    typography_replacements = {
        # Headings
        r'h1 class="[^"]*"': 'h1 class="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-slate-100"',
        r'h2 class="[^"]*"': 'h2 class="text-3xl font-semibold mb-4 text-slate-900 dark:text-slate-100"',
        r'h3 class="[^"]*"': 'h3 class="text-2xl font-semibold mb-3 text-slate-700 dark:text-slate-300"',
        # Paragraphs
        r'p class="[^"]*"': 'p class="text-lg mb-4 text-slate-600 dark:text-slate-400"',
    }
    
    # Define replacements for spacing adjustments
    spacing_replacements = {
        # Sections
        r'py-[0-9]+': 'py-16',
        r'mb-[0-9]+': 'mb-8',
        r'px-[0-9]+': 'px-8',
        # Divs
        r'(mx|ml|mr|mb|mt)-[0-9]+': '\1-6',
    }
    
    # Apply typography improvements
    for pattern, replacement in typography_replacements.items():
        content = re.sub(pattern, replacement, content)
    
    # Apply spacing adjustments
    for pattern, replacement in spacing_replacements.items():
        content = re.sub(pattern, replacement, content)
    
    # Add Tailwind responsive container to major sections
    responsive_containers = r'csection id="[^"]*" class="[^"]*"e'
    content = re.sub(responsive_containers, lambda m: m.group().replace('class="', 'class="container '), content)
    
    return content

# Function to process HTML file

def process_html_file(filepath):
    """Process a single HTML file for styling refinement."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        # Apply HTML and CSS refinement
        refined_content = refine_html_css(original_content)
        
        # Only write if changes were made
        if refined_content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(refined_content)
            return True
        
        return False

    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")
        return False

# Main function
def main():
    """Process all HTML files in the docs directory for styling enhancement."""
    docs_dir = Path("/Users/thekryptodragon/SirsiNexus/docs")
    
    if not docs_dir.exists():
        print(f"Error: Directory {docs_dir} does not exist.")
        return
    
    # Find all HTML files recursively
    html_files = list(docs_dir.glob("**/*.html"))
    
    if not html_files:
        print("No HTML files found in the docs directory.")
        return
    
    print(f"Refining styling for {len(html_files)} HTML files...")
    print("=" * 70)
    
    refined_files = []
    
    for html_file in html_files:
        if process_html_file(html_file):
            print(f"✓ Styling refined in: {html_file.relative_to(docs_dir)}")
            refined_files.append(str(html_file.relative_to(docs_dir)))
        else:
            print(f"- No changes needed for: {html_file.relative_to(docs_dir)}")
    
    print("=" * 70)
    print(f"Styling refinement complete! {len(refined_files)} files updated.")

    if refined_files:
        print("\nFiles refined for styling update:")
        for file in refined_files:
            print(f"  • {file}")

if __name__ == "__main__":
    main()

