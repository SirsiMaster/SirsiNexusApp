package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"connectrpc.com/connect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	adminv2 "github.com/sirsimaster/sirsi-nexus/gen/go/sirsi/admin/v2"
	"github.com/sirsimaster/sirsi-nexus/gen/go/sirsi/admin/v2/v2connect"
	commonv1 "github.com/sirsimaster/sirsi-nexus/gen/go/sirsi/common/v1"
)

type AdminServer struct{}
type HypervisorServer struct{}

const settingsFile = "settings.json"

var mockSettings = &adminv2.SystemSettings{
	MaintenanceMode: false,
	ActiveRegion:    "us-central1",
	SirsiMultiplier: 2.0,
}

func loadSettings() {
	data, err := os.ReadFile(settingsFile)
	if err != nil {
		if os.IsNotExist(err) {
			log.Println("Settings file not found, creating default...")
			saveSettings()
			return
		}
		log.Printf("Error reading settings: %v", err)
		return
	}
	err = json.Unmarshal(data, &mockSettings)
	if err != nil {
		log.Printf("Error unmarshaling settings: %v", err)
	}
}

func saveSettings() {
	data, err := json.MarshalIndent(mockSettings, "", "  ")
	if err != nil {
		log.Printf("Error marshaling settings: %v", err)
		return
	}
	err = os.WriteFile(settingsFile, data, 0644)
	if err != nil {
		log.Printf("Error writing settings: %v", err)
	}
}

func (s *AdminServer) ListEstates(
	ctx context.Context,
	req *connect.Request[adminv2.ListEstatesRequest],
) (*connect.Response[adminv2.ListEstatesResponse], error) {
	log.Printf("ListEstates called")

	// Mock implementation
	estates := []*adminv2.Estate{
		{
			Id:         "est_123",
			Name:       "Blue Ridge Estate",
			OwnerEmail: "alice@wonderland.com",
			Phase:      adminv2.EstatePhase_ESTATE_PHASE_FUNDING,
			CreatedAt:  1700000000,
		},
		{
			Id:         "est_456",
			Name:       "Crystal Peak Manor",
			OwnerEmail: "bob@builder.com",
			Phase:      adminv2.EstatePhase_ESTATE_PHASE_PLANNING,
			CreatedAt:  1700005000,
		},
	}

	res := connect.NewResponse(&adminv2.ListEstatesResponse{
		Estates: estates,
		Pagination: &commonv1.PaginationResponse{
			TotalCount: int32(len(estates)),
		},
	})
	return res, nil
}

func (s *AdminServer) GetEstate(
	ctx context.Context,
	req *connect.Request[adminv2.GetEstateRequest],
) (*connect.Response[adminv2.Estate], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, fmt.Errorf("unimplemented"))
}

func (s *AdminServer) CreateEstate(
	ctx context.Context,
	req *connect.Request[adminv2.CreateEstateRequest],
) (*connect.Response[adminv2.Estate], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, fmt.Errorf("unimplemented"))
}

func (s *AdminServer) UpdateEstate(
	ctx context.Context,
	req *connect.Request[adminv2.UpdateEstateRequest],
) (*connect.Response[adminv2.Estate], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, fmt.Errorf("unimplemented"))
}

func (s *AdminServer) DeleteEstate(
	ctx context.Context,
	req *connect.Request[adminv2.DeleteEstateRequest],
) (*connect.Response[adminv2.DeleteEstateResponse], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, fmt.Errorf("unimplemented"))
}

func (s *AdminServer) GetSystemOverview(
	ctx context.Context,
	req *connect.Request[adminv2.GetSystemOverviewRequest],
) (*connect.Response[adminv2.SystemOverview], error) {
	loadSettings()
	res := connect.NewResponse(&adminv2.SystemOverview{
		TotalTenants:    12,
		TotalContracts:  142,
		SirsiMultiplier: mockSettings.SirsiMultiplier,
		MaintenanceMode: mockSettings.MaintenanceMode,
		RevenueMtd: &commonv1.Money{
			AmountCents: 4250000,
			Currency:    "USD",
		},
		ActivityFeed: []*adminv2.AuditLogEntry{
			{
				Id:        "audit_1",
				Timestamp: 1708236000,
				Level:     "INFO",
				Source:    "ContractsService",
				Message:   "New contract created: FW-992",
				User:      "Cylton Collymore",
			},
		},
	})
	return res, nil
}

