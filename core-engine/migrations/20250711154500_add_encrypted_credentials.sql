-- Add encrypted credentials table for Phase 1 production credential management
CREATE TABLE IF NOT EXISTS encrypted_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    credential_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    encrypted_data TEXT NOT NULL,
    nonce TEXT NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id, tenant_id, provider, name)
);

-- Add credential access logs table for audit trail
CREATE TABLE IF NOT EXISTS credential_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_id UUID REFERENCES encrypted_credentials(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    success BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details TEXT
);

-- Add tenants table if it doesn't exist
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_encrypted_credentials_user_tenant ON encrypted_credentials(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_credentials_provider ON encrypted_credentials(provider);
CREATE INDEX IF NOT EXISTS idx_encrypted_credentials_active ON encrypted_credentials(is_active);
CREATE INDEX IF NOT EXISTS idx_credential_access_logs_user_tenant ON credential_access_logs(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_credential_access_logs_timestamp ON credential_access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_credential_access_logs_action ON credential_access_logs(action);

-- Add default tenant for existing users
INSERT INTO tenants (name, description) VALUES ('default', 'Default tenant for existing users') ON CONFLICT DO NOTHING;
