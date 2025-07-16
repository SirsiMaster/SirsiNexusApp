#!/bin/bash

# =============================================================================
# INVESTOR PORTAL REVAMP SCRIPT
# =============================================================================
# This script completely revamps the investor portal structure:
# 1. Renames investor-portal.html → investor-login.html
# 2. Renames investor-dashboard.html → investor-portal.html
# 3. Updates all navigation links and references
# 4. Integrates committee pages into the new structure
# 5. Creates a seamless investor experience
# =============================================================================

set -e  # Exit on any error

echo "🚀 Starting SirsiNexus Investor Portal Revamp..."
echo "================================================="

# Color definitions for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# =============================================================================
# STEP 1: BACKUP CURRENT FILES
# =============================================================================
print_info "Step 1: Creating backup of current files..."

# Create backup directory
mkdir -p backup/investor-portal-revamp-$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup/investor-portal-revamp-$(date +%Y%m%d_%H%M%S)"

# Backup current files
cp investor-portal.html "$BACKUP_DIR/investor-portal.html.bak" 2>/dev/null || print_warning "investor-portal.html not found"
cp docs/investor-dashboard.html "$BACKUP_DIR/investor-dashboard.html.bak" 2>/dev/null || print_warning "investor-dashboard.html not found"
cp committee-index.html "$BACKUP_DIR/committee-index.html.bak" 2>/dev/null || print_warning "committee-index.html not found"

print_status "Backup created in $BACKUP_DIR"

# =============================================================================
# STEP 2: RENAME FILES
# =============================================================================
print_info "Step 2: Renaming files to new structure..."

# Rename investor-portal.html to investor-login.html
if [ -f "investor-portal.html" ]; then
    mv investor-portal.html investor-login.html
    print_status "investor-portal.html → investor-login.html"
else
    print_error "investor-portal.html not found!"
fi

# Rename investor-dashboard.html to investor-portal.html
if [ -f "docs/investor-dashboard.html" ]; then
    mv docs/investor-dashboard.html investor-portal.html
    print_status "investor-dashboard.html → investor-portal.html"
else
    print_error "docs/investor-dashboard.html not found!"
fi

# =============================================================================
# STEP 3: UPDATE NAVIGATION LINKS
# =============================================================================
print_info "Step 3: Updating navigation links throughout the site..."

# Update index.html references
if [ -f "index.html" ]; then
    sed -i '' 's/investor-portal\.html/investor-login.html/g' index.html
    print_status "Updated index.html navigation links"
fi

# Update signup.html references  
if [ -f "signup.html" ]; then
    sed -i '' 's/investor-portal\.html/investor-login.html/g' signup.html
    print_status "Updated signup.html navigation links"
fi

# Update investor-login.html internal references
if [ -f "investor-login.html" ]; then
    # Update the form action to point to the new investor-portal.html
    sed -i '' 's/investor-dashboard\.html/investor-portal.html/g' investor-login.html
    print_status "Updated investor-login.html form action"
fi

# Update investor-portal.html internal references
if [ -f "investor-portal.html" ]; then
    # Update logout redirect to point to investor-login.html
    sed -i '' 's/investor-portal\.html/investor-login.html/g' investor-portal.html
    print_status "Updated investor-portal.html logout redirect"
fi

# =============================================================================
# STEP 4: UPDATE TITLES AND METADATA
# =============================================================================
print_info "Step 4: Updating titles and metadata..."

# Update investor-login.html title
if [ -f "investor-login.html" ]; then
    sed -i '' 's/<title>.*<\/title>/<title>SirsiNexus - Investor Login<\/title>/g' investor-login.html
    print_status "Updated investor-login.html title"
fi

# Update investor-portal.html title
if [ -f "investor-portal.html" ]; then
    sed -i '' 's/<title>.*<\/title>/<title>SirsiNexus - Investor Portal<\/title>/g' investor-portal.html
    print_status "Updated investor-portal.html title"
fi

# =============================================================================
# STEP 5: CREATE COMMITTEE INTEGRATION
# =============================================================================
print_info "Step 5: Creating committee integration..."

# Create committee directory structure
mkdir -p committee/assets
mkdir -p committee/docs

# Move committee-index.html to committee/index.html
if [ -f "committee-index.html" ]; then
    mv committee-index.html committee/index.html
    print_status "Moved committee-index.html to committee/index.html"
fi

# =============================================================================
# STEP 6: UPDATE AUTHENTICATION FLOW
# =============================================================================
print_info "Step 6: Updating authentication flow..."

# Update authentication references in investor-portal.html
if [ -f "investor-portal.html" ]; then
    # Update authentication check to redirect to investor-login.html
    sed -i '' 's/window\.location\.href = '\''investor-portal\.html'\''/window.location.href = '\''investor-login.html'\''/g' investor-portal.html
    print_status "Updated authentication flow in investor-portal.html"
fi

# =============================================================================
# STEP 7: UPDATE DOCUMENTATION LINKS
# =============================================================================
print_info "Step 7: Updating documentation and README links..."

