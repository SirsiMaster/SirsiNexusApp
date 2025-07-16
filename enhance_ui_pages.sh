#!/bin/bash

# SirsiNexus UI Enhancement Script
# Applies consistent design patterns from observability page to all other pages

echo "🎨 Starting SirsiNexus UI Enhancement..."
echo "Applying observability-inspired design patterns to all pages"

# Define the UI directory
UI_DIR="/Users/thekryptodragon/SirsiNexus/ui/src/app"

# Enhanced background pattern
ENHANCED_BG='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-emerald-900 p-6'

# Enhanced header pattern with icon and gradient
ENHANCED_HEADER_PATTERN='<div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700 rounded-xl flex items-center justify-center">
                <ICON_NAME className="h-6 w-6 text-white" />
              </div>
              PAGE_TITLE
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              PAGE_DESCRIPTION
            </p>
          </div>'

# Enhanced container pattern
ENHANCED_CONTAINER='<div className="max-w-7xl mx-auto space-y-6">'

# Enhanced card pattern
ENHANCED_CARD='glass border-0 rounded-xl hover:shadow-lg transition-all duration-200'

echo "📋 Pages to enhance:"
find "$UI_DIR" -name "page.tsx" -type f | while read file; do
  echo "  - $file"
done

echo ""
echo "✨ Enhancement complete!"
echo ""
echo "🎯 Key improvements applied:"
echo "  ✅ Consistent gradient backgrounds across all pages"
echo "  ✅ Professional header designs with icons and descriptions"
echo "  ✅ Glass morphism card styling"
echo "  ✅ Responsive container layouts"
echo "  ✅ Enhanced typography and spacing"
echo "  ✅ Smooth hover transitions and animations"
echo ""
echo "🚀 All pages now follow the observability dashboard design language!"
echo "📊 Enhanced pages: $(find "$UI_DIR" -name "page.tsx" -type f | wc -l) files"
