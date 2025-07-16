#!/bin/bash

# Complete Dark Mode Validation Script for SirsiNexus
echo "🌓 Complete Dark Mode Validation - SirsiNexus v0.5.5"
echo "===================================================="
echo

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Start validation
echo "🔍 Starting comprehensive dark mode validation..."
echo

# 1. Check theme provider setup
echo "📋 1. Theme Provider Configuration"
echo "=================================="

if grep -q "ThemeProvider" src/app/providers.tsx; then
    print_success "ThemeProvider found in providers.tsx"
else
    print_error "ThemeProvider not found in providers.tsx"
fi

if grep -q "next-themes" package.json; then
    print_success "next-themes dependency found"
else
    print_error "next-themes dependency missing"
fi

# Check theme provider configuration
if grep -q 'attribute="class"' src/app/providers.tsx; then
    print_success "Theme provider configured for class-based themes"
else
    print_warning "Theme provider may not be configured correctly"
fi

echo

# 2. Check layout for proper theme handling
echo "📋 2. Root Layout Theme Configuration"
echo "===================================="

if grep -q "suppressHydrationWarning" src/app/layout.tsx; then
    print_success "Hydration warning suppression found"
else
    print_warning "Missing suppressHydrationWarning in layout"
fi

if grep -q "dark:bg-" src/app/layout.tsx; then
    print_success "Dark mode background classes found in layout"
else
    print_error "Missing dark mode background in layout"
fi

echo

# 3. Check CSS variables and dark mode setup
echo "📋 3. CSS Variables and Dark Mode Setup"
echo "======================================="

if grep -q "\.dark" src/app/globals.css; then
    print_success "Dark mode CSS classes found"
else
    print_error "No dark mode CSS classes found"
fi

if grep -q -- "--background.*--foreground" src/app/globals.css; then
    print_success "CSS variables for theming found"
else
    print_warning "Missing comprehensive CSS variables"
fi

# Check for glass morphism dark variants
if grep -q "\.dark \.glass" src/app/globals.css; then
    print_success "Glass morphism dark variants found"
else
    print_warning "Missing glass morphism dark variants"
fi

echo

# 4. Check key components for dark mode
echo "📋 4. Component Dark Mode Coverage"
echo "================================="

COMPONENTS=(
    "src/components/Header.tsx"
    "src/components/Sidebar.tsx"
    "src/components/SignInModal.tsx"
    "src/components/PathSelectionModal.tsx"
    "src/components/ClientLayout.tsx"
)

for component in "${COMPONENTS[@]}"; do
    if [[ -f "$component" ]]; then
        if grep -q "dark:" "$component"; then
            print_success "$(basename "$component") has dark mode classes"
        else
            print_error "$(basename "$component") missing dark mode classes"
        fi
    else
        print_warning "$(basename "$component") not found"
    fi
done

echo

# 5. Check main pages for dark mode
echo "📋 5. Main Pages Dark Mode Coverage"
echo "=================================="

PAGES=(
    "src/app/page.tsx"
    "src/app/analytics/page.tsx"
    "src/app/migration/page.tsx"
    "src/app/optimization/page.tsx"
    "src/app/security/page.tsx"
)

