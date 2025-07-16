#!/bin/bash

echo "🌓 Comprehensive Component Dark Mode Audit"
echo "=========================================="

# Find all component files
COMPONENT_FILES=$(find src/components -name "*.tsx" -type f | sort)
TOTAL_FILES=$(echo "$COMPONENT_FILES" | wc -l | tr -d ' ')

echo ""
echo "Found $TOTAL_FILES component files to audit:"
echo "$COMPONENT_FILES" | sed 's/^/  - /'
echo ""

# Initialize counters
FILES_WITH_ISSUES=0
TOTAL_ISSUES=0

# Dark mode patterns to check for
LIGHT_PATTERNS=(
  "bg-white\b"
  "bg-gray-50\b"
  "bg-gray-100\b"
  "bg-gray-200\b"
  "bg-slate-50\b"
  "bg-slate-100\b"
  "bg-slate-200\b"
  "text-gray-900\b"
  "text-gray-800\b"
  "text-gray-700\b"
  "text-gray-600\b"
  "text-slate-900\b"
  "text-slate-800\b"
  "text-slate-700\b"
  "text-slate-600\b"
  "border-gray-200\b"
  "border-gray-300\b"
  "border-slate-200\b"
  "border-slate-300\b"
)

# Corresponding dark mode patterns
DARK_PATTERNS=(
  "dark:bg-"
  "dark:text-"
  "dark:border-"
)

# Check each component file
for file in $COMPONENT_FILES; do
  echo "📄 Checking: $file"
  
  ISSUES_IN_FILE=0
  
  # Check for light mode classes without dark variants
  for pattern in "${LIGHT_PATTERNS[@]}"; do
    # Look for the pattern
    MATCHES=$(grep -n "$pattern" "$file" | grep -v "dark:" || true)
    
    if [ ! -z "$MATCHES" ]; then
      # Check if the same line has a dark variant
      while IFS= read -r match; do
        LINE_NUM=$(echo "$match" | cut -d: -f1)
        LINE_CONTENT=$(sed -n "${LINE_NUM}p" "$file")
        
        # Check if this line has any dark: variant
        if ! echo "$LINE_CONTENT" | grep -q "dark:"; then
          if [ $ISSUES_IN_FILE -eq 0 ]; then
            echo "  ⚠️  Issues found:"
            FILES_WITH_ISSUES=$((FILES_WITH_ISSUES + 1))
          fi
          echo "    Line $LINE_NUM: $pattern (no dark variant)"
          ISSUES_IN_FILE=$((ISSUES_IN_FILE + 1))
          TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
        fi
      done <<< "$MATCHES"
    fi
  done
  
  if [ $ISSUES_IN_FILE -eq 0 ]; then
    echo "  ✅ No issues found"
  fi
  
  echo ""
done

echo "📊 COMPONENT AUDIT SUMMARY:"
echo "=========================="
echo "  Total components checked: $TOTAL_FILES"
echo "  Components with issues: $FILES_WITH_ISSUES"
echo "  Total issues found: $TOTAL_ISSUES"
echo ""

if [ $TOTAL_ISSUES -eq 0 ]; then
  echo "🎉 ALL COMPONENTS HAVE PROPER DARK MODE SUPPORT!"
else
  echo "⚠️  Found $TOTAL_ISSUES dark mode issues across $FILES_WITH_ISSUES components"
fi

echo ""
echo "🔧 Next steps:"
echo "  1. Fix the components listed above"
echo "  2. Add dark: variants for light mode classes"
echo "  3. Test with theme toggle in browser"
echo "  4. Re-run this audit to confirm fixes"
