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

// ═══════════════════════════════════════════════════════════════════
// TenantService — ADR-030 Self-Service Tenant Provisioning
// ═══════════════════════════════════════════════════════════════════

func (s *TenantServer) ListTenants(
	ctx context.Context,
	req *connect.Request[adminv2.ListTenantsRequest],
) (*connect.Response[adminv2.ListTenantsResponse], error) {
	tenants := []*adminv2.Tenant{
		{
			Id:                 "tenant_fw",
			Name:               "FinalWishes",
			Slug:               "finalwishes",
			Description:        "Premier Legacy Management Platform",
			Status:             adminv2.TenantStatus_TENANT_STATUS_ACTIVE,
			OwnerUid:           "fw_admin_001",
			SuperadminUids:     []string{"cylton_uid", "hypervisor_svc"},
			Plan:               adminv2.Plan_PLAN_BUSINESS,
			CloudProvider:      adminv2.CloudProvider_CLOUD_PROVIDER_GCP,
			ProvisioningStatus: adminv2.ProvisioningState_PROVISIONING_STATE_ACTIVE,
			Region:             "us-east1",
			Industry:           "Legal",
			CompanySize:        "11-50",
		},
		{
			Id:                 "tenant_as",
			Name:               "Assiduous",
			Slug:               "assiduous",
			Description:        "Autonomous AI Agent Infrastructure",
			Status:             adminv2.TenantStatus_TENANT_STATUS_ACTIVE,
			OwnerUid:           "as_admin_001",
			SuperadminUids:     []string{"cylton_uid", "hypervisor_svc"},
			Plan:               adminv2.Plan_PLAN_BUSINESS,
			CloudProvider:      adminv2.CloudProvider_CLOUD_PROVIDER_GCP,
			ProvisioningStatus: adminv2.ProvisioningState_PROVISIONING_STATE_ACTIVE,
			Region:             "us-central1",
			Industry:           "Technology",
			CompanySize:        "1-10",
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
	// Mock: return FinalWishes for any ID
	return connect.NewResponse(&adminv2.Tenant{
		Id:                 req.Msg.Id,
		Name:               "FinalWishes",
		Slug:               "finalwishes",
		Status:             adminv2.TenantStatus_TENANT_STATUS_ACTIVE,
		Plan:               adminv2.Plan_PLAN_BUSINESS,
		CloudProvider:      adminv2.CloudProvider_CLOUD_PROVIDER_GCP,
		ProvisioningStatus: adminv2.ProvisioningState_PROVISIONING_STATE_ACTIVE,
		Region:             "us-east1",
		SuperadminUids:     []string{"cylton_uid", "hypervisor_svc"},
	}), nil
}

func (s *TenantServer) GetTenantByOwner(
	ctx context.Context,
	req *connect.Request[adminv2.GetTenantByOwnerRequest],
) (*connect.Response[adminv2.Tenant], error) {
	log.Printf("GetTenantByOwner: %s", req.Msg.OwnerUid)
	return connect.NewResponse(&adminv2.Tenant{
		Id:                 "tenant_mock",
		Name:               "Mock Tenant",
		Slug:               "mock-tenant",
		OwnerUid:           req.Msg.OwnerUid,
		Status:             adminv2.TenantStatus_TENANT_STATUS_ACTIVE,
		Plan:               adminv2.Plan_PLAN_FREE,
		ProvisioningStatus: adminv2.ProvisioningState_PROVISIONING_STATE_ACTIVE,
		SuperadminUids:     []string{"cylton_uid", "hypervisor_svc"},
	}), nil
}

func (s *TenantServer) CreateTenant(
	ctx context.Context,
	req *connect.Request[adminv2.CreateTenantRequest],
) (*connect.Response[adminv2.Tenant], error) {
	log.Printf("CreateTenant: name=%s slug=%s plan=%s cloud=%s region=%s",
		req.Msg.Name, req.Msg.Slug, req.Msg.Plan, req.Msg.CloudProvider, req.Msg.Region)

	// Generate a mock tenant ID
	tenantId := fmt.Sprintf("tenant_%s", req.Msg.Slug)

	tenant := &adminv2.Tenant{
		Id:                 tenantId,
		Name:               req.Msg.Name,
		Slug:               req.Msg.Slug,
		Description:        req.Msg.Description,
		Status:             adminv2.TenantStatus_TENANT_STATUS_ACTIVE,
		OwnerUid:           req.Msg.OwnerUid,
		SuperadminUids:     []string{"cylton_uid", "hypervisor_svc"},
		Plan:               req.Msg.Plan,
		CloudProvider:      req.Msg.CloudProvider,
		Region:             req.Msg.Region,
		Industry:           req.Msg.Industry,
		CompanySize:        req.Msg.CompanySize,
		StripeCustomerId:   req.Msg.StripeCustomerId,
		ProvisioningStatus: adminv2.ProvisioningState_PROVISIONING_STATE_PENDING,
		Config:             req.Msg.Config,
	}

	return connect.NewResponse(tenant), nil
}

func (s *TenantServer) UpdateTenant(
	ctx context.Context,
	req *connect.Request[adminv2.UpdateTenantRequest],
) (*connect.Response[adminv2.Tenant], error) {
	log.Printf("UpdateTenant: %s", req.Msg.Id)
	return connect.NewResponse(req.Msg.Tenant), nil
}

func (s *TenantServer) StartProvisioning(
	ctx context.Context,
	req *connect.Request[adminv2.StartProvisioningRequest],
) (*connect.Response[adminv2.ProvisioningStatus], error) {
	log.Printf("StartProvisioning for tenant: %s", req.Msg.TenantId)
	return connect.NewResponse(&adminv2.ProvisioningStatus{
		TenantId:    req.Msg.TenantId,
		State:       adminv2.ProvisioningState_PROVISIONING_STATE_PROVISIONING,
		CurrentStep: 1,
		TotalSteps:  6,
		Steps: []*adminv2.ProvisioningStep{
			{Name: "Creating Firebase project", Status: adminv2.StepStatus_STEP_STATUS_IN_PROGRESS},
			{Name: "Provisioning Cloud Run service", Status: adminv2.StepStatus_STEP_STATUS_PENDING},
			{Name: "Configuring DNS", Status: adminv2.StepStatus_STEP_STATUS_PENDING},
			{Name: "Creating GitHub repository", Status: adminv2.StepStatus_STEP_STATUS_PENDING},
			{Name: "Seeding initial data", Status: adminv2.StepStatus_STEP_STATUS_PENDING},
			{Name: "Registering with Hypervisor", Status: adminv2.StepStatus_STEP_STATUS_PENDING},
		},
	}), nil
}

func (s *TenantServer) GetProvisioningStatus(
	ctx context.Context,
	req *connect.Request[adminv2.GetProvisioningStatusRequest],
) (*connect.Response[adminv2.ProvisioningStatus], error) {
	// Mock: return fully provisioned
	return connect.NewResponse(&adminv2.ProvisioningStatus{
		TenantId:    req.Msg.TenantId,
		State:       adminv2.ProvisioningState_PROVISIONING_STATE_ACTIVE,
		CurrentStep: 6,
		TotalSteps:  6,
		Steps: []*adminv2.ProvisioningStep{
			{Name: "Creating Firebase project", Status: adminv2.StepStatus_STEP_STATUS_COMPLETE},
			{Name: "Provisioning Cloud Run service", Status: adminv2.StepStatus_STEP_STATUS_COMPLETE},
			{Name: "Configuring DNS", Status: adminv2.StepStatus_STEP_STATUS_COMPLETE},
			{Name: "Creating GitHub repository", Status: adminv2.StepStatus_STEP_STATUS_COMPLETE},
			{Name: "Seeding initial data", Status: adminv2.StepStatus_STEP_STATUS_COMPLETE},
			{Name: "Registering with Hypervisor", Status: adminv2.StepStatus_STEP_STATUS_COMPLETE},
		},
	}), nil
}

func (s *TenantServer) CreateCheckoutSession(
	ctx context.Context,
	req *connect.Request[adminv2.CreateCheckoutSessionRequest],
) (*connect.Response[adminv2.CreateCheckoutSessionResponse], error) {
	log.Printf("CreateCheckoutSession: owner=%s plan=%s", req.Msg.OwnerUid, req.Msg.Plan)

	// Mock Stripe Checkout URL
	// In production, this would use the Stripe SDK to create a session
	mockUrl := fmt.Sprintf("https://checkout.stripe.com/pay/mock_session_%s?success_url=%s&cancel_url=%s",
		req.Msg.Plan.String(), req.Msg.SuccessUrl, req.Msg.CancelUrl)

	return connect.NewResponse(&adminv2.CreateCheckoutSessionResponse{
		SessionId:   "mock_session_id_" + req.Msg.Plan.String(),
		CheckoutUrl: mockUrl,
	}), nil
}

func (s *TenantServer) SuspendTenant(
	ctx context.Context,
	req *connect.Request[adminv2.SuspendTenantRequest],
) (*connect.Response[adminv2.Tenant], error) {
	log.Printf("SuspendTenant: %s", req.Msg.Id)
	return connect.NewResponse(&adminv2.Tenant{
		Id:     req.Msg.Id,
		Status: adminv2.TenantStatus_TENANT_STATUS_SUSPENDED,
	}), nil
}

func (s *TenantServer) DeactivateTenant(
	ctx context.Context,
	req *connect.Request[adminv2.DeactivateTenantRequest],
) (*connect.Response[adminv2.DeactivateTenantResponse], error) {
	log.Printf("DeactivateTenant: %s", req.Msg.Id)
	return connect.NewResponse(&adminv2.DeactivateTenantResponse{
		Success: true,
	}), nil
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

// Tab 3: Infrastructure
func (s *HypervisorServer) GetHypervisorInfrastructure(
	ctx context.Context,
	req *connect.Request[adminv2.GetHypervisorInfrastructureRequest],
) (*connect.Response[adminv2.GetHypervisorInfrastructureResponse], error) {
	resp := &adminv2.GetHypervisorInfrastructureResponse{
		Resources: &adminv2.ResourceState{InSync: 142, Drifted: 3, Pending: 7},
		DriftItems: []*adminv2.DriftItem{
			{Resource: "cloud_run_service/sirsi-admin", Type: "Cloud Run", Tenant: "Sirsi Core", Detected: "2 hours ago", Severity: "warning"},
			{Resource: "firestore_rules/sirsi-nexus", Type: "Firestore", Tenant: "Sirsi Core", Detected: "5 hours ago", Severity: "info"},
			{Resource: "cloud_sql_instance/prod-primary", Type: "Cloud SQL", Tenant: "FinalWishes", Detected: "1 day ago", Severity: "critical"},
		},
		EnvironmentMatrix: []*adminv2.EnvironmentEntry{
			{Tenant: "FinalWishes", Environment: "Production", Version: "v6.0.5", Status: "operational", LastDeploy: "2 min ago"},
			{Tenant: "FinalWishes", Environment: "Staging", Version: "v6.1.0-rc1", Status: "operational", LastDeploy: "15 min ago"},
			{Tenant: "Assiduous", Environment: "Production", Version: "v1.1.0", Status: "operational", LastDeploy: "3 days ago"},
			{Tenant: "Assiduous", Environment: "Staging", Version: "v1.2.0", Status: "degraded", LastDeploy: "2 hours ago"},
		},
		CloudRunServices: []*adminv2.CloudRunService{
			{Name: "sirsi-admin", Tenant: "Sirsi Core", Instances: 2, MaxInstances: 10, Cpu: 35, Memory: 42},
			{Name: "fw-api", Tenant: "FinalWishes", Instances: 3, MaxInstances: 20, Cpu: 48, Memory: 55},
			{Name: "as-api", Tenant: "Assiduous", Instances: 1, MaxInstances: 10, Cpu: 12, Memory: 28},
		},
		CostByResource: []*adminv2.CostByResource{
			{Name: "Cloud Run", Cost: 840},
			{Name: "Cloud SQL", Cost: 650},
			{Name: "Firestore", Cost: 320},
			{Name: "Cloud Storage", Cost: 180},
			{Name: "Networking", Cost: 150},
			{Name: "Other", Cost: 200},
		},
	}
	return connect.NewResponse(resp), nil
}

// Tab 5: Database
func (s *HypervisorServer) GetHypervisorDatabase(
	ctx context.Context,
	req *connect.Request[adminv2.GetHypervisorDatabaseRequest],
) (*connect.Response[adminv2.GetHypervisorDatabaseResponse], error) {
	resp := &adminv2.GetHypervisorDatabaseResponse{
		ConnectionPools: []*adminv2.ConnectionPool{
			{Database: "fw_production", Active: 12, Idle: 8, Max: 50},
			{Database: "fw_staging", Active: 3, Idle: 7, Max: 20},
			{Database: "as_production", Active: 5, Idle: 10, Max: 30},
		},
		SlowQueries: []*adminv2.SlowQuery{
			{Query: "SELECT * FROM estates WHERE status = 'active' ORDER BY updated_at", AvgTime: 340, Frequency: 42, LastSeen: "5 min ago"},
			{Query: "SELECT c.*, u.email FROM contracts c JOIN users u ON c.user_id = u.id", AvgTime: 220, Frequency: 18, LastSeen: "12 min ago"},
		},
		ReplicationLag: []*adminv2.ReplicationEntry{
			{Replica: "fw-replica-us-east1", LagMs: 12},
			{Replica: "fw-replica-eu-west1", LagMs: 45},
			{Replica: "as-replica-us-central1", LagMs: 8},
		},
		TableStats: []*adminv2.TableStats{
			{Name: "users", RowCount: 2847, DiskMb: 12.4, IndexMb: 3.2, LastVacuum: "2 hours ago"},
			{Name: "estates", RowCount: 1234, DiskMb: 45.6, IndexMb: 8.1, LastVacuum: "4 hours ago"},
			{Name: "contracts", RowCount: 892, DiskMb: 128.3, IndexMb: 15.4, LastVacuum: "1 hour ago"},
			{Name: "audit_log", RowCount: 45678, DiskMb: 256.7, IndexMb: 32.1, LastVacuum: "30 min ago"},
		},
		FirestoreCollections: []*adminv2.FirestoreCollection{
			{Name: "users", DocumentCount: 2847, ReadsTrend: []float64{1200, 1400, 1100, 1500, 1300, 1600, 1450}, WritesTrend: []float64{100, 120, 80, 150, 110, 130, 120}},
			{Name: "notifications", DocumentCount: 15234, ReadsTrend: []float64{5000, 5200, 4800, 5500, 5100, 5300, 5400}, WritesTrend: []float64{200, 220, 180, 250, 210, 230, 240}},
		},
		BackupStatus: []*adminv2.BackupStatus{
			{Database: "fw_production", LastBackup: "1 hour ago", Status: "operational", LastRestoreTest: "2 days ago"},
			{Database: "as_production", LastBackup: "2 hours ago", Status: "operational", LastRestoreTest: "3 days ago"},
		},
	}
	return connect.NewResponse(resp), nil
}

// Tab 6: Frontend
func (s *HypervisorServer) GetHypervisorFrontend(
	ctx context.Context,
	req *connect.Request[adminv2.GetHypervisorFrontendRequest],
) (*connect.Response[adminv2.GetHypervisorFrontendResponse], error) {
	resp := &adminv2.GetHypervisorFrontendResponse{
		WebVitals: []*adminv2.WebVital{
			{Name: "LCP", Value: 1.8, Unit: "s", Rating: "good", ThresholdGood: 2.5, ThresholdPoor: 4.0},
			{Name: "FID", Value: 12, Unit: "ms", Rating: "good", ThresholdGood: 100, ThresholdPoor: 300},
			{Name: "CLS", Value: 0.05, Unit: "", Rating: "good", ThresholdGood: 0.1, ThresholdPoor: 0.25},
			{Name: "TTFB", Value: 320, Unit: "ms", Rating: "needs-improvement", ThresholdGood: 200, ThresholdPoor: 600},
			{Name: "INP", Value: 85, Unit: "ms", Rating: "good", ThresholdGood: 200, ThresholdPoor: 500},
		},
		BundleSize: &adminv2.BundleSize{
			Current: 342, Budget: 500,
			ByModule: []*adminv2.BundleModule{
				{Name: "react", Size: 45},
				{Name: "recharts", Size: 88},
				{Name: "tanstack-router", Size: 32},
				{Name: "connectrpc", Size: 18},
				{Name: "lucide-react", Size: 24},
				{Name: "app-code", Size: 135},
			},
		},
		PageInventory: []*adminv2.PageEntry{
			{Route: "/", ComponentCount: 12, LoadTimeMs: 420, ErrorRate: 0.1, Traffic: 4500},
			{Route: "/tenants", ComponentCount: 28, LoadTimeMs: 680, ErrorRate: 0.3, Traffic: 2800},
			{Route: "/users", ComponentCount: 15, LoadTimeMs: 350, ErrorRate: 0.05, Traffic: 3200},
			{Route: "/contracts", ComponentCount: 18, LoadTimeMs: 520, ErrorRate: 0.2, Traffic: 1800},
			{Route: "/analytics", ComponentCount: 22, LoadTimeMs: 750, ErrorRate: 0.1, Traffic: 1200},
		},
		ErrorTracking: []*adminv2.ErrorEntry{
			{Component: "recharts/ResponsiveContainer", Frequency: 45, AffectedUsers: 12, Severity: "warning"},
			{Component: "CommandPalette/SearchInput", Frequency: 8, AffectedUsers: 3, Severity: "info"},
		},
	}
	return connect.NewResponse(resp), nil
}

// Tab 7: Backend
func (s *HypervisorServer) GetHypervisorBackend(
	ctx context.Context,
	req *connect.Request[adminv2.GetHypervisorBackendRequest],
) (*connect.Response[adminv2.GetHypervisorBackendResponse], error) {
	resp := &adminv2.GetHypervisorBackendResponse{
		ApiEndpoints: []*adminv2.APIEndpoint{
			{Method: "POST", Path: "/sirsi.admin.v2.AdminService/GetSystemOverview", RequestCount: 24500, AvgLatencyMs: 12, ErrorRate: 0.02, P95Trend: []float64{15, 14, 12, 13, 12, 11, 12}},
			{Method: "POST", Path: "/sirsi.admin.v2.AdminService/ListUsers", RequestCount: 18200, AvgLatencyMs: 28, ErrorRate: 0.1, P95Trend: []float64{35, 30, 28, 32, 28, 27, 28}},
			{Method: "POST", Path: "/sirsi.admin.v2.HypervisorService/GetHypervisorOverview", RequestCount: 8400, AvgLatencyMs: 8, ErrorRate: 0, P95Trend: []float64{10, 9, 8, 9, 8, 8, 8}},
			{Method: "POST", Path: "/sirsi.admin.v2.TenantService/ListTenants", RequestCount: 12300, AvgLatencyMs: 15, ErrorRate: 0.05, P95Trend: []float64{20, 18, 15, 16, 15, 14, 15}},
		},
		ServiceHealth: []*adminv2.ServiceHealth{
			{Service: "sirsi-admin-service", Status: "operational", Uptime: 99.98},
			{Service: "sirsi-sign-api", Status: "operational", Uptime: 99.95},
			{Service: "firebase-auth", Status: "operational", Uptime: 100},
			{Service: "sendgrid-relay", Status: "degraded", Uptime: 98.5},
		},
		GrpcThroughput: []*adminv2.GrpcThroughput{
			{Service: "AdminService", Rps: 145, Trend: []float64{120, 130, 140, 145, 138, 142, 145}},
			{Service: "HypervisorService", Rps: 82, Trend: []float64{60, 70, 75, 80, 78, 82, 82}},
			{Service: "TenantService", Rps: 55, Trend: []float64{40, 45, 50, 55, 52, 54, 55}},
		},
		GoRuntime: &adminv2.GoRuntime{Goroutines: 142, HeapMb: 28.5, GcPauseMs: 1.2},
		RateLimits: []*adminv2.RateLimit{
			{Service: "Stripe API", Used: 820, Limit: 10000},
			{Service: "SendGrid", Used: 4500, Limit: 10000},
			{Service: "Firebase Auth", Used: 1200, Limit: 50000},
		},
	}
	return connect.NewResponse(resp), nil
}

// Tab 8: Integrations
func (s *HypervisorServer) GetHypervisorIntegrations(
	ctx context.Context,
	req *connect.Request[adminv2.GetHypervisorIntegrationsRequest],
) (*connect.Response[adminv2.GetHypervisorIntegrationsResponse], error) {
	resp := &adminv2.GetHypervisorIntegrationsResponse{
		ServiceHealth: []*adminv2.IntegrationServiceHealth{
			{Name: "Stripe", Status: "operational", LastCheck: "30s ago", ResponseTimeMs: 145},
			{Name: "SendGrid", Status: "degraded", LastCheck: "1 min ago", ResponseTimeMs: 820},
			{Name: "Plaid", Status: "operational", LastCheck: "45s ago", ResponseTimeMs: 210},
			{Name: "OpenSign", Status: "operational", LastCheck: "1 min ago", ResponseTimeMs: 180},
			{Name: "Firebase", Status: "operational", LastCheck: "15s ago", ResponseTimeMs: 45},
		},
		Webhooks: []*adminv2.WebhookEntry{
			{Url: "https://api.sirsi.ai/webhooks/stripe", EventTypes: []string{"payment_intent.succeeded", "checkout.session.completed"}, SuccessRate: 99.8, AvgResponseMs: 120, RetryCount: 2},
			{Url: "https://api.sirsi.ai/webhooks/opensign", EventTypes: []string{"document.signed", "document.viewed"}, SuccessRate: 98.5, AvgResponseMs: 250, RetryCount: 5},
		},
		ApiKeys: []*adminv2.APIKeyEntry{
			{Service: "Stripe", ExpiresAt: "2027-01-15", DaysRemaining: 317, RotationStatus: "current"},
			{Service: "SendGrid", ExpiresAt: "2026-06-30", DaysRemaining: 118, RotationStatus: "current"},
			{Service: "Plaid", ExpiresAt: "2026-04-15", DaysRemaining: 42, RotationStatus: "rotation-due"},
			{Service: "OpenSign", ExpiresAt: "2026-12-01", DaysRemaining: 272, RotationStatus: "current"},
		},
		ScheduledJobs: []*adminv2.ScheduledJob{
			{Name: "daily-backup", Schedule: "0 2 * * *", LastRun: "2:00 AM today", NextRun: "2:00 AM tomorrow", Status: "operational"},
			{Name: "cert-renewal-check", Schedule: "0 8 * * 1", LastRun: "Monday 8:00 AM", NextRun: "Next Monday 8:00 AM", Status: "operational"},
			{Name: "audit-log-rotation", Schedule: "0 0 1 * *", LastRun: "Mar 1 midnight", NextRun: "Apr 1 midnight", Status: "operational"},
		},
	}
	return connect.NewResponse(resp), nil
}

// Tab 9: Cost
func (s *HypervisorServer) GetHypervisorCost(
	ctx context.Context,
	req *connect.Request[adminv2.GetHypervisorCostRequest],
) (*connect.Response[adminv2.GetHypervisorCostResponse], error) {
	resp := &adminv2.GetHypervisorCostResponse{
		MonthlyByService: []*adminv2.CostByService{
			{Service: "Cloud Run", Tenant: "FinalWishes", Cost: 420},
			{Service: "Cloud Run", Tenant: "Assiduous", Cost: 280},
			{Service: "Cloud Run", Tenant: "Sirsi Core", Cost: 140},
			{Service: "Cloud SQL", Tenant: "FinalWishes", Cost: 380},
			{Service: "Cloud SQL", Tenant: "Assiduous", Cost: 270},
			{Service: "Firestore", Tenant: "Sirsi Core", Cost: 320},
			{Service: "Cloud Storage", Tenant: "FinalWishes", Cost: 120},
			{Service: "Cloud Storage", Tenant: "Assiduous", Cost: 60},
		},
		BudgetVsActual: &adminv2.BudgetVsActual{Budget: 5000, Actual: 2340, Forecast: 4200},
		CostTrend_6M: []*adminv2.CostTrendMonth{
			{Month: "Oct", Finalwishes: 1200, Assiduous: 400, SirsiCore: 300},
			{Month: "Nov", Finalwishes: 1400, Assiduous: 500, SirsiCore: 350},
			{Month: "Dec", Finalwishes: 1300, Assiduous: 480, SirsiCore: 320},
			{Month: "Jan", Finalwishes: 1500, Assiduous: 550, SirsiCore: 380},
			{Month: "Feb", Finalwishes: 1600, Assiduous: 580, SirsiCore: 400},
			{Month: "Mar", Finalwishes: 1100, Assiduous: 500, SirsiCore: 340},
		},
		CostPerUser: 8.20,
		IdleResources: []*adminv2.IdleResource{
			{Name: "as-staging-worker-idle", Type: "Cloud Run", MonthlyCost: 45, Recommendation: "Scale to 0 outside business hours"},
			{Name: "fw-dev-sql-instance", Type: "Cloud SQL", MonthlyCost: 120, Recommendation: "Consider pausing during off-hours"},
		},
	}
	return connect.NewResponse(resp), nil
}

// Tab 10: Incidents
func (s *HypervisorServer) GetHypervisorIncidents(
	ctx context.Context,
	req *connect.Request[adminv2.GetHypervisorIncidentsRequest],
) (*connect.Response[adminv2.GetHypervisorIncidentsResponse], error) {
	resp := &adminv2.GetHypervisorIncidentsResponse{
		OpenIncidents: []*adminv2.IncidentDetail{
			{
				Id: "inc_1", Title: "Elevated staging error rate — Assiduous",
				Severity: "warning", Status: "investigating",
				OpenedAt: "3 hours ago", Tenant: "Assiduous", Assignee: "Cylton Collymore",
				Description: "Error rate on Assiduous staging environment spiked to 8.5%, above the 5% threshold.",
			},
		},
		SlaCompliance: &adminv2.SLACompliance{
			Current: 99.5, Target: 99.9,
			Trend: []float64{99.8, 99.7, 99.9, 99.5, 99.6, 99.5, 99.5},
		},
		IncidentHistory: []*adminv2.IncidentDetail{
			{Id: "inc_0", Title: "DNS propagation delay — sirsi.ai", Severity: "critical", Status: "resolved", OpenedAt: "2 days ago", ResolvedAt: "2 days ago", Tenant: "Sirsi Core", Assignee: "Cylton Collymore", Description: "DNS propagation took 48 minutes after domain migration."},
			{Id: "inc_-1", Title: "Stripe webhook timeout", Severity: "warning", Status: "resolved", OpenedAt: "5 days ago", ResolvedAt: "5 days ago", Tenant: "FinalWishes", Assignee: "Cylton Collymore", Description: "Stripe webhooks failing due to timeout on payment confirmation."},
		},
		RunbookLog: []*adminv2.RunbookLog{
			{Name: "auto-restart-degraded", Trigger: "error_rate > 5%", Result: "success", Duration: "45s", Timestamp: "3 hours ago"},
			{Name: "ssl-cert-renewal", Trigger: "days_remaining < 14", Result: "success", Duration: "2m 30s", Timestamp: "1 day ago"},
			{Name: "db-failover-test", Trigger: "scheduled", Result: "success", Duration: "1m 15s", Timestamp: "3 days ago"},
		},
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
