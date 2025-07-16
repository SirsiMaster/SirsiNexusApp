-- RBAC (Role-Based Access Control) Database Migration
-- Create tables for roles, permissions, and user role assignments

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT permissions_name_format CHECK (name ~ '^[a-z0-9_]+:[a-z0-9_]+$')
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT roles_name_format CHECK (name ~ '^[a-z0-9_]+$')
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_by UUID NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires_at ON user_roles(expires_at) WHERE expires_at IS NOT NULL;

-- Insert basic permissions
INSERT INTO permissions (name, resource, action, description) VALUES
    ('users:create', 'users', 'create', 'Create new users'),
    ('users:read', 'users', 'read', 'View user information'),
    ('users:update', 'users', 'update', 'Update user information'),
    ('users:delete', 'users', 'delete', 'Delete users'),
    
    ('roles:create', 'roles', 'create', 'Create new roles'),
    ('roles:read', 'roles', 'read', 'View role information'),
    ('roles:update', 'roles', 'update', 'Update role information'),
    ('roles:delete', 'roles', 'delete', 'Delete roles'),
    
    ('projects:create', 'projects', 'create', 'Create new projects'),
    ('projects:read', 'projects', 'read', 'View project information'),
    ('projects:update', 'projects', 'update', 'Update project information'),
    ('projects:delete', 'projects', 'delete', 'Delete projects'),
    
    ('agents:create', 'agents', 'create', 'Create new agents'),
    ('agents:read', 'agents', 'read', 'View agent information'),
    ('agents:update', 'agents', 'update', 'Update agent configuration'),
    ('agents:delete', 'agents', 'delete', 'Delete agents'),
    
    ('aws:read', 'aws', 'read', 'Read AWS resources'),
    ('aws:write', 'aws', 'write', 'Modify AWS resources'),
    
    ('azure:read', 'azure', 'read', 'Read Azure resources'),
    ('azure:write', 'azure', 'write', 'Modify Azure resources'),
    
    ('gcp:read', 'gcp', 'read', 'Read GCP resources'),
    ('gcp:write', 'gcp', 'write', 'Modify GCP resources'),
    
    ('migration:read', 'migration', 'read', 'View migration plans'),
    ('migration:write', 'migration', 'write', 'Execute migration plans'),
    
    ('billing:read', 'billing', 'read', 'View billing information'),
    ('billing:write', 'billing', 'write', 'Modify billing settings'),
    
    ('security:read', 'security', 'read', 'View security reports'),
    ('security:write', 'security', 'write', 'Modify security settings'),
    
    ('audit:read', 'audit', 'read', 'View audit logs'),
    ('analytics:read', 'analytics', 'read', 'View analytics and reports'),
    
    ('system:admin', 'system', 'admin', 'Full system administration access')
ON CONFLICT (name) DO NOTHING;

-- Insert system roles
INSERT INTO roles (name, description, permissions, is_system_role) VALUES
    ('admin', 'System Administrator', ARRAY[
        'users:create', 'users:read', 'users:update', 'users:delete',
        'roles:create', 'roles:read', 'roles:update', 'roles:delete',
        'projects:create', 'projects:read', 'projects:update', 'projects:delete',
        'agents:create', 'agents:read', 'agents:update', 'agents:delete',
        'aws:read', 'aws:write', 'azure:read', 'azure:write', 'gcp:read', 'gcp:write',
        'migration:read', 'migration:write', 'billing:read', 'billing:write',
        'security:read', 'security:write', 'audit:read', 'analytics:read',
        'system:admin'
    ], TRUE),
    
    ('user', 'Standard User', ARRAY[
        'projects:create', 'projects:read', 'projects:update',
        'agents:create', 'agents:read', 'agents:update',
        'aws:read', 'azure:read', 'gcp:read',
        'migration:read', 'analytics:read'
    ], TRUE),
    
    ('viewer', 'Read-Only User', ARRAY[
        'projects:read', 'agents:read',
        'aws:read', 'azure:read', 'gcp:read',
        'migration:read', 'analytics:read'
    ], TRUE)
ON CONFLICT (name) DO NOTHING;

-- Create trigger to update updated_at timestamp on roles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE permissions IS 'System permissions that can be assigned to roles';
COMMENT ON TABLE roles IS 'User roles with associated permissions';
COMMENT ON TABLE user_roles IS 'Assignment of roles to users';

COMMENT ON COLUMN permissions.name IS 'Unique permission identifier in format resource:action';
COMMENT ON COLUMN permissions.resource IS 'Resource type this permission applies to';
COMMENT ON COLUMN permissions.action IS 'Action type (create, read, update, delete, etc.)';

COMMENT ON COLUMN roles.permissions IS 'Array of permission names assigned to this role';
COMMENT ON COLUMN roles.is_system_role IS 'Whether this is a built-in system role that cannot be deleted';

COMMENT ON COLUMN user_roles.expires_at IS 'Optional expiration time for temporary role assignments';
