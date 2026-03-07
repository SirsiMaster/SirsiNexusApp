import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient, contractsClient } from '../lib/grpc';

export const useContracts = (projectId = '', userEmail = '', pageSize = 50) => {
    return useQuery({
        queryKey: ['contracts', projectId, userEmail, pageSize],
        queryFn: async () => {
            const res = await contractsClient.listContracts({
                projectId,
                userEmail,
                pagination: {
                    pageSize
                }
            });
            return res;
        }
    });
};



export const useUsers = (pageSize = 10, pageToken = '') => {
    return useQuery({
        queryKey: ['users', pageSize, pageToken],
        queryFn: async () => {
            const res = await adminClient.listUsers({
                pagination: { pageSize, pageToken }
            });
            return res;
        }
    });
};

export const useNotifications = (pageSize = 10, pageToken = '') => {
    return useQuery({
        queryKey: ['notifications', pageSize, pageToken],
        queryFn: async () => {
            const res = await adminClient.listNotifications({
                pagination: { pageSize, pageToken }
            });
            return res;
        }
    });
};

export const useSendNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (req: { recipientId: string, title: string, body: string, type: string, channel: string }) => {
            const res = await adminClient.sendNotification(req);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
};

export const useLogDevSession = () => {
    return useMutation({
        mutationFn: async (req: { developerId: string, action: string, metadata: string }) => {
            const res = await adminClient.logDevSession(req);
            return res;
        }
    });
};

export const useManageUserRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (req: { userId: string, role: string }) => {
            const res = await adminClient.manageUserRole(req);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
};

export const useSettings = () => {
    return useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await adminClient.getSettings({});
            return res.settings;
        }
    });
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (settings: { maintenanceMode: boolean, activeRegion: string, sirsiMultiplier: number }) => {
            const res = await adminClient.updateSettings({
                settings
            });
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        }
    });
};

export const useAuditTrail = (filterLevel = 'ALL', pageSize = 50, pageToken = '') => {
    return useQuery({
        queryKey: ['audit-trail', filterLevel, pageSize, pageToken],
        queryFn: async () => {
            const res = await adminClient.listAuditTrail({
                filterLevel,
                pagination: {
                    pageSize,
                    pageToken
                }
            });
            return res;
        }
    });
};

