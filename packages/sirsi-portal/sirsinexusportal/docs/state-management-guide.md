# SirsiNexus State Management Guide

Professional loading states, error handling, and offline detection for SirsiNexus applications.

## Quick Start

Include the state management library in your HTML:

```html
<script src="/components/state-management.js"></script>
```

The library automatically initializes and creates global utilities:

- `window.SirsiState` - Main state manager instance
- `window.SirsiStateUtils` - Utility functions for common operations

## Features

### 1. Loading Indicators

#### Overlay Spinners
```javascript
// Show loading overlay on a container
const loadingId = window.SirsiState.showLoadingSpinner(container, 'spinner');

// Hide loading overlay
window.SirsiState.hideLoadingSpinner(loadingId);

// Different types: 'spinner' or 'dots'
const loadingId = window.SirsiState.showLoadingSpinner(container, 'dots');
```

#### Button Loading States
```javascript
const button = document.getElementById('save-btn');

// Set button to loading state
window.SirsiState.setButtonLoading(button, true);

// Remove loading state
window.SirsiState.setButtonLoading(button, false);
```

### 2. Skeleton Loaders

#### Table Skeletons
```javascript
const tableContainer = document.getElementById('data-table');

// Create skeleton with 5 rows and 6 columns
window.SirsiState.createTableSkeleton(tableContainer, 5, 6);
```

#### Card Skeletons
```javascript
const cardContainer = document.getElementById('user-cards');
window.SirsiState.createCardSkeleton(cardContainer);
```

### 3. Empty States

Show professional empty state illustrations:

```javascript
const container = document.getElementById('content-area');

window.SirsiState.showEmptyState(container, {
    type: 'users', // 'users', 'documents', 'search', or 'default'
    title: 'No users found',
    description: 'Add your first user to get started.',
    actionText: 'Add User',
    actionCallback: 'function() { openUserModal(); }'
});
```

### 4. Error Boundaries

Handle and display errors gracefully:

```javascript
try {
    await riskyOperation();
} catch (error) {
    window.SirsiState.createErrorBoundary(container, error, {
        title: 'Something went wrong',
        message: 'Please try again or contact support.',
        retryCallback: () => {
            // Retry logic here
            window.location.reload();
        }
    });
}
```

### 5. Retry Mechanisms

Automatically retry failed operations with exponential backoff:

```javascript
const result = await window.SirsiState.withRetry(async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Network error');
    return response.json();
}, {
    retries: 3,
    delay: 1000,
    exponentialBackoff: true,
    onRetry: (error, attempt) => {
        console.log(`Attempt ${attempt} failed:`, error.message);
    }
});
```

### 6. API Wrapper

Convenient wrapper with built-in state management:

```javascript
const data = await window.SirsiState.apiCall('/api/users', {
    method: 'GET',
    showLoading: true,
    loadingContainer: document.getElementById('table-container'),
    retryOptions: { retries: 2 },
    onSuccess: (data) => {
        console.log('Data loaded:', data);
    },
    onError: (error) => {
        console.error('Failed to load data:', error);
    }
});
```

### 7. Offline Detection

Automatic offline state management:

```javascript
// Check online status
if (window.SirsiState.isOnline) {
    // Proceed with network operation
}

// Show/hide offline banner manually
window.SirsiState.showOfflineBanner();
window.SirsiState.hideOfflineBanner();

// Add to offline queue for when connection returns
window.SirsiState.addToOfflineQueue({
    url: '/api/save',
    options: { method: 'POST', body: data }
});
```

### 8. Graceful Degradation

Show limited functionality warnings:

```javascript
window.SirsiState.showGracefulDegradation(
    container, 
    'Advanced features are temporarily unavailable.',
    '<p><strong>Available:</strong> Basic viewing, search</p>'
);
```

## Enhanced Data Table Component

Use the built-in data table with state management:

```html
<sirsi-data-table 
    data-source="/api/users"
    columns='[{"key":"name","title":"Name"},{"key":"email","title":"Email"}]'>
</sirsi-data-table>
```

The table automatically handles:
- Loading states with skeleton
- Empty states
- Error boundaries with retry
- Responsive design

## Integration Examples

### Form Submission with Loading
```javascript
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('[type="submit"]');
    window.SirsiState.setButtonLoading(submitBtn, true);
    
    try {
        const formData = new FormData(e.target);
        await window.SirsiState.apiCall('/api/users', {
            method: 'POST',
            body: formData
        });
        
        window.SirsiToast.success('User created successfully');
    } catch (error) {
        window.SirsiToast.error('Failed to create user');
    } finally {
        window.SirsiState.setButtonLoading(submitBtn, false);
    }
}
```

### Data Loading with States
```javascript
class DataManager {
    async loadData() {
        const container = document.getElementById('data-container');
        
        // Show skeleton loader
        window.SirsiState.createTableSkeleton(container, 10, 5);
        
        try {
            const data = await fetch('/api/data').then(r => r.json());
            
            if (data.length === 0) {
                // Show empty state
                window.SirsiState.showEmptyState(container, {
                    title: 'No data available',
                    description: 'Try refreshing or adding some data.'
                });
            } else {
                // Render data
                this.renderData(data);
            }
        } catch (error) {
            // Show error boundary
            window.SirsiState.createErrorBoundary(container, error, {
                retryCallback: () => this.loadData()
            });
        }
    }
}
```

## CSS Classes

The library includes comprehensive CSS classes:

### Loading States
- `.sirsi-loading-overlay` - Full overlay with backdrop
- `.sirsi-loading-spinner` - Spinning circle indicator
- `.sirsi-loading-dots` - Three dot animation
- `.sirsi-btn-loading` - Button loading state

### Skeleton Loaders
- `.sirsi-skeleton` - Base skeleton animation
- `.sirsi-skeleton-text` - Text line placeholder
- `.sirsi-skeleton-avatar` - Circular avatar placeholder
- `.sirsi-skeleton-button` - Button placeholder

### State Components
- `.sirsi-empty-state` - Empty state container
- `.sirsi-error-boundary` - Error display container
- `.sirsi-offline-banner` - Offline notification banner
- `.sirsi-graceful-degradation` - Limited functionality notice

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- Mobile responsive design
- Dark mode support

## Best Practices

1. **Always provide fallbacks** - Check if state management is available before using
2. **Use consistent loading patterns** - Skeleton loaders for data, spinners for actions
3. **Meaningful error messages** - Help users understand what went wrong
4. **Accessible design** - Proper ARIA labels and roles
5. **Progressive enhancement** - Basic functionality works without JavaScript

## Configuration

Customize the state manager on initialization:

```javascript
window.SirsiState = new SirsiStateManager({
    retryAttempts: 5,        // Default: 3
    retryDelay: 2000,        // Default: 1000ms
    maxOfflineQueue: 50      // Default: unlimited
});
```

## Demo

See the complete demo at `/demo-state-management.html` for interactive examples of all features.
