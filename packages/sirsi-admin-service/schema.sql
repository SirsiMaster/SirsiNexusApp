-- Sirsi Cloud SQL Schema — v0.9.2-alpha
-- Instance: sirsi-nexus-live:us-central1:sirsi-vault-sql
-- Database: postgres
-- ADR-030 tenant provisioning + ADR-031 catalog/signing persistence

-- ══════════════════════════════════════════════════════════════
-- TENANTS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tenants (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug             VARCHAR(64) UNIQUE NOT NULL,
    name             VARCHAR(255) NOT NULL,
    owner_uid        VARCHAR(128) NOT NULL,
    superadmin_uids  TEXT[] NOT NULL DEFAULT '{}',
    plan             VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'solo', 'business')),
    cloud_provider   VARCHAR(20) NOT NULL DEFAULT 'gcp' CHECK (cloud_provider IN ('gcp', 'aws', 'azure', 'local')),
    provisioning_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (provisioning_status IN ('pending', 'provisioning', 'active', 'suspended', 'archived')),
    stripe_customer_id VARCHAR(128),
    github_repo_url  VARCHAR(512),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_owner ON tenants(owner_uid);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(provisioning_status);

-- ══════════════════════════════════════════════════════════════
-- CATALOG PRODUCTS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS catalog_products (
    id                     VARCHAR(128) PRIMARY KEY,
    tenant_id              VARCHAR(128) NOT NULL DEFAULT 'sirsi',
    name                   VARCHAR(255) NOT NULL,
    short_description      TEXT,
    description            TEXT,
    category               VARCHAR(64) NOT NULL DEFAULT 'service',
    price_cents            BIGINT NOT NULL DEFAULT 0,
    standalone_price_cents BIGINT NOT NULL DEFAULT 0,
    hours                  INTEGER NOT NULL DEFAULT 0,
    timeline_weeks         INTEGER NOT NULL DEFAULT 0,
    timeline_unit          VARCHAR(20) NOT NULL DEFAULT 'weeks',
    recurring              BOOLEAN NOT NULL DEFAULT FALSE,
    interval               VARCHAR(20) NOT NULL DEFAULT 'one_time',
    features               TEXT[] NOT NULL DEFAULT '{}',
    detailed_scope         TEXT[] NOT NULL DEFAULT '{}',
    stripe_product_id      VARCHAR(128),
    stripe_price_id        VARCHAR(128),
    archived               BOOLEAN NOT NULL DEFAULT FALSE,
    created_at             BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at             BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_products_tenant ON catalog_products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON catalog_products(category);
CREATE INDEX IF NOT EXISTS idx_products_archived ON catalog_products(archived);

-- ══════════════════════════════════════════════════════════════
-- CATALOG BUNDLES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS catalog_bundles (
    id                     VARCHAR(128) PRIMARY KEY,
    tenant_id              VARCHAR(128) NOT NULL DEFAULT 'sirsi',
    name                   VARCHAR(255) NOT NULL,
    short_description      TEXT,
    description            TEXT,
    price_cents            BIGINT NOT NULL DEFAULT 0,
    hours                  INTEGER NOT NULL DEFAULT 0,
    timeline_weeks         INTEGER NOT NULL DEFAULT 0,
    timeline_unit          VARCHAR(20) NOT NULL DEFAULT 'weeks',
    addon_discount_pct     INTEGER NOT NULL DEFAULT 0,
    included_product_ids   TEXT[] NOT NULL DEFAULT '{}',
    stripe_product_id      VARCHAR(128),
    stripe_price_id        VARCHAR(128),
    archived               BOOLEAN NOT NULL DEFAULT FALSE,
    created_at             BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at             BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_bundles_tenant ON catalog_bundles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bundles_archived ON catalog_bundles(archived);

-- ══════════════════════════════════════════════════════════════
-- SIGNING ENVELOPES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS signing_envelopes (
    id              VARCHAR(128) PRIMARY KEY,
    tenant_id       VARCHAR(128) NOT NULL DEFAULT 'sirsi',
    title           VARCHAR(255) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'completed', 'voided')),
    created_by      VARCHAR(128),
    signers         JSONB NOT NULL DEFAULT '[]',
    documents       JSONB NOT NULL DEFAULT '[]',
    payment_status  VARCHAR(20) NOT NULL DEFAULT 'none' CHECK (payment_status IN ('none', 'pending', 'paid', 'failed')),
    stripe_session_id VARCHAR(128),
    amount_cents    BIGINT NOT NULL DEFAULT 0,
    sha256_hash     VARCHAR(64),
    signed_at       BIGINT,
    created_at      BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at      BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_envelopes_tenant ON signing_envelopes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_envelopes_status ON signing_envelopes(status);
CREATE INDEX IF NOT EXISTS idx_envelopes_created_by ON signing_envelopes(created_by);

-- ══════════════════════════════════════════════════════════════
-- PROVISIONING STATUS (replaces in-memory map)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS provisioning_status (
    tenant_id       VARCHAR(128) PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    state           VARCHAR(20) NOT NULL DEFAULT 'pending',
    overall_progress INTEGER NOT NULL DEFAULT 0,
    firebase_status  VARCHAR(20) NOT NULL DEFAULT 'pending',
    stripe_status    VARCHAR(20) NOT NULL DEFAULT 'pending',
    github_status    VARCHAR(20) NOT NULL DEFAULT 'pending',
    dns_status       VARCHAR(20) NOT NULL DEFAULT 'pending',
    error_message    TEXT,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════
-- SCHEMA VERSION TRACKING
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS schema_migrations (
    version     INTEGER PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_migrations (version, description)
VALUES (1, 'Initial schema: tenants, catalog, signing, provisioning')
ON CONFLICT (version) DO NOTHING;
