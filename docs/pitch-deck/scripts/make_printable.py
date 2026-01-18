import os
import re
from bs4 import BeautifulSoup
import copy

# Configuration
SOURCE_FILE = 'sirsi-nvidia-deck.html'
OUTPUT_FILE = 'all-slides.html'

def main():
    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')

    # Find visible slides
    slides = [s for s in soup.find_all('div', class_='slide') if 'display: none' not in str(s.get('style', ''))]
    print(f"Found {len(slides)} visible slides.")

    # Create new printable page
    print_soup = BeautifulSoup("<!DOCTYPE html><html><head></head><body><div class='presentation-print'></div></body></html>", 'html.parser')
    
    # Copy styling from source
    # We want to keep the style block but override some things
    head = soup.head
    print_soup.html.insert(0, head)
    
    # Add print-specific overrides to the head
    style_override = print_soup.new_tag('style')
    style_override.string = """
        body { margin: 0; padding: 0; background: white; overflow: visible; height: auto; }
        .presentation-print { width: 100%; max-width: 1400px; margin: 0 auto; }
        .slide {
            position: relative !important;
            opacity: 1 !important;
            visibility: visible !important;
            display: flex !important;
            width: 100% !important;
            height: auto !important;
            min-height: 800px; /* Ensure logical height */
            page-break-after: always;
            break-after: page;
            border-bottom: 2px dashed #eee; /* Visual separator for web view */
            margin-bottom: 0px !important;
            top: auto !important; 
            left: auto !important;
            padding: 40px 20px !important;
        }
        .slide-header, .progress, .nav-buttons, .slide-badge, .logo-badge { display: none !important; }
        @media print {
            .slide { 
                border-bottom: none; 
                height: 100vh !important; 
                page-break-after: always;
            }
        }
    """
    print_soup.head.append(style_override)

    container = print_soup.find('div', class_='presentation-print')
    
    for slide in slides:
        slide_clone = copy.copy(slide)
        # Ensure styles are clean
        # Remove any inline display:none if strictly present (though we filtered)
        container.append(slide_clone)

    # Copy Chart.js scripts if needed
    for script in soup.find_all('script'):
        if script.get('src') and 'chart.js' in script.get('src'):
            print_soup.body.append(script)
        elif script.string and 'new Chart' in script.string:
            # We need to make sure the chart script runs.
            # The canvas ID might duplicate if we had multiple? No, source has one slide 12.
            print_soup.body.append(script)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(str(print_soup))
    
    print(f"Generated {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
