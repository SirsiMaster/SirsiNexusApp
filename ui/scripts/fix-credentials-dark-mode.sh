#!/bin/bash

echo "🌙 Fixing Credentials Page Dark Mode"
echo "==================================="

FILE="src/app/credentials/page.tsx"

if [ ! -f "$FILE" ]; then
  echo "❌ Credentials page not found!"
  exit 1
fi

echo "📄 Processing: $FILE"

# Create backup
cp "$FILE" "$FILE.backup"

# Apply comprehensive dark mode fixes for credentials page
sed -i '' \
  -e 's/text-slate-700\b/text-slate-700 dark:text-slate-300/g' \
  -e 's/text-slate-900\b/text-slate-900 dark:text-slate-100/g' \
  -e 's/text-slate-600\b/text-slate-600 dark:text-slate-400/g' \
  -e 's/text-slate-500\b/text-slate-500 dark:text-slate-400/g' \
  -e 's/text-slate-400\b/text-slate-400 dark:text-slate-500/g' \
  -e 's/border-slate-200\b/border-slate-200 dark:border-slate-700/g' \
  -e 's/border-slate-300\b/border-slate-300 dark:border-slate-600/g' \
  -e 's/hover:border-slate-300\b/hover:border-slate-300 dark:hover:border-slate-500/g' \
  -e 's/bg-emerald-50\b/bg-emerald-50 dark:bg-emerald-900/g' \
  -e 's/text-emerald-700\b/text-emerald-700 dark:text-emerald-300/g' \
  -e 's/bg-slate-50\b/bg-slate-50 dark:bg-slate-800/g' \
  -e 's/bg-slate-100\b/bg-slate-100 dark:bg-slate-700/g' \
  -e 's/bg-gray-50\b/bg-gray-50 dark:bg-gray-800/g' \
  -e 's/bg-gray-100\b/bg-gray-100 dark:bg-gray-700/g' \
  -e 's/bg-white\b/bg-white dark:bg-gray-800/g' \
  -e 's/border-gray-200\b/border-gray-200 dark:border-gray-700/g' \
  -e 's/border-gray-300\b/border-gray-300 dark:border-gray-600/g' \
  -e 's/text-gray-600\b/text-gray-600 dark:text-gray-400/g' \
  -e 's/text-gray-700\b/text-gray-700 dark:text-gray-300/g' \
  -e 's/text-gray-800\b/text-gray-800 dark:text-gray-200/g' \
  -e 's/text-gray-900\b/text-gray-900 dark:text-gray-100/g' \
  -e 's/hover:text-slate-600\b/hover:text-slate-600 dark:hover:text-slate-300/g' \
  -e 's/hover:bg-slate-100\b/hover:bg-slate-100 dark:hover:bg-slate-700/g' \
  -e 's/hover:bg-gray-50\b/hover:bg-gray-50 dark:hover:bg-gray-700/g' \
  "$FILE"

# Fix input field backgrounds and focus states
sed -i '' \
  -e 's/w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent/w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent/g' \
  -e 's/w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10/w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10/g' \
  -e 's/w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm/w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm/g' \
  "$FILE"

echo "✅ Applied dark mode fixes to credentials page"
echo "📄 Backup created: $FILE.backup"
echo ""
echo "🔧 Next steps:"
echo "  1. Test the credentials page in dark mode"
echo "  2. Check all form inputs and cards"
echo "  3. Remove backup file if satisfied"
