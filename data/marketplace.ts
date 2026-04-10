import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpClient } from "@/data/client/http-client";
import { API_ENDPOINTS } from "@/data/client/endpoints";
import type { ApiResponse } from "@/types";
import type { CustomerResponse, ProductResponse, SaleOrderResponse, CreateCustomerRequest, CreateProductRequest, CreateSaleOrderRequest, UpdateOrderStatusRequest } from "@/types/marketplace";

export const CUSTOMER_KEYS = {
  ALL: ["customers"] as const,
  BY_FARM: (farmId: string) => ["customers", "farm", farmId] as const,
  DETAIL: (id: string) => ["customers", id] as const,
};

export const PRODUCT_KEYS = {
  ALL: ["products"] as const,
  BY_FARM: (farmId: string) => ["products", "farm", farmId] as const,
  DETAIL: (id: string) => ["products", id] as const,
};

export const ORDER_KEYS = {
  ALL: ["orders"] as const,
  BY_FARM: (farmId: string) => ["orders", "farm", farmId] as const,
  DETAIL: (id: string) => ["orders", id] as const,
  PENDING: (farmId: string) => ["orders", "pending", farmId] as const,
  REVENUE: (farmId: string) => ["orders", "revenue", farmId] as const,
};

export const customerApi = {
  byFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<CustomerResponse[]>>(API_ENDPOINTS.marketplace.customers.byFarm(farmId)),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<CustomerResponse>>(API_ENDPOINTS.marketplace.customers.get(id)),
  create: (data: CreateCustomerRequest) =>
    HttpClient.post<ApiResponse<CustomerResponse>>(API_ENDPOINTS.marketplace.customers.create, data),
  update: (id: string, data: Partial<CreateCustomerRequest>) =>
    HttpClient.put<ApiResponse<CustomerResponse>>(API_ENDPOINTS.marketplace.customers.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.marketplace.customers.delete(id)),
  topRevenue: (farmId: string) =>
    HttpClient.get<ApiResponse<CustomerResponse[]>>(API_ENDPOINTS.marketplace.customers.topRevenue(farmId)),
};

export const productApi = {
  byFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<ProductResponse[]>>(API_ENDPOINTS.marketplace.products.byFarm(farmId)),
  available: (farmId: string) =>
    HttpClient.get<ApiResponse<ProductResponse[]>>(API_ENDPOINTS.marketplace.products.available(farmId)),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<ProductResponse>>(API_ENDPOINTS.marketplace.products.get(id)),
  create: (data: CreateProductRequest) =>
    HttpClient.post<ApiResponse<ProductResponse>>(API_ENDPOINTS.marketplace.products.create, data),
  update: (id: string, data: Partial<CreateProductRequest>) =>
    HttpClient.put<ApiResponse<ProductResponse>>(API_ENDPOINTS.marketplace.products.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.marketplace.products.delete(id)),
  lowStock: (farmId: string) =>
    HttpClient.get<ApiResponse<ProductResponse[]>>(API_ENDPOINTS.marketplace.products.lowStock(farmId)),
  expiring: (farmId: string) =>
    HttpClient.get<ApiResponse<ProductResponse[]>>(API_ENDPOINTS.marketplace.products.expiring(farmId)),
  inventoryValue: (farmId: string) =>
    HttpClient.get<ApiResponse<number>>(API_ENDPOINTS.marketplace.products.inventoryValue(farmId)),
};

export const orderApi = {
  byFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<SaleOrderResponse[]>>(API_ENDPOINTS.marketplace.orders.byFarm(farmId)),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<SaleOrderResponse>>(API_ENDPOINTS.marketplace.orders.get(id)),
  create: (data: CreateSaleOrderRequest) =>
    HttpClient.post<ApiResponse<SaleOrderResponse>>(API_ENDPOINTS.marketplace.orders.create, data),
  update: (id: string, data: Partial<CreateSaleOrderRequest>) =>
    HttpClient.put<ApiResponse<SaleOrderResponse>>(API_ENDPOINTS.marketplace.orders.update(id), data),
  updateStatus: (id: string, data: UpdateOrderStatusRequest) =>
    HttpClient.put<ApiResponse<SaleOrderResponse>>(API_ENDPOINTS.marketplace.orders.updateStatus(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.marketplace.orders.delete(id)),
  byStatus: (farmId: string, status: string) =>
    HttpClient.get<ApiResponse<SaleOrderResponse[]>>(API_ENDPOINTS.marketplace.orders.byStatus(farmId, status)),
  pendingApproval: (farmId: string) =>
    HttpClient.get<ApiResponse<SaleOrderResponse[]>>(API_ENDPOINTS.marketplace.orders.pendingApproval(farmId)),
  overdueDeliveries: (farmId: string) =>
    HttpClient.get<ApiResponse<SaleOrderResponse[]>>(API_ENDPOINTS.marketplace.orders.overdueDeliveries(farmId)),
  revenue: (farmId: string, startDate: string, endDate: string) =>
    HttpClient.get<ApiResponse<any>>(`${API_ENDPOINTS.marketplace.orders.revenue(farmId)}?startDate=${startDate}&endDate=${endDate}`),
  averageValue: (farmId: string) =>
    HttpClient.get<ApiResponse<number>>(API_ENDPOINTS.marketplace.orders.averageValue(farmId)),
};

// ======================================
// QUERY HOOKS
// ======================================

export function useFarmCustomers(farmId: string) {
  return useQuery({ queryKey: CUSTOMER_KEYS.BY_FARM(farmId), queryFn: () => customerApi.byFarm(farmId), enabled: !!farmId });
}

export function useFarmProducts(farmId: string) {
  return useQuery({ queryKey: PRODUCT_KEYS.BY_FARM(farmId), queryFn: () => productApi.byFarm(farmId), enabled: !!farmId });
}

export function useFarmOrders(farmId: string) {
  return useQuery({ queryKey: ORDER_KEYS.BY_FARM(farmId), queryFn: () => orderApi.byFarm(farmId), enabled: !!farmId });
}

export function useOrder(id: string) {
  return useQuery({ queryKey: ORDER_KEYS.DETAIL(id), queryFn: () => orderApi.getById(id), enabled: !!id });
}

export function usePendingOrders(farmId: string) {
  return useQuery({ queryKey: ORDER_KEYS.PENDING(farmId), queryFn: () => orderApi.pendingApproval(farmId), enabled: !!farmId });
}

// ======================================
// MUTATION HOOKS
// ======================================

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => customerApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: CUSTOMER_KEYS.ALL }); toast.success("Client ajouté"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductRequest) => productApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: PRODUCT_KEYS.ALL }); toast.success("Produit ajouté"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSaleOrderRequest) => orderApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ORDER_KEYS.ALL }); toast.success("Commande créée"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusRequest }) => orderApi.updateStatus(id, data),
    onSuccess: (_, { id }) => { qc.invalidateQueries({ queryKey: ORDER_KEYS.ALL }); qc.invalidateQueries({ queryKey: ORDER_KEYS.DETAIL(id) }); toast.success("Statut mis à jour"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}