func (s *AdminServer) LogDevSession(
	ctx context.Context,
	req *connect.Request[adminv2.LogDevSessionRequest],
) (*connect.Response[adminv2.LogDevSessionResponse], error) {
	log.Printf("LogDevSession called by: %s", req.Msg.DeveloperId)
	res := connect.NewResponse(&adminv2.LogDevSessionResponse{
		SessionId: "sess_mock_999",
	})
	return res, nil
}

func (s *AdminServer) GetDevMetrics(
	ctx context.Context,
	req *connect.Request[adminv2.GetDevMetricsRequest],
) (*connect.Response[adminv2.DevMetrics], error) {
	res := connect.NewResponse(&adminv2.DevMetrics{
		Velocity:       0.85,
		OpenIssues:     12,
		ClosedIssues:   45,
		ActiveSessions: 3,
		BurnRate: &commonv1.Money{
			AmountCents: 500000,
			Currency:    "USD",
		},
	})
	return res, nil
}

func (s *AdminServer) SyncGitHubStats(
	ctx context.Context,
	req *connect.Request[adminv2.SyncGitHubStatsRequest],
) (*connect.Response[adminv2.SyncGitHubStatsResponse], error) {
	return connect.NewResponse(&adminv2.SyncGitHubStatsResponse{
		Success:     true,
		SyncedCount: 150,
	}), nil
}

func (s *AdminServer) ManageUserRole(
	ctx context.Context,
	req *connect.Request[adminv2.ManageUserRoleRequest],
) (*connect.Response[adminv2.ManageUserRoleResponse], error) {
	log.Printf("ManageUserRole: %s -> %s", req.Msg.UserId, req.Msg.Role)
	res := connect.NewResponse(&adminv2.ManageUserRoleResponse{
		Success: true,
	})
	return res, nil
}

func (s *AdminServer) ListUsers(
	ctx context.Context,
	req *connect.Request[adminv2.ListUsersRequest],
) (*connect.Response[adminv2.ListUsersResponse], error) {
	// Canonical accounts — matches login.html VALID_CREDENTIALS
	// 3 accounts: Admin, Investor, Client
	users := []*adminv2.User{
		{
			Id:       "ADMIN",
			Email:    "cylton@sirsi.ai",
			Name:     "Administrator",
			Role:     "Admin",
			TenantId: "sirsi-core",
		},
		{
			Id:       "INV001",
			Email:    "sirsimaster@gmail.com",
			Name:     "Investor",
			Role:     "Investor",
			TenantId: "finalwishes",
		},
		{
			Id:       "CLIENT",
			Email:    "sirsimaster@gmail.com",
			Name:     "Client",
			Role:     "Client",
			TenantId: "",
		},
	}

	// Filter by tenant if requested
	if req.Msg.TenantId != "" {
		filtered := make([]*adminv2.User, 0)
		for _, u := range users {
			if u.TenantId == req.Msg.TenantId {
				filtered = append(filtered, u)
			}
		}
		users = filtered
	}

	res := connect.NewResponse(&adminv2.ListUsersResponse{
		Users: users,
		Pagination: &commonv1.PaginationResponse{
			TotalCount: int32(len(users)),
		},
	})
	return res, nil
}

func (s *AdminServer) SendNotification(
	ctx context.Context,
	req *connect.Request[adminv2.SendNotificationRequest],
) (*connect.Response[adminv2.SendNotificationResponse], error) {
	log.Printf("SendNotification to %s: %s", req.Msg.RecipientId, req.Msg.Title)
	res := connect.NewResponse(&adminv2.SendNotificationResponse{
		NotificationId: "notif_mock_123",
	})
	return res, nil
}

