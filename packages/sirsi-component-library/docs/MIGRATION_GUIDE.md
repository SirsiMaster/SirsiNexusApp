# Component Migration Guide

This guide provides step-by-step instructions for migrating existing components from various projects into the SirsiMaster Component Library.

## 📋 Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Migration Process](#migration-process)
3. [Component Standards](#component-standards)
4. [Testing Requirements](#testing-requirements)
5. [Documentation Requirements](#documentation-requirements)
6. [Common Migration Patterns](#common-migration-patterns)
7. [Post-Migration Checklist](#post-migration-checklist)

## Pre-Migration Checklist

Before migrating a component, ensure you have:

- [ ] Identified all instances of the component across projects
- [ ] Listed all dependencies and project-specific code
- [ ] Documented current usage patterns
- [ ] Identified potential breaking changes
- [ ] Planned the generic API design

## Migration Process

### Step 1: Audit Existing Component

```bash
# Find all versions of the component
find /path/to/project -name "*ComponentName*" -type f

# Check for usage
grep -r "ComponentName" /path/to/project --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"

# List dependencies
grep -E "^import|^const.*require" /path/to/component.js
```

### Step 2: Create Generic Version

#### Original (Project-Specific)
```javascript
// Assiduous specific header
import { firebaseAuth } from '../firebase/config';
import { useAssidousUser } from '../hooks/useUser';

export const AssidousHeader = () => {
  const user = useAssidousUser();
  
  return (
    <header className="assiduous-header">
      <img src="/assiduous-logo.png" alt="Assiduous" />
      <nav>{/* Assiduous specific navigation */}</nav>
      <button onClick={() => firebaseAuth.signOut()}>Logout</button>
    </header>
  );
};
```

#### Migrated (Generic Library Version)
```typescript
// Generic header component
export interface HeaderProps {
  logo?: {
    src: string;
    alt: string;
    href?: string;
  };
  navigation?: NavigationItem[];
  user?: {
    name: string;
    avatar?: string;
  };
  onLogout?: () => void;
  theme?: 'light' | 'dark' | 'custom';
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  logo,
  navigation = [],
  user,
  onLogout,
  theme = 'light',
  className = '',
}) => {
  return (
    <header className={`sm-header sm-header--${theme} ${className}`}>
      {logo && (
        <div className="sm-header__logo">
          <img src={logo.src} alt={logo.alt} />
        </div>
      )}
      
      <nav className="sm-header__nav">
        {navigation.map(item => (
          <NavItem key={item.id} {...item} />
        ))}
      </nav>
      
      {user && (
        <div className="sm-header__user">
          <span>{user.name}</span>
          {onLogout && (
            <button onClick={onLogout} className="sm-header__logout">
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
};
```

### Step 3: File Structure Setup

```bash
# Create component directory
mkdir -p src/components/layout/Header

# Create component files
touch src/components/layout/Header/Header.tsx
touch src/components/layout/Header/Header.css
touch src/components/layout/Header/Header.types.ts
touch src/components/layout/Header/Header.test.tsx
touch src/components/layout/Header/Header.stories.tsx
touch src/components/layout/Header/index.ts
touch src/components/layout/Header/README.md
```

### Step 4: Implement Component Files

#### Header.types.ts
```typescript
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  children?: NavigationItem[];
}

export interface HeaderProps {
  // ... props definition
}
```

#### Header.tsx
```typescript
import React from 'react';
import { HeaderProps } from './Header.types';
import './Header.css';

export const Header: React.FC<HeaderProps> = (props) => {
  // Implementation
};
```

#### Header.css
```css
.sm-header {
  /* Base styles */
  --header-height: 64px;
  --header-bg: var(--color-surface);
  --header-border: var(--color-border);
  
  display: flex;
  align-items: center;
  height: var(--header-height);
  padding: 0 var(--spacing-lg);
  background: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
}

.sm-header--dark {
  --header-bg: var(--color-surface-dark);
  --header-border: var(--color-border-dark);
}
```

#### Header.test.tsx
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

describe('Header Component', () => {
  test('renders logo when provided', () => {
    render(<Header logo={{ src: 'test.png', alt: 'Test' }} />);
    expect(screen.getByAltText('Test')).toBeInTheDocument();
  });
  
  test('calls onLogout when logout button clicked', () => {
    const handleLogout = jest.fn();
    render(<Header user={{ name: 'John' }} onLogout={handleLogout} />);
    fireEvent.click(screen.getByText('Logout'));
    expect(handleLogout).toHaveBeenCalled();
  });
});
```

#### Header.stories.tsx
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    logo: {
      src: '/logo.png',
      alt: 'Company Logo',
    },
    navigation: [
      { id: '1', label: 'Home', href: '/' },
      { id: '2', label: 'About', href: '/about' },
    ],
  },
};

export const WithUser: Story = {
  args: {
    ...Default.args,
    user: {
      name: 'John Doe',
      avatar: '/avatar.jpg',
    },
    onLogout: () => console.log('Logout clicked'),
  },
};
```

### Step 5: Update Project to Use Library Component

#### In Assiduous (or source project)
```javascript
// Before - Using local component
import { AssidousHeader } from './components/AssidousHeader';

// After - Using library component
import { Header } from '@sirsimaster/component-library';

// Usage with project-specific props
<Header
  logo={{
    src: '/assiduous-logo.png',
    alt: 'Assiduous',
  }}
  navigation={assidousNavItems}
  user={currentUser}
  onLogout={() => firebaseAuth.signOut()}
  theme="light"
  className="assiduous-custom"
/>
```

## Component Standards

### Naming Conventions

```typescript
// Component files
ComponentName.tsx       // Main component
ComponentName.types.ts  // TypeScript types
ComponentName.css      // Styles
ComponentName.test.tsx // Tests
ComponentName.stories.tsx // Storybook stories

// CSS classes
.sm-component-name     // Base class (sm = SirsiMaster)
.sm-component-name--variant // Modifier
.sm-component-name__element // Child element
```

### Props Standards

```typescript
interface ComponentProps {
  // Required props first
  requiredProp: string;
  
  // Optional props with defaults
  optionalProp?: string;
  
  // Event handlers
  onClick?: (event: MouseEvent) => void;
  
  // Style customization
  className?: string;
  style?: CSSProperties;
  
  // Theme
  theme?: 'light' | 'dark' | 'custom';
  
  // Children (if applicable)
  children?: ReactNode;
  
  // Spread props for flexibility
  [key: string]: any;
}
```

### Style Guidelines

```css
/* Use CSS custom properties for theming */
.sm-component {
  /* Define component-specific variables */
  --component-bg: var(--color-surface);
  --component-text: var(--color-text);
  
  /* Use the variables */
  background: var(--component-bg);
  color: var(--component-text);
  
  /* Responsive by default */
  width: 100%;
  max-width: 100%;
  
  /* Use design system spacing */
  padding: var(--spacing-md);
  margin: var(--spacing-sm) 0;
}

/* Dark theme support */
.sm-component--dark {
  --component-bg: var(--color-surface-dark);
  --component-text: var(--color-text-dark);
}

/* Mobile-first responsive design */
@media (min-width: 768px) {
  .sm-component {
    /* Tablet and desktop styles */
  }
}
```

## Testing Requirements

### Unit Tests (Required)

```typescript
describe('ComponentName', () => {
  // Rendering tests
  test('renders without crashing', () => {});
  test('renders with all props', () => {});
  
  // Interaction tests
  test('handles click events', () => {});
  test('updates state correctly', () => {});
  
  // Accessibility tests
  test('has proper ARIA attributes', () => {});
  test('is keyboard navigable', () => {});
  
  // Edge cases
  test('handles missing optional props', () => {});
  test('handles empty data', () => {});
});
```

### Visual Tests (Storybook)

Create stories for:
- Default state
- All prop variations
- Interactive states (hover, focus, active)
- Different themes
- Responsive breakpoints
- Edge cases (long text, empty state)

## Documentation Requirements

### Component README Template

```markdown
# ComponentName

Brief description of what the component does.

## Installation

\`\`\`bash
npm install @sirsimaster/component-library
\`\`\`

## Usage

\`\`\`jsx
import { ComponentName } from '@sirsimaster/component-library';

function App() {
  return (
    <ComponentName
      prop1="value"
      prop2={value}
      onEvent={handleEvent}
    />
  );
}
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| prop1 | string | - | Required. Description |
| prop2 | number | 0 | Optional. Description |

## Examples

### Basic Usage
\`\`\`jsx
<ComponentName prop1="hello" />
\`\`\`

### Advanced Usage
\`\`\`jsx
<ComponentName
  prop1="hello"
  prop2={42}
  theme="dark"
  className="custom-class"
/>
\`\`\`

## Accessibility

- Keyboard navigation support
- ARIA attributes included
- Screen reader friendly

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
```

## Common Migration Patterns

### Pattern 1: Removing Framework Dependencies

```javascript
// Before - React specific
import { useState, useEffect } from 'react';

// After - Vanilla JS with framework adapters
// vanilla/Component.js
export class Component {
  constructor(options) {
    this.options = options;
  }
}

// react/Component.jsx
import { Component as VanillaComponent } from '../vanilla/Component';
export const Component = (props) => {
  // React wrapper
};
```

### Pattern 2: Abstracting Data Sources

```javascript
// Before - Firebase specific
import { db } from '../firebase';
const data = await db.collection('items').get();

// After - Generic data interface
export interface DataProvider {
  getData(): Promise<Item[]>;
}

export const Component = ({ dataProvider }: { dataProvider: DataProvider }) => {
  const data = await dataProvider.getData();
};
```

### Pattern 3: Theme Abstraction

```javascript
// Before - Project specific colors
.header {
  background: #FF5722; /* Assiduous orange */
}

// After - Theme variables
.sm-header {
  background: var(--color-primary);
}

// Projects define their own theme
:root {
  --color-primary: #FF5722; /* Assiduous orange */
}
```

## Post-Migration Checklist

### In Component Library

- [ ] Component added to src/components/
- [ ] TypeScript types defined
- [ ] Unit tests passing (>80% coverage)
- [ ] Storybook stories created
- [ ] Documentation written
- [ ] Component exported in index.ts
- [ ] Version bumped in package.json
- [ ] CHANGELOG updated

### In Source Project

- [ ] Old component removed
- [ ] Library component imported
- [ ] All usages updated
- [ ] Project-specific styles applied via className
- [ ] Integration tested
- [ ] Build successful
- [ ] Deploy successful

### Documentation Updates

- [ ] Library README updated
- [ ] Migration logged in MIGRATION_LOG.md
- [ ] Breaking changes documented
- [ ] Example added to playground
- [ ] Storybook deployed

## Migration Log Template

Create an entry in `MIGRATION_LOG.md`:

```markdown
## [ComponentName] - YYYY-MM-DD

**Source**: ProjectName/path/to/component
**Migrated By**: Developer Name
**Version**: 1.0.0

### Changes Made
- Removed Firebase dependencies
- Made theme configurable
- Added TypeScript types
- Improved accessibility

### Breaking Changes
- Prop `userId` renamed to `user`
- Event `onClose` renamed to `onDismiss`

### Migration Path
\`\`\`javascript
// Old usage
<AssidousModal userId={user.id} onClose={handleClose} />

// New usage
<Modal user={user} onDismiss={handleClose} />
\`\`\`

### Projects Updated
- [x] Assiduous
- [ ] Project2
- [ ] Project3
```

## Automation Scripts

### Migrate Component Script

```bash
#!/bin/bash
# scripts/migrate-component.sh

COMPONENT_NAME=$1
SOURCE_PATH=$2
TARGET_CATEGORY=$3

# Create component structure
mkdir -p src/components/$TARGET_CATEGORY/$COMPONENT_NAME

# Copy and transform files
cp $SOURCE_PATH src/components/$TARGET_CATEGORY/$COMPONENT_NAME/

# Generate boilerplate
node scripts/generate-component.js $COMPONENT_NAME $TARGET_CATEGORY

# Run tests
npm test src/components/$TARGET_CATEGORY/$COMPONENT_NAME

# Update exports
node scripts/update-exports.js $COMPONENT_NAME

echo "Component $COMPONENT_NAME migrated successfully!"
```

### Usage
```bash
./scripts/migrate-component.sh Header ../assiduous/components/header.js layout
```

## Troubleshooting

### Common Issues

1. **Circular Dependencies**
   - Solution: Use dependency injection or callbacks

2. **Style Conflicts**
   - Solution: Use CSS modules or prefixed classes

3. **Type Mismatches**
   - Solution: Create adapter functions or use generics

4. **Performance Regression**
   - Solution: Add memoization or lazy loading

5. **Bundle Size Increase**
   - Solution: Tree-shaking and code splitting

## Support

For help with migrations:
- Check existing examples in `/examples/migrations/`
- Ask in #component-library Slack channel
- Create an issue with `migration-help` label

---

*Last Updated: 2025-09-09*
