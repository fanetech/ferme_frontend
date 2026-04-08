import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpClient } from "@/data/client/http-client";
import { API_ENDPOINTS } from "@/data/client/endpoints";
import type { ApiResponse, PagedData } from "@/types";
import type { CropTypeResponse, ParcelResponse, CultivationResponse, AgriculturalActivityResponse, CultivationTimelineResponse, CreateCropTypeRequest, CreateParcelRequest, CreateCultivationRequest, CreateAgriculturalActivityRequest } from "@/types/crop";

// ======================================
// QUERY KEYS
// ======================================

export const CROP_TYPE_KEYS = {
  ALL: ["crop-types"] as const,
  LIST: (params?: Record<string, any>) => ["crop-types", "list", params] as const,
  DETAIL: (id: string) => ["crop-types", id] as const,
};

export const PARCEL_KEYS = {
  ALL: ["parcels"] as const,
  BY_FARM: (farmId: string) => ["parcels", "farm", farmId] as const,
  DETAIL: (id: string) => ["parcels", id] as const,
};

export const CULTIVATION_KEYS = {
  ALL: ["cultivations"] as const,
  BY_FARM: (farmId: string) => ["cultivations", "farm", farmId] as const,
  BY_PARCEL: (parcelId: string) => ["cultivations", "parcel", parcelId] as const,
  DETAIL: (id: string) => ["cultivations", id] as const,
  TIMELINE: (id: string) => ["cultivations", id, "timeline"] as const,
};

export const ACTIVITY_KEYS = {
  BY_CULTIVATION: (cultivationId: string) => ["activities", "cultivation", cultivationId] as const,
};

// ======================================
// CROP TYPE API
// ======================================

export const cropTypeApi = {
  list: (page = 0, size = 20) =>
    HttpClient.get<ApiResponse<PagedData<CropTypeResponse>>>(`${API_ENDPOINTS.cropTypes.list}?page=${page}&size=${size}`),
  listAll: () =>
    HttpClient.get<ApiResponse<CropTypeResponse[]>>(API_ENDPOINTS.cropTypes.listAll),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<CropTypeResponse>>(API_ENDPOINTS.cropTypes.get(id)),
  create: (data: CreateCropTypeRequest) =>
    HttpClient.post<ApiResponse<CropTypeResponse>>(API_ENDPOINTS.cropTypes.create, data),
  update: (id: string, data: Partial<CreateCropTypeRequest>) =>
    HttpClient.put<ApiResponse<CropTypeResponse>>(API_ENDPOINTS.cropTypes.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.cropTypes.delete(id)),
  byFamily: (family: string) =>
    HttpClient.get<ApiResponse<CropTypeResponse[]>>(API_ENDPOINTS.cropTypes.byFamily(family)),
  search: (keyword: string) =>
    HttpClient.get<ApiResponse<PagedData<CropTypeResponse>>>(`${API_ENDPOINTS.cropTypes.search}?keyword=${keyword}`),
};

// ======================================
// PARCEL API
// ======================================

export const parcelApi = {
  byFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<ParcelResponse[]>>(API_ENDPOINTS.parcels.byFarm(farmId)),
  activeByFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<ParcelResponse[]>>(API_ENDPOINTS.parcels.activByFarm(farmId)),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<ParcelResponse>>(API_ENDPOINTS.parcels.get(id)),
  create: (farmId: string, data: CreateParcelRequest) =>
    HttpClient.post<ApiResponse<ParcelResponse>>(API_ENDPOINTS.parcels.create(farmId), data),
  update: (id: string, data: Partial<CreateParcelRequest>) =>
    HttpClient.put<ApiResponse<ParcelResponse>>(API_ENDPOINTS.parcels.update(id), data),
  changeStatus: (id: string, status: string) =>
    HttpClient.put<ApiResponse<ParcelResponse>>(`${API_ENDPOINTS.parcels.changeStatus(id)}`, { status }),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.parcels.delete(id)),
};

// ======================================
// CULTIVATION API
// ======================================

