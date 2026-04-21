import { useQuery } from "@tanstack/react-query";
import { HttpClient } from "@/data/client/http-client";
import { API_ENDPOINTS } from "@/data/client/endpoints";
import type { ApiResponse, PagedData } from "@/types";
import type {
  AuditLogResponse, SystemLogResponse, SyncLogResponse,
  AuditStatsResponse, SystemLogSearchRequest,
} from "@/types/audit";

// ======================================
// QUERY KEYS
// ======================================

export const AUDIT_KEYS = {
  ALL: ["audit"] as const,
  LIST: (params?: Record<string, any>) => ["audit", "list", params] as const,
  DETAIL: (id: string) => ["audit", id] as const,
  FAILED: ["audit", "failed"] as const,
  STATS: ["audit", "stats"] as const,
  BY_USER: (userId: string) => ["audit", "user", userId] as const,
  BY_ENTITY: (type: string, id: string) => ["audit", "entity", type, id] as const,
};

export const SYSTEM_LOG_KEYS = {
  ALL: ["system-logs"] as const,
  SEARCH: (params?: Record<string, any>) => ["system-logs", "search", params] as const,
  ERRORS: ["system-logs", "errors"] as const,
  SERVER_ERRORS: ["system-logs", "server-errors"] as const,
  SECURITY: ["system-logs", "security"] as const,
  SECURITY_ANALYSIS: ["system-logs", "security-analysis"] as const,
  MY_LOGS: ["system-logs", "my"] as const,
  STATS: ["system-logs", "stats"] as const,
};

export const SYNC_LOG_KEYS = {
  ALL: ["sync-logs"] as const,
  LIST: (params?: Record<string, any>) => ["sync-logs", "list", params] as const,
  DETAIL: (id: string) => ["sync-logs", id] as const,
  BY_FARM: (farmId: string) => ["sync-logs", "farm", farmId] as const,
  FAILED: ["sync-logs", "failed"] as const,
  CONFLICTS: ["sync-logs", "conflicts"] as const,
};

// ======================================
// AUDIT API
// ======================================

export const auditApi = {
  list: (page = 0, size = 20) =>
    HttpClient.get<ApiResponse<PagedData<AuditLogResponse>>>(
      `${API_ENDPOINTS.audit.list}?page=${page}&size=${size}&sortBy=actionTimestamp&sortDirection=DESC`
    ),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<AuditLogResponse>>(API_ENDPOINTS.audit.get(id)),
  byEntity: (entityType: string, entityId: string) =>
    HttpClient.get<ApiResponse<AuditLogResponse[]>>(API_ENDPOINTS.audit.byEntity(entityType, entityId)),
  byUser: (userId: string) =>
    HttpClient.get<ApiResponse<AuditLogResponse[]>>(API_ENDPOINTS.audit.byUser(userId)),
  failed: () =>
    HttpClient.get<ApiResponse<AuditLogResponse[]>>(API_ENDPOINTS.audit.failed),
  stats: () =>
    HttpClient.get<ApiResponse<Record<string, number>>>(API_ENDPOINTS.audit.stats),
};

// ======================================
// SYSTEM LOG API
// ======================================

export const systemLogApi = {
  search: (data: SystemLogSearchRequest) =>
    HttpClient.post<ApiResponse<PagedData<SystemLogResponse>>>(API_ENDPOINTS.systemLogs.search, data),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<SystemLogResponse>>(API_ENDPOINTS.systemLogs.get(id)),
  errors: (page = 0, size = 20) =>
    HttpClient.get<ApiResponse<PagedData<SystemLogResponse>>>(`${API_ENDPOINTS.systemLogs.errors}?page=${page}&size=${size}`),
  serverErrors: (page = 0, size = 20) =>
    HttpClient.get<ApiResponse<PagedData<SystemLogResponse>>>(`${API_ENDPOINTS.systemLogs.serverErrors}?page=${page}&size=${size}`),
  securityViolations: (page = 0, size = 20) =>
    HttpClient.get<ApiResponse<PagedData<SystemLogResponse>>>(`${API_ENDPOINTS.systemLogs.securityViolations}?page=${page}&size=${size}`),
  securityAnalysis: () =>
    HttpClient.get<ApiResponse<Record<string, any>>>(API_ENDPOINTS.systemLogs.securityAnalysis),
  byUser: (userId: string, page = 0, size = 20) =>
    HttpClient.get<ApiResponse<PagedData<SystemLogResponse>>>(`${API_ENDPOINTS.systemLogs.byUser(userId)}?page=${page}&size=${size}`),
  myLogs: (page = 0, size = 20) =>
    HttpClient.get<ApiResponse<PagedData<SystemLogResponse>>>(`${API_ENDPOINTS.systemLogs.myLogs}?page=${page}&size=${size}`),
  bySession: (sessionId: string) =>
    HttpClient.get<ApiResponse<SystemLogResponse[]>>(API_ENDPOINTS.systemLogs.bySession(sessionId)),
  stats: () =>
    HttpClient.get<ApiResponse<AuditStatsResponse>>(API_ENDPOINTS.systemLogs.stats),
};

