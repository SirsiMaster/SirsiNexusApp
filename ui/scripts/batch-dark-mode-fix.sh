#!/bin/bash

# Batch Dark Mode Fix Script
# Fixes common dark mode patterns across multiple files

echo "🔧 Starting batch dark mode fixes..."

# Find files that need fixing
PROBLEM_FILES=($(find src -name "page.tsx" -exec grep -l "bg-white\|text-gray-900\|bg-gray-50" {} \; | grep -v node_modules))

echo "Found ${#PROBLEM_FILES[@]} files that may need dark mode fixes"

for file in "${PROBLEM_FILES[@]}"; do
    echo "Fixing: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Apply common dark mode patterns using sed
    sed -i '' \
        -e 's/bg-white\([^-]\)/bg-white dark:bg-gray-800\1/g' \
        -e 's/text-gray-900\([^-]\)/text-gray-900 dark:text-gray-100\1/g' \
        -e 's/text-gray-600\([^-]\)/text-gray-600 dark:text-gray-400\1/g' \
        -e 's/border-gray-200\([^-]\)/border-gray-200 dark:border-gray-700\1/g' \
        -e 's/bg-gray-50\([^-]\)/bg-gray-50 dark:bg-gray-900\1/g' \
        -e 's/bg-gray-100\([^-]\)/bg-gray-100 dark:bg-gray-800\1/g' \
        -e 's/from-.*-50/& dark:from-gray-900/g' \
        -e 's/to-.*-50/& dark:to-gray-800/g' \
        -e 's/from-.*-100/& dark:from-gray-900/g' \
        -e 's/to-.*-100/& dark:to-gray-800/g' \
        "$file"
    
    echo "  ✅ Applied common dark mode patterns"
done

echo "🎉 Batch fixes complete! Testing build..."

# Test if build still works
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful after fixes"
    # Remove backups
    find src -name "*.backup" -delete
else
    echo "❌ Build failed, restoring backups"
    # Restore backups
    for file in "${PROBLEM_FILES[@]}"; do
        if [ -f "$file.backup" ]; then
            mv "$file.backup" "$file"
        fi
    done
fi

echo "🔧 Running final audit..."
./scripts/comprehensive-dark-mode-audit.sh | tail -10
