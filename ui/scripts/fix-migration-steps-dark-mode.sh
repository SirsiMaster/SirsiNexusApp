#!/bin/bash

echo "🌙 Fixing Migration Steps Dark Mode"
echo "==================================="

# Find all migration step files
MIGRATION_STEP_FILES=(
  "src/components/MigrationSteps/MigrationSteps.tsx"
  "src/components/MigrationSteps/AIEnhancedStep.tsx"
  "src/components/MigrationSteps/steps/PlanStep.tsx"
  "src/components/MigrationSteps/steps/SpecifyStep.tsx"
  "src/components/MigrationSteps/steps/BuildStep.tsx"
  "src/components/MigrationSteps/steps/TestStep.tsx"
  "src/components/MigrationSteps/steps/TransferStep.tsx"
  "src/components/MigrationSteps/steps/ValidateStep.tsx"
  "src/components/MigrationSteps/steps/OptimizeStep.tsx"
  "src/components/MigrationSteps/steps/EnvironmentSetupStep.tsx"
  "src/components/MigrationSteps/steps/SupportStep.tsx"
)

echo "Found ${#MIGRATION_STEP_FILES[@]} migration step files to fix"
echo ""

# Function to apply dark mode fixes to a migration step file
fix_migration_step() {
  local file="$1"
  echo "🔧 Fixing: $file"
  
  if [ ! -f "$file" ]; then
    echo "  ❌ File not found: $file"
    return
  fi
  
  # Create backup
  cp "$file" "$file.backup"
  
  # Apply dark mode fixes
  sed -i '' \
    -e 's/\bbg-white\b/bg-white dark:bg-gray-800/g' \
    -e 's/\bbg-gray-50\b/bg-gray-50 dark:bg-gray-800/g' \
    -e 's/\bbg-gray-100\b/bg-gray-100 dark:bg-gray-700/g' \
    -e 's/\bbg-gray-200\b/bg-gray-200 dark:bg-gray-600/g' \
    -e 's/\bbg-slate-50\b/bg-slate-50 dark:bg-slate-800/g' \
    -e 's/\bbg-slate-100\b/bg-slate-100 dark:bg-slate-700/g' \
    -e 's/\bbg-slate-200\b/bg-slate-200 dark:bg-slate-600/g' \
    -e 's/\btext-gray-900\b/text-gray-900 dark:text-gray-100/g' \
    -e 's/\btext-gray-800\b/text-gray-800 dark:text-gray-200/g' \
    -e 's/\btext-gray-700\b/text-gray-700 dark:text-gray-300/g' \
    -e 's/\btext-gray-600\b/text-gray-600 dark:text-gray-400/g' \
    -e 's/\btext-slate-900\b/text-slate-900 dark:text-slate-100/g' \
    -e 's/\btext-slate-800\b/text-slate-800 dark:text-slate-200/g' \
    -e 's/\btext-slate-700\b/text-slate-700 dark:text-slate-300/g' \
    -e 's/\btext-slate-600\b/text-slate-600 dark:text-slate-400/g' \
    -e 's/\bborder-gray-200\b/border-gray-200 dark:border-gray-700/g' \
    -e 's/\bborder-gray-300\b/border-gray-300 dark:border-gray-600/g' \
    -e 's/\bborder-slate-200\b/border-slate-200 dark:border-slate-700/g' \
    -e 's/\bborder-slate-300\b/border-slate-300 dark:border-slate-600/g' \
    "$file"
  
  echo "  ✅ Fixed successfully"
}

# Fix each migration step file
for file in "${MIGRATION_STEP_FILES[@]}"; do
  fix_migration_step "$file"
done

echo ""
echo "📊 Summary:"
echo "  Fixed ${#MIGRATION_STEP_FILES[@]} migration step files"
echo "  Backup files created with .backup extension"
echo ""
echo "🔧 Next steps:"
echo "  1. Test the migration wizard in dark mode"
echo "  2. Check all steps render properly"
echo "  3. Remove backup files if satisfied"
