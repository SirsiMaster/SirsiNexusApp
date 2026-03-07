package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
)

// ── Cloud SQL Connection Pool ────────────────────────────────────
//
// Connection options:
//   1. DATABASE_URL env var (Cloud Run with Cloud SQL Proxy sidecar)
//      e.g. postgres://sirsi-admin:pass@/postgres?host=/cloudsql/sirsi-nexus-live:us-central1:sirsi-vault-sql
//   2. Falls back to nil (uses in-memory stores — dev mode)

var db *sql.DB

// initDB initializes the Cloud SQL connection pool.
// Returns nil if no database configuration is found (dev mode).
func initDB() *sql.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Println("ℹ️ No DATABASE_URL — using in-memory stores (dev mode)")
		return nil
	}

	pool, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Printf("⚠️ Cloud SQL: failed to open: %v (falling back to in-memory)", err)
		return nil
	}
	pool.SetMaxOpenConns(10)
	pool.SetMaxIdleConns(5)

	if err := pool.Ping(); err != nil {
		log.Printf("⚠️ Cloud SQL: ping failed: %v (falling back to in-memory)", err)
		pool.Close()
		return nil
	}

	log.Println("✅ Cloud SQL connected via DATABASE_URL")
	return pool
}

// runMigrations applies the schema.sql if the schema_migrations table doesn't exist.
func runMigrations(pool *sql.DB) error {
	if pool == nil {
		return nil
	}

	var exists bool
	err := pool.QueryRow(`
		SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_name = 'schema_migrations'
		)
	`).Scan(&exists)

	if err != nil || !exists {
		log.Println("🔄 Running initial schema migration...")
		schema, err := os.ReadFile("schema.sql")
		if err != nil {
			return fmt.Errorf("failed to read schema.sql: %w", err)
		}
		if _, err := pool.Exec(string(schema)); err != nil {
			return fmt.Errorf("failed to apply schema: %w", err)
		}
		log.Println("✅ Schema migration applied successfully")
	} else {
		log.Println("✅ Schema already up to date")
	}

	return nil
}

// useDB returns true if a Cloud SQL connection is available.
func useDB() bool {
	return db != nil
}
