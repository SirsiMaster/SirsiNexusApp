// src/hooks/useTenantService.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@connectrpc/connect";
import { TenantService } from "../gen/sirsi/admin/v2/tenant_pb";
import { transport } from "../lib/transport";
import type {
    CreateTenantRequest
} from "../gen/sirsi/admin/v2/tenant_pb";

const client = createClient(TenantService as any, transport);

export const useTenants = () => {
    return useQuery({
        queryKey: ['tenants'],
        queryFn: async () => {
            const res = await (client as any).listTenants({
                pagination: { pageSize: 50, pageToken: "" },
                statusFilter: 1, // Active
            });
            return res.tenants;
        },
    });
};

export const useTenant = (id: string) => {
    return useQuery({
        queryKey: ['tenant', id],
        queryFn: async () => {
            const res = await (client as any).getTenant({ id });
            return res.tenant;
        },
        enabled: !!id,
    });
};

export const useCreateTenant = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (req: CreateTenantRequest) => {
            return await (client as any).createTenant(req);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
        },
    });
};