func (s *AdminServer) ListNotifications(
	ctx context.Context,
	req *connect.Request[adminv2.ListNotificationsRequest],
) (*connect.Response[adminv2.ListNotificationsResponse], error) {
	notifs := []*adminv2.Notification{
		{
			Id:          "notif_1",
			RecipientId: "all",
			Title:       "System Maintenance Complete",
			Body:        "Cloud Run backend upgraded to v0.8.0-alpha. All services operational.",
			Type:        "info",
			SentAt:      1709510400,
			Status:      "delivered",
		},
		{
			Id:          "notif_2",
			RecipientId: "user_2",
			Title:       "Contract Ready for Review",
			Body:        "FinalWishes MSA (MSA-2026-001) is awaiting your signature.",
			Type:        "action",
			SentAt:      1709424000,
			Status:      "delivered",
		},
		{
			Id:          "notif_3",
			RecipientId: "user_1",
			Title:       "MFA Enrollment Verified",
			Body:        "TOTP handshake for cylton@sirsi.ai confirmed. Custom claims synced.",
			Type:        "success",
			SentAt:      1709337600,
			Status:      "delivered",
		},
		{
			Id:          "notif_4",
			RecipientId: "user_3",
			Title:       "Assiduous Tenant Provisioned",
			Body:        "Staging environment is live. Production deployment pending approval.",
			Type:        "info",
			SentAt:      1709251200,
			Status:      "delivered",
		},
		{
			Id:          "notif_5",
			RecipientId: "all",
			Title:       "Security Audit Passed",
			Body:        "SOC 2 Type II readiness assessment: 23/23 controls verified.",
			Type:        "success",
			SentAt:      1709164800,
			Status:      "delivered",
		},
	}
	res := connect.NewResponse(&adminv2.ListNotificationsResponse{
		Notifications: notifs,
		Pagination: &commonv1.PaginationResponse{
			TotalCount: int32(len(notifs)),
		},
	})
	return res, nil
}

func (s *AdminServer) GetSettings(
	ctx context.Context,
	req *connect.Request[adminv2.GetSettingsRequest],
) (*connect.Response[adminv2.GetSettingsResponse], error) {
	loadSettings() // Refresh from disk
	return connect.NewResponse(&adminv2.GetSettingsResponse{
		Settings: mockSettings,
	}), nil
}

func (s *AdminServer) UpdateSettings(
	ctx context.Context,
	req *connect.Request[adminv2.UpdateSettingsRequest],
) (*connect.Response[adminv2.UpdateSettingsResponse], error) {
	log.Printf("UpdateSettings: Multiplier -> %f", req.Msg.Settings.SirsiMultiplier)
	mockSettings = req.Msg.Settings
	saveSettings()
	return connect.NewResponse(&adminv2.UpdateSettingsResponse{
		Success: true,
	}), nil
}

func (s *AdminServer) ListAuditTrail(
	ctx context.Context,
	req *connect.Request[adminv2.ListAuditTrailRequest],
) (*connect.Response[adminv2.ListAuditTrailResponse], error) {
	logs := []*adminv2.AuditLogEntry{
		{
			Id:        "audit_1",
			Timestamp: 1709510400,
			Level:     "INFO",
			Source:    "ContractsService",
			Message:   "New contract created: FW-MSA-2026-001",
			User:      "Cylton Collymore",
		},
		{
			Id:        "audit_2",
			Timestamp: 1709506800,
			Level:     "INFO",
			Source:    "AuthService",
			Message:   "MFA handshake verified for identity: cylton@sirsi.ai (CID: #USR-001)",
			User:      "Cylton Collymore",
		},
		{
			Id:        "audit_3",
			Timestamp: 1709503200,
			Level:     "INFO",
			Source:    "UserService",
			Message:   "User provisioned: John Doe (j.doe@example.com) — role: Investor",
			User:      "Cylton Collymore",
		},
		{
			Id:        "audit_4",
			Timestamp: 1709499600,
			Level:     "WARN",
			Source:    "DeploymentService",
			Message:   "Cloud Run revision sirsi-admin-00042 scaled to 0 instances (cold start expected)",
			User:      "system",
		},
		{
			Id:        "audit_5",
			Timestamp: 1709496000,
			Level:     "INFO",
			Source:    "ContractsService",
			Message:   "Contract fully executed: Assiduous NDA (NDA-2026-042) — SHA-256 sealed",
			User:      "Jane Smith",
		},
		{
			Id:        "audit_6",
			Timestamp: 1709492400,
			Level:     "INFO",
			Source:    "SettingsService",
			Message:   "Sirsi Multiplier updated: 1.8x → 2.0x",
			User:      "Cylton Collymore",
		},
		{
			Id:        "audit_7",
			Timestamp: 1709488800,
			Level:     "INFO",
			Source:    "TenantService",
			Message:   "Tenant 'Assiduous' provisioned — staging environment active",
			User:      "Robert Vance",
		},
		{
			Id:        "audit_8",
			Timestamp: 1709485200,
			Level:     "ERROR",
			Source:    "PaymentService",
			Message:   "Stripe webhook signature verification failed (retried successfully)",
			User:      "system",
		},
	}

	// Filter by level if requested
	if req.Msg.FilterLevel != "" {
		filtered := make([]*adminv2.AuditLogEntry, 0)
		for _, l := range logs {
			if strings.EqualFold(l.Level, req.Msg.FilterLevel) {
				filtered = append(filtered, l)
			}
		}
		logs = filtered
	}

	res := connect.NewResponse(&adminv2.ListAuditTrailResponse{
		Logs: logs,
		Pagination: &commonv1.PaginationResponse{
			TotalCount: int32(len(logs)),
		},
	})
	return res, nil
}

