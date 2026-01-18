#!/bin/bash

# SirsiMaster Component Library - Universal Installation Script
# This script can be run in any project to add the component library

echo "
╔════════════════════════════════════════════════════╗
║   SirsiMaster Component Library Installation      ║
╚════════════════════════════════════════════════════╝
"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Component Library GitHub URL
LIBRARY_URL="https://github.com/sirsimaster/component-library"
CDN_BASE="https://cdn.jsdelivr.net/gh/sirsimaster/component-library@latest"

echo -e "${BLUE}📦 Installing SirsiMaster Component Library...${NC}\n"

# Detect project type
detect_project_type() {
    if [ -f "package.json" ]; then
        echo "node"
    elif [ -f "index.html" ]; then
        echo "static"
    elif [ -f "requirements.txt" ] || [ -f "setup.py" ]; then
        echo "python"
    else
        echo "unknown"
    fi
}

PROJECT_TYPE=$(detect_project_type)
echo -e "${GREEN}✓${NC} Detected project type: ${YELLOW}$PROJECT_TYPE${NC}"

# Function to add UI components
add_ui_components() {
    echo -e "\n${BLUE}🎨 Adding UI Components...${NC}"
    
    if [ "$PROJECT_TYPE" = "static" ] || [ "$PROJECT_TYPE" = "unknown" ]; then
        # For static HTML projects
        if [ -f "index.html" ]; then
            # Check if already added
            if grep -q "sirsimaster-ui.css" index.html; then
                echo -e "${YELLOW}⚠${NC}  UI components already added to index.html"
            else
                # Add before </head>
                sed -i.bak '/<\/head>/i\
    <!-- SirsiMaster Component Library -->\
    <link rel="stylesheet" href="'$CDN_BASE'/ui-components/dist/sirsimaster-ui.css">\
    <script src="'$CDN_BASE'/ui-components/dist/sirsimaster-ui.js"></script>' index.html
                echo -e "${GREEN}✓${NC} Added UI components to index.html"
            fi
        fi
    elif [ "$PROJECT_TYPE" = "node" ]; then
        # For Node.js projects
        echo -e "${BLUE}Installing via NPM...${NC}"
        npm install @sirsimaster/component-library --save
        echo -e "${GREEN}✓${NC} Installed via NPM"
    fi
    
    # Create example file
    cat > sirsimaster-examples.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>SirsiMaster Component Examples</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sirsimaster/component-library@latest/ui-components/dist/sirsimaster-ui.css">
</head>
<body style="padding: 2rem;">
    <h1>SirsiMaster Component Examples</h1>
    
    <h2>Buttons</h2>
    <button class="sm-btn sm-btn-primary">Primary</button>
    <button class="sm-btn sm-btn-secondary">Secondary</button>
    <button class="sm-btn sm-btn-success">Success</button>
    <button class="sm-btn sm-btn-danger">Danger</button>
    
    <h2>Cards</h2>
    <div class="sm-card" style="max-width: 400px;">
        <div class="sm-card-header">Card Title</div>
        <div class="sm-card-body">This is a card component from the library.</div>
        <div class="sm-card-footer">Card Footer</div>
    </div>
    
    <h2>Forms</h2>
    <div class="sm-form-group">
        <label class="sm-form-label">Email Address</label>
        <input type="email" class="sm-form-input" placeholder="Enter your email">
    </div>
    
    <script src="https://cdn.jsdelivr.net/gh/sirsimaster/component-library@latest/ui-components/dist/sirsimaster-ui.js"></script>
</body>
</html>
EOF
    echo -e "${GREEN}✓${NC} Created sirsimaster-examples.html"
}

# Function to add CI/CD pipeline
add_cicd_pipeline() {
    echo -e "\n${BLUE}🚀 Adding CI/CD Pipeline...${NC}"
    
    # Create .github/workflows directory
    mkdir -p .github/workflows
    
    # Download the universal deployment workflow
    curl -sSL "$CDN_BASE/cicd-pipelines/templates/github-actions/universal-deploy.yml" \
        -o .github/workflows/deploy.yml 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Added GitHub Actions workflow"
    else
        echo -e "${YELLOW}⚠${NC}  Could not download workflow file"
    fi
    
    # Create CI/CD config
    mkdir -p .cicd
    cat > .cicd/config.json << 'EOF'
{
  "project": {
    "name": "my-project",
    "type": "web",
    "framework": "vanilla"
  },
  "providers": {
    "production": {
      "type": "firebase",
      "projectId": "YOUR_PROJECT_ID"
    }
  }
}
EOF
    echo -e "${GREEN}✓${NC} Created .cicd/config.json (update with your settings)"
}

# Function to add development tools
add_dev_tools() {
    echo -e "\n${BLUE}🛠️  Adding Development Tools...${NC}"
    
    # Add verification script
    mkdir -p scripts
    curl -sSL "$CDN_BASE/development-tools/scripts/verify-completion.sh" \
        -o scripts/verify-completion.sh 2>/dev/null
    chmod +x scripts/verify-completion.sh 2>/dev/null
    
    # Add .gitignore if not exists
    if [ ! -f ".gitignore" ]; then
        cat > .gitignore << 'EOF'
# Dependencies
node_modules/
vendor/

# Build outputs
dist/
build/
*.min.js
*.min.css

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOF
        echo -e "${GREEN}✓${NC} Created .gitignore"
    fi
    
    echo -e "${GREEN}✓${NC} Added development tools"
}

# Main installation menu
echo -e "\n${YELLOW}What would you like to install?${NC}"
echo "1) Everything (Recommended)"
echo "2) UI Components only"
echo "3) CI/CD Pipeline only"
echo "4) Development Tools only"
echo "5) Exit"

read -p "Select option (1-5): " choice

case $choice in
    1)
        add_ui_components
        add_cicd_pipeline
        add_dev_tools
        ;;
    2)
        add_ui_components
        ;;
    3)
        add_cicd_pipeline
        ;;
    4)
        add_dev_tools
        ;;
    5)
        echo -e "${BLUE}Installation cancelled${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

# Summary
echo -e "\n${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}📋 Next Steps:${NC}"
echo "1. Review the generated files"
echo "2. Update .cicd/config.json with your project settings"
echo "3. Add required secrets to your repository"
echo "4. View examples in sirsimaster-examples.html"

echo -e "\n${BLUE}📚 Documentation:${NC}"
echo "GitHub: $LIBRARY_URL"
echo "Examples: Open sirsimaster-examples.html in your browser"

echo -e "\n${GREEN}Happy coding! 🚀${NC}"
