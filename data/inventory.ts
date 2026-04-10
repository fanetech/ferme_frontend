import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpClient } from "@/data/client/http-client";
import { API_ENDPOINTS } from "@/data/client/endpoints";
import type { ApiResponse } from "@/types";
import type { InventoryItemResponse, StockMovementResponse, CreateInventoryItemRequest, CreateStockMovementRequest } from "@/types/inventory";

export const INVENTORY_KEYS = {
  ALL: ["inventory"] as const,
  BY_FARM: (farmId: string) => ["inventory", "farm", farmId] as const,
  DETAIL: (id: string) => ["inventory", id] as const,
  LOW_STOCK: (farmId: string) => ["inventory", "low-stock", farmId] as const,
  MOVEMENTS: (itemId: string) => ["inventory", "movements", itemId] as const,
};

export const inventoryApi = {
  byFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<InventoryItemResponse[]>>(API_ENDPOINTS.inventory.items.byFarm(farmId)),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<InventoryItemResponse>>(API_ENDPOINTS.inventory.items.get(id)),
  create: (data: CreateInventoryItemRequest) =>
    HttpClient.post<ApiResponse<InventoryItemResponse>>(API_ENDPOINTS.inventory.items.create, data),
  update: (id: string, data: Partial<CreateInventoryItemRequest>) =>
    HttpClient.put<ApiResponse<InventoryItemResponse>>(API_ENDPOINTS.inventory.items.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.inventory.items.delete(id)),
  lowStock: (farmId: string) =>
    HttpClient.get<ApiResponse<InventoryItemResponse[]>>(API_ENDPOINTS.inventory.items.lowStock(farmId)),
  needsReorder: (farmId: string) =>
    HttpClient.get<ApiResponse<InventoryItemResponse[]>>(API_ENDPOINTS.inventory.items.needsReorder(farmId)),
  search: (keyword: string) =>
    HttpClient.get<ApiResponse<InventoryItemResponse[]>>(`${API_ENDPOINTS.inventory.items.search}?keyword=${keyword}`),
  // Movements
  createMovement: (data: CreateStockMovementRequest) =>
    HttpClient.post<ApiResponse<StockMovementResponse>>(API_ENDPOINTS.inventory.movements.create, data),
  movementsByItem: (itemId: string) =>
    HttpClient.get<ApiResponse<StockMovementResponse[]>>(API_ENDPOINTS.inventory.movements.byItem(itemId)),
  movementsByType: (type: string) =>
    HttpClient.get<ApiResponse<StockMovementResponse[]>>(API_ENDPOINTS.inventory.movements.byType(type)),
  movementsByDateRange: (startDate: string, endDate: string) =>
    HttpClient.get<ApiResponse<StockMovementResponse[]>>(`${API_ENDPOINTS.inventory.movements.byDateRange}?startDate=${startDate}&endDate=${endDate}`),
};

export function useFarmInventory(farmId: string) {
  return useQuery({ queryKey: INVENTORY_KEYS.BY_FARM(farmId), queryFn: () => inventoryApi.byFarm(farmId), enabled: !!farmId });
}

export function useInventoryItem(id: string) {
  return useQuery({ queryKey: INVENTORY_KEYS.DETAIL(id), queryFn: () => inventoryApi.getById(id), enabled: !!id });
}

export function useLowStockItems(farmId: string) {
  return useQuery({ queryKey: INVENTORY_KEYS.LOW_STOCK(farmId), queryFn: () => inventoryApi.lowStock(farmId), enabled: !!farmId });
}

export function useItemMovements(itemId: string) {
  return useQuery({ queryKey: INVENTORY_KEYS.MOVEMENTS(itemId), queryFn: () => inventoryApi.movementsByItem(itemId), enabled: !!itemId });
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInventoryItemRequest) => inventoryApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: INVENTORY_KEYS.ALL }); toast.success("Article ajouté"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useCreateStockMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStockMovementRequest) => inventoryApi.createMovement(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: INVENTORY_KEYS.ALL }); toast.success("Mouvement enregistré"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}
