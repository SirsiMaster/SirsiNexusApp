import os
import re
from bs4 import BeautifulSoup

# Configuration
SOURCE_FILE = 'sirsi-nvidia-deck.html'
OUTPUT_DIR = 'nvidia-deck-site'
CSS_FILE = os.path.join(OUTPUT_DIR, 'css', 'style.css')
ASSETS_DIR = os.path.join(OUTPUT_DIR, 'assets')

def main():
    # 1. Read Source
    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')

    # 2. Extract CSS
    style_content = ""
    style_tags = soup.find_all('style')
    for style in style_tags:
        if style.string:
            style_content += style.string + "\n"
    
    # Add navigation styling for the static site
    style_content += """
    /* Static Navigation Styling */
    .static-nav {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 10px 20px;
        border-radius: 30px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        display: flex;
        gap: 15px;
        align-items: center;
        z-index: 1000;
        font-family: 'Inter', sans-serif;
    }
    .static-nav a {
        text-decoration: none;
        color: #333;
        font-weight: 600;
        font-size: 14px;
        padding: 5px 10px;
        border-radius: 15px;
        transition: background 0.2s;
    }
    .static-nav a:hover {
        background: #f0f0f0;
    }
    .static-nav .page-num {
        color: #888;
        font-size: 14px;
        font-weight: 500;
    }
    .static-nav .disabled {
        color: #ccc;
        pointer-events: none;
    }
    @media print {
        .static-nav { display: none; }
    }
    """

    with open(CSS_FILE, 'w', encoding='utf-8') as f:
        f.write(style_content)
    print(f"CSS extracted to {CSS_FILE}")

    # 3. Process Slides
    # We find all divs with class="slide" that are not hidden
    slides = [s for s in soup.find_all('div', class_='slide') if 'display: none' not in str(s.get('style', ''))]
    
    total_slides = len(slides)
    print(f"Found {total_slides} visible slides.")

    # Base HTML template
    # We need to preserve the head but remove the style tags we extracted
    head = soup.head
    for s in head.find_all('style'):
        s.decompose()
    
    # Add link to new CSS
    link_tag = soup.new_tag("link", rel="stylesheet", href="css/style.css")
    head.append(link_tag)
    
    # Also need Chart.js if present in the head or body
    # It usually is scripts. We'll handle scripts by including them in the footer or keeping head scripts.

    for i, slide in enumerate(slides):
        slide_num = i + 1
        prev_num = slide_num - 1 if slide_num > 1 else None
        next_num = slide_num + 1 if slide_num < total_slides else None
        
        filename = "index.html" if slide_num == 1 else f"slide-{slide_num:02d}.html"
        prev_link = ("index.html" if prev_num == 1 else f"slide-{prev_num:02d}.html") if prev_num else "#"
        next_link = ("index.html" if next_num == 1 else f"slide-{next_num:02d}.html") if next_num else "#"

        # Create new soup for this page
        page_soup = BeautifulSoup("<!DOCTYPE html><html></html>", 'html.parser')
        page_soup.html.append(head)
        
        body = page_soup.new_tag("body")
        
        # Presentation wrapper
        presentation = page_soup.new_tag("div", **{'class': 'presentation'})
        
        # Make sure the slide is visible (remove any display: none or JS hiding logic from inline style if any)
        # Actually the scrape logic filtered those out, but let's be safe.
        # We need to ensure the slide is displayed. The CSS makes .slide hidden by default? 
        # No, in standard CSS .slide is block usually, but our JS made them hidden.
        # Let's check Global CSS. .slide { display: none; } is likely set for JS to toggle.
        # We need to override this for the specific slide on THIS page.
        # We'll add an inline style display: flex to the slide.
        
        # Copy the slide
        import copy
        slide_copy = copy.copy(slide)
        
        # Force display flex
        existing_style = slide_copy.get('style', '')
        slide_copy['style'] = existing_style + "; display: flex !important; opacity: 1 !important;"
        
        presentation.append(slide_copy)
        
        # Navigation controls (Static)
        nav_div = page_soup.new_tag("div", **{'class': 'static-nav'})
        
        prev_a = page_soup.new_tag("a", href=prev_link)
        prev_a.string = "Previous"
        if not prev_num: prev_a['class'] = "disabled"
        nav_div.append(prev_a)
        
        count_span = page_soup.new_tag("span", **{'class': 'page-num'})
        count_span.string = f"{slide_num} / {total_slides}"
        nav_div.append(count_span)
        
        next_a = page_soup.new_tag("a", href=next_link)
        next_a.string = "Next"
        if not next_num: next_a['class'] = "disabled"
        nav_div.append(next_a)
        
        body.append(presentation)
        body.append(nav_div)
        
        # Add scripts if needed (Chart.js for slide 12)
        # We should copy all scripts from the original body 
        # BUT remove the logic that controls the slideshow since we are doing MPA.
        # Check for Canvas
        if slide_copy.find('canvas'):
            # It needs chart.js and the specific chart initialization script.
            # We'll simplisticly copy all scripts but comment out the slideshow logic if possible?
            # Or just rely on the fact that chart.js initialization code is likely separate.
            # In sirsi-nvidia-deck.html, scripts are at the end.
            
            # Let's assume we need the CDN link for Chart.js
            chart_script = soup.find('script', src=re.compile('chart.js'))
            if chart_script:
                body.append(chart_script)
            
            # And the initialization script. We'll grab the script tag that contains "new Chart".
            for script in soup.find_all('script'):
                if script.string and 'new Chart' in script.string:
                    body.append(script)
        
        page_soup.html.append(body)
        
        output_path = os.path.join(OUTPUT_DIR, filename)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(str(page_soup))
            
        print(f"Generated {filename}")

if __name__ == "__main__":
    main()