type TenantServer struct{}

func (s *TenantServer) ListTenants(
	ctx context.Context,
	req *connect.Request[adminv2.ListTenantsRequest],
) (*connect.Response[adminv2.ListTenantsResponse], error) {
	tenants := []*adminv2.Tenant{
		{
			Id:          "tenant_fw",
			Name:        "FinalWishes",
			Slug:        "finalwishes",
			Description: "Premier Legacy Management Platform",
			Status:      adminv2.TenantStatus_TENANT_STATUS_ACTIVE,
		},
		{
			Id:          "tenant_as",
			Name:        "Assiduous",
			Slug:        "assiduous",
			Description: "Autonomous AI Agent Infrastructure",
			Status:      adminv2.TenantStatus_TENANT_STATUS_ACTIVE,
		},
	}
	return connect.NewResponse(&adminv2.ListTenantsResponse{
		Tenants: tenants,
		Pagination: &commonv1.PaginationResponse{
			TotalCount: int32(len(tenants)),
		},
	}), nil
}

func (s *TenantServer) GetTenant(
	ctx context.Context,
	req *connect.Request[adminv2.GetTenantRequest],
) (*connect.Response[adminv2.Tenant], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, fmt.Errorf("unimplemented"))
}

func (s *TenantServer) CreateTenant(
	ctx context.Context,
	req *connect.Request[adminv2.CreateTenantRequest],
) (*connect.Response[adminv2.Tenant], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, fmt.Errorf("unimplemented"))
}

func (s *TenantServer) UpdateTenant(
	ctx context.Context,
	req *connect.Request[adminv2.UpdateTenantRequest],
) (*connect.Response[adminv2.Tenant], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, fmt.Errorf("unimplemented"))
}

func (s *TenantServer) DeactivateTenant(
	ctx context.Context,
	req *connect.Request[adminv2.DeactivateTenantRequest],
) (*connect.Response[adminv2.DeactivateTenantResponse], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, fmt.Errorf("unimplemented"))
}

// ═══════════════════════════════════════════════════════════════════
// HypervisorServer — ADR-026 Operational Telemetry
// ═══════════════════════════════════════════════════════════════════

