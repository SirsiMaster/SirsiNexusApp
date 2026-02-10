// src/lib/transport.ts
import { createConnectTransport } from "@connectrpc/connect-web";
import type { Interceptor } from "@connectrpc/connect";
import { auth } from "./firebase";

// Unified Gateway URL
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL ?? "http://localhost:8080";

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

export const transport = createConnectTransport({
    baseUrl: GATEWAY_URL,
    interceptors: [authInterceptor],
});
