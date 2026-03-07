package main

// catalog_sql.go — Cloud SQL persistence for CatalogService
// Falls back to in-memory maps when db == nil (dev mode).

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	adminv2 "github.com/sirsimaster/sirsi-nexus/gen/go/sirsi/admin/v2"
)

// ── Product SQL Operations ────────────────────────────────────────

func sqlListProducts(tenantID string, includeArchived bool, categoryFilter string) ([]*adminv2.CatalogProduct, error) {
	query := `SELECT id, tenant_id, name, short_description, description, category,
		price_cents, standalone_price_cents, hours, timeline_weeks, timeline_unit,
		recurring, interval, features, detailed_scope,
		COALESCE(stripe_product_id, ''), COALESCE(stripe_price_id, ''),
		archived, created_at, updated_at
		FROM catalog_products WHERE 1=1`
	args := []interface{}{}
	argIdx := 1

	if tenantID != "" {
		query += " AND tenant_id = $" + itoa(argIdx)
		args = append(args, tenantID)
		argIdx++
	}
	if !includeArchived {
		query += " AND archived = FALSE"
	}
	if categoryFilter != "" {
		query += " AND category = $" + itoa(argIdx)
		args = append(args, categoryFilter)
		argIdx++
	}
	query += " ORDER BY created_at DESC"

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []*adminv2.CatalogProduct
	for rows.Next() {
		p := &adminv2.CatalogProduct{}
		var features, scope []string
		err := rows.Scan(
			&p.Id, &p.TenantId, &p.Name, &p.ShortDescription, &p.Description,
			&p.Category, &p.PriceCents, &p.StandalonePriceCents,
			&p.Hours, &p.TimelineWeeks, &p.TimelineUnit,
			&p.Recurring, &p.Interval, pqArray(&features), pqArray(&scope),
			&p.StripeProductId, &p.StripePriceId,
			&p.Archived, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			log.Printf("sqlListProducts scan error: %v", err)
			continue
		}
		p.Features = features
		p.DetailedScope = scope
		products = append(products, p)
	}
	return products, nil
}

