import { createPromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { ContractsService } from "../gen/proto/contracts/v1/contracts_connect";
import { AdminService } from "../gen/proto/admin/v1/admin_connect";

const transport = createConnectTransport({
    baseUrl: "https://contracts-grpc-210890802638.us-central1.run.app", // Assuming same base URL for now or update as needed
});

export const contractsClient = createPromiseClient(ContractsService, transport);
export const adminClient = createPromiseClient(AdminService, transport);
