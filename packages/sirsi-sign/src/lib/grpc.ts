import { createClient, type Interceptor } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { ContractsService } from "../gen/sirsi/contracts/v2/contract_service_pb";
import { AdminService } from "../gen/sirsi/admin/v2/admin_service_pb";
import { CatalogService } from "../gen/sirsi/admin/v2/catalog_pb";
import { SigningService } from "../gen/sirsi/sign/v1/signing_pb";
import { auth } from "./firebase";

/**
 * gRPC Interceptor to inject Firebase Auth Bearer token
 */
const authInterceptor: Interceptor = (next) => async (req) => {
    // Attempt to get current user
    const user = auth.currentUser;
    if (user) {
        try {
            const token = await user.getIdToken();
            req.header.set("Authorization", `Bearer ${token}`);
        } catch (error) {
            console.error("Failed to get Firebase ID token:", error);
        }
    }
    return await next(req);
};

const transport = createConnectTransport({
    baseUrl: "https://contracts-grpc-210890802638.us-east4.run.app", // Match live region in us-east4
    interceptors: [authInterceptor],
});

// Admin transport (for CatalogService, AdminService, SigningService — uses sirsi-admin-service)
const adminTransport = createConnectTransport({
    baseUrl: import.meta.env.VITE_GATEWAY_URL || "http://localhost:8080",
    interceptors: [authInterceptor],
});

export const contractsClient = createClient(ContractsService, transport);
export const adminClient = createClient(AdminService, adminTransport);
export const catalogClient = createClient(CatalogService, adminTransport);
export const signingClient = createClient(SigningService, adminTransport);
