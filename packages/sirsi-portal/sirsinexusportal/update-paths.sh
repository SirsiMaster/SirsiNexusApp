#!/bin/bash

# SirsiNexus Path Update Script
# Updates all file paths to use /SirsiNexusPortal/ as the base path

echo "🔄 Updating file paths for /SirsiNexusPortal/ base URL..."

# Find all HTML files and update paths
find . -name "*.html" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./ui/*" | while read -r file; do
    echo "📝 Processing: $file"
    
    # Create backup
    cp "$file" "${file}.bak"
    
    # Update absolute paths for assets
    sed -i '' 's|href="assets/|href="/SirsiNexusPortal/assets/|g' "$file"
    sed -i '' 's|src="assets/|src="/SirsiNexusPortal/assets/|g' "$file"
    
    # Update relative paths going back to root
    sed -i '' 's|href="../index\.html"|href="/SirsiNexusPortal/index.html"|g' "$file"
    sed -i '' 's|href="../../index\.html"|href="/SirsiNexusPortal/index.html"|g' "$file"
    
    # Update relative paths going back one level for assets
    sed -i '' 's|href="../assets/|href="/SirsiNexusPortal/assets/|g' "$file"
    sed -i '' 's|src="../assets/|src="/SirsiNexusPortal/assets/|g' "$file"
    
    # Update relative paths going back two levels for assets
    sed -i '' 's|href="../../assets/|href="/SirsiNexusPortal/assets/|g' "$file"
    sed -i '' 's|src="../../assets/|src="/SirsiNexusPortal/assets/|g' "$file"
    
    # Update navigation links
    sed -i '' 's|href="index\.html"|href="/SirsiNexusPortal/index.html"|g' "$file"
    sed -i '' 's|href="investor-login\.html"|href="/SirsiNexusPortal/investor-login.html"|g' "$file"
    sed -i '' 's|href="documentation\.html"|href="/SirsiNexusPortal/documentation.html"|g' "$file"
    sed -i '' 's|href="signup\.html"|href="/SirsiNexusPortal/signup.html"|g' "$file"
    sed -i '' 's|href="contact\.html"|href="/SirsiNexusPortal/contact.html"|g' "$file"
    
    # Update investor portal links
    sed -i '' 's|href="investor-portal/|href="/SirsiNexusPortal/investor-portal/|g' "$file"
    sed -i '' 's|href="../investor-portal/|href="/SirsiNexusPortal/investor-portal/|g' "$file"
    
    # Update committee links within investor portal
    sed -i '' 's|href="committee/|href="/SirsiNexusPortal/investor-portal/committee/|g' "$file"
    sed -i '' 's|href="../committee/|href="/SirsiNexusPortal/investor-portal/committee/|g' "$file"
    
    # Update window.location.href in JavaScript
    sed -i '' "s|window\.location\.href = '/investor-login\.html'|window.location.href = '/SirsiNexusPortal/investor-login.html'|g" "$file"
    sed -i '' "s|window\.location\.href = '../index\.html'|window.location.href = '/SirsiNexusPortal/index.html'|g" "$file"
    sed -i '' "s|window\.location\.href = '../../index\.html'|window.location.href = '/SirsiNexusPortal/index.html'|g" "$file"
    sed -i '' "s|window\.location\.href = 'index\.html'|window.location.href = '/SirsiNexusPortal/index.html'|g" "$file"
    
done

# Update JavaScript files
find . -name "*.js" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./ui/*" | while read -r file; do
    echo "📜 Processing JavaScript: $file"
    
    # Create backup
    cp "$file" "${file}.bak"
    
    # Update window.location.href paths
    sed -i '' "s|window\.location\.href = '/investor-login\.html'|window.location.href = '/SirsiNexusPortal/investor-login.html'|g" "$file"
    sed -i '' "s|window\.location\.href = '/index\.html'|window.location.href = '/SirsiNexusPortal/index.html'|g" "$file"
    
done

# Update JSON config files
find . -name "*.json" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./ui/*" | while read -r file; do
    echo "📄 Processing JSON: $file"
    
    # Create backup
    cp "$file" "${file}.bak"
    
    # Update paths in JSON files
    sed -i '' 's|"/assets/|"/SirsiNexusPortal/assets/|g' "$file"
    sed -i '' 's|"/investor-portal/|"/SirsiNexusPortal/investor-portal/|g' "$file"
    
done

echo "✅ Path update complete! All files now use /SirsiNexusPortal/ as the base path."
echo "📋 Backup files created with .bak extension"
echo ""
echo "🔍 Next steps:"
echo "1. Test the updated paths"
echo "2. Remove .bak files if everything works correctly: find . -name '*.bak' -delete"
echo "3. Commit changes to git"
