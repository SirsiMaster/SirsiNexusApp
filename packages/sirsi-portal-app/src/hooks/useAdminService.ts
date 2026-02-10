// src/hooks/useAdminService.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@connectrpc/connect";
import { AdminService } from "../gen/sirsi/admin/v2/admin_service_pb";
import { transport } from "../lib/transport";
import type {
    ManageUserRoleRequest,
    UpdateSettingsRequest
} from "../gen/sirsi/admin/v2/admin_service_pb";

const client = createClient(AdminService as any, transport);

export const useUsers = (tenantId: string) => {
    return useQuery({
        queryKey: ['users', tenantId],
        queryFn: async () => {
            const res = await (client as any).listUsers({
                tenantId,
                pagination: { pageSize: 50, pageToken: "" }
            });
            return res.users;
        },
        enabled: !!tenantId,
    });
};

export const useManageRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (req: ManageUserRoleRequest) => {
            return await (client as any).manageUserRole(req);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useSystemSettings = () => {
    return useQuery({
        queryKey: ['system-settings'],
        queryFn: async () => {
            const res = await (client as any).getSettings({});
            return res.settings;
        },
    });
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (req: UpdateSettingsRequest) => {
            return await (client as any).updateSettings(req);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-settings'] });
        },
    });
};
