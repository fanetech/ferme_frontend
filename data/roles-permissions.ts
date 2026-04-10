import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpClient } from "@/data/client/http-client";
import { API_ENDPOINTS } from "@/data/client/endpoints";
import type { ApiResponse, PagedData } from "@/types";
import type { RoleResponse, PermissionResponse, ModuleResponse, CreateRoleRequest, UpdateRoleRequest, CreateModuleRequest, UpdateModuleRequest } from "@/types/role";

// ======================================
// QUERY KEYS
// ======================================

export const ROLE_QUERY_KEYS = {
  ALL: ["roles"] as const,
  LIST: (params?: Record<string, any>) => ["roles", "list", params] as const,
  DETAIL: (id: string) => ["roles", id] as const,
  SYSTEM: ["roles", "system"] as const,
};

export const PERMISSION_QUERY_KEYS = {
  ALL: ["permissions"] as const,
  LIST: (params?: Record<string, any>) => ["permissions", "list", params] as const,
  BY_MODULE: (module: string) => ["permissions", "module", module] as const,
};

export const MODULE_QUERY_KEYS = {
  ALL: ["modules"] as const,
  LIST: (params?: Record<string, any>) => ["modules", "list", params] as const,
  DETAIL: (id: string) => ["modules", id] as const,
  ACTIVE: ["modules", "active"] as const,
};

// ======================================
// API CALLS
// ======================================

export const roleApi = {
  list: (page = 0, size = 20) =>
    HttpClient.get<ApiResponse<PagedData<RoleResponse>>>(`${API_ENDPOINTS.roles.list}?page=${page}&size=${size}`),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<RoleResponse>>(API_ENDPOINTS.roles.get(id)),
  create: (data: CreateRoleRequest) =>
    HttpClient.post<ApiResponse<RoleResponse>>(API_ENDPOINTS.roles.create, data),
  update: (id: string, data: UpdateRoleRequest) =>
    HttpClient.put<ApiResponse<RoleResponse>>(API_ENDPOINTS.roles.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.roles.delete(id)),
  getSystem: () =>
    HttpClient.get<ApiResponse<RoleResponse[]>>(API_ENDPOINTS.roles.system),
  search: (keyword: string) =>
    HttpClient.get<ApiResponse<PagedData<RoleResponse>>>(`${API_ENDPOINTS.roles.search}?keyword=${keyword}`),
  addPermissions: (id: string, permissionIds: string[]) =>
    HttpClient.post<ApiResponse<RoleResponse>>(API_ENDPOINTS.roles.addPermissions(id), { permissionIds }),
};

export const permissionApi = {
  list: (page = 0, size = 50) =>
    HttpClient.get<ApiResponse<PagedData<PermissionResponse>>>(`${API_ENDPOINTS.permissions.list}?page=${page}&size=${size}`),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<PermissionResponse>>(API_ENDPOINTS.permissions.get(id)),
  byModule: (module: string) =>
    HttpClient.get<ApiResponse<PermissionResponse[]>>(API_ENDPOINTS.permissions.byModule(module)),
  search: (keyword: string) =>
    HttpClient.get<ApiResponse<PagedData<PermissionResponse>>>(`${API_ENDPOINTS.permissions.search}?keyword=${keyword}`),
};

export const moduleApi = {
  list: (page = 0, size = 50) =>
    HttpClient.get<ApiResponse<PagedData<ModuleResponse>>>(`${API_ENDPOINTS.modules.list}?page=${page}&size=${size}`),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<ModuleResponse>>(API_ENDPOINTS.modules.get(id)),
  create: (data: CreateModuleRequest) =>
    HttpClient.post<ApiResponse<ModuleResponse>>(API_ENDPOINTS.modules.create, data),
  update: (id: string, data: UpdateModuleRequest) =>
    HttpClient.put<ApiResponse<ModuleResponse>>(API_ENDPOINTS.modules.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.modules.delete(id)),
  getActive: () =>
    HttpClient.get<ApiResponse<ModuleResponse[]>>(API_ENDPOINTS.modules.active),
};

// ======================================
// ROLE HOOKS
// ======================================

export function useRoles(page = 0, size = 20) {
  return useQuery({
    queryKey: ROLE_QUERY_KEYS.LIST({ page, size }),
    queryFn: () => roleApi.list(page, size),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ROLE_QUERY_KEYS.DETAIL(id),
    queryFn: () => roleApi.getById(id),
    enabled: !!id,
  });
}

export function useSystemRoles() {
  return useQuery({
    queryKey: ROLE_QUERY_KEYS.SYSTEM,
    queryFn: () => roleApi.getSystem(),
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleRequest) => roleApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.ALL }); toast.success("Rôle créé"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) => roleApi.update(id, data),
    onSuccess: (_, { id }) => { qc.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.ALL }); qc.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.DETAIL(id) }); toast.success("Rôle mis à jour"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.ALL }); toast.success("Rôle supprimé"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useAddPermissionsToRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissionIds }: { id: string; permissionIds: string[] }) => roleApi.addPermissions(id, permissionIds),
    onSuccess: (_, { id }) => { qc.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.DETAIL(id) }); toast.success("Permissions ajoutées"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

// ======================================
// PERMISSION HOOKS
// ======================================

export function usePermissions(page = 0, size = 50) {
  return useQuery({
    queryKey: PERMISSION_QUERY_KEYS.LIST({ page, size }),
    queryFn: () => permissionApi.list(page, size),
  });
}

export function usePermissionsByModule(module: string) {
  return useQuery({
    queryKey: PERMISSION_QUERY_KEYS.BY_MODULE(module),
    queryFn: () => permissionApi.byModule(module),
    enabled: !!module,
  });
}

// ======================================
// MODULE HOOKS
// ======================================

export function useModules(page = 0, size = 50) {
  return useQuery({
    queryKey: MODULE_QUERY_KEYS.LIST({ page, size }),
    queryFn: () => moduleApi.list(page, size),
  });
}

export function useActiveModules() {
  return useQuery({
    queryKey: MODULE_QUERY_KEYS.ACTIVE,
    queryFn: () => moduleApi.getActive(),
  });
}