// ======================================
// SYNC LOG API
// ======================================

export const syncLogApi = {
  list: (page = 0, size = 20) =>
    HttpClient.get<ApiResponse<PagedData<SyncLogResponse>>>(`${API_ENDPOINTS.syncLogs.list}?page=${page}&size=${size}`),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<SyncLogResponse>>(API_ENDPOINTS.syncLogs.get(id)),
  byFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<SyncLogResponse[]>>(API_ENDPOINTS.syncLogs.byFarm(farmId)),
  byUser: (userId: string) =>
    HttpClient.get<ApiResponse<SyncLogResponse[]>>(API_ENDPOINTS.syncLogs.byUser(userId)),
  byDevice: (deviceId: string) =>
    HttpClient.get<ApiResponse<SyncLogResponse[]>>(API_ENDPOINTS.syncLogs.byDevice(deviceId)),
  failed: () =>
    HttpClient.get<ApiResponse<SyncLogResponse[]>>(API_ENDPOINTS.syncLogs.failed),
  conflicts: () =>
    HttpClient.get<ApiResponse<SyncLogResponse[]>>(API_ENDPOINTS.syncLogs.conflicts),
  avgDuration: (farmId: string) =>
    HttpClient.get<ApiResponse<number>>(API_ENDPOINTS.syncLogs.avgDuration(farmId)),
};

// ======================================
// AUDIT HOOKS
// ======================================

export function useAuditLogs(page = 0, size = 20) {
  return useQuery({ queryKey: AUDIT_KEYS.LIST({ page, size }), queryFn: () => auditApi.list(page, size) });
}

export function useAuditLog(id: string) {
  return useQuery({ queryKey: AUDIT_KEYS.DETAIL(id), queryFn: () => auditApi.getById(id), enabled: !!id });
}

export function useFailedAudits() {
  return useQuery({ queryKey: AUDIT_KEYS.FAILED, queryFn: () => auditApi.failed() });
}

export function useAuditStats() {
  return useQuery({ queryKey: AUDIT_KEYS.STATS, queryFn: () => auditApi.stats() });
}

export function useAuditByUser(userId: string) {
  return useQuery({ queryKey: AUDIT_KEYS.BY_USER(userId), queryFn: () => auditApi.byUser(userId), enabled: !!userId });
}

// ======================================
// SYSTEM LOG HOOKS
// ======================================

export function useSystemLogErrors(page = 0, size = 20) {
  return useQuery({ queryKey: [...SYSTEM_LOG_KEYS.ERRORS, page, size], queryFn: () => systemLogApi.errors(page, size) });
}

export function useServerErrors(page = 0, size = 20) {
  return useQuery({ queryKey: [...SYSTEM_LOG_KEYS.SERVER_ERRORS, page, size], queryFn: () => systemLogApi.serverErrors(page, size) });
}

export function useSecurityViolations(page = 0, size = 20) {
  return useQuery({ queryKey: [...SYSTEM_LOG_KEYS.SECURITY, page, size], queryFn: () => systemLogApi.securityViolations(page, size) });
}

export function useSecurityAnalysis() {
  return useQuery({ queryKey: SYSTEM_LOG_KEYS.SECURITY_ANALYSIS, queryFn: () => systemLogApi.securityAnalysis() });
}

export function useSystemLogStats() {
  return useQuery({ queryKey: SYSTEM_LOG_KEYS.STATS, queryFn: () => systemLogApi.stats() });
}

export function useMyLogs(page = 0, size = 20) {
  return useQuery({ queryKey: [...SYSTEM_LOG_KEYS.MY_LOGS, page, size], queryFn: () => systemLogApi.myLogs(page, size) });
}

// ======================================
// SYNC LOG HOOKS
// ======================================

export function useSyncLogs(page = 0, size = 20) {
  return useQuery({ queryKey: SYNC_LOG_KEYS.LIST({ page, size }), queryFn: () => syncLogApi.list(page, size) });
}

export function useSyncLog(id: string) {
  return useQuery({ queryKey: SYNC_LOG_KEYS.DETAIL(id), queryFn: () => syncLogApi.getById(id), enabled: !!id });
}

export function useFailedSyncs() {
  return useQuery({ queryKey: SYNC_LOG_KEYS.FAILED, queryFn: () => syncLogApi.failed() });
}

export function useSyncConflicts() {
  return useQuery({ queryKey: SYNC_LOG_KEYS.CONFLICTS, queryFn: () => syncLogApi.conflicts() });
}
