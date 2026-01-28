import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from '../lib/grpc';
import {
    ListEstatesRequest,
    LogDevSessionRequest,
    ManageUserRoleRequest,
    ListUsersRequest,
    ListNotificationsRequest,
    SendNotificationRequest
} from '../gen/proto/admin/v1/admin_pb';

export const useEstates = (pageSize = 10, pageToken = '') => {
    return useQuery({
        queryKey: ['estates', pageSize, pageToken],
        queryFn: async () => {
            const res = await adminClient.listEstates(new ListEstatesRequest({ pageSize, pageToken }));
            return res;
        }
    });
};

export const useUsers = (pageSize = 10, pageToken = '') => {
    return useQuery({
        queryKey: ['users', pageSize, pageToken],
        queryFn: async () => {
            const res = await adminClient.listUsers(new ListUsersRequest({ pageSize, pageToken }));
            return res;
        }
    });
};

export const useNotifications = (pageSize = 10, pageToken = '') => {
    return useQuery({
        queryKey: ['notifications', pageSize, pageToken],
        queryFn: async () => {
            const res = await adminClient.listNotifications(new ListNotificationsRequest({ pageSize, pageToken }));
            return res;
        }
    });
};

export const useSendNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (req: { recipientId: string, title: string, body: string, type: string, channel: string }) => {
            const res = await adminClient.sendNotification(new SendNotificationRequest(req));
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
            const res = await adminClient.logDevSession(new LogDevSessionRequest(req));
            return res;
        }
    });
};

export const useManageUserRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (req: { userId: string, role: string }) => {
            const res = await adminClient.manageUserRole(new ManageUserRoleRequest(req));
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
};
