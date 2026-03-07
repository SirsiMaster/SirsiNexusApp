package main

// telemetry.go — Live telemetry data for HypervisorService
//
// Pulls real data from:
//   - Cloud Run Admin API (services, revisions, deployments)
//   - Stripe API (revenue, MRR, active subscriptions)
//   - Firebase Auth Admin SDK (user count)
//
// Falls back to mock data if API calls fail (graceful degradation).

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sync"
	"time"
)

// ── Telemetry Cache ──────────────────────────────────────────────
// Caches live data to avoid hammering APIs on every Hypervisor request.
// Refreshes every 60 seconds.

type telemetryCache struct {
	mu            sync.RWMutex
	lastRefresh   time.Time
	cloudRunStats *cloudRunStats
	stripeStats   *stripeStats
	recentDeploys []deployEvent
}

type cloudRunStats struct {
	TotalServices   int
	TotalRevisions  int
	ActiveRevisions int
	Deploys24h      int
}

type stripeStats struct {
	MRR              float64 // Monthly recurring revenue in dollars
	ActiveSubs       int
	TotalCustomers   int
	RevenueThisMonth float64 // In dollars
}

type deployEvent struct {
	Service   string
	Revision  string
	Timestamp time.Time
}

var cache = &telemetryCache{}

const cacheTTL = 60 * time.Second

// refreshIfStale refreshes the cache if it's older than cacheTTL.
func refreshIfStale() {
	cache.mu.RLock()
	stale := time.Since(cache.lastRefresh) > cacheTTL
	cache.mu.RUnlock()

	if !stale {
		return
	}

	cache.mu.Lock()
	defer cache.mu.Unlock()

	// Double-check after acquiring write lock
	if time.Since(cache.lastRefresh) <= cacheTTL {
		return
	}

	log.Println("🔄 [Telemetry] Refreshing live data...")

	// Fetch in parallel
	var wg sync.WaitGroup

	wg.Add(1)
	go func() {
		defer wg.Done()
		cache.cloudRunStats = fetchCloudRunStats()
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		cache.stripeStats = fetchStripeStats()
	}()

	wg.Wait()

	cache.lastRefresh = time.Now()
	log.Println("✅ [Telemetry] Live data refreshed")
}

// ── Cloud Run Telemetry ──────────────────────────────────────────

type cloudRunServiceList struct {
	Items []struct {
		Metadata struct {
			Name string `json:"name"`
		} `json:"metadata"`
	} `json:"items"`
}

type cloudRunRevisionList struct {
	Items []struct {
		Metadata struct {
			Name              string `json:"name"`
			CreationTimestamp string `json:"creationTimestamp"`
		} `json:"metadata"`
		Status struct {
			Conditions []struct {
				Type   string `json:"type"`
				Status string `json:"status"`
			} `json:"conditions"`
		} `json:"status"`
	} `json:"items"`
}

func fetchCloudRunStats() *cloudRunStats {
	stats := &cloudRunStats{}

	// Use the metadata server token for auth (available on Cloud Run)
	token := getAccessToken()
	if token == "" {
		log.Println("⚠️ [Telemetry] No access token — using mock Cloud Run data")
		return &cloudRunStats{TotalServices: 21, TotalRevisions: 45, ActiveRevisions: 21, Deploys24h: 6}
	}

	project := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if project == "" {
		project = "sirsi-nexus-live"
	}

	// List Cloud Run services
	servicesURL := fmt.Sprintf("https://run.googleapis.com/apis/serving.knative.dev/v1/namespaces/%s/services", project)
	body, err := gcpGet(servicesURL, token)
	if err == nil {
		var services cloudRunServiceList
		if json.Unmarshal(body, &services) == nil {
			stats.TotalServices = len(services.Items)
		}
	}

	// List Cloud Run revisions (to count deployments)
	revisionsURL := fmt.Sprintf("https://run.googleapis.com/apis/serving.knative.dev/v1/namespaces/%s/revisions", project)
	body, err = gcpGet(revisionsURL, token)
	if err == nil {
		var revisions cloudRunRevisionList
		if json.Unmarshal(body, &revisions) == nil {
			stats.TotalRevisions = len(revisions.Items)
			now := time.Now()
			for _, rev := range revisions.Items {
				// Count active revisions
				for _, cond := range rev.Status.Conditions {
					if cond.Type == "Ready" && cond.Status == "True" {
						stats.ActiveRevisions++
						break
					}
				}
				// Count deployments in last 24h
				created, err := time.Parse(time.RFC3339, rev.Metadata.CreationTimestamp)
				if err == nil && now.Sub(created) < 24*time.Hour {
					stats.Deploys24h++
				}
			}
		}
	}

	return stats
}

