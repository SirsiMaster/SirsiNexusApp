#!/usr/bin/env python3

import os
import re
import glob

def fix_header_styling(file_path):
    """Fix header styling to target the correct HTML structure."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace the existing premium CSS with corrected selectors
        # First, let's find and replace the document-header styles
        
        # Find the premium CSS section and replace it
        css_pattern = r'(<!-- Premium Enhancement CSS -->.*?</style>)'
        
        new_premium_css = '''<!-- Premium Enhancement CSS -->
    <style>
        /* Premium Page Title Section Enhancement */
        .bg-slate-50.dark\\:bg-slate-800.py-12 {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%) !important;
            position: relative;
            overflow: hidden;
            padding: 80px 20px !important;
            margin-bottom: 40px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .bg-slate-50.dark\\:bg-slate-800.py-12::before {
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
        
        /* Enhanced Page Title */
        .bg-slate-50.dark\\:bg-slate-800.py-12 h1 {
            font-size: 3.5rem !important;
            font-weight: 800 !important;
            margin-bottom: 25px !important;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2) !important;
            color: #ffffff !important;
            position: relative;
            z-index: 2;
            letter-spacing: -0.02em;
            line-height: 1.1;
        }
        
        .bg-slate-50.dark\\:bg-slate-800.py-12 p {
            font-size: 1.4rem !important;
            opacity: 0.95;
            position: relative;
            z-index: 2;
            font-weight: 400;
            letter-spacing: 0.01em;
            color: #e2e8f0 !important;
        }
        
        .bg-slate-50.dark\\:bg-slate-800.py-12 .text-center div {
            position: relative;
            z-index: 2;
        }
        
        .bg-slate-50.dark\\:bg-slate-800.py-12 .text-center div span {
            color: #cbd5e1 !important;
        }
        
        /* Premium Navigation Header */
        header.bg-white.dark\\:bg-gray-800\\/95 {
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(20px) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
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
        
        /* Enhanced Content Cards */
        .bg-white.dark\\:bg-slate-800.rounded-lg {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 16px !important;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        .bg-white.dark\\:bg-slate-800.rounded-lg:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 
                0 25px 50px rgba(0, 0, 0, 0.15),
                0 15px 30px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Enhanced Metric Values */
        .text-2xl.font-bold.text-emerald-600,
        .text-2xl.font-bold.text-blue-600,
        .text-2xl.font-bold.text-purple-600,
        .text-2xl.font-bold.text-orange-600,
        .text-2xl.font-bold.text-indigo-600,
        .text-2xl.font-bold.text-rose-600 {
            font-size: 2.5rem !important;
            font-weight: 900 !important;
            background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Enhanced Executive Summary */
        .executive-summary {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px !important;
            padding: 40px !important;
            margin: 40px auto !important;
            max-width: 1200px;
            box-shadow: 
                0 8px 32px rgba(0, 0, 0, 0.1),
                0 4px 16px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
            position: relative;
            overflow: hidden;
        }
        
        .executive-summary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.5s ease;
        }
        
        .executive-summary:hover::before {
            left: 100%;
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
        
        /* Body Enhancement */
        body {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
        }
        
        /* Responsive Improvements */
        @media (max-width: 768px) {
            .bg-slate-50.dark\\:bg-slate-800.py-12 h1 {
                font-size: 2.5rem !important;
            }
            
            .bg-slate-50.dark\\:bg-slate-800.py-12 p {
                font-size: 1.2rem !important;
            }
        }
    </style>'''
        
        # Replace the entire CSS block
        if re.search(css_pattern, content, re.DOTALL):
            content = re.sub(css_pattern, new_premium_css, content, flags=re.DOTALL)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed header styling: {file_path}")
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
    
    fixed_count = 0
    for file_path in html_files:
        if fix_header_styling(file_path):
            fixed_count += 1
    
    print(f"\nFixed header styling on {fixed_count} out of {len(html_files)} HTML files")

if __name__ == "__main__":
    main()
