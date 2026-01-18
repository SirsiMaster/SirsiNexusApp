#!/bin/bash

echo "🔍 SirsiMaster GitHub Pages Site Validation"
echo "=========================================="
echo

# Check for merge conflicts
echo "📋 Checking for merge conflicts..."
CONFLICTS=$(grep -r "<<<<<<< HEAD" . --include="*.html" --include="*.css" --include="*.js" --include="*.json" --include="*.md" 2>/dev/null | wc -l)
if [ "$CONFLICTS" -eq 0 ]; then
    echo "✅ No merge conflicts found!"
else
    echo "❌ Found $CONFLICTS merge conflicts"
    echo "Files with conflicts:"
    grep -r "<<<<<<< HEAD" . --include="*.html" --include="*.css" --include="*.js" --include="*.json" --include="*.md" -l 2>/dev/null
fi
echo

# Check main pages accessibility
echo "🌐 Checking main pages accessibility..."
PAGES=("index.html" "investor-login.html" "documentation.html" "signup.html")
for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "✅ $page exists"
    else
        echo "❌ $page missing"
    fi
done
echo

# Check GitHub Pages status
echo "🚀 Checking GitHub Pages status..."
curl -s https://sirsimaster.github.io/ > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Site is accessible at https://sirsimaster.github.io/"
else
    echo "❌ Site is not accessible"
fi
echo

echo "🎉 Validation complete!"
echo "Site Status: $([ "$CONFLICTS" -eq 0 ] && echo "✅ HEALTHY" || echo "❌ NEEDS FIXING")"
