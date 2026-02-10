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

	adminv2 "github.com/sirsimaster/sirsi-nexus/gen/go/sirsi/admin/v2"
	"github.com/sirsimaster/sirsi-nexus/gen/go/sirsi/admin/v2/v2connect"
	contractsv2 "github.com/sirsimaster/sirsi-nexus/gen/go/sirsi/contracts/v2"
	contractsv2connect "github.com/sirsimaster/sirsi-nexus/gen/go/sirsi/contracts/v2/v2connect"
)

// AdminServer implements the AdminService v2
type AdminServer struct {
	v2connect.UnimplementedAdminServiceHandler
}

func (s *AdminServer) LogDevSession(
	ctx context.Context,
	req *connect.Request[adminv2.LogDevSessionRequest],
) (*connect.Response[adminv2.LogDevSessionResponse], error) {
	log.Printf("LogDevSession (v2) called by: %s", req.Msg.DeveloperId)
	return connect.NewResponse(&adminv2.LogDevSessionResponse{
		SessionId: "sess_v2_mock_888",
	}), nil
}

// ContractsServer implements the ContractsService v2
type ContractsServer struct {
	contractsv2connect.UnimplementedContractsServiceHandler
}

func (s *ContractsServer) ListContracts(
	ctx context.Context,
	req *connect.Request[contractsv2.ListContractsRequest],
) (*connect.Response[contractsv2.ListContractsResponse], error) {
	log.Printf("ListContracts (v2) called for project: %s", req.Msg.ProjectId)

	contracts := []*contractsv2.Contract{
		{
			Id:         "cnt_v2_1",
			ProjectId:  req.Msg.ProjectId,
			ClientName: "Test Client",
			Status:     contractsv2.ContractStatus_CONTRACT_STATUS_ACTIVE,
		},
	}

	return connect.NewResponse(&contractsv2.ListContractsResponse{
		Contracts: contracts,
	}), nil
}

// TenantServer implements the TenantService v2
type TenantServer struct {
	v2connect.UnimplementedTenantServiceHandler
}

func (s *TenantServer) ListTenants(
	ctx context.Context,
	req *connect.Request[adminv2.ListTenantsRequest],
) (*connect.Response[adminv2.ListTenantsResponse], error) {
	log.Printf("ListTenants (v2) called")
	tenants := []*adminv2.Tenant{
		{
			Id:   "tenant_1",
			Name: "FinalWishes",
			Slug: "finalwishes",
		},
	}
	return connect.NewResponse(&adminv2.ListTenantsResponse{
		Tenants: tenants,
	}), nil
}

func main() {
	mux := http.NewServeMux()

	// Register Admin Service
	adminPath, adminHandler := v2connect.NewAdminServiceHandler(&AdminServer{})
	mux.Handle(adminPath, adminHandler)

	// Register Tenant Service
	tenantPath, tenantHandler := v2connect.NewTenantServiceHandler(&TenantServer{})
	mux.Handle(tenantPath, tenantHandler)

	// Register Contracts Service
	contractsPath, contractsHandler := contractsv2connect.NewContractsServiceHandler(&ContractsServer{})
	mux.Handle(contractsPath, contractsHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🚀 Sirsi Unified Gateway listening on :%s\n", port)
	fmt.Printf("Registered %s\n", adminPath)
	fmt.Printf("Registered %s\n", tenantPath)
	fmt.Printf("Registered %s\n", contractsPath)

	err := http.ListenAndServe(
		":"+port,
		h2c.NewHandler(mux, &http2.Server{}),
	)
	if err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
