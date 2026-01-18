# SirsiNexus Toast Notification System

A comprehensive, feature-rich toast notification system built for the SirsiNexus platform.

## Features

✅ **Multiple Toast Types**: Success, Error, Warning, and Info
✅ **Auto-dismiss**: Configurable duration with smooth animations
✅ **Click-to-dismiss**: Click anywhere on toast or the close button
✅ **Stacked Notifications**: Multiple toasts stack elegantly
✅ **Smooth Animations**: Slide-in/slide-out with easing
✅ **Position Options**: 6 different positions (top-right is default)
✅ **Queue Management**: Limits visible toasts and manages overflow
✅ **Progress Indicator**: Optional progress bar showing remaining time
✅ **Persistent Toasts**: Option for toasts that don't auto-dismiss
✅ **Custom Callbacks**: Execute functions when toast is clicked
✅ **Accessibility**: Proper ARIA attributes and screen reader support
✅ **Responsive Design**: Adapts to mobile and desktop screens
✅ **Dark Mode Support**: Automatically adapts to theme changes

## Quick Start

### 1. Include the Library

```html
<script src="components/ui-library.js"></script>
```

### 2. Basic Usage

```javascript
// Simple notifications
SirsiToast.success('Operation successful!');
SirsiToast.error('Something went wrong!');
SirsiToast.warning('Please be careful!');
SirsiToast.info('Here is some info.');
```

### 3. Advanced Usage

```javascript
// With title and custom duration
SirsiToast.success('Data saved successfully!', {
    title: 'Success',
    duration: 4000
});

// Persistent notification
SirsiToast.warning('Important system maintenance notice.', {
    title: 'Maintenance Alert',
    persistent: true,
    showProgress: false
});

// With callback function
SirsiToast.info('Click to view details.', {
    title: 'New Message',
    onClick: () => {
        // Handle click
        window.location.href = '/messages';
    }
});
```

## API Reference

### Basic Methods

#### `SirsiToast.success(message, options)`
#### `SirsiToast.error(message, options)`
#### `SirsiToast.warning(message, options)`
#### `SirsiToast.info(message, options)`

**Parameters:**
- `message` (string): The notification message
- `options` (object, optional): Configuration options

### Universal Method

#### `SirsiToast.show(options)`

**Parameters:**
- `options` (object): Configuration object

```javascript
SirsiToast.show({
    message: 'Custom notification',
    title: 'Optional Title',
    type: 'success', // 'success', 'error', 'warning', 'info'
    duration: 5000,
    persistent: false,
    showProgress: true,
    onClick: () => console.log('Clicked!')
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `message` | string | - | The notification message (required) |
| `title` | string | null | Optional title for the notification |
| `type` | string | 'info' | Toast type: 'success', 'error', 'warning', 'info' |
| `duration` | number | 5000 | Auto-dismiss time in milliseconds |
| `persistent` | boolean | false | If true, toast won't auto-dismiss |
| `showProgress` | boolean | true | Show/hide the progress bar |
| `onClick` | function | null | Callback function when toast is clicked |

### Utility Methods

#### `SirsiToast.clear()`
Removes all visible toasts immediately.

#### `SirsiToast.setPosition(position)`
Changes the global position for new toasts.

**Available positions:**
- `'top-left'`
- `'top-center'`
- `'top-right'` (default)
- `'bottom-left'`
- `'bottom-center'`
- `'bottom-right'`

### Global Configuration

```javascript
// Change maximum visible toasts
SirsiToast.maxVisible = 3;

// Change default duration
SirsiToast.defaultDuration = 4000;
```

## Examples

### Sequential Notifications
```javascript
const steps = [
    { type: 'info', message: 'Starting process...' },
    { type: 'success', message: 'Step 1 completed' },
    { type: 'success', message: 'Step 2 completed' },
    { type: 'success', message: 'Process finished!' }
];

steps.forEach((step, index) => {
    setTimeout(() => {
        SirsiToast[step.type](step.message);
    }, index * 1000);
});
```

### Form Validation
```javascript
function validateForm() {
    const errors = [];
    
    if (!email.value) errors.push('Email is required');
    if (!password.value) errors.push('Password is required');
    
    if (errors.length > 0) {
        errors.forEach(error => {
            SirsiToast.error(error, { duration: 4000 });
        });
        return false;
    }
    
    SirsiToast.success('Form submitted successfully!');
    return true;
}
```

### Progress Updates
```javascript
function showProgress() {
    SirsiToast.info('Processing...', { 
        persistent: true,
        showProgress: false 
    });
    
    // Simulate async operation
    setTimeout(() => {
        SirsiToast.clear();
        SirsiToast.success('Operation completed!');
    }, 3000);
}
```

## Demo

Open `toast-demo.html` in your browser to see all features in action with an interactive demo.

## Styling

The system uses CSS custom properties for theming. You can override colors by setting these variables:

```css
:root {
    --sirsi-toast-success: #10b981;
    --sirsi-toast-error: #ef4444;
    --sirsi-toast-warning: #f59e0b;
    --sirsi-toast-info: #3b82f6;
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

Part of the SirsiNexus UI Component Library.
