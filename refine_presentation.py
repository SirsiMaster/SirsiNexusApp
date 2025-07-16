#!/usr/bin/env python3
"""
Refine and polish the entire presentation for GitHub Pages.
Ensure high-quality typography, spacing, animations, and overall consistency.
"""

import os
import re
from pathlib import Path

# Define CSS improvements and enhancements for high-quality presentation

REFINED_CSS = '''
<style>
    /* Base Styling Enhancements for Consistency and Professionalism */

    /* Typography Scale */
    h1.display-heading {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        line-height: 1.1;
        letter-spacing: -0.02em;
    }

    h2.section-heading {
        font-size: 2.25rem;
        font-weight: 700;
        margin-bottom: 1rem;
        line-height: 1.2;
    }

    h3.subsection-heading {
        font-size: 1.75rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    p.body-text {
        font-size: 1rem;
        line-height: 1.75;
        color: #3b3b3b;
        margin-bottom: 1.25rem;
    }

    /* Spacing Consistency */
    .content-container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 1.5rem;
    }

    .section-container {
        padding: 4rem 0;
    }

    .tight-container {
        max-width: 850px;
        margin: 0 auto;
    }

    /* Table Enhancements */
    .professional-table {
        width: 100%;
        border-collapse: collapse;
        margin: 2rem 0;
    }
    .professional-table th, .professional-table td {
        padding: 1rem;
        border-bottom: 1px solid #e0e0e0;
    }

    /* List Enhancements */
    .professional-list {
        list-style: none;
        padding: 0;
    }
    .professional-list li {
        position: relative;
        padding-left: 2rem;
        margin-bottom: 0.5rem;
    }
    .professional-list li::before {
        content: '✔︎';
        position: absolute;
        left: 0;
        color: #059669;
        font-weight: bold;
    }

    /* Card Design Improvements */
    .enhanced-card {
        background: #ffffff;
        border-radius: 0.75rem;
        padding: 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 1.5rem;
        transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
    }

    .enhanced-card:hover {
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        transform: translateY(-5px);
    }

    /* Font and Color Harmonization */
    body, h1, h2, h3, p {
        font-family: 'Inter', sans-serif;
        color: #333;
    }

    a {
        color: #059669;
        text-decoration: none;
        transition: color 0.2s;
    }

    a:hover {
        color: #047857;
    }

    /* Smooth Scrolling */
    html {
        scroll-behavior: smooth;
    }

    /* Responsive Design Adjustments */
    @media (max-width: 768px) {
        .content-container {
            padding-left: 1rem;
            padding-right: 1rem;
        }

        .section-container {
            padding: 3rem 0;
        }

        h1.display-heading {
            font-size: 2.5rem;
        }
        h2.section-heading {
            font-size: 2rem;
        }
        h3.subsection-heading {
            font-size: 1.5rem;
        }
    }

    /* Print Styles for Documents */
    @media print {
        .enhanced-card {
            box-shadow: none;
            border: 1px solid #e0e0e0;
        }
    }
</style>
'''

# Function to enhance HTML with refined CSS and improved structure

def enhance_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Insert refined CSS before the closing </head> tag
    if '</head>' in content:
        content = content.replace('</head>', REFINED_CSS + '\n</head>')

    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

    return file_path

# Function to apply enhancements across all HTML files

def apply_enhancements(directory):
    html_files = Path(directory).rglob('*.html')
    enhanced_files = []

    for html_file in html_files:
        enhanced_files.append(enhance_html(html_file))

    return enhanced_files

# Main function to execute refinements

def main():
    directory = "/Users/thekryptodragon/SirsiNexus/docs"

    if not os.path.exists(directory):
        print(f"Directory {directory} does not exist.")
        return

    print("Applying refinements across all HTML files...")
    enhanced_files = apply_enhancements(directory)

    print("Enhancements applied to the following files:")
    for file in enhanced_files:
        print(f"- {file}")

    print("All files refined for high-quality, professional presentation.")

if __name__ == "__main__":
    main()

