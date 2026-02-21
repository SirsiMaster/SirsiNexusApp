package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"connectrpc.com/connect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	adminv2 "github.com/sirsimaster/sirsi-nexus/gen/go/sirsi/admin/v2"
	"github.com/sirsimaster/sirsi-nexus/gen/go/sirsi/admin/v2/v2connect"
	commonv1 "github.com/sirsimaster/sirsi-nexus/gen/go/sirsi/common/v1"
)

type AdminServer struct{}

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
	users := []*adminv2.User{
		{
			Id:    "user_1",
			Email: "cylton@sirsi.ai",
			Name:  "Cylton Collymore",
			Role:  "Admin",
		},
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
			Title:       "System Maintenance",
			Body:        "Scheduled maintenance in 2 hours.",
			Type:        "warning",
			SentAt:      1706482800,
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
			Timestamp: 1706482800,
			Level:     "INFO",
			Source:    "AdminService",
			Message:   "Admin service initialized",
			User:      "system",
		},
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

func main() {
	loadSettings()
	mux := http.NewServeMux()
	mux.Handle(v2connect.NewAdminServiceHandler(&AdminServer{}))
	mux.Handle(v2connect.NewTenantServiceHandler(&TenantServer{}))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Admin Service listening on :%s\n", port)
	err := http.ListenAndServe(
		":"+port,
		h2c.NewHandler(mux, &http2.Server{}),
	)
	if err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
