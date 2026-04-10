import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpClient } from "@/data/client/http-client";
import { API_ENDPOINTS } from "@/data/client/endpoints";
import type { ApiResponse, PagedData } from "@/types";
import type { UserResponse, CreateUserRequest, UpdateUserRequest } from "@/types/user";

export const FM_USER_KEYS = {
  ALL: ["fm-users"] as const,
  LIST: (params?: Record<string, any>) => ["fm-users", "list", params] as const,
  DETAIL: (id: string) => ["fm-users", id] as const,
  COUNT: (status: string) => ["fm-users", "count", status] as const,
};

export const fmUserApi = {
  list: (page = 0, size = 10, sortBy = "createdAt", sortDirection = "DESC") =>
    HttpClient.get<ApiResponse<PagedData<UserResponse>>>(
      `${API_ENDPOINTS.users.list}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    ),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<UserResponse>>(API_ENDPOINTS.users.get(id)),
  getByPhone: (phone: string) =>
    HttpClient.get<ApiResponse<UserResponse>>(API_ENDPOINTS.users.getByPhone(phone)),
  getByCode: (code: string) =>
    HttpClient.get<ApiResponse<UserResponse>>(API_ENDPOINTS.users.getByCode(code)),
  create: (data: CreateUserRequest) =>
    HttpClient.post<ApiResponse<UserResponse>>(API_ENDPOINTS.users.create, data),
  update: (id: string, data: UpdateUserRequest) =>
    HttpClient.put<ApiResponse<UserResponse>>(API_ENDPOINTS.users.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.users.delete(id)),
  changeStatus: (id: string, status: string) =>
    HttpClient.put<ApiResponse<UserResponse>>(`${API_ENDPOINTS.users.changeStatus(id)}`, { status }),
  byStatus: (status: string) =>
    HttpClient.get<ApiResponse<UserResponse[]>>(API_ENDPOINTS.users.byStatus(status)),
  search: (keyword: string, page = 0, size = 10) =>
    HttpClient.get<ApiResponse<PagedData<UserResponse>>>(`${API_ENDPOINTS.users.search}?keyword=${keyword}&page=${page}&size=${size}`),
  countByStatus: (status: string) =>
    HttpClient.get<ApiResponse<number>>(API_ENDPOINTS.users.countByStatus(status)),
};

// ======================================
// QUERY HOOKS
// ======================================

export function useFmUsers(page = 0, size = 10) {
  return useQuery({
    queryKey: FM_USER_KEYS.LIST({ page, size }),
    queryFn: () => fmUserApi.list(page, size),
  });
}

export function useFmUser(id: string) {
  return useQuery({
    queryKey: FM_USER_KEYS.DETAIL(id),
    queryFn: () => fmUserApi.getById(id),
    enabled: !!id,
  });
}

export function useFmUserCountByStatus(status: string) {
  return useQuery({
    queryKey: FM_USER_KEYS.COUNT(status),
    queryFn: () => fmUserApi.countByStatus(status),
    enabled: !!status,
  });
}

// ======================================
// MUTATION HOOKS
// ======================================

export function useCreateFmUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => fmUserApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: FM_USER_KEYS.ALL }); toast.success("Utilisateur créé"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur lors de la création"),
  });
}

export function useUpdateFmUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => fmUserApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: FM_USER_KEYS.ALL });
      qc.invalidateQueries({ queryKey: FM_USER_KEYS.DETAIL(id) });
      toast.success("Utilisateur mis à jour");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur lors de la mise à jour"),
  });
}

export function useDeleteFmUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fmUserApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: FM_USER_KEYS.ALL }); toast.success("Utilisateur supprimé"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur lors de la suppression"),
  });
}

export function useChangeUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => fmUserApi.changeStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: FM_USER_KEYS.ALL });
      qc.invalidateQueries({ queryKey: FM_USER_KEYS.DETAIL(id) });
      toast.success("Statut mis à jour");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}