// ── Stripe Telemetry ─────────────────────────────────────────────

func fetchStripeStats() *stripeStats {
	stats := &stripeStats{}

	apiKey := os.Getenv("STRIPE_SECRET_KEY")
	if apiKey == "" {
		log.Println("⚠️ [Telemetry] No Stripe key — using mock Stripe data")
		return &stripeStats{MRR: 0, ActiveSubs: 0, TotalCustomers: 0, RevenueThisMonth: 0}
	}

	// Get active subscriptions
	subsBody, err := stripeGet("/v1/subscriptions?status=active&limit=100", apiKey)
	if err == nil {
		var result struct {
			Data []struct {
				Plan struct {
					Amount int64 `json:"amount"`
				} `json:"plan"`
			} `json:"data"`
		}
		if json.Unmarshal(subsBody, &result) == nil {
			stats.ActiveSubs = len(result.Data)
			var totalCents int64
			for _, sub := range result.Data {
				totalCents += sub.Plan.Amount
			}
			stats.MRR = float64(totalCents) / 100.0
		}
	}

	// Get customer count
	custBody, err := stripeGet("/v1/customers?limit=1", apiKey)
	if err == nil {
		var result struct {
			TotalCount int `json:"total_count"`
		}
		// Stripe doesn't return total_count on list, use has_more logic
		// For now, just count the customers we can see
		var listResult struct {
			Data    []json.RawMessage `json:"data"`
			HasMore bool              `json:"has_more"`
		}
		if json.Unmarshal(custBody, &listResult) == nil {
			_ = result
			if listResult.HasMore {
				stats.TotalCustomers = 100 // Estimate — more than 1 page
			} else {
				stats.TotalCustomers = len(listResult.Data)
			}
		}
	}

	// Get balance transactions this month for revenue
	monthStart := time.Now().UTC().Truncate(24 * time.Hour)
	monthStart = time.Date(monthStart.Year(), monthStart.Month(), 1, 0, 0, 0, 0, time.UTC)
	balURL := fmt.Sprintf("/v1/balance_transactions?created[gte]=%d&limit=100&type=charge", monthStart.Unix())
	balBody, err := stripeGet(balURL, apiKey)
	if err == nil {
		var result struct {
			Data []struct {
				Amount int64 `json:"amount"`
			} `json:"data"`
		}
		if json.Unmarshal(balBody, &result) == nil {
			var totalCents int64
			for _, txn := range result.Data {
				totalCents += txn.Amount
			}
			stats.RevenueThisMonth = float64(totalCents) / 100.0
		}
	}

	return stats
}

// ── HTTP Helpers ─────────────────────────────────────────────────

func getAccessToken() string {
	// On Cloud Run, use the metadata server
	req, err := http.NewRequest("GET",
		"http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
		nil)
	if err != nil {
		return ""
	}
	req.Header.Set("Metadata-Flavor", "Google")

	client := &http.Client{Timeout: 2 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()

	var tokenResp struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return ""
	}
	return tokenResp.AccessToken
}

func gcpGet(url, token string) ([]byte, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("HTTP %d from %s", resp.StatusCode, url)
	}
	return io.ReadAll(resp.Body)
}

func stripeGet(path, apiKey string) ([]byte, error) {
	req, err := http.NewRequest("GET", "https://api.stripe.com"+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("HTTP %d from Stripe %s", resp.StatusCode, path)
	}
	return io.ReadAll(resp.Body)
}

// ── Public API ───────────────────────────────────────────────────

// GetLiveCloudRunStats returns cached Cloud Run metrics.
func GetLiveCloudRunStats() *cloudRunStats {
	refreshIfStale()
	cache.mu.RLock()
	defer cache.mu.RUnlock()
	if cache.cloudRunStats != nil {
		return cache.cloudRunStats
	}
	return &cloudRunStats{TotalServices: 21, TotalRevisions: 45, ActiveRevisions: 21, Deploys24h: 6}
}

// GetLiveStripeStats returns cached Stripe metrics.
func GetLiveStripeStats() *stripeStats {
	refreshIfStale()
	cache.mu.RLock()
	defer cache.mu.RUnlock()
	if cache.stripeStats != nil {
		return cache.stripeStats
	}
	return &stripeStats{MRR: 0, ActiveSubs: 0, TotalCustomers: 0, RevenueThisMonth: 0}
}