# Update README.md if it exists
if [ -f "README.md" ]; then
    sed -i '' 's/investor-portal\.html/investor-login.html/g' README.md
    print_status "Updated README.md links"
fi

# Update any documentation files
find docs/ -name "*.md" -o -name "*.html" | while read file; do
    if [ -f "$file" ]; then
        sed -i '' 's/investor-portal\.html/investor-login.html/g' "$file"
        sed -i '' 's/investor-dashboard\.html/investor-portal.html/g' "$file"
    fi
done

print_status "Updated documentation links"

# =============================================================================
# STEP 8: CREATE NEW COMMITTEE-INVESTOR BRIDGE
# =============================================================================
print_info "Step 8: Creating committee-investor bridge..."

# Create a bridge page for committee members to access investor portal
cat > committee-investor-bridge.html << 'EOF'
<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SirsiNexus - Committee Access</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            fontFamily: {
              'inter': ['Inter', 'sans-serif'],
            },
            colors: {
              emerald: {
                600: '#059669',
                700: '#047857',
              },
            },
          },
        },
      }
    </script>
</head>
<body class="h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div class="text-center">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Committee Access</h1>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Access committee resources and investor portal
                </p>
            </div>
            
            <div class="space-y-4">
                <a href="committee/index.html" 
                   class="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200">
                    Committee Dashboard
                </a>
                
                <a href="investor-login.html" 
                   class="group relative w-full flex justify-center py-4 px-6 border border-emerald-600 text-sm font-medium rounded-lg text-emerald-600 bg-transparent hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200">
                    Investor Login
                </a>
            </div>
        </div>
    </div>
</body>
</html>
EOF

print_status "Created committee-investor bridge page"

# =============================================================================
# STEP 9: UPDATE GITHUB PAGES CONFIGURATION
# =============================================================================
print_info "Step 9: Updating GitHub Pages configuration..."

# Update _config.yml to include new structure
if [ -f "_config.yml" ]; then
    # Add committee collection if not exists
    if ! grep -q "committee:" "_config.yml"; then
        cat >> _config.yml << 'EOF'

# Committee Collection
collections:
  committee:
    output: true
    permalink: /committee/:name/
EOF
    fi
    print_status "Updated _config.yml with committee collection"
fi

# =============================================================================
# STEP 10: VALIDATE AND TEST
# =============================================================================
print_info "Step 10: Validating changes..."

# Check if all files exist
files_to_check=("investor-login.html" "investor-portal.html" "committee/index.html" "committee-investor-bridge.html")

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_status "✓ $file exists"
    else
        print_error "✗ $file missing"
    fi
done

# =============================================================================
# STEP 11: GIT OPERATIONS
# =============================================================================
print_info "Step 11: Committing changes to git..."

# Add all changes
git add .

# Commit changes
git commit -m "🔄 REVAMP: Complete investor portal restructure

🎯 File Renaming:
- investor-portal.html → investor-login.html
- investor-dashboard.html → investor-portal.html

🔗 Navigation Updates:
- Updated all internal links and references
- Fixed authentication flow redirects
- Updated form actions and logout redirects

🏢 Committee Integration:
- Moved committee-index.html to committee/index.html
- Created committee-investor bridge page
- Added committee collection to _config.yml

📋 Structure Changes:
- Cleaner login/portal separation
- Professional committee integration
- Updated titles and metadata
- Backup created for rollback safety

✅ Result: Seamless investor experience with proper committee integration"

print_status "Changes committed to git"

# =============================================================================
# COMPLETION SUMMARY
# =============================================================================
echo
echo "================================================="
echo -e "${GREEN}🎉 INVESTOR PORTAL REVAMP COMPLETE! 🎉${NC}"
echo "================================================="
echo
print_info "Summary of changes:"
echo "  📝 investor-portal.html → investor-login.html"
echo "  📝 investor-dashboard.html → investor-portal.html"
echo "  📝 committee-index.html → committee/index.html"
echo "  📝 Created committee-investor-bridge.html"
echo "  📝 Updated all navigation links"
echo "  📝 Fixed authentication flow"
echo "  📝 Updated GitHub Pages configuration"
echo
print_info "New URL Structure:"
echo "  🔐 Login: https://sirsinexusdev.github.io/SirsiNexus/investor-login.html"
echo "  🏢 Portal: https://sirsinexusdev.github.io/SirsiNexus/investor-portal.html"
echo "  👥 Committee: https://sirsinexusdev.github.io/SirsiNexus/committee/"
echo "  🌉 Bridge: https://sirsinexusdev.github.io/SirsiNexus/committee-investor-bridge.html"
echo
print_info "Next steps:"
echo "  1. Push changes: git push origin main"
echo "  2. Wait for GitHub Pages deployment (~2 minutes)"
echo "  3. Test all links and authentication flow"
echo "  4. Update any external references to the old URLs"
echo
print_status "Backup available in: $BACKUP_DIR"
echo
echo -e "${GREEN}🚀 Ready to push and deploy!${NC}"
