const fs = require('fs');
const path = require('path');

// Paths to update
const PORTAL_ROOT = path.join(__dirname, '..', 'investor-portal');
const LAYOUT_FILE = path.join(__dirname, '..', 'components', 'portal-layout.html');

// Read layout file
const layoutContent = fs.readFileSync(LAYOUT_FILE, 'utf8');

// Function to update a file
function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove old navigation scripts and header
    content = content.replace(/<script src=".*theme-toggle\.js"><\/script>/g, '');
    content = content.replace(/<script src=".*universal-navigation\.js"><\/script>/g, '');
    content = content.replace(/<header.*?<\/header>/s, '<div id="unified-header"></div>');
    
    // Add new layout content after opening <body> tag
    content = content.replace(/<body[^>]*>/, (match) => `${match}\n${layoutContent}`);
    
    // Write updated content
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
}

// Function to process directory
function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.html')) {
            updateFile(fullPath);
        }
    });
}

// Start processing
console.log('Updating portal pages with new layout...');
processDirectory(PORTAL_ROOT);
console.log('Done!');
