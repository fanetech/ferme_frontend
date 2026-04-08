import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpClient } from "@/data/client/http-client";
import { API_ENDPOINTS } from "@/data/client/endpoints";
import type { ApiResponse, PagedData } from "@/types";
import type { AnimalTypeResponse, LivestockResponse, VeterinaryCareResponse, AnimalProductionResponse, CreateAnimalTypeRequest, CreateLivestockRequest, CreateVeterinaryCareRequest, CreateAnimalProductionRequest } from "@/types/livestock";

export const ANIMAL_TYPE_KEYS = {
  ALL: ["animal-types"] as const,
  LIST: (params?: Record<string, any>) => ["animal-types", "list", params] as const,
};

export const LIVESTOCK_KEYS = {
  ALL: ["livestock"] as const,
  BY_FARM: (farmId: string) => ["livestock", "farm", farmId] as const,
  DETAIL: (id: string) => ["livestock", id] as const,
  VET_CARE: (livestockId: string) => ["livestock", livestockId, "vet-care"] as const,
  PRODUCTION: (livestockId: string) => ["livestock", livestockId, "production"] as const,
  GENEALOGY: (id: string) => ["livestock", id, "genealogy"] as const,
};

export const animalTypeApi = {
  list: (page = 0, size = 20) =>
    HttpClient.get<ApiResponse<PagedData<AnimalTypeResponse>>>(`${API_ENDPOINTS.animalTypes.list}?page=${page}&size=${size}`),
  listAll: () =>
    HttpClient.get<ApiResponse<AnimalTypeResponse[]>>(API_ENDPOINTS.animalTypes.listAll),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<AnimalTypeResponse>>(API_ENDPOINTS.animalTypes.get(id)),
  create: (data: CreateAnimalTypeRequest) =>
    HttpClient.post<ApiResponse<AnimalTypeResponse>>(API_ENDPOINTS.animalTypes.create, data),
  update: (id: string, data: Partial<CreateAnimalTypeRequest>) =>
    HttpClient.put<ApiResponse<AnimalTypeResponse>>(API_ENDPOINTS.animalTypes.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.animalTypes.delete(id)),
  byCategory: (category: string) =>
    HttpClient.get<ApiResponse<AnimalTypeResponse[]>>(API_ENDPOINTS.animalTypes.byCategory(category)),
  search: (keyword: string) =>
    HttpClient.get<ApiResponse<PagedData<AnimalTypeResponse>>>(`${API_ENDPOINTS.animalTypes.search}?keyword=${keyword}`),
};

export const livestockApi = {
  byFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<LivestockResponse[]>>(API_ENDPOINTS.livestock.byFarm(farmId)),
  activeByFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<LivestockResponse[]>>(API_ENDPOINTS.livestock.activeByFarm(farmId)),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<LivestockResponse>>(API_ENDPOINTS.livestock.get(id)),
  create: (farmId: string, data: CreateLivestockRequest) =>
    HttpClient.post<ApiResponse<LivestockResponse>>(API_ENDPOINTS.livestock.create(farmId), data),
  update: (id: string, data: Partial<CreateLivestockRequest>) =>
    HttpClient.put<ApiResponse<LivestockResponse>>(API_ENDPOINTS.livestock.update(id), data),
  changeStatus: (id: string, status: string) =>
    HttpClient.put<ApiResponse<LivestockResponse>>(`${API_ENDPOINTS.livestock.changeStatus(id)}`, { status }),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.livestock.delete(id)),
  genealogy: (id: string) =>
    HttpClient.get<ApiResponse<any>>(API_ENDPOINTS.livestock.genealogy(id)),
  // Vet care
  getVetCare: (livestockId: string) =>
    HttpClient.get<ApiResponse<VeterinaryCareResponse[]>>(API_ENDPOINTS.livestock.vetCare(livestockId)),
  createVetCare: (livestockId: string, data: CreateVeterinaryCareRequest) =>
    HttpClient.post<ApiResponse<VeterinaryCareResponse>>(API_ENDPOINTS.livestock.vetCare(livestockId), data),
  updateVetCare: (id: string, data: Partial<CreateVeterinaryCareRequest>) =>
    HttpClient.put<ApiResponse<VeterinaryCareResponse>>(API_ENDPOINTS.livestock.updateVetCare(id), data),
  deleteVetCare: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.livestock.deleteVetCare(id)),
  // Production
  getProduction: (livestockId: string) =>
    HttpClient.get<ApiResponse<AnimalProductionResponse[]>>(API_ENDPOINTS.livestock.production(livestockId)),
  createProduction: (livestockId: string, data: CreateAnimalProductionRequest) =>
    HttpClient.post<ApiResponse<AnimalProductionResponse>>(API_ENDPOINTS.livestock.production(livestockId), data),
  updateProduction: (id: string, data: Partial<CreateAnimalProductionRequest>) =>
    HttpClient.put<ApiResponse<AnimalProductionResponse>>(API_ENDPOINTS.livestock.updateProduction(id), data),
  deleteProduction: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.livestock.deleteProduction(id)),
};

// ======================================
// QUERY HOOKS
// ======================================

export function useAnimalTypes(page = 0, size = 20) {
  return useQuery({ queryKey: ANIMAL_TYPE_KEYS.LIST({ page, size }), queryFn: () => animalTypeApi.list(page, size) });
}

export function useAllAnimalTypes() {
  return useQuery({ queryKey: [...ANIMAL_TYPE_KEYS.ALL, "all"], queryFn: () => animalTypeApi.listAll() });
}

export function useFarmLivestock(farmId: string) {
  return useQuery({ queryKey: LIVESTOCK_KEYS.BY_FARM(farmId), queryFn: () => livestockApi.byFarm(farmId), enabled: !!farmId });
}

export function useLivestock(id: string) {
  return useQuery({ queryKey: LIVESTOCK_KEYS.DETAIL(id), queryFn: () => livestockApi.getById(id), enabled: !!id });
}

export function useLivestockVetCare(livestockId: string) {
  return useQuery({ queryKey: LIVESTOCK_KEYS.VET_CARE(livestockId), queryFn: () => livestockApi.getVetCare(livestockId), enabled: !!livestockId });
}

export function useLivestockProduction(livestockId: string) {
  return useQuery({ queryKey: LIVESTOCK_KEYS.PRODUCTION(livestockId), queryFn: () => livestockApi.getProduction(livestockId), enabled: !!livestockId });
}

export function useLivestockGenealogy(id: string) {
  return useQuery({ queryKey: LIVESTOCK_KEYS.GENEALOGY(id), queryFn: () => livestockApi.genealogy(id), enabled: !!id });
}

// ======================================
// MUTATION HOOKS
// ======================================

export function useCreateLivestock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ farmId, data }: { farmId: string; data: CreateLivestockRequest }) => livestockApi.create(farmId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: LIVESTOCK_KEYS.ALL }); toast.success("Animal enregistré"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useCreateVetCare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ livestockId, data }: { livestockId: string; data: CreateVeterinaryCareRequest }) => livestockApi.createVetCare(livestockId, data),
    onSuccess: (_, { livestockId }) => { qc.invalidateQueries({ queryKey: LIVESTOCK_KEYS.VET_CARE(livestockId) }); toast.success("Soin enregistré"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useCreateAnimalProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ livestockId, data }: { livestockId: string; data: CreateAnimalProductionRequest }) => livestockApi.createProduction(livestockId, data),
    onSuccess: (_, { livestockId }) => { qc.invalidateQueries({ queryKey: LIVESTOCK_KEYS.PRODUCTION(livestockId) }); toast.success("Production enregistrée"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}
