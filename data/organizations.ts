import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpClient } from "@/data/client/http-client";
import { API_ENDPOINTS } from "@/data/client/endpoints";
import type { ApiResponse, PagedData } from "@/types";
import type { OrganizationResponse, CreateOrganizationRequest, UpdateOrganizationRequest } from "@/types/organization";

export const ORG_QUERY_KEYS = {
  ALL: ["organizations"] as const,
  LIST: (params?: Record<string, any>) => ["organizations", "list", params] as const,
  DETAIL: (id: string) => ["organizations", id] as const,
  COUNT_BY_STATUS: ["organizations", "count-by-status"] as const,
  MEMBERS: (orgId: string) => ["organizations", orgId, "members"] as const,
};

export const organizationApi = {
  list: (page = 0, size = 10, sortBy = "createdAt", sortDirection = "DESC") =>
    HttpClient.get<ApiResponse<PagedData<OrganizationResponse>>>(
      `${API_ENDPOINTS.organizations.list}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    ),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<OrganizationResponse>>(API_ENDPOINTS.organizations.get(id)),
  getByCode: (code: string) =>
    HttpClient.get<ApiResponse<OrganizationResponse>>(API_ENDPOINTS.organizations.getByCode(code)),
  create: (data: CreateOrganizationRequest) =>
    HttpClient.post<ApiResponse<OrganizationResponse>>(API_ENDPOINTS.organizations.create, data),
  update: (id: string, data: UpdateOrganizationRequest) =>
    HttpClient.put<ApiResponse<OrganizationResponse>>(API_ENDPOINTS.organizations.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.organizations.delete(id)),
  changeStatus: (id: string, status: string) =>
    HttpClient.put<ApiResponse<OrganizationResponse>>(`${API_ENDPOINTS.organizations.changeStatus(id)}`, { status }),
  search: (keyword: string) =>
    HttpClient.get<ApiResponse<PagedData<OrganizationResponse>>>(`${API_ENDPOINTS.organizations.search}?keyword=${keyword}`),
  byStatus: (status: string) =>
    HttpClient.get<ApiResponse<OrganizationResponse[]>>(API_ENDPOINTS.organizations.byStatus(status)),
  byType: (type: string) =>
    HttpClient.get<ApiResponse<OrganizationResponse[]>>(API_ENDPOINTS.organizations.byType(type)),
  countByStatus: () =>
    HttpClient.get<ApiResponse<Record<string, number>>>(API_ENDPOINTS.organizations.countByStatus),
};

// ======================================
// QUERY HOOKS
// ======================================

export function useOrganizations(page = 0, size = 10) {
  return useQuery({
    queryKey: ORG_QUERY_KEYS.LIST({ page, size }),
    queryFn: () => organizationApi.list(page, size),
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: ORG_QUERY_KEYS.DETAIL(id),
    queryFn: () => organizationApi.getById(id),
    enabled: !!id,
  });
}

export function useOrganizationCountByStatus() {
  return useQuery({
    queryKey: ORG_QUERY_KEYS.COUNT_BY_STATUS,
    queryFn: () => organizationApi.countByStatus(),
  });
}

// ======================================
// MUTATION HOOKS
// ======================================

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => organizationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.ALL });
      toast.success("Organisation créée avec succès");
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Erreur lors de la création"),
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationRequest }) => organizationApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.DETAIL(id) });
      toast.success("Organisation mise à jour");
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Erreur lors de la mise à jour"),
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.ALL });
      toast.success("Organisation supprimée");
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Erreur lors de la suppression"),
  });
}
