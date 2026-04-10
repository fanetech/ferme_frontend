import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpClient } from "@/data/client/http-client";
import { API_ENDPOINTS } from "@/data/client/endpoints";
import type { ApiResponse } from "@/types";
import type { NotificationResponse, NotificationStatsResponse, AlertRuleResponse, SendNotificationRequest, CreateAlertRuleRequest } from "@/types/notification";

export const NOTIFICATION_KEYS = {
  ALL: ["notifications"] as const,
  LIST: ["notifications", "list"] as const,
  UNREAD: ["notifications", "unread"] as const,
  UNREAD_COUNT: ["notifications", "unread-count"] as const,
  STATS: ["notifications", "stats"] as const,
};

export const ALERT_RULE_KEYS = {
  ALL: ["alert-rules"] as const,
  BY_FARM: (farmId: string) => ["alert-rules", "farm", farmId] as const,
};

export const notificationApi = {
  list: () =>
    HttpClient.get<ApiResponse<NotificationResponse[]>>(API_ENDPOINTS.notifications.list),
  unread: () =>
    HttpClient.get<ApiResponse<NotificationResponse[]>>(API_ENDPOINTS.notifications.unread),
  unreadCount: () =>
    HttpClient.get<ApiResponse<number>>(API_ENDPOINTS.notifications.unreadCount),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<NotificationResponse>>(API_ENDPOINTS.notifications.get(id)),
  markRead: (id: string) =>
    HttpClient.put<ApiResponse<void>>(API_ENDPOINTS.notifications.markRead(id), {}),
  markAllRead: () =>
    HttpClient.put<ApiResponse<void>>(API_ENDPOINTS.notifications.markAllRead, {}),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.notifications.delete(id)),
  send: (data: SendNotificationRequest) =>
    HttpClient.post<ApiResponse<NotificationResponse>>(API_ENDPOINTS.notifications.send, data),
  stats: () =>
    HttpClient.get<ApiResponse<NotificationStatsResponse>>(API_ENDPOINTS.notifications.stats),
};

export const alertRuleApi = {
  byFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<AlertRuleResponse[]>>(API_ENDPOINTS.alertRules.byFarm(farmId)),
  create: (farmId: string, data: CreateAlertRuleRequest) =>
    HttpClient.post<ApiResponse<AlertRuleResponse>>(API_ENDPOINTS.alertRules.create(farmId), data),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<AlertRuleResponse>>(API_ENDPOINTS.alertRules.get(id)),
  update: (id: string, data: Partial<CreateAlertRuleRequest>) =>
    HttpClient.put<ApiResponse<AlertRuleResponse>>(API_ENDPOINTS.alertRules.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.alertRules.delete(id)),
  toggle: (id: string) =>
    HttpClient.put<ApiResponse<AlertRuleResponse>>(API_ENDPOINTS.alertRules.toggle(id), {}),
  trigger: (id: string) =>
    HttpClient.post<ApiResponse<void>>(API_ENDPOINTS.alertRules.trigger(id), {}),
};

// ======================================
// QUERY HOOKS
// ======================================

export function useNotifications() {
  return useQuery({ queryKey: NOTIFICATION_KEYS.LIST, queryFn: () => notificationApi.list() });
}

export function useUnreadNotifications() {
  return useQuery({ queryKey: NOTIFICATION_KEYS.UNREAD, queryFn: () => notificationApi.unread() });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.UNREAD_COUNT,
    queryFn: () => notificationApi.unreadCount(),
    refetchInterval: 30000,
  });
}

export function useNotificationStats() {
  return useQuery({ queryKey: NOTIFICATION_KEYS.STATS, queryFn: () => notificationApi.stats() });
}

export function useFarmAlertRules(farmId: string) {
  return useQuery({ queryKey: ALERT_RULE_KEYS.BY_FARM(farmId), queryFn: () => alertRuleApi.byFarm(farmId), enabled: !!farmId });
}

// ======================================
// MUTATION HOOKS
// ======================================

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.ALL }); },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.ALL }); toast.success("Toutes les notifications marquées comme lues"); },
  });
}

export function useSendNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SendNotificationRequest) => notificationApi.send(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.ALL }); toast.success("Notification envoyée"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useCreateAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ farmId, data }: { farmId: string; data: CreateAlertRuleRequest }) => alertRuleApi.create(farmId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ALERT_RULE_KEYS.ALL }); toast.success("Règle d'alerte créée"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useToggleAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertRuleApi.toggle(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ALERT_RULE_KEYS.ALL }); toast.success("Règle mise à jour"); },
  });
}