export const cultivationApi = {
  byParcel: (parcelId: string) =>
    HttpClient.get<ApiResponse<CultivationResponse[]>>(API_ENDPOINTS.cultivations.byParcel(parcelId)),
  byFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<CultivationResponse[]>>(API_ENDPOINTS.cultivations.byFarm(farmId)),
  activeByFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<CultivationResponse[]>>(API_ENDPOINTS.cultivations.activeByFarm(farmId)),
  byFarmAndYear: (farmId: string, year: number) =>
    HttpClient.get<ApiResponse<CultivationResponse[]>>(API_ENDPOINTS.cultivations.byFarmAndYear(farmId, year)),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<CultivationResponse>>(API_ENDPOINTS.cultivations.get(id)),
  create: (parcelId: string, data: CreateCultivationRequest) =>
    HttpClient.post<ApiResponse<CultivationResponse>>(API_ENDPOINTS.cultivations.create(parcelId), data),
  update: (id: string, data: Partial<CreateCultivationRequest>) =>
    HttpClient.put<ApiResponse<CultivationResponse>>(API_ENDPOINTS.cultivations.update(id), data),
  changeStatus: (id: string, status: string) =>
    HttpClient.put<ApiResponse<CultivationResponse>>(`${API_ENDPOINTS.cultivations.changeStatus(id)}`, { status }),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.cultivations.delete(id)),
  timeline: (id: string) =>
    HttpClient.get<ApiResponse<CultivationTimelineResponse>>(API_ENDPOINTS.cultivations.timeline(id)),
};

// ======================================
// ACTIVITY API
// ======================================

export const activityApi = {
  byCultivation: (cultivationId: string) =>
    HttpClient.get<ApiResponse<AgriculturalActivityResponse[]>>(API_ENDPOINTS.activities.byCultivation(cultivationId)),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<AgriculturalActivityResponse>>(API_ENDPOINTS.activities.get(id)),
  create: (cultivationId: string, data: CreateAgriculturalActivityRequest) =>
    HttpClient.post<ApiResponse<AgriculturalActivityResponse>>(API_ENDPOINTS.activities.create(cultivationId), data),
  update: (id: string, data: Partial<CreateAgriculturalActivityRequest>) =>
    HttpClient.put<ApiResponse<AgriculturalActivityResponse>>(API_ENDPOINTS.activities.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.activities.delete(id)),
};

// ======================================
// QUERY HOOKS
// ======================================

export function useCropTypes(page = 0, size = 20) {
  return useQuery({ queryKey: CROP_TYPE_KEYS.LIST({ page, size }), queryFn: () => cropTypeApi.list(page, size) });
}

export function useAllCropTypes() {
  return useQuery({ queryKey: [...CROP_TYPE_KEYS.ALL, "all"], queryFn: () => cropTypeApi.listAll() });
}

export function useFarmParcels(farmId: string) {
  return useQuery({ queryKey: PARCEL_KEYS.BY_FARM(farmId), queryFn: () => parcelApi.byFarm(farmId), enabled: !!farmId });
}

export function useParcel(id: string) {
  return useQuery({ queryKey: PARCEL_KEYS.DETAIL(id), queryFn: () => parcelApi.getById(id), enabled: !!id });
}

export function useFarmCultivations(farmId: string) {
  return useQuery({ queryKey: CULTIVATION_KEYS.BY_FARM(farmId), queryFn: () => cultivationApi.byFarm(farmId), enabled: !!farmId });
}

export function useCultivation(id: string) {
  return useQuery({ queryKey: CULTIVATION_KEYS.DETAIL(id), queryFn: () => cultivationApi.getById(id), enabled: !!id });
}

export function useCultivationTimeline(id: string) {
  return useQuery({ queryKey: CULTIVATION_KEYS.TIMELINE(id), queryFn: () => cultivationApi.timeline(id), enabled: !!id });
}

export function useCultivationActivities(cultivationId: string) {
  return useQuery({ queryKey: ACTIVITY_KEYS.BY_CULTIVATION(cultivationId), queryFn: () => activityApi.byCultivation(cultivationId), enabled: !!cultivationId });
}

// ======================================
// MUTATION HOOKS
// ======================================

export function useCreateParcel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ farmId, data }: { farmId: string; data: CreateParcelRequest }) => parcelApi.create(farmId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: PARCEL_KEYS.ALL }); toast.success("Parcelle créée"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useCreateCultivation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ parcelId, data }: { parcelId: string; data: CreateCultivationRequest }) => cultivationApi.create(parcelId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: CULTIVATION_KEYS.ALL }); toast.success("Culture créée"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cultivationId, data }: { cultivationId: string; data: CreateAgriculturalActivityRequest }) => activityApi.create(cultivationId, data),
    onSuccess: (_, { cultivationId }) => { qc.invalidateQueries({ queryKey: ACTIVITY_KEYS.BY_CULTIVATION(cultivationId) }); toast.success("Activité enregistrée"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}
