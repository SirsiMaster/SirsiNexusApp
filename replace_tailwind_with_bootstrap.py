#!/usr/bin/env python3

import os
import re
import glob

def replace_tailwind_with_bootstrap(file_path):
    """Replace Tailwind CSS with Bootstrap 5 in HTML files."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace Tailwind CSS CDN with Bootstrap 5
        content = re.sub(
            r'<script src="https://cdn\.tailwindcss\.com"></script>',
            '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">\n    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>',
            content
        )
        
        # Remove Tailwind config script
        content = re.sub(
            r'<script>\s*tailwind\.config = \{[^}]*\}[^<]*</script>',
            '',
            content,
            flags=re.DOTALL
        )
        
        # Common class replacements
        class_replacements = {
            # Layout
            'max-w-7xl': 'container-fluid',
            'max-w-6xl': 'container',
            'max-w-4xl': 'container',
            'mx-auto': 'mx-auto',
            'px-6': 'px-4',
            'py-12': 'py-5',
            'py-8': 'py-4',
            'mb-12': 'mb-5',
            'mb-8': 'mb-4',
            'mb-6': 'mb-3',
            'mb-4': 'mb-3',
            'mt-8': 'mt-4',
            'mt-12': 'mt-5',
            
            # Typography
            'text-3xl': 'h1',
            'text-2xl': 'h2',
            'text-xl': 'h3',
            'text-lg': 'h4',
            'font-bold': 'fw-bold',
            'font-semibold': 'fw-semibold',
            'font-medium': 'fw-medium',
            'text-center': 'text-center',
            'text-slate-900': 'text-dark',
            'text-slate-700': 'text-secondary',
            'text-slate-600': 'text-muted',
            'text-slate-300': 'text-light',
            'text-slate-100': 'text-white',
            'text-white': 'text-white',
            
            # Colors
            'bg-white': 'bg-white',
            'bg-slate-900': 'bg-dark',
            'bg-slate-800': 'bg-dark',
            'bg-slate-100': 'bg-light',
            'bg-blue-50': 'bg-primary bg-opacity-10',
            'bg-green-50': 'bg-success bg-opacity-10',
            'bg-emerald-600': 'bg-success',
            'bg-emerald-700': 'bg-success',
            
            # Spacing
            'p-6': 'p-4',
            'p-8': 'p-4',
            'px-4': 'px-3',
            'py-4': 'py-3',
            'gap-8': 'gap-4',
            'gap-6': 'gap-3',
            
            # Borders
            'rounded-lg': 'rounded',
            'rounded-md': 'rounded',
            'border': 'border',
            'border-slate-200': 'border-secondary',
            
            # Flexbox
            'flex': 'd-flex',
            'flex-col': 'flex-column',
            'items-center': 'align-items-center',
            'justify-center': 'justify-content-center',
            'justify-between': 'justify-content-between',
            'flex-wrap': 'flex-wrap',
            
            # Grid
            'grid': 'd-grid',
            'grid-cols-1': 'row-cols-1',
            'grid-cols-2': 'row-cols-2',
            'grid-cols-3': 'row-cols-3',
            'grid-cols-4': 'row-cols-4',
            'md:grid-cols-2': 'row-cols-md-2',
            'lg:grid-cols-3': 'row-cols-lg-3',
            
            # Buttons
            'bg-blue-600': 'btn-primary',
            'bg-green-600': 'btn-success',
            'hover:bg-blue-700': '',
            'hover:bg-green-700': '',
            'px-6 py-2': 'btn',
            'cursor-pointer': '',
            
            # Utilities
            'shadow-lg': 'shadow',
            'shadow-md': 'shadow-sm',
            'transition': '',
            'duration-200': '',
            'transform': '',
            'hover:scale-105': '',
            
            # Dark mode (remove for now)
            'dark:bg-slate-900': '',
            'dark:bg-slate-800': '',
            'dark:text-slate-100': '',
            'dark:text-slate-300': '',
            'dark:border-slate-700': '',
        }
        
        # Apply class replacements
        for old_class, new_class in class_replacements.items():
            if new_class:
                content = content.replace(old_class, new_class)
            else:
                content = content.replace(old_class, '')
        
        # Clean up extra spaces in class attributes
        content = re.sub(r'class="([^"]*)"', lambda m: f'class="{" ".join(m.group(1).split())}"', content)
        
        # Remove empty class attributes
        content = re.sub(r'class=""', '', content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {file_path}")
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
        if replace_tailwind_with_bootstrap(file_path):
            updated_count += 1
    
    print(f"\nUpdated {updated_count} out of {len(html_files)} HTML files")

if __name__ == "__main__":
    main()
