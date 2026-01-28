package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"connectrpc.com/connect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	adminv1 "github.com/sirsimaster/sirsi-admin-service/gen/go/proto/admin/v1"
	"github.com/sirsimaster/sirsi-admin-service/gen/go/proto/admin/v1/v1connect"
)

type AdminServer struct{}

func (s *AdminServer) ListEstates(
	ctx context.Context,
	req *connect.Request[adminv1.ListEstatesRequest],
) (*connect.Response[adminv1.ListEstatesResponse], error) {
	log.Printf("ListEstates called with pageSize: %d", req.Msg.PageSize)

	// Mock implementation
	estates := []*adminv1.Estate{
		{
			Id:        "est_123",
			Name:      "Blue Ridge Estate",
			OwnerName: "Alice Wonderland",
			Status:    "Active",
			CreatedAt: 1700000000,
		},
		{
			Id:        "est_456",
			Name:      "Crystal Peak Manor",
			OwnerName: "Bob Builder",
			Status:    "Pending",
			CreatedAt: 1700005000,
		},
	}

	res := connect.NewResponse(&adminv1.ListEstatesResponse{
		Estates: estates,
	})
	return res, nil
}

func (s *AdminServer) GetEstate(
	ctx context.Context,
	req *connect.Request[adminv1.GetEstateRequest],
) (*connect.Response[adminv1.Estate], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, fmt.Errorf("unimplemented"))
}

func (s *AdminServer) LogDevSession(
	ctx context.Context,
	req *connect.Request[adminv1.LogDevSessionRequest],
) (*connect.Response[adminv1.LogDevSessionResponse], error) {
	log.Printf("LogDevSession called by: %s", req.Msg.DeveloperId)
	res := connect.NewResponse(&adminv1.LogDevSessionResponse{
		SessionId: "sess_mock_999",
	})
	return res, nil
}

func (s *AdminServer) ManageUserRole(
	ctx context.Context,
	req *connect.Request[adminv1.ManageUserRoleRequest],
) (*connect.Response[adminv1.ManageUserRoleResponse], error) {
	log.Printf("ManageUserRole: %s -> %s", req.Msg.UserId, req.Msg.Role)
	res := connect.NewResponse(&adminv1.ManageUserRoleResponse{
		Success: true,
	})
	return res, nil
}

func (s *AdminServer) ListUsers(
	ctx context.Context,
	req *connect.Request[adminv1.ListUsersRequest],
) (*connect.Response[adminv1.ListUsersResponse], error) {
	users := []*adminv1.User{
		{
			Id:    "user_1",
			Email: "cylton@sirsi.ai",
			Name:  "Cylton Collymore",
			Role:  "Admin",
		},
	}
	res := connect.NewResponse(&adminv1.ListUsersResponse{
		Users: users,
	})
	return res, nil
}

func (s *AdminServer) SendNotification(
	ctx context.Context,
	req *connect.Request[adminv1.SendNotificationRequest],
) (*connect.Response[adminv1.SendNotificationResponse], error) {
	log.Printf("SendNotification to %s: %s", req.Msg.RecipientId, req.Msg.Title)
	res := connect.NewResponse(&adminv1.SendNotificationResponse{
		NotificationId: "notif_mock_123",
	})
	return res, nil
}

func (s *AdminServer) ListNotifications(
	ctx context.Context,
	req *connect.Request[adminv1.ListNotificationsRequest],
) (*connect.Response[adminv1.ListNotificationsResponse], error) {
	notifs := []*adminv1.Notification{
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
	res := connect.NewResponse(&adminv1.ListNotificationsResponse{
		Notifications: notifs,
	})
	return res, nil
}

func main() {
	mux := http.NewServeMux()
	path, handler := v1connect.NewAdminServiceHandler(&AdminServer{})
	mux.Handle(path, handler)

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
