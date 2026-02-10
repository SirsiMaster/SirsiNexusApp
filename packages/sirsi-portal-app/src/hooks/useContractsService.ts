// src/hooks/useContractsService.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@connectrpc/connect";
import { ContractsService } from "../gen/sirsi/contracts/v2/contract_service_pb";
import { transport } from "../lib/transport";
import type {
    CreateContractRequest
} from "../gen/sirsi/contracts/v2/contract_service_pb";

const client = createClient(ContractsService as any, transport);

export const useContracts = (tenantId: string, projectId: string = "") => {
    return useQuery({
        queryKey: ['contracts', tenantId, projectId],
        queryFn: async () => {
            const res = await (client as any).listContracts({
                tenantId,
                projectId,
                pagination: { pageSize: 50, pageToken: "" },
                userEmail: "",
            });
            return res.contracts;
        },
        enabled: !!tenantId,
    });
};

export const useContract = (id: string) => {
    return useQuery({
        queryKey: ['contract', id],
        queryFn: async () => {
            const res = await (client as any).getContract({ id });
            return res.contract;
        },
        enabled: !!id,
    });
};

export const useCreateContract = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (req: CreateContractRequest) => {
            return await (client as any).createContract(req);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contracts', variables.tenantId] });
        },
    });
};
