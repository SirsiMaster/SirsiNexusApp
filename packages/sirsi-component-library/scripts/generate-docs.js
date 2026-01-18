#!/usr/bin/env node

/**
 * Automatic Documentation Generator for SirsiMaster Component Library
 * 
 * This script automatically generates documentation for components by:
 * 1. Scanning the src/components directory
 * 2. Parsing component files for props and methods
 * 3. Generating markdown documentation
 * 4. Creating a component index
 * 5. Updating the main README
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// Configuration
const CONFIG = {
  componentsDir: path.join(__dirname, '../src/components'),
  docsDir: path.join(__dirname, '../docs/components'),
  storiesDir: path.join(__dirname, '../stories'),
  outputFile: path.join(__dirname, '../docs/COMPONENT_INDEX.md'),
};

// Ensure docs directory exists
if (!fs.existsSync(CONFIG.docsDir)) {
  fs.mkdirSync(CONFIG.docsDir, { recursive: true });
}

/**
 * Parse TypeScript/JSX file to extract component information
 */
function parseComponent(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  
  // Basic parsing - in production, use proper AST parsing
  const componentInfo = {
    name: path.basename(filePath, path.extname(filePath)),
    props: [],
    methods: [],
    description: '',
    examples: [],
  };

  // Extract props from TypeScript interface
  const propsMatch = code.match(/interface\s+\w+Props\s*{([^}]+)}/);
  if (propsMatch) {
    const propsContent = propsMatch[1];
    const propLines = propsContent.split('\n').filter(line => line.trim());
    
    propLines.forEach(line => {
      const propMatch = line.match(/^\s*(\w+)(\?)?:\s*([^;]+)/);
      if (propMatch) {
        componentInfo.props.push({
          name: propMatch[1],
          required: !propMatch[2],
          type: propMatch[3].trim(),
        });
      }
    });
  }

  // Extract component description from JSDoc
  const docMatch = code.match(/\/\*\*\s*\n([^*]|\*(?!\/))*\*\//);
  if (docMatch) {
    const docContent = docMatch[0];
    const descMatch = docContent.match(/\*\s+([^@\n]+)/);
    if (descMatch) {
      componentInfo.description = descMatch[1].trim();
    }
  }

  return componentInfo;
}

/**
 * Generate markdown documentation for a component
 */
function generateComponentDoc(componentInfo) {
  let doc = `# ${componentInfo.name}\n\n`;
  
  if (componentInfo.description) {
    doc += `${componentInfo.description}\n\n`;
  }

  doc += `## Usage\n\n`;
  doc += `\`\`\`jsx\n`;
  doc += `import { ${componentInfo.name} } from '@sirsimaster/component-library';\n\n`;
  doc += `function Example() {\n`;
  doc += `  return <${componentInfo.name} />;\n`;
  doc += `}\n`;
  doc += `\`\`\`\n\n`;

  if (componentInfo.props.length > 0) {
    doc += `## Props\n\n`;
    doc += `| Prop | Type | Required | Description |\n`;
    doc += `|------|------|----------|-------------|\n`;
    
    componentInfo.props.forEach(prop => {
      doc += `| ${prop.name} | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | - |\n`;
    });
    doc += `\n`;
  }

  doc += `## Examples\n\n`;
  doc += `### Basic Usage\n\n`;
  doc += `\`\`\`jsx\n`;
  doc += `<${componentInfo.name} />\n`;
  doc += `\`\`\`\n\n`;

  doc += `## Storybook\n\n`;
  doc += `View this component in [Storybook](https://sirsimaster.github.io/sirsimaster-component-library/?path=/story/${componentInfo.name.toLowerCase()})\n\n`;

  doc += `## Source Code\n\n`;
  doc += `- [Component](../src/components/${componentInfo.name}/${componentInfo.name}.tsx)\n`;
  doc += `- [Styles](../src/components/${componentInfo.name}/${componentInfo.name}.css)\n`;
  doc += `- [Tests](../src/components/${componentInfo.name}/${componentInfo.name}.test.tsx)\n`;
  doc += `- [Stories](../stories/${componentInfo.name}.stories.tsx)\n`;

  return doc;
}

/**
 * Scan directory recursively for component files
 */
function scanComponents(dir, components = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanComponents(filePath, components);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      // Skip test and story files
      if (!file.includes('.test.') && !file.includes('.stories.')) {
        components.push(filePath);
      }
    }
  });
  
  return components;
}

/**
 * Generate component index
 */
function generateIndex(components) {
  let index = `# Component Index\n\n`;
  index += `This is an automatically generated index of all components in the SirsiMaster Component Library.\n\n`;
  index += `Last updated: ${new Date().toISOString()}\n\n`;
  
  // Group components by category
  const categories = {};
  
  components.forEach(component => {
    const relativePath = path.relative(CONFIG.componentsDir, component.filePath);
    const category = path.dirname(relativePath).split(path.sep)[0] || 'root';
    
    if (!categories[category]) {
      categories[category] = [];
    }
    
    categories[category].push(component);
  });
  
  // Generate index by category
  Object.keys(categories).sort().forEach(category => {
    index += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    
    categories[category].forEach(component => {
      const docPath = `./components/${component.name}.md`;
      index += `- [${component.name}](${docPath})`;
      if (component.description) {
        index += ` - ${component.description}`;
      }
      index += `\n`;
    });
    
    index += `\n`;
  });
  
  // Add usage section
  index += `## Quick Start\n\n`;
  index += `\`\`\`bash\n`;
  index += `npm install @sirsimaster/component-library\n`;
  index += `\`\`\`\n\n`;
  index += `\`\`\`jsx\n`;
  index += `import { Button, Card, Header } from '@sirsimaster/component-library';\n`;
  index += `\`\`\`\n\n`;
  
  // Add links
  index += `## Resources\n\n`;
  index += `- [Storybook](https://sirsimaster.github.io/sirsimaster-component-library)\n`;
  index += `- [GitHub Repository](https://github.com/SirsiMaster/sirsimaster-component-library)\n`;
  index += `- [NPM Package](https://www.npmjs.com/package/@sirsimaster/component-library)\n`;
  index += `- [Migration Guide](./MIGRATION_GUIDE.md)\n`;
  
  return index;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Scanning for components...');
  const componentFiles = scanComponents(CONFIG.componentsDir);
  
  console.log(`📝 Found ${componentFiles.length} components`);
  
  const components = [];
  
  // Process each component
  componentFiles.forEach(filePath => {
    console.log(`  Processing: ${path.basename(filePath)}`);
    
    try {
      const componentInfo = parseComponent(filePath);
      componentInfo.filePath = filePath;
      components.push(componentInfo);
      
      // Generate individual component documentation
      const doc = generateComponentDoc(componentInfo);
      const docPath = path.join(CONFIG.docsDir, `${componentInfo.name}.md`);
      fs.writeFileSync(docPath, doc);
      
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
  });
  
  // Generate index
  console.log('\n📚 Generating component index...');
  const index = generateIndex(components);
  fs.writeFileSync(CONFIG.outputFile, index);
  
  console.log('✅ Documentation generation complete!');
  console.log(`   - ${components.length} components documented`);
  console.log(`   - Index created at: ${CONFIG.outputFile}`);
  console.log(`   - Component docs in: ${CONFIG.docsDir}`);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { parseComponent, generateComponentDoc, generateIndex };
