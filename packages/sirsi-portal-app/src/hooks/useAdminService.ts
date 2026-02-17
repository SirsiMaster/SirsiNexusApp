// src/hooks/useAdminService.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@connectrpc/connect";
import { AdminService } from "../gen/sirsi/admin/v2/admin_service_pb";
import { transport } from "../lib/transport";

const client = createClient(AdminService as any, transport);

// Estate Management
export const useEstates = (req: any = {}) => {
    return useQuery({
        queryKey: ['estates', req],
        queryFn: async () => {
            const res = await (client as any).listEstates({
                pagination: { pageSize: 50, pageToken: "" },
                ...req
            });
            return res.estates;
        },
    });
};

export const useEstate = (id: string) => {
    return useQuery({
        queryKey: ['estate', id],
        queryFn: async () => {
            const res = await (client as any).getEstate({ id });
            return res.estate;
        },
        enabled: !!id,
    });
};

export const useCreateEstate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (req: any) => {
            return await (client as any).createEstate(req);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['estates'] });
        },
    });
};

export const useUpdateEstate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (req: any) => {
            return await (client as any).updateEstate(req);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['estates'] });
            queryClient.invalidateQueries({ queryKey: ['estate', variables.id] });
        },
    });
};

// Development Intelligence
export const useDevMetrics = (req: any) => {
    return useQuery({
        queryKey: ['dev-metrics', req],
        queryFn: async () => {
            const res = await (client as any).getDevMetrics(req);
            return res;
        },
        enabled: !!req.tenantId,
    });
};

export const useSyncGitHub = () => {
    return useMutation({
        mutationFn: async (req: any) => {
            return await (client as any).syncGitHubStats(req);
        },
    });
};

// System Settings
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
        mutationFn: async (req: any) => {
            return await (client as any).updateSettings(req);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-settings'] });
        },
    });
};

// User Management
export const useUsers = (tenantId?: string) => {
    return useQuery({
        queryKey: ['admin-users', tenantId],
        queryFn: async () => {
            const res = await (client as any).listUsers({
                tenantId,
                pagination: { pageSize: 100, pageToken: "" }
            });
            return res.users;
        },
    });
};