func (s *HypervisorServer) GetHypervisorOverview(
	ctx context.Context,
	req *connect.Request[adminv2.GetHypervisorOverviewRequest],
) (*connect.Response[adminv2.GetHypervisorOverviewResponse], error) {
	resp := &adminv2.GetHypervisorOverviewResponse{
		Uptime: &adminv2.UptimeGauge{
			Current: 99.98,
			Target:  99.9,
			Trend:   []float64{99.95, 99.97, 99.96, 99.99, 99.98, 99.97, 99.98},
		},
		Deployments_24H: &adminv2.CountGauge{
			Count: 8,
			Trend: []float64{3, 5, 4, 8, 6, 7, 8},
		},
		CloudSpendMtd: &adminv2.SpendGauge{
			Current: 2340,
			Budget:  5000,
			Trend:   []float64{1200, 1500, 1800, 2000, 2100, 2200, 2340},
		},
		Tenants: []*adminv2.TenantSummary{
			{
				Id: "tenant_fw", Name: "FinalWishes", Slug: "finalwishes",
				Status: "operational", Environment: "Production",
				Uptime_30D: 99.9, Deployments_24H: 5, OpenIncidents: 0,
				UptimeTrend: []float64{99.8, 99.9, 99.95, 99.9, 99.85, 99.9, 99.9},
			},
			{
				Id: "tenant_as", Name: "Assiduous", Slug: "assiduous",
				Status: "degraded", Environment: "Staging",
				Uptime_30D: 98.2, Deployments_24H: 3, OpenIncidents: 1,
				UptimeTrend: []float64{99.0, 98.5, 98.0, 97.5, 98.0, 98.2, 98.2},
			},
		},
		RecentActivity: []*adminv2.ActivityEvent{
			{Id: "1", Timestamp: "2 min ago", Type: "deploy", Tenant: "FinalWishes", Message: "Deployed v6.0.5 to production", Severity: "info"},
			{Id: "2", Timestamp: "15 min ago", Type: "security", Tenant: "Sirsi Core", Message: "MFA enrollment completed for new admin", Severity: "info"},
			{Id: "3", Timestamp: "1 hour ago", Type: "config", Tenant: "FinalWishes", Message: "Updated Stripe webhook endpoint", Severity: "info"},
			{Id: "4", Timestamp: "2 hours ago", Type: "deploy", Tenant: "Assiduous", Message: "Deployed v1.2.0 to staging", Severity: "info"},
			{Id: "5", Timestamp: "3 hours ago", Type: "incident", Tenant: "Assiduous", Message: "Elevated error rate detected in staging", Severity: "warning"},
			{Id: "6", Timestamp: "4 hours ago", Type: "user", Tenant: "Sirsi Core", Message: "New user provisioned: analyst@sirsi.ai", Severity: "info"},
		},
		OpenIncidents: []*adminv2.IncidentSummary{
			{
				Id: "inc_1", Title: "Elevated staging error rate — Assiduous",
				Severity: "warning", Status: "investigating",
				OpenedAt: "3 hours ago", Tenant: "Assiduous", Assignee: "Cylton Collymore",
			},
		},
	}
	return connect.NewResponse(resp), nil
}

func (s *HypervisorServer) GetHypervisorDevOps(
	ctx context.Context,
	req *connect.Request[adminv2.GetHypervisorDevOpsRequest],
) (*connect.Response[adminv2.GetHypervisorDevOpsResponse], error) {
	resp := &adminv2.GetHypervisorDevOpsResponse{
		DeploymentFrequency: []*adminv2.DeploymentFrequency{
			{Tenant: "FinalWishes", DailyCounts: []int32{4, 6, 3, 5, 7, 2, 5}},
			{Tenant: "Assiduous", DailyCounts: []int32{1, 2, 0, 3, 1, 2, 3}},
		},
		ChangeFailureRate: []*adminv2.DORAMetric{
			{Tenant: "FinalWishes", Value: 3.2, Unit: "%", DoraLevel: "elite", Trend: []float64{4, 3.5, 3, 3.2, 3.1, 3.2, 3.2}},
			{Tenant: "Assiduous", Value: 8.5, Unit: "%", DoraLevel: "high", Trend: []float64{10, 9, 8, 9, 8.5, 8.5, 8.5}},
		},
		Mttr: []*adminv2.DORAMetric{
			{Tenant: "FinalWishes", Value: 22, Unit: "min", DoraLevel: "elite", Trend: []float64{30, 25, 22, 28, 24, 22, 22}},
			{Tenant: "Assiduous", Value: 48, Unit: "min", DoraLevel: "high", Trend: []float64{60, 55, 50, 48, 52, 48, 48}},
		},
		LeadTime: []*adminv2.DORAMetric{
			{Tenant: "FinalWishes", Value: 4.2, Unit: "hours", DoraLevel: "elite", Trend: []float64{6, 5, 4.5, 4, 4.2, 4.2, 4.2}},
			{Tenant: "Assiduous", Value: 18, Unit: "hours", DoraLevel: "medium", Trend: []float64{24, 20, 18, 22, 18, 18, 18}},
		},
		PipelineMatrix: []*adminv2.PipelineStatus{
			{Tenant: "FinalWishes", Environment: "production", Status: "operational", LastRun: "2 min ago", Branch: "main"},
			{Tenant: "FinalWishes", Environment: "staging", Status: "operational", LastRun: "15 min ago", Branch: "develop"},
			{Tenant: "Assiduous", Environment: "production", Status: "unknown", LastRun: "N/A", Branch: "main"},
			{Tenant: "Assiduous", Environment: "staging", Status: "degraded", LastRun: "1 hour ago", Branch: "develop"},
		},
		RecentDeployments: []*adminv2.Deployment{
			{Id: "d1", Sha: "f8d2c1a", Tenant: "FinalWishes", Environment: "Production", Version: "v6.0.5", Status: "success", Deployer: "Cylton Collymore", Duration: "3m 42s", Timestamp: "2 min ago"},
			{Id: "d2", Sha: "a3b7e2f", Tenant: "Assiduous", Environment: "Staging", Version: "v1.2.0", Status: "success", Deployer: "Cylton Collymore", Duration: "2m 18s", Timestamp: "2 hours ago"},
			{Id: "d3", Sha: "c1d9f3e", Tenant: "FinalWishes", Environment: "Production", Version: "v6.0.4", Status: "success", Deployer: "Cylton Collymore", Duration: "4m 11s", Timestamp: "6 hours ago"},
		},
		BuildHealth: []*adminv2.BuildHealth{
			{Tenant: "FinalWishes", SuccessRate: 97.5, Trend: []float64{95, 96, 97, 97.5, 97, 97.5, 97.5}},
			{Tenant: "Assiduous", SuccessRate: 89.2, Trend: []float64{85, 87, 88, 90, 89, 89.2, 89.2}},
		},
	}
	return connect.NewResponse(resp), nil
}