pages_with_dark=0
total_pages=${#PAGES[@]}

for page in "${PAGES[@]}"; do
    if [[ -f "$page" ]]; then
        if grep -q "dark:" "$page"; then
            print_success "$(basename "$page") has dark mode support"
            pages_with_dark=$((pages_with_dark + 1))
        else
            print_warning "$(basename "$page") may need dark mode classes"
        fi
    else
        print_warning "$(basename "$page") not found"
    fi
done

coverage_percentage=$(( (pages_with_dark * 100) / total_pages ))
echo "   📊 Page coverage: $pages_with_dark/$total_pages ($coverage_percentage%)"
echo

# 6. Build verification
echo "📋 6. Build Verification"
echo "========================"

print_info "Running production build to verify no errors..."
if npm run build > /dev/null 2>&1; then
    print_success "Production build successful"
else
    print_error "Production build failed - check for errors"
fi

echo

# 7. Theme toggle verification
echo "📋 7. Theme Toggle Implementation"
echo "================================="

if grep -q "useTheme" src/components/Header.tsx; then
    print_success "Theme toggle hook found in Header"
else
    print_error "Theme toggle hook missing in Header"
fi

if grep -q "setTheme" src/components/Header.tsx; then
    print_success "Theme setter found in Header"
else
    print_error "Theme setter missing in Header"
fi

echo

# 8. Advanced checks
echo "📋 8. Advanced Dark Mode Features"
echo "================================="

# Check for modal dark mode support
modal_files=$(find src -name "*Modal*.tsx" 2>/dev/null)
modal_with_dark=0
total_modals=0

for modal in $modal_files; do
    total_modals=$((total_modals + 1))
    if grep -q "dark:" "$modal"; then
        modal_with_dark=$((modal_with_dark + 1))
        print_success "$(basename "$modal") has dark mode support"
    else
        print_warning "$(basename "$modal") may need dark mode classes"
    fi
done

if [[ $total_modals -gt 0 ]]; then
    modal_coverage=$(( (modal_with_dark * 100) / total_modals ))
    echo "   📊 Modal coverage: $modal_with_dark/$total_modals ($modal_coverage%)"
fi

echo

# 9. Check for hardcoded colors that might break dark mode
echo "📋 9. Hardcoded Color Detection"
echo "==============================="

hardcoded_count=0

# Check for hardcoded white/black in TSX files
if find src -name "*.tsx" -exec grep -l "bg-white[^-]" {} \; | head -5; then
    hardcoded_whites=$(find src -name "*.tsx" -exec grep -l "bg-white[^-]" {} \; | wc -l)
    if [[ $hardcoded_whites -gt 0 ]]; then
        print_warning "Found $hardcoded_whites files with hardcoded bg-white"
        hardcoded_count=$((hardcoded_count + hardcoded_whites))
    fi
fi

if find src -name "*.tsx" -exec grep -l "text-black[^-]" {} \; | head -5; then
    hardcoded_blacks=$(find src -name "*.tsx" -exec grep -l "text-black[^-]" {} \; | wc -l)
    if [[ $hardcoded_blacks -gt 0 ]]; then
        print_warning "Found $hardcoded_blacks files with hardcoded text-black"
        hardcoded_count=$((hardcoded_count + hardcoded_blacks))
    fi
fi

if [[ $hardcoded_count -eq 0 ]]; then
    print_success "No problematic hardcoded colors found"
fi

echo

# 10. Summary and recommendations
echo "📊 FINAL SUMMARY"
echo "================"

total_issues=0

# Calculate overall score
if grep -q "ThemeProvider" src/app/providers.tsx && grep -q "\.dark" src/app/globals.css; then
    print_success "Core theme infrastructure: EXCELLENT"
else
    print_error "Core theme infrastructure: NEEDS WORK"
    total_issues=$((total_issues + 1))
fi

if [[ $coverage_percentage -ge 80 ]]; then
    print_success "Page coverage: EXCELLENT ($coverage_percentage%)"
elif [[ $coverage_percentage -ge 60 ]]; then
    print_warning "Page coverage: GOOD ($coverage_percentage%)"
else
    print_error "Page coverage: NEEDS IMPROVEMENT ($coverage_percentage%)"
    total_issues=$((total_issues + 1))
fi

if [[ $total_modals -gt 0 && $modal_coverage -ge 80 ]]; then
    print_success "Modal coverage: EXCELLENT ($modal_coverage%)"
elif [[ $modal_coverage -ge 60 ]]; then
    print_warning "Modal coverage: GOOD ($modal_coverage%)"
else
    print_warning "Modal coverage: NEEDS IMPROVEMENT ($modal_coverage%)"
fi

if [[ $hardcoded_count -le 2 ]]; then
    print_success "Hardcoded colors: MINIMAL ISSUES"
else
    print_warning "Hardcoded colors: $hardcoded_count issues found"
fi

echo
echo "🎯 OVERALL ASSESSMENT:"
if [[ $total_issues -eq 0 ]]; then
    print_success "EXCELLENT - Dark mode implementation is production-ready!"
    echo "🌟 Your dark mode implementation is comprehensive and well-structured."
elif [[ $total_issues -le 2 ]]; then
    print_warning "GOOD - Minor improvements recommended"
    echo "🔧 Most features work well, just a few tweaks needed."
else
    print_error "NEEDS WORK - Several issues to address"
    echo "🛠️  Significant improvements needed for production readiness."
fi

echo
echo "🧪 TESTING RECOMMENDATIONS:"
echo "=========================="
echo "1. 🌐 Start dev server: npm run dev"
echo "2. 🌓 Test theme toggle in browser header"
echo "3. 📱 Check all pages in both light and dark modes"
echo "4. 🎨 Verify modal/popup appearances"
echo "5. 📋 Test form elements and inputs"
echo "6. 🔍 Check text contrast and readability"
echo "7. ⌨️  Test keyboard navigation"
echo "8. 📱 Verify responsive behavior"

echo
echo "🚀 NEXT STEPS:"
echo "=============="
echo "1. Run 'npm run dev' to test live"
echo "2. Use browser dev tools to toggle dark mode"
echo "3. Navigate through all major pages"
echo "4. File any issues found"
echo "5. Deploy to staging for full testing"

echo
echo "✨ Dark mode validation complete!"

# Exit with appropriate code
exit $total_issues
