// Enhanced Theme Toggle Test Script
// Run this in browser console to test dark mode functionality

console.log('🌓 SirsiNexus Theme Toggle Test');
console.log('================================');

// Test 1: Check theme provider setup
console.log('\n📋 Test 1: Theme Provider Configuration');
const themeProviders = document.querySelectorAll('[data-theme]');
console.log(`Theme providers found: ${themeProviders.length}`);

const htmlElement = document.documentElement;
console.log(`HTML element classes: ${htmlElement.className}`);
console.log(`HTML data-theme: ${htmlElement.getAttribute('data-theme')}`);

// Test 2: Check for next-themes setup
console.log('\n📋 Test 2: Next-Themes Integration');
const nextThemeScript = document.querySelector('script[data-next-themes]');
console.log(`Next-themes script found: ${!!nextThemeScript}`);

// Test 3: Test theme toggle functionality
console.log('\n📋 Test 3: Theme Toggle Functionality');

function testThemeToggle() {
    const currentTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
    console.log(`Current theme: ${currentTheme}`);
    
    // Try to find theme toggle button
    const themeButtons = [
        ...document.querySelectorAll('button[title*="mode"]'),
        ...document.querySelectorAll('button[aria-label*="theme"]'),
        ...document.querySelectorAll('button[title*="theme"]'),
        ...document.querySelectorAll('button[title*="Switch to"]')
    ];
    
    console.log(`Theme toggle buttons found: ${themeButtons.length}`);
    themeButtons.forEach((btn, i) => {
        console.log(`Button ${i + 1}: ${btn.title || btn.getAttribute('aria-label')}`);
    });
    
    if (themeButtons.length > 0) {
        console.log('Attempting to toggle theme...');
        themeButtons[0].click();
        
        setTimeout(() => {
            const newTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
            console.log(`Theme after toggle: ${newTheme}`);
            console.log(`Toggle successful: ${newTheme !== currentTheme ? '✅' : '❌'}`);
        }, 100);
    }
}

testThemeToggle();

// Test 4: Check component dark mode coverage
console.log('\n📋 Test 4: Component Dark Mode Coverage');

function checkElementDarkMode(selector, name) {
    const elements = document.querySelectorAll(selector);
    let withDark = 0;
    let total = elements.length;
    
    elements.forEach(el => {
        const classes = el.className;
        if (classes.includes('dark:')) {
            withDark++;
        }
    });
    
    const percentage = total > 0 ? Math.round((withDark / total) * 100) : 0;
    console.log(`${name}: ${withDark}/${total} (${percentage}%) have dark: classes`);
    
    return { name, withDark, total, percentage };
}

const components = [
    ['header', 'Header'],
    ['nav', 'Navigation'],
    ['[class*="card"]', 'Cards'],
    ['button', 'Buttons'],
    ['[class*="modal"]', 'Modals'],
    ['[class*="dropdown"]', 'Dropdowns'],
    ['input, textarea', 'Form Elements'],
    ['[class*="sidebar"]', 'Sidebar'],
    ['main', 'Main Content']
];

const results = components.map(([selector, name]) => checkElementDarkMode(selector, name));

// Test 5: Check CSS variables
console.log('\n📋 Test 5: CSS Variables for Theming');
const rootStyles = getComputedStyle(htmlElement);
const themeVars = [
    '--background',
    '--foreground', 
    '--card',
    '--popover',
    '--primary',
    '--secondary',
    '--glass-bg',
    '--glass-border'
];

themeVars.forEach(varName => {
    const value = rootStyles.getPropertyValue(varName);
    console.log(`${varName}: ${value || 'Not found'}`);
});

// Test 6: Check for hardcoded colors
console.log('\n📋 Test 6: Hardcoded Color Detection');
const allElements = document.querySelectorAll('*');
let hardcodedCount = 0;

allElements.forEach(el => {
    const styles = getComputedStyle(el);
    const bgColor = styles.backgroundColor;
    const color = styles.color;
    
    // Check for hardcoded white/black
    if (bgColor === 'rgb(255, 255, 255)' || bgColor === 'rgb(0, 0, 0)' ||
        color === 'rgb(255, 255, 255)' || color === 'rgb(0, 0, 0)') {
        hardcodedCount++;
    }
});

console.log(`Elements with potential hardcoded colors: ${hardcodedCount}`);

// Test 7: Performance check
console.log('\n📋 Test 7: Theme Performance');
console.time('Theme Toggle Time');

// Simulate theme toggle and measure time
if (themeButtons.length > 0) {
    themeButtons[0].click();
    setTimeout(() => {
        console.timeEnd('Theme Toggle Time');
    }, 50);
}

// Summary
console.log('\n📊 Summary Report');
console.log('================');
const totalCoverage = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
console.log(`Average dark mode coverage: ${Math.round(totalCoverage)}%`);

if (totalCoverage >= 90) {
    console.log('✅ Excellent dark mode implementation');
} else if (totalCoverage >= 70) {
    console.log('⚠️ Good dark mode implementation, some improvements needed');
} else {
    console.log('❌ Dark mode implementation needs significant work');
}

// Test recommendations
console.log('\n🔧 Recommendations:');
results.forEach(r => {
    if (r.percentage < 80 && r.total > 0) {
        console.log(`- Improve dark mode for ${r.name} (${r.percentage}% coverage)`);
    }
});

console.log('\n🧪 To test manually:');
console.log('1. Toggle theme using button or keyboard shortcut');
console.log('2. Check all pages in both light and dark modes');
console.log('3. Verify text contrast and readability');
console.log('4. Test modals, dropdowns, and overlays');
console.log('5. Check form elements and inputs');
