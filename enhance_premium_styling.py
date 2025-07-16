#!/usr/bin/env python3

import os
import re
import glob

def enhance_premium_styling(file_path):
    """Add premium CSS enhancements with motion graphics and improved headers."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Enhanced premium CSS with motion graphics
        premium_css = '''
    <!-- Premium Enhancement CSS -->
    <style>
        /* Premium Header Enhancements */
        .document-header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%);
            position: relative;
            overflow: hidden;
            padding: 80px 20px;
            margin-bottom: 40px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .document-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.2) 0%, transparent 50%);
            animation: headerGlow 8s ease-in-out infinite alternate;
        }
        
        @keyframes headerGlow {
            0% { opacity: 0.3; transform: scale(1); }
            100% { opacity: 0.7; transform: scale(1.05); }
        }
        
        .document-header h1 {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 15px;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
            color: #ffffff;
            position: relative;
            z-index: 2;
            letter-spacing: -0.02em;
            line-height: 1.1;
        }
        
        .document-header p {
            font-size: 1.4rem;
            opacity: 0.95;
            position: relative;
            z-index: 2;
            font-weight: 400;
            letter-spacing: 0.01em;
        }
        
        /* Premium Glass Morphism Cards */
        .premium-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 30px;
            margin: 20px 0;
            box-shadow: 
                0 8px 32px rgba(0, 0, 0, 0.1),
                0 4px 16px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        .premium-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.5s ease;
        }
        
        .premium-card:hover::before {
            left: 100%;
        }
        
        .premium-card:hover {
            transform: translateY(-5px);
            box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.15),
                0 10px 20px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
        
        /* Enhanced Metrics Grid */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin: 40px 0;
        }
        
        .metric-card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            padding: 35px 25px;
            text-align: center;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        .metric-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 
                0 25px 50px rgba(0, 0, 0, 0.15),
                0 15px 30px rgba(0, 0, 0, 0.1);
        }
        
        .metric-value {
            font-size: 3rem;
            font-weight: 900;
            background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            display: block;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        /* Premium Navigation */
        .document-nav {
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px 30px;
            margin: 20px auto 40px;
            max-width: 1200px;
        }
        
        /* Enhanced Buttons */
        .premium-button {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            border: none;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            padding: 12px 24px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .premium-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
        }
        
        .premium-button:hover::before {
            left: 100%;
        }
        
        .premium-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
        }
        
        /* Improved Spacing */
        .content-section {
            margin: 50px 0;
            padding: 0 20px;
        }
        
        .content-section h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 30px;
            color: #1e293b;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .content-section p {
            font-size: 1.1rem;
            line-height: 1.7;
            color: #475569;
            margin-bottom: 20px;
        }
        
        /* Enhanced Contrast */
        .high-contrast {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border: 1px solid rgba(0, 0, 0, 0.1);
            color: #1e293b;
        }
        
        .dark-contrast {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #f8fafc;
        }
        
        /* Animation Enhancements */
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-in {
            animation: slideInUp 0.6s ease-out forwards;
        }
        
        /* Responsive Improvements */
        @media (max-width: 768px) {
            .document-header h1 {
                font-size: 2.5rem;
            }
            
            .metrics-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .content-section {
                padding: 0 15px;
                margin: 30px 0;
            }
        }
    </style>'''
        
        # Find the closing </head> tag and insert the premium CSS before it
        if '</head>' in content:
            content = content.replace('</head>', f'{premium_css}\n</head>')
        
        # Enhance existing elements with premium classes
        content = re.sub(r'class="([^"]*document-header[^"]*)"', r'class="\1 premium-header"', content)
        content = re.sub(r'class="([^"]*metric-card[^"]*)"', r'class="\1 animate-in"', content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Enhanced premium styling: {file_path}")
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
    
    enhanced_count = 0
    for file_path in html_files:
        if enhance_premium_styling(file_path):
            enhanced_count += 1
    
    print(f"\nEnhanced premium styling on {enhanced_count} out of {len(html_files)} HTML files")

if __name__ == "__main__":
    main()