func sqlGetProduct(id string) (*adminv2.CatalogProduct, error) {
	p := &adminv2.CatalogProduct{}
	var features, scope []string
	err := db.QueryRow(`
		SELECT id, tenant_id, name, short_description, description, category,
			price_cents, standalone_price_cents, hours, timeline_weeks, timeline_unit,
			recurring, interval, features, detailed_scope,
			COALESCE(stripe_product_id, ''), COALESCE(stripe_price_id, ''),
			archived, created_at, updated_at
		FROM catalog_products WHERE id = $1
	`, id).Scan(
		&p.Id, &p.TenantId, &p.Name, &p.ShortDescription, &p.Description,
		&p.Category, &p.PriceCents, &p.StandalonePriceCents,
		&p.Hours, &p.TimelineWeeks, &p.TimelineUnit,
		&p.Recurring, &p.Interval, pqArray(&features), pqArray(&scope),
		&p.StripeProductId, &p.StripePriceId,
		&p.Archived, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	p.Features = features
	p.DetailedScope = scope
	return p, nil
}

func sqlUpsertProduct(p *adminv2.CatalogProduct) error {
	_, err := db.Exec(`
		INSERT INTO catalog_products (
			id, tenant_id, name, short_description, description, category,
			price_cents, standalone_price_cents, hours, timeline_weeks, timeline_unit,
			recurring, interval, features, detailed_scope,
			stripe_product_id, stripe_price_id, archived, created_at, updated_at
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
		ON CONFLICT (id) DO UPDATE SET
			name=$3, short_description=$4, description=$5, category=$6,
			price_cents=$7, standalone_price_cents=$8, hours=$9, timeline_weeks=$10,
			timeline_unit=$11, recurring=$12, interval=$13, features=$14,
			detailed_scope=$15, stripe_product_id=$16, stripe_price_id=$17,
			archived=$18, updated_at=$20
	`,
		p.Id, p.TenantId, p.Name, p.ShortDescription, p.Description, p.Category,
		p.PriceCents, p.StandalonePriceCents, p.Hours, p.TimelineWeeks, p.TimelineUnit,
		p.Recurring, p.Interval, pgArray(p.Features), pgArray(p.DetailedScope),
		nullStr(p.StripeProductId), nullStr(p.StripePriceId),
		p.Archived, p.CreatedAt, p.UpdatedAt,
	)
	return err
}

func sqlArchiveProduct(id string) error {
	_, err := db.Exec(`UPDATE catalog_products SET archived = TRUE, updated_at = $1 WHERE id = $2`,
		time.Now().Unix(), id)
	return err
}

func sqlRecoverProduct(id string) error {
	_, err := db.Exec(`UPDATE catalog_products SET archived = FALSE, updated_at = $1 WHERE id = $2`,
		time.Now().Unix(), id)
	return err
}

// ── Bundle SQL Operations ─────────────────────────────────────────

func sqlListBundles(tenantID string, includeArchived bool) ([]*adminv2.CatalogBundle, error) {
	query := `SELECT id, tenant_id, name, short_description, description,
		price_cents, hours, timeline_weeks, timeline_unit, addon_discount_pct,
		included_product_ids,
		COALESCE(stripe_product_id, ''), COALESCE(stripe_price_id, ''),
		archived, created_at, updated_at
		FROM catalog_bundles WHERE 1=1`
	args := []interface{}{}
	argIdx := 1

	if tenantID != "" {
		query += " AND tenant_id = $" + itoa(argIdx)
		args = append(args, tenantID)
		argIdx++
	}
	if !includeArchived {
		query += " AND archived = FALSE"
	}
	query += " ORDER BY created_at DESC"

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bundles []*adminv2.CatalogBundle
	for rows.Next() {
		b := &adminv2.CatalogBundle{}
		var productIds []string
		err := rows.Scan(
			&b.Id, &b.TenantId, &b.Name, &b.ShortDescription, &b.Description,
			&b.PriceCents, &b.Hours, &b.TimelineWeeks, &b.TimelineUnit,
			&b.AddonDiscountPct, pqArray(&productIds),
			&b.StripeProductId, &b.StripePriceId,
			&b.Archived, &b.CreatedAt, &b.UpdatedAt,
		)
		if err != nil {
			log.Printf("sqlListBundles scan error: %v", err)
			continue
		}
		b.IncludedProductIds = productIds
		bundles = append(bundles, b)
	}
	return bundles, nil
}

func sqlUpsertBundle(b *adminv2.CatalogBundle) error {
	_, err := db.Exec(`
		INSERT INTO catalog_bundles (
			id, tenant_id, name, short_description, description,
			price_cents, hours, timeline_weeks, timeline_unit,
			addon_discount_pct, included_product_ids,
			stripe_product_id, stripe_price_id, archived, created_at, updated_at
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
		ON CONFLICT (id) DO UPDATE SET
			name=$3, short_description=$4, description=$5,
			price_cents=$6, hours=$7, timeline_weeks=$8, timeline_unit=$9,
			addon_discount_pct=$10, included_product_ids=$11,
			stripe_product_id=$12, stripe_price_id=$13,
			archived=$14, updated_at=$16
	`,
		b.Id, b.TenantId, b.Name, b.ShortDescription, b.Description,
		b.PriceCents, b.Hours, b.TimelineWeeks, b.TimelineUnit,
		b.AddonDiscountPct, pgArray(b.IncludedProductIds),
		nullStr(b.StripeProductId), nullStr(b.StripePriceId),
		b.Archived, b.CreatedAt, b.UpdatedAt,
	)
	return err
}

// ── Helpers ───────────────────────────────────────────────────────

func itoa(i int) string {
	return fmt.Sprintf("%d", i)
}

func nullStr(s string) sql.NullString {
	if s == "" {
		return sql.NullString{}
	}
	return sql.NullString{String: s, Valid: true}
}

// pgArray converts a Go string slice to a PostgreSQL text array literal
func pgArray(s []string) string {
	if len(s) == 0 {
		return "{}"
	}
	items := make([]string, len(s))
	for i, v := range s {
		items[i] = `"` + strings.ReplaceAll(v, `"`, `\"`) + `"`
	}
	return "{" + strings.Join(items, ",") + "}"
}

// pqArray wraps a *[]string for scanning PostgreSQL arrays
func pqArray(dest *[]string) interface{} {
	return &pgArrayScanner{dest: dest}
}

type pgArrayScanner struct {
	dest *[]string
}

func (s *pgArrayScanner) Scan(src interface{}) error {
	if src == nil {
		*s.dest = []string{}
		return nil
	}
	switch v := src.(type) {
	case string:
		*s.dest = parsePostgresArray(v)
	case []byte:
		*s.dest = parsePostgresArray(string(v))
	default:
		*s.dest = []string{}
	}
	return nil
}

func parsePostgresArray(s string) []string {
	s = strings.TrimPrefix(s, "{")
	s = strings.TrimSuffix(s, "}")
	if s == "" {
		return []string{}
	}
	parts := strings.Split(s, ",")
	result := make([]string, len(parts))
	for i, p := range parts {
		result[i] = strings.Trim(p, `"`)
	}
	return result
}
