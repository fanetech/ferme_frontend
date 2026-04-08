import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpClient } from "@/data/client/http-client";
import { API_ENDPOINTS } from "@/data/client/endpoints";
import type { ApiResponse, PagedData } from "@/types";
import type { FarmResponse, FarmStatisticsResponse, CreateFarmRequest, UpdateFarmRequest } from "@/types/farm";

export const FARM_QUERY_KEYS = {
  ALL: ["farms"] as const,
  LIST: (params?: Record<string, any>) => ["farms", "list", params] as const,
  DETAIL: (id: string) => ["farms", id] as const,
  STATS: (id: string) => ["farms", id, "stats"] as const,
  COUNT_BY_STATUS: ["farms", "count-by-status"] as const,
  BY_ORG: (orgId: string) => ["farms", "organization", orgId] as const,
};

export const farmApi = {
  list: (page = 0, size = 10, sortBy = "createdAt", sortDirection = "DESC") =>
    HttpClient.get<ApiResponse<PagedData<FarmResponse>>>(
      `${API_ENDPOINTS.farms.list}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    ),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<FarmResponse>>(API_ENDPOINTS.farms.get(id)),
  getByCode: (code: string) =>
    HttpClient.get<ApiResponse<FarmResponse>>(API_ENDPOINTS.farms.getByCode(code)),
  create: (data: CreateFarmRequest) =>
    HttpClient.post<ApiResponse<FarmResponse>>(API_ENDPOINTS.farms.create, data),
  update: (id: string, data: UpdateFarmRequest) =>
    HttpClient.put<ApiResponse<FarmResponse>>(API_ENDPOINTS.farms.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.farms.delete(id)),
  changeStatus: (id: string, status: string) =>
    HttpClient.put<ApiResponse<FarmResponse>>(`${API_ENDPOINTS.farms.changeStatus(id)}`, { status }),
  search: (keyword: string) =>
    HttpClient.get<ApiResponse<PagedData<FarmResponse>>>(`${API_ENDPOINTS.farms.search}?keyword=${keyword}`),
  byStatus: (status: string) =>
    HttpClient.get<ApiResponse<FarmResponse[]>>(API_ENDPOINTS.farms.byStatus(status)),
  byType: (type: string) =>
    HttpClient.get<ApiResponse<FarmResponse[]>>(API_ENDPOINTS.farms.byType(type)),
  byOrganization: (orgId: string) =>
    HttpClient.get<ApiResponse<FarmResponse[]>>(API_ENDPOINTS.farms.byOrganization(orgId)),
  statistics: (id: string) =>
    HttpClient.get<ApiResponse<FarmStatisticsResponse>>(API_ENDPOINTS.farms.statistics(id)),
  countByStatus: () =>
    HttpClient.get<ApiResponse<Record<string, number>>>(API_ENDPOINTS.farms.countByStatus),
};

export function useFarms(page = 0, size = 10) {
  return useQuery({
    queryKey: FARM_QUERY_KEYS.LIST({ page, size }),
    queryFn: () => farmApi.list(page, size),
  });
}

export function useFarm(id: string) {
  return useQuery({
    queryKey: FARM_QUERY_KEYS.DETAIL(id),
    queryFn: () => farmApi.getById(id),
    enabled: !!id,
  });
}

export function useFarmStatistics(id: string) {
  return useQuery({
    queryKey: FARM_QUERY_KEYS.STATS(id),
    queryFn: () => farmApi.statistics(id),
    enabled: !!id,
  });
}

export function useFarmsByOrganization(orgId: string) {
  return useQuery({
    queryKey: FARM_QUERY_KEYS.BY_ORG(orgId),
    queryFn: () => farmApi.byOrganization(orgId),
    enabled: !!orgId,
  });
}

export function useFarmCountByStatus() {
  return useQuery({
    queryKey: FARM_QUERY_KEYS.COUNT_BY_STATUS,
    queryFn: () => farmApi.countByStatus(),
  });
}

export function useCreateFarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFarmRequest) => farmApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEYS.ALL });
      toast.success("Ferme créée avec succès");
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Erreur lors de la création"),
  });
}

export function useUpdateFarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFarmRequest }) => farmApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEYS.DETAIL(id) });
      toast.success("Ferme mise à jour");
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Erreur lors de la mise à jour"),
  });
}

export function useDeleteFarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => farmApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEYS.ALL });
      toast.success("Ferme supprimée");
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Erreur lors de la suppression"),
  });
}
