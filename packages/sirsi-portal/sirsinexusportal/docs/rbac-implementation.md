# SirsiNexus RBAC Implementation Guide

## Overview

The SirsiNexus Role-Based Access Control (RBAC) system provides comprehensive access management across both server and client sides, ensuring secure and granular control over platform features and data.

## Architecture

### Core Components

1. **RBAC System** (`/assets/js/rbac-system.js`)
   - Central access control engine
   - Role and permission definitions
   - Real-time UI filtering
   - Route protection

2. **Session Manager Integration**
   - Automatic RBAC updates on login/logout
   - Persistent role state
   - Token-based authentication

3. **RBAC UI Component** (`/components/rbac-ui.js`)
   - Visual role indicators
   - Permission-based UI helpers
   - Dynamic content filtering

4. **Mock Backend Support** (`/assets/js/mock-backend.js`)
   - Test users with different roles
   - Simulated permission checks
   - Development testing

## Role Hierarchy

```javascript
1. Super Administrator (Level: 100)
   - Full system access
   - All permissions granted
   - System management capabilities

2. Administrator (Level: 90)
   - Administrative access
   - User and content management
   - System monitoring

3. Manager (Level: 70)
   - Team oversight
   - Content management
   - Analytics access

4. Investor (Level: 50)
   - Investment data access
   - Portfolio viewing
   - Committee participation

5. Committee Member (Level: 40)
   - Committee resources
   - Report creation
   - Limited data access

6. Contributor (Level: 30)
   - Content creation
   - Basic analytics
   - Own content management

7. Viewer (Level: 20)
   - Read-only access
   - Basic analytics viewing
   - Limited features

8. Guest (Level: 10)
   - Public content only
   - Minimal access
   - Registration required for more
```

## Implementation Guide

### 1. Basic Setup

Include the RBAC system in your HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- RBAC System -->
    <script src="/assets/js/rbac-system.js"></script>
    
    <!-- Optional: RBAC UI Component for visual feedback -->
    <script src="/components/rbac-ui.js"></script>
</head>
<body>
    <!-- Optional: Add RBAC UI indicator -->
    <rbac-ui></rbac-ui>
    
    <!-- Your content -->
</body>
</html>
```

### 2. HTML Attribute-Based Access Control

#### Feature-Based Access

```html
<!-- This element will only be visible to users with admin_dashboard feature access -->
<div data-feature="admin_dashboard">
    <h2>Admin Dashboard</h2>
    <!-- Admin-only content -->
</div>

<!-- Multiple features example -->
<nav data-feature="user_management">
    <a href="/admin/users">Manage Users</a>
</nav>
```

#### Permission-Based Access

```html
<!-- This button will only be visible to users with users.create permission -->
<button data-permission="users.create">
    Create New User
</button>

<!-- Disable instead of hide -->
<button data-permission-disable="users.delete">
    Delete User
</button>
```

#### Role-Level Access

```html
<!-- Minimum role level required -->
<section data-role="manager">
    <h3>Manager Tools</h3>
    <!-- Content for managers and above -->
</section>
```

### 3. Programmatic Access Control

#### Check Permissions

```javascript
// Check single permission
if (rbac.hasPermission('users.create')) {
    // User can create users
    showCreateUserForm();
}

// Check multiple permissions (ANY)
if (rbac.hasAnyPermission(['users.update', 'users.delete'])) {
    // User can update OR delete
    showEditControls();
}

// Check multiple permissions (ALL)
if (rbac.hasAllPermissions(['analytics.view', 'analytics.export'])) {
    // User can view AND export
    showExportButton();
}
```

#### Check Features

```javascript
// Check feature access
if (rbac.hasFeatureAccess('investment_dashboard')) {
    // Show investment portal link
    displayInvestmentLink();
}
```

#### Check Role Level

```javascript
// Check if user meets minimum role level
if (rbac.meetsRoleLevel('manager')) {
    // User is manager or above
    showManagementTools();
}
```

#### Guard Pattern

```javascript
// Basic guard
rbac.guard('documents.create', 
    () => {
        // Success callback
        uploadDocument();
    },
    () => {
        // Failure callback
        showPermissionError();
    }
);

// Async guard
await rbac.guardAsync('system.backup',
    async () => {
        // Allowed
        return await performBackup();
    },
    async () => {
        // Denied
        throw new Error('Backup permission required');
    }
);
```

### 4. Dynamic UI Updates

#### Listen for Role Changes

```javascript
document.addEventListener('rbac-role-changed', (event) => {
    const { user, role, permissions } = event.detail;
    console.log(`User role changed to: ${role}`);
    
    // Update UI based on new role
    updateNavigationMenu();
    refreshDashboard();
});
```

#### Manual UI Filtering

```javascript
// Trigger UI update after dynamic content load
rbac.filterUIElements();

// Apply role-based styling
rbac.applyRoleStyling();
```

### 5. Route Protection

```javascript
// Check route access
const canAccess = rbac.checkRouteAccess('/admin/users');
if (!canAccess) {
    // Redirect to unauthorized page
    window.location.href = '/unauthorized';
}

