// src/hooks/useAdminService.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@connectrpc/connect";
import { AdminService } from "../gen/sirsi/admin/v2/admin_service_pb";
import { transport } from "../lib/transport";

const client = createClient(AdminService as any, transport);

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

// System Overview & Monitoring
export const useSystemOverview = () => {
    return useQuery({
        queryKey: ['system-overview'],
        queryFn: async () => {
            return await (client as any).getSystemOverview({});
        },
        refetchInterval: 10000, // Sync every 10s
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

export const useManageUserRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (req: { userId: string; role: string }) => {
            return await (client as any).manageUserRole(req);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
    });
};

// Audit Trail
export const useAuditTrail = (filterLevel?: string) => {
    return useQuery({
        queryKey: ['audit-trail', filterLevel],
        queryFn: async () => {
            const res = await (client as any).listAuditTrail({
                filterLevel: filterLevel || '',
                pagination: { pageSize: 100, pageToken: "" }
            });
            return res.logs;
        },
    });
};

// Notifications
export const useNotifications = (recipientId?: string) => {
    return useQuery({
        queryKey: ['notifications', recipientId],
        queryFn: async () => {
            const res = await (client as any).listNotifications({
                recipientId: recipientId || '',
                pagination: { pageSize: 50, pageToken: "" }
            });
            return res.notifications;
        },
    });
};

export const useSendNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (req: any) => {
            return await (client as any).sendNotification(req);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