func (s *HypervisorServer) GetHypervisorSecurity(
	ctx context.Context,
	req *connect.Request[adminv2.GetHypervisorSecurityRequest],
) (*connect.Response[adminv2.GetHypervisorSecurityResponse], error) {
	resp := &adminv2.GetHypervisorSecurityResponse{
		MfaCompliance: []*adminv2.MFAComplianceEntry{
			{Tenant: "FinalWishes", Enrolled: 12, Total: 14},
			{Tenant: "Assiduous", Enrolled: 3, Total: 5},
			{Tenant: "Sirsi Core", Enrolled: 4, Total: 4},
		},
		AuthActivity_24H: make([]*adminv2.AuthActivityHour, 24),
		VulnerabilityScore: &adminv2.VulnerabilityScore{
			Score: 82, Critical: 0, High: 1, Medium: 4, Low: 12,
		},
		Certificates: []*adminv2.CertificateStatus{
			{Domain: "sign.sirsi.ai", Issuer: "Let's Encrypt", ExpiresAt: "2026-03-24", DaysRemaining: 22, Status: "operational"},
			{Domain: "sirsi-sign.web.app", Issuer: "Google Trust", ExpiresAt: "2026-06-15", DaysRemaining: 105, Status: "operational"},
			{Domain: "api.sirsi.ai", Issuer: "Let's Encrypt", ExpiresAt: "2026-03-10", DaysRemaining: 8, Status: "degraded"},
		},
		SecretRotationCompliance: 87,
		Soc2Score:                91,
	}

	// Populate 24 hours of auth activity
	for i := int32(0); i < 24; i++ {
		resp.AuthActivity_24H[i] = &adminv2.AuthActivityHour{
			Hour:       i,
			Successful: 10 + i%5*3,
			Failed:     i % 3,
		}
	}

	return connect.NewResponse(resp), nil
}

// corsMiddleware wraps a handler with permissive CORS for local development.
// In production, Cloud Run handles CORS via IAP/Load Balancer config.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		// Allow localhost origins for development
		if origin == "" || strings.HasPrefix(origin, "http://localhost") || strings.HasPrefix(origin, "https://sirsi") {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5174")
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Connect-Protocol-Version, Connect-Timeout-Ms, Authorization, X-Grpc-Web, X-User-Agent")
		w.Header().Set("Access-Control-Expose-Headers", "Grpc-Status, Grpc-Message, Grpc-Status-Details-Bin")
		w.Header().Set("Access-Control-Max-Age", "86400")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	loadSettings()
	mux := http.NewServeMux()
	mux.Handle(v2connect.NewAdminServiceHandler(&AdminServer{}))
	mux.Handle(v2connect.NewTenantServiceHandler(&TenantServer{}))
	mux.Handle(v2connect.NewHypervisorServiceHandler(&HypervisorServer{}))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Sirsi Admin Service v0.9.0-alpha listening on :%s\n", port)
	err := http.ListenAndServe(
		":"+port,
		h2c.NewHandler(corsMiddleware(mux), &http2.Server{}),
	)
	if err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
