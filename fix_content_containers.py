#!/usr/bin/env python3

import os
import re
import glob

def fix_content_containers(file_path):
    """Fix content that's sitting outside of proper containers."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Find content that's outside of containers and wrap it
        patterns_to_fix = [
            # Pattern 1: Headings and content outside of containers
            (r'(\s*</div>\s*\n\s*<h[1-6][^>]*>.*?</h[1-6]>\s*\n\s*<(?:table|ul|ol|p|div)[^>]*>)', 
             r'\1'),
            
            # Pattern 2: Tables outside containers
            (r'(\s*</div>\s*\n\s*<h[1-6][^>]*>.*?</h[1-6]>\s*\n\s*<table>)',
             r'\1'),
        ]
        
        # More specific fix - wrap the problematic content
        # Look for the specific pattern where content is outside containers
        
        # Fix the "Quantified Business Impact" section
        quantified_pattern = r'(\s*</div>\s*\n\s*<h3>Quantified Business Impact</h3>\s*\n\s*<table>.*?</table>)'
        if re.search(quantified_pattern, content, re.DOTALL):
            replacement = r'''
    <div class="max-w-7xl mx-auto px-6 mb-12">
        <h3 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Quantified Business Impact</h3>
        <table class="w-full border-collapse border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <thead>
                <tr>
                    <th class="bg-slate-900 dark:bg-slate-800 text-white p-4 text-left">Challenge</th>
                    <th class="bg-slate-900 dark:bg-slate-800 text-white p-4 text-left">Frequency</th>
                    <th class="bg-slate-900 dark:bg-slate-800 text-white p-4 text-left">Annual Cost Impact</th>
                    <th class="bg-slate-900 dark:bg-slate-800 text-white p-4 text-left">Current Solutions</th>
                    <th class="bg-slate-900 dark:bg-slate-800 text-white p-4 text-left">Effectiveness</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Over-provisioned Resources</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">85% of enterprises</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">$840K annually (avg)</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Manual rightsizing</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">15% reduction max</td>
                </tr>
                <tr>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Unused/Idle Instances</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">92% of enterprises</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">$560K annually (avg)</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Scheduled automation</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">30% reduction max</td>
                </tr>
                <tr>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Multi-Cloud Complexity</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">78% of enterprises</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">$420K in overhead (avg)</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Multiple tools</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Limited effectiveness</td>
                </tr>
                <tr>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Reactive Incident Response</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">100% of enterprises</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">$380K annually (avg)</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Manual monitoring</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Post-incident only</td>
                </tr>
            </tbody>
        </table>
    </div>'''
            
            content = re.sub(
                r'(\s*</div>\s*\n\s*<h3>Quantified Business Impact</h3>\s*\n\s*<table>.*?</table>)',
                replacement,
                content,
                flags=re.DOTALL
            )
        
        # Fix the "Market Validation" section
        market_validation_pattern = r'(\s*<h2>Market Validation</h2>\s*\n\s*<p>.*?</p>\s*\n\s*<ul>.*?</ul>)'
        if re.search(market_validation_pattern, content, re.DOTALL):
            replacement = r'''
    <div class="max-w-7xl mx-auto px-6 mb-12">
        <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Market Validation</h2>
        <p class="text-slate-700 dark:text-slate-300 mb-6">Extensive market research and customer interviews confirm significant demand for intelligent cloud optimization solutions:</p>
        
        <ul class="space-y-4 text-slate-700 dark:text-slate-300">
            <li><strong>Survey Results:</strong> 89% of IT decision makers actively seeking AI-powered cloud optimization (n=340)</li>
            <li><strong>Budget Allocation:</strong> Average enterprise budgets $240K annually for cloud optimization tools</li>
            <li><strong>Decision Timeline:</strong> 73% plan to implement solution within 12 months</li>
            <li><strong>Key Success Metrics:</strong> Cost reduction (89%), operational efficiency (67%), compliance (45%)</li>
        </ul>
    </div>'''
            
            content = re.sub(
                r'(\s*<h2>Market Validation</h2>\s*\n\s*<p>.*?</p>\s*\n\s*<ul>.*?</ul>)',
                replacement,
                content,
                flags=re.DOTALL
            )
        
        # Fix the "SirsiNexus Solution Value Proposition" section
        solution_pattern = r'(\s*<h1>SirsiNexus Solution Value Proposition</h1>\s*\n\s*<h2>Competitive Advantages</h2>.*?<h3>Competitive Differentiation Against AI Infrastructure Startups</h3>\s*\n\s*<table>.*?</table>)'
        if re.search(solution_pattern, content, re.DOTALL):
            replacement = r'''
    <div class="max-w-7xl mx-auto px-6 mb-12">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8 text-center">SirsiNexus Solution Value Proposition</h1>
        
        <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Competitive Advantages</h2>
        
        <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 mb-8">
            <strong class="text-slate-900 dark:text-slate-100">Unique Value Proposition:</strong> First natural language-driven cloud hypervisor with intuitive GUI interface, eliminating the need for specialized scripting knowledge while delivering genuine AI-powered optimization and predictive analytics.
        </div>

        <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Competitive Differentiation Against AI Infrastructure Startups</h3>
        <table class="w-full border-collapse border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <thead>
                <tr>
                    <th class="bg-slate-900 dark:bg-slate-800 text-white p-4 text-left">Capability</th>
                    <th class="bg-slate-900 dark:bg-slate-800 text-white p-4 text-left">SirsiNexus</th>
                    <th class="bg-slate-900 dark:bg-slate-800 text-white p-4 text-left">Pulumi</th>
                    <th class="bg-slate-900 dark:bg-slate-800 text-white p-4 text-left">OpsCanvas</th>
                    <th class="bg-slate-900 dark:bg-slate-800 text-white p-4 text-left">Base44</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Natural Language Interface</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✓ Plain English commands</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ Code-based only</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ Traditional UI</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ Script-driven</td>
                </tr>
                <tr>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Visual GUI Management</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✓ Intuitive drag-and-drop</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ Code editor only</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✓ Basic dashboards</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ Command line focus</td>
                </tr>
                <tr>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">AI-Powered Optimization</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✓ GPT-4 + Claude integration</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ Static code analysis</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ Rule-based alerts</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ Manual automation</td>
                </tr>
                <tr>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Predictive Analytics</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✓ 6-month cost forecasting</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ No forecasting</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ Historical only</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ Reactive monitoring</td>
                </tr>
                <tr>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Multi-Cloud Orchestration</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✓ Unified platform</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✓ Multi-cloud support</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✓ Limited providers</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✓ Manual integration</td>
                </tr>
                <tr>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Learning Curve</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✓ Immediate productivity</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ Requires programming</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✓ Moderate learning</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ Expert-level required</td>
                </tr>
                <tr>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">Business-Technical Alignment</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✓ Stakeholder-friendly UI</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ Technical teams only</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✓ Limited business views</td>
                    <td class="p-4 border-b border-slate-200 dark:border-slate-700">✗ Technical focus only</td>
                </tr>
            </tbody>
        </table>
    </div>'''
            
            content = re.sub(
                r'(\s*<h1>SirsiNexus Solution Value Proposition</h1>\s*\n\s*<h2>Competitive Advantages</h2>.*?<h3>Competitive Differentiation Against AI Infrastructure Startups</h3>\s*\n\s*<table>.*?</table>)',
                replacement,
                content,
                flags=re.DOTALL
            )
        
        # Fix the "Customer Value Proposition" section
        customer_value_pattern = r'(\s*<h2>Customer Value Proposition</h2>\s*\n\s*<div class="success-box">.*?</div>)'
        if re.search(customer_value_pattern, content, re.DOTALL):
            replacement = r'''
    <div class="max-w-7xl mx-auto px-6 mb-12">
        <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Customer Value Proposition</h2>
        
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <strong class="text-slate-900 dark:text-slate-100">Market Validation:</strong> Extensive customer interviews and market research confirm strong demand for natural language-driven cloud management solutions, with enterprise decision-makers prioritizing intuitive interfaces over complex scripting systems.
        </div>
    </div>'''
            
            content = re.sub(
                r'(\s*<h2>Customer Value Proposition</h2>\s*\n\s*<div class="success-box">.*?</div>)',
                replacement,
                content,
                flags=re.DOTALL
            )
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed content containers: {file_path}")
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
        if fix_content_containers(file_path):
            fixed_count += 1
    
    print(f"\nFixed content containers on {fixed_count} out of {len(html_files)} HTML files")

if __name__ == "__main__":
    main()
