import { createPromiseClient, type Interceptor } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { ContractsService } from "../gen/proto/contracts/v1/contracts_connect";
import { AdminService } from "../gen/proto/admin/v1/admin_connect";
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

export const contractsClient = createPromiseClient(ContractsService, transport);
export const adminClient = createPromiseClient(AdminService, transport);
