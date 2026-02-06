import { createPromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { ContractsService } from "../gen/proto/contracts/v1/contracts_connect";
import { AdminService } from "../gen/proto/admin/v1/admin_connect";

const transport = createConnectTransport({
    baseUrl: "https://contracts-grpc-210890802638.us-east4.run.app", // Match live region in us-east4
});


export const contractsClient = createPromiseClient(ContractsService, transport);
export const adminClient = createPromiseClient(AdminService, transport);
