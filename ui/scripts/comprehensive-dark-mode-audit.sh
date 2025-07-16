#!/bin/bash

# Comprehensive Dark Mode Audit for ALL SirsiNexus Pages
echo "🌓 Comprehensive Dark Mode Audit - ALL Pages"
echo "=============================================="
echo

# Get all page.tsx files
PAGES=($(find src -name "page.tsx" | sort))

echo "Found ${#PAGES[@]} pages to audit:"
for page in "${PAGES[@]}"; do
    echo "  - $page"
done
echo

# Function to check for dark mode compliance
check_dark_mode() {
    local file="$1"
    local issues=0
    local warnings=()
    
    echo "📄 Checking: $file"
    
    if [[ ! -f "$file" ]]; then
        echo "  ❌ File not found"
        return 1
    fi
    
    # Check for basic dark mode classes
    if ! grep -q "dark:" "$file"; then
        warnings+=("No dark: classes found")
        issues=$((issues + 1))
    fi
    
    # Check for hardcoded light backgrounds without dark variants
    if grep -q "bg-white[^-]" "$file" && ! grep -q "dark:bg-" "$file"; then
        warnings+=("bg-white without dark variant")
        issues=$((issues + 1))
    fi
    
    # Check for hardcoded light text without dark variants
    if grep -q "text-gray-900" "$file" && ! grep -q "dark:text-gray-100\|dark:text-white" "$file"; then
        warnings+=("text-gray-900 without dark variant")
        issues=$((issues + 1))
    fi
    
    # Check for light borders without dark variants
    if grep -q "border-gray-200" "$file" && ! grep -q "dark:border-gray-700\|dark:border-gray-600" "$file"; then
        warnings+=("border-gray-200 without dark variant")
        issues=$((issues + 1))
    fi
    
    # Check for light gradients without dark variants
    if grep -q "from-.*-50\|to-.*-50\|from-.*-100\|to-.*-100" "$file" && ! grep -q "dark:from-\|dark:to-" "$file"; then
        warnings+=("Light gradient without dark variant")
        issues=$((issues + 1))
    fi
    
    # Check for cards and containers
    if grep -q "bg-gray-50\|bg-gray-100" "$file" && ! grep -q "dark:bg-gray-800\|dark:bg-gray-900" "$file"; then
        warnings+=("Light container background without dark variant")
        issues=$((issues + 1))
    fi
    
    # Display results
    if [ $issues -eq 0 ]; then
        echo "  ✅ No issues found"
    else
        echo "  ❌ Found $issues issues:"
        for warning in "${warnings[@]}"; do
            echo "    - $warning"
        done
    fi
    
    echo
    return $issues
}

# Check each page
total_issues=0
problematic_pages=()

for page in "${PAGES[@]}"; do
    check_dark_mode "$page"
    page_issues=$?
    total_issues=$((total_issues + page_issues))
    
    if [ $page_issues -gt 0 ]; then
        problematic_pages+=("$page")
    fi
done

# Summary
echo "📊 COMPREHENSIVE AUDIT SUMMARY:"
echo "=============================="
echo "  Total pages checked: ${#PAGES[@]}"
echo "  Pages with issues: ${#problematic_pages[@]}"
echo "  Total issues found: $total_issues"
echo

if [ ${#problematic_pages[@]} -gt 0 ]; then
    echo "🚨 PAGES NEEDING DARK MODE FIXES:"
    for page in "${problematic_pages[@]}"; do
        echo "  - $page"
    done
    echo
fi

if [ $total_issues -eq 0 ]; then
    echo "🎉 ALL PAGES HAVE PROPER DARK MODE SUPPORT!"
else
    echo "⚠️  DARK MODE IMPLEMENTATION IS INCOMPLETE"
    echo "   ${#problematic_pages[@]} pages need attention"
fi

echo
echo "🔧 Next steps:"
echo "  1. Fix the pages listed above"
echo "  2. Test with theme toggle in browser"
echo "  3. Verify all cards, buttons, and text are readable"
echo "  4. Re-run this audit to confirm fixes"
