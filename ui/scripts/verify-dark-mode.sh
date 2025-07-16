#!/bin/bash

# Script to verify dark mode implementation across SirsiNexus frontend pages
echo "🌓 Verifying dark mode implementation across SirsiNexus frontend..."
echo

# Pages to check
PAGES=(
    "src/app/page.tsx"
    "src/app/analytics/page.tsx"
    "src/app/migration/page.tsx" 
    "src/app/optimization/page.tsx"
    "src/app/security/page.tsx"
    "src/app/team/page.tsx"
    "src/app/ai-orchestration/page.tsx"
    "src/app/scaling/page.tsx"
    "src/app/console/page.tsx"
)

# Function to check for common dark mode issues
check_dark_mode() {
    local file="$1"
    local issues=0
    
    echo "📄 Checking: $file"
    
    if [[ ! -f "$file" ]]; then
        echo "  ❌ File not found"
        return 1
    fi
    
    # Check for hardcoded white backgrounds
    if grep -q "bg-white[^-]" "$file" && ! grep -q "dark:bg-" "$file"; then
        echo "  ⚠️  Found bg-white without dark: variant"
        issues=$((issues + 1))
    fi
    
    # Check for hardcoded text colors without dark variants
    if grep -q "text-gray-900" "$file" && ! grep -q "dark:text-gray-100" "$file"; then
        echo "  ⚠️  Found text-gray-900 without dark:text-gray-100"
        issues=$((issues + 1))
    fi
    
    # Check for border colors without dark variants
    if grep -q "border-gray-200" "$file" && ! grep -q "dark:border-gray-700" "$file"; then
        echo "  ⚠️  Found border-gray-200 without dark:border-gray-700"
        issues=$((issues + 1))
    fi
    
    # Check for light gradients without dark variants
    if grep -q "from-.*-50\|to-.*-50" "$file" && ! grep -q "dark:from-\|dark:to-" "$file"; then
        echo "  ⚠️  Found light gradient without dark variant"
        issues=$((issues + 1))
    fi
    
    # Check for proper dark mode implementation patterns
    if grep -q "dark:" "$file"; then
        echo "  ✅ Dark mode classes found"
    else
        echo "  ❌ No dark mode classes found"
        issues=$((issues + 1))
    fi
    
    if [[ $issues -eq 0 ]]; then
        echo "  ✅ No issues found"
    else
        echo "  ❌ Found $issues potential issues"
    fi
    
    echo
    return $issues
}

# Check CSS file for dark mode support
echo "🎨 Checking global CSS for dark mode support..."
CSS_FILE="src/app/globals.css"
if [[ -f "$CSS_FILE" ]]; then
    if grep -q "@apply.*dark:" "$CSS_FILE" || grep -q "\.dark " "$CSS_FILE"; then
        echo "  ✅ Dark mode CSS classes found"
    else
        echo "  ⚠️  Limited dark mode CSS support found"
    fi
else
    echo "  ❌ Global CSS file not found"
fi
echo

# Check each page
total_issues=0
for page in "${PAGES[@]}"; do
    check_dark_mode "$page"
    total_issues=$((total_issues + $?))
done

# Summary
echo "📊 Summary:"
echo "  Total pages checked: ${#PAGES[@]}"
echo "  Total issues found: $total_issues"

if [[ $total_issues -eq 0 ]]; then
    echo "  🎉 All pages appear to have proper dark mode support!"
else
    echo "  ⚠️  Some pages may need dark mode improvements"
fi

echo
echo "🔧 Manual verification steps:"
echo "  1. Run 'npm run dev' to start the development server"
echo "  2. Toggle dark mode using the theme switcher"
echo "  3. Navigate through all pages to verify visual consistency"
echo "  4. Check for text readability and proper contrast"
echo "  5. Verify hover states work in both light and dark modes"