// Get all accessible routes for navigation
const routes = rbac.getAccessibleRoutes();
routes.forEach(route => {
    // Build navigation menu
    createNavLink(route.path, route.name, route.icon);
});
```

### 6. Integration Examples

#### Admin Dashboard Integration

```javascript
// In admin-dashboard.html
document.addEventListener('DOMContentLoaded', function() {
    // Check admin access
    if (!rbac.hasFeatureAccess('admin_dashboard')) {
        window.location.href = '/unauthorized';
        return;
    }
    
    // Load dashboard based on permissions
    if (rbac.hasPermission('users.read')) {
        loadUserStats();
    }
    
    if (rbac.hasPermission('analytics.view')) {
        loadAnalytics();
    }
    
    if (rbac.hasPermission('system.monitor')) {
        loadSystemStatus();
    }
});
```

#### Form Validation

```javascript
// User creation form
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        await rbac.guardAsync('users.create', async () => {
            const formData = new FormData(e.target);
            await createUser(formData);
            showSuccess('User created successfully');
        });
    } catch (error) {
        showError(error.message);
    }
});
```

#### Dynamic Content Loading

```javascript
// Load content based on permissions
async function loadDashboardWidgets() {
    const widgets = [];
    
    if (rbac.hasPermission('analytics.view')) {
        widgets.push(await loadAnalyticsWidget());
    }
    
    if (rbac.hasPermission('users.read')) {
        widgets.push(await loadUsersWidget());
    }
    
    if (rbac.hasPermission('system.monitor')) {
        widgets.push(await loadSystemWidget());
    }
    
    renderWidgets(widgets);
}
```

## Best Practices

### 1. Progressive Enhancement

```javascript
// Start with basic access, enhance based on permissions
function renderDocument(doc) {
    // Everyone can view
    const container = createDocumentView(doc);
    
    // Add edit button if permitted
    rbac.guard('documents.update', () => {
        container.appendChild(createEditButton(doc));
    });
    
    // Add delete button if permitted
    rbac.guard('documents.delete', () => {
        container.appendChild(createDeleteButton(doc));
    });
    
    return container;
}
```

### 2. Graceful Degradation

```javascript
// Provide alternative content for restricted users
function showContent() {
    if (rbac.hasFeatureAccess('advanced_analytics')) {
        loadAdvancedAnalytics();
    } else if (rbac.hasFeatureAccess('basic_analytics')) {
        loadBasicAnalytics();
    } else {
        showUpgradePrompt();
    }
}
```

### 3. Server-Side Validation

```javascript
// Always validate on the server too
async function deleteUser(userId) {
    // Client-side check for immediate feedback
    if (!rbac.hasPermission('users.delete')) {
        showError('Permission denied');
        return;
    }
    
    // Server will also validate
    const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    
    if (response.status === 403) {
        showError('Server: Permission denied');
    }
}
```

## Testing

### 1. Role Switching (Development)

```javascript
// For testing different roles
function switchRole(role) {
    const testUser = {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: role
    };
    
    rbac.setCurrentUser(testUser);
    console.log(`Switched to role: ${role}`);
}

// Test different scenarios
switchRole('admin');
console.log('Can create users?', rbac.hasPermission('users.create')); // true

switchRole('viewer');
console.log('Can create users?', rbac.hasPermission('users.create')); // false
```

### 2. Demo Page

See `/rbac-demo.html` for a complete interactive demonstration of the RBAC system.

## Security Considerations

1. **Client-Side Only**: The RBAC system on the client is for UI/UX purposes only. Always validate permissions on the server.

2. **Token Security**: Store authentication tokens securely and include them in API requests.

3. **Regular Updates**: Keep role definitions synchronized between client and server.

4. **Audit Logging**: Log all permission checks and access attempts on the server.

5. **Principle of Least Privilege**: Grant users only the minimum permissions needed.

## Troubleshooting

### Common Issues

1. **Elements Not Hiding**
   ```javascript
   // Ensure RBAC is initialized
   console.log('RBAC loaded?', window.rbac !== undefined);
   
   // Check current user
   console.log('Current role:', rbac.getCurrentRole());
   
   // Manual refresh
   rbac.filterUIElements();
   ```

2. **Permission Denied**
   ```javascript
   // Debug permissions
   const role = rbac.getCurrentRole();
   const permissions = rbac.getRolePermissions(role);
   console.log(`Role ${role} has permissions:`, permissions);
   ```

3. **Dynamic Content**
   ```javascript
   // After adding content dynamically
   const newContent = document.createElement('div');
   newContent.setAttribute('data-permission', 'admin.view');
   document.body.appendChild(newContent);
   
   // Refresh RBAC filtering
   rbac.filterUIElements();
   ```

## API Reference

### Properties

- `rbac.roles` - All role definitions
- `rbac.permissions` - All permission definitions
- `rbac.rolePermissions` - Role-to-permission mappings
- `rbac.featureAccess` - Feature-to-role mappings

### Methods

- `rbac.getCurrentRole()` - Get current user's role
- `rbac.hasPermission(permission)` - Check single permission
- `rbac.hasAnyPermission(permissions[])` - Check if user has any permission
- `rbac.hasAllPermissions(permissions[])` - Check if user has all permissions
- `rbac.hasFeatureAccess(feature)` - Check feature access
- `rbac.meetsRoleLevel(role)` - Check if user meets minimum role level
- `rbac.getRolePermissions(role)` - Get all permissions for a role
- `rbac.getRoleFeatures(role)` - Get all features for a role
- `rbac.getRoleInfo(role)` - Get role information
- `rbac.getAllRoles()` - Get all role definitions
- `rbac.filterUIElements()` - Apply UI filtering
- `rbac.applyRoleStyling()` - Apply role-based styles
- `rbac.checkRouteAccess(route)` - Check route access
- `rbac.getAccessibleRoutes()` - Get all accessible routes
- `rbac.guard(permission, success, failure)` - Guard function execution
- `rbac.guardAsync(permission, success, failure)` - Async guard

### Events

- `rbac-role-changed` - Fired when user role changes
- `session-created` - Integrated with session manager
- `session-ended` - Integrated with session manager

## Conclusion

The SirsiNexus RBAC system provides a robust, flexible solution for managing access control across the platform. By combining HTML attributes, JavaScript APIs, and visual feedback, it creates a seamless experience for both developers and users while maintaining security through server-side validation.
