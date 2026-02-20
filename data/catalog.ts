import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import client from "@/data/client";
import type {
  ServiceProduct,
  ServiceProductSearchParams,
  CreateServiceProductRequest,
  UpdateServiceProductRequest,
  UpdateStockRequest,
  ServiceConfig,
  ServiceDataField,
  PricingRule,
  EndpointConfig,
  ResponseMapping,
  ServiceNature, ExternalServiceExecutionRequest, ExternalServiceSimulationResultDto
} from "@/types/catalog";

// ========================================
// QUERY KEYS
// ========================================

export const catalogQueryKeys = {
  all: ['catalog'] as const,
  
  // Services/Products
  servicesProducts: () => [...catalogQueryKeys.all, 'services-products'] as const,
  servicesProductsList: (params?: ServiceProductSearchParams) => 
    [...catalogQueryKeys.servicesProducts(), 'list', params] as const,
  servicesProduct: (id: string) => 
    [...catalogQueryKeys.servicesProducts(), 'detail', id] as const,
  servicesProductByCode: (code: string) => 
    [...catalogQueryKeys.servicesProducts(), 'code', code] as const,
  servicesProductsActive: () => 
    [...catalogQueryKeys.servicesProducts(), 'active'] as const,
  servicesProductsByStructure: (structureId: string) => 
    [...catalogQueryKeys.servicesProducts(), 'structure', structureId] as const,
  servicesProductsOutOfStock: () => 
    [...catalogQueryKeys.servicesProducts(), 'out-of-stock'] as const,
  servicesProductsNeedsRestocking: () => 
    [...catalogQueryKeys.servicesProducts(), 'needs-restocking'] as const,
  servicesProductsLowStock: () => 
    [...catalogQueryKeys.servicesProducts(), 'low-stock'] as const,
  servicesProductsStats: (structureId?: string) => 
    [...catalogQueryKeys.servicesProducts(), 'stats', structureId] as const,
  
  // Service Config
  serviceConfigs: () => [...catalogQueryKeys.all, 'service-configs'] as const,
  serviceConfig: (serviceId: string) => 
    [...catalogQueryKeys.serviceConfigs(), 'detail', serviceId] as const,
  getOrCreateServiceConfig: (serviceId: string) =>
    [...catalogQueryKeys.serviceConfigs(), 'get-or-create', serviceId] as const,
  
  // Data Fields
  dataFields: () => [...catalogQueryKeys.all, 'data-fields'] as const,
  dataFieldsList: (endpointId: string) => 
    [...catalogQueryKeys.dataFields(), 'list', endpointId] as const,
  
  // Pricing Rules
  pricingRules: () => [...catalogQueryKeys.all, 'pricing-rules'] as const,
  pricingRulesList: (serviceId: string) => 
    [...catalogQueryKeys.pricingRules(), 'list', serviceId] as const,
  pricingRule: (id: string) => 
    [...catalogQueryKeys.pricingRules(), 'detail', id] as const,
  
  // Endpoint Configs
  endpointConfigs: () => [...catalogQueryKeys.all, 'endpoint-configs'] as const,
  endpointConfigsList: (configId: string) => 
    [...catalogQueryKeys.endpointConfigs(), 'list', configId] as const,
  endpointConfig: (id: string) => 
    [...catalogQueryKeys.endpointConfigs(), 'detail', id] as const,
  
  // Response Mappings
  responseMappings: () => [...catalogQueryKeys.all, 'response-mappings'] as const,
  responseMappingsList: (endpointId: string) => 
    [...catalogQueryKeys.responseMappings(), 'list', endpointId] as const,
};

// ========================================
// SERVICES/PRODUCTS HOOKS
// ========================================

// Liste des services/produits avec recherche et filtres
export function useServicesProducts(params?: ServiceProductSearchParams) {
  const searchParams = new URLSearchParams();
  
  if (params) {
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    if (params.serviceNatures?.length) {
      params.serviceNatures.forEach(nature => searchParams.append('serviceNatures', nature));
    }
    if (params.structureId) searchParams.append('structureId', params.structureId);
    if (params.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params.status) searchParams.append('status', params.status);
    if (params.minAmount !== undefined) searchParams.append('minAmount', params.minAmount.toString());
    if (params.maxAmount !== undefined) searchParams.append('maxAmount', params.maxAmount.toString());
    if (params.currency) searchParams.append('currency', params.currency);
    if (params.inStock !== undefined) searchParams.append('inStock', params.inStock.toString());
    if (params.needsRestocking !== undefined) searchParams.append('needsRestocking', params.needsRestocking.toString());
    if (params.lowStock !== undefined) searchParams.append('lowStock', params.lowStock.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortDir) searchParams.append('sortDirection', params.sortDir);
  }
  
  return useQuery({
    queryKey: catalogQueryKeys.servicesProductsList(params),
    queryFn: async () => {
      const response = await client.catalog.servicesProducts.list(searchParams);
      return response.data;
    }
  });
}

// Détail d'un service/produit
export function useServiceProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: catalogQueryKeys.servicesProduct(id),
    queryFn: async () => {
      const response = await client.catalog.servicesProducts.get(id);
      return response.data;
    },
    enabled: enabled && !!id
  });
}

// Service/produit par code
export function useServiceProductByCode(code: string, enabled = true) {
  return useQuery({
    queryKey: catalogQueryKeys.servicesProductByCode(code),
    queryFn: async () => {
      const response = await client.catalog.servicesProducts.getByCode(code);
      return response.data;
    },
    enabled: enabled && !!code
  });
}

// Tous les services/produits actifs
export function useActiveServicesProducts() {
  return useQuery({
    queryKey: catalogQueryKeys.servicesProductsActive(),
    queryFn: async () => {
      const response = await client.catalog.servicesProducts.getAllActive();
      return response.data;
    }
  });
}

// Services/produits par structure
export function useServicesProductsByStructure(structureId: string, enabled = true) {
  return useQuery({
    queryKey: catalogQueryKeys.servicesProductsByStructure(structureId),
    queryFn: async () => {
      const response = await client.catalog.servicesProducts.getByStructure(structureId);
      return response.data;
    },
    enabled: enabled && !!structureId
  });
}

// Produits en rupture de stock
export function useOutOfStockProducts() {
  return useQuery({
    queryKey: catalogQueryKeys.servicesProductsOutOfStock(),
    queryFn: async () => {
      const response = await client.catalog.servicesProducts.getOutOfStock();
      return response.data;
    }
  });
}

// Produits nécessitant réapprovisionnement
export function useNeedsRestockingProducts() {
  return useQuery({
    queryKey: catalogQueryKeys.servicesProductsNeedsRestocking(),
    queryFn: async () => {
      const response = await client.catalog.servicesProducts.getNeedsRestocking();
      return response.data;
    }
  });
}

// Produits avec stock faible
export function useLowStockProducts() {
  return useQuery({
    queryKey: catalogQueryKeys.servicesProductsLowStock(),
    queryFn: async () => {
      const response = await client.catalog.servicesProducts.getLowStock();
      return response.data;
    }
  });
}

// Statistiques des services/produits
export function useServicesProductsStats(structureId?: string) {
  return useQuery({
    queryKey: catalogQueryKeys.servicesProductsStats(structureId),
    queryFn: async () => {
      const response = await client.catalog.servicesProducts.getStats(structureId);
      return response.data;
    }
  });
}

// Créer un service/produit
export function useCreateServiceProduct(options: { showToast?: boolean } = {}) {
  const queryClient = useQueryClient();
  const { showToast = true } = options;
  
  return useMutation({
    mutationFn: async (data: CreateServiceProductRequest) => {
      const response = await client.catalog.servicesProducts.create(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProducts() });
      if (showToast) {
        toast.success("Service/produit créé avec succès");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création");
    }
  });
}

// Mettre à jour un service/produit
export function useUpdateServiceProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateServiceProductRequest }) => {
      const response = await client.catalog.servicesProducts.update(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProduct(variables.id) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProducts() });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProductsStats() });
      toast.success("Service/produit mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
  });
}

// Supprimer un service/produit
export function useDeleteServiceProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await client.catalog.servicesProducts.delete(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProducts() });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProductsStats() });
      toast.success("Service/produit supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  });
}

// Activer un service/produit
export function useActivateServiceProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.catalog.servicesProducts.activate(id);
      return response.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProduct(id) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProducts() });
      toast.success("Service/produit activé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'activation");
    }
  });
}

// Désactiver un service/produit
export function useDeactivateServiceProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.catalog.servicesProducts.deactivate(id);
      return response.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProduct(id) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProducts() });
      toast.success("Service/produit désactivé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la désactivation");
    }
  });
}

// Suspendre un service/produit
export function useSuspendServiceProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await client.catalog.servicesProducts.suspend(id, reason);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProduct(variables.id) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProducts() });
      toast.success("Service/produit suspendu avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suspension");
    }
  });
}

// Mettre à jour le stock
export function useUpdateStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateStockRequest }) => {
      const response = await client.catalog.servicesProducts.updateStock(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProduct(variables.id) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProducts() });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProductsOutOfStock() });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProductsNeedsRestocking() });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProductsLowStock() });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProductsStats() });
      toast.success("Stock mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du stock");
    }
  });
}

// Vérifier la disponibilité d'un code
export function useCheckCodeAvailability() {
  return useMutation({
    mutationFn: async ({ code, excludeId }: { code: string; excludeId?: string }) => {
      const response = await client.catalog.servicesProducts.checkCode(code, excludeId);
      return response.data;
    }
  });
}

// ========================================
// SERVICE CONFIG HOOKS
// ========================================

// Configuration d'un service
export function useServiceConfig(serviceId: string, enabled = true) {
  return useQuery({
    queryKey: catalogQueryKeys.serviceConfig(serviceId),
    queryFn: async () => {
      const response = await client.catalog.serviceConfig.get(serviceId);
      return response.data;
    },
    enabled: enabled && !!serviceId
  });
}

export function useGetOrCreateServiceConfig(serviceId: string) {
  return useQuery({
    queryKey: catalogQueryKeys.getOrCreateServiceConfig(serviceId),
    queryFn: async () => {
      const response = await client.catalog.serviceConfig.getOrCreate(serviceId);
      return response.data;
    },
    enabled: !!serviceId
  });
}

// Créer une configuration de service
export function useCreateServiceConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<ServiceConfig>) => {
      const response = await client.catalog.serviceConfig.create(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProducts(data?.serviceId) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfig(data.serviceId) });
      toast.success("Configuration créée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création de la configuration");
    }
  });
}

// Mettre à jour une configuration de service
export function useUpdateServiceConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ServiceConfig> }) => {
      const response = await client.catalog.serviceConfig.update(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfig(data.serviceId) });
      toast.success("Configuration mise à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour de la configuration");
    }
  });
}

// Créer ou mettre à jour une configuration de service (idempotent)
export function useCreateOrUpdateServiceConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, data }: { serviceId: string; data: Partial<ServiceConfig> }) => {
      const response = await client.catalog.serviceConfig.createOrUpdate(serviceId, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalider toutes les queries liées à la configuration de service
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfigs() });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfig(data.serviceId) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.getOrCreateServiceConfig(data.serviceId) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.servicesProduct(data.serviceId) });
      toast.success("Configuration enregistrée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement de la configuration");
    }
  });
}

// Supprimer une configuration de service
export function useDeleteServiceConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await client.catalog.serviceConfig.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfigs() });
      toast.success("Configuration supprimée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression de la configuration");
    }
  });
}

// Tester une configuration de service
export function useTestServiceConfig() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.catalog.serviceConfig.test(id);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Test de configuration réussi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors du test de configuration");
    }
  });
}

// Désactiver une configuration de service
export function useDeactivateServiceConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.catalog.serviceConfig.deactivate(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfigs() });
      toast.success("Configuration désactivée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la désactivation de la configuration");
    }
  });
}

// Activer une configuration de service
export function useActivateServiceConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.catalog.serviceConfig.activate(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfigs() });
      toast.success("Configuration activée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'activation de la configuration");
    }
  });
}

// ========================================
// DATA FIELDS HOOKS
// ========================================

// Liste des champs de données
export function useDataFields(endpointId: string, enabled = true) {
  return useQuery({
    queryKey: catalogQueryKeys.dataFieldsList(endpointId),
    queryFn: async () => {
      const response = await client.catalog.dataFields.list(endpointId);
      return response.data;
    },
    enabled: enabled && !!endpointId
  });
}

// Créer un champ de données
export function useCreateDataField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<ServiceDataField>) => {
      const response = await client.catalog.dataFields.create(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.dataFieldsList(data.endpointConfigId) });
      toast.success("Champ créé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création du champ");
    }
  });
}

// Mettre à jour un champ de données
export function useUpdateDataField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ServiceDataField> }) => {
      const response = await client.catalog.dataFields.update(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.dataFieldsList(data.endpointConfigId) });
      toast.success("Champ mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du champ");
    }
  });
}

// Supprimer un champ de données
export function useDeleteDataField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, endpointId }: { id: string; endpointId: string }) => {
      await client.catalog.dataFields.delete(id);
      return endpointId;
    },
    onSuccess: (endpointId) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.dataFieldsList(endpointId) });
      toast.success("Champ supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression du champ");
    }
  });
}

// Réordonner les champs de données
export function useReorderDataFields() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ fieldIds, endpointId }: { fieldIds: string[]; endpointId: string }) => {
      await client.catalog.dataFields.reorder({ fieldIds });
      return endpointId;
    },
    onSuccess: (endpointId) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.dataFieldsList(endpointId) });
      toast.success("Ordre des champs mis à jour");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la réorganisation des champs");
    }
  });
}

// ========================================
// CALCULATION FIELDS HOOKS
// ========================================

// Liste des champs de calcul pour un service
export function useCalculationFields(serviceId: string, enabled = true) {
  return useQuery({
    queryKey: [...catalogQueryKeys.all, 'calculation-fields', serviceId],
    queryFn: async () => {
        const response = await client.catalog.calculationFields.list(serviceId);
      return response.data;
    },
    enabled: enabled && !!serviceId
  });
}

// Créer un champ de calcul
export function useCreateCalculationField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await client.catalog.calculationFields.create(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [...catalogQueryKeys.all, 'calculation-fields', data.serviceId] });
      toast.success("Champ de calcul créé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création du champ");
    }
  });
}

// Mettre à jour un champ de calcul
export function useUpdateCalculationField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await client.catalog.calculationFields.update(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [...catalogQueryKeys.all, 'calculation-fields', data.serviceId] });
      toast.success("Champ de calcul mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du champ");
    }
  });
}

// Supprimer un champ de calcul
export function useDeleteCalculationField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, serviceId }: { id: string; serviceId: string }) => {
      await client.catalog.calculationFields.delete(id);
      return serviceId;
    },
    onSuccess: (serviceId) => {
      queryClient.invalidateQueries({ queryKey: [...catalogQueryKeys.all, 'calculation-fields', serviceId] });
      toast.success("Champ de calcul supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression du champ");
    }
  });
}

// ========================================
// PRICING RULES HOOKS
// ========================================

// Liste des règles de tarification
export function usePricingRules(serviceId: string, enabled = true) {
  return useQuery({
    queryKey: catalogQueryKeys.pricingRulesList(serviceId),
    queryFn: async () => {
      const response = await client.catalog.pricingRules.list(serviceId);
      return response.data;
    },
    enabled: enabled && !!serviceId
  });
}

// Détail d'une règle de tarification
export function usePricingRule(id: string, enabled = true) {
  return useQuery({
    queryKey: catalogQueryKeys.pricingRule(id),
    queryFn: async () => {
      const response = await client.catalog.pricingRules.get(id);
      return response.data;
    },
    enabled: enabled && !!id
  });
}

// Créer une règle de tarification
export function useCreatePricingRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<PricingRule>) => {
      console.log("Creating pricing rule with data:", data);
      const response = await client.catalog.pricingRules.create(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.pricingRulesList(data.serviceId) });
      console.log("New pricing rule created:", data);
      toast.success("Règle de tarification créée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création de la règle");
    }
  });
}

// Mettre à jour une règle de tarification
export function useUpdatePricingRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PricingRule> }) => {
      const response = await client.catalog.pricingRules.update(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.pricingRule(data.id) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.pricingRulesList(data.serviceId) });
      toast.success("Règle de tarification mise à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour de la règle");
    }
  });
}

// Supprimer une règle de tarification
export function useDeletePricingRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, serviceId }: { id: string; serviceId: string }) => {
      await client.catalog.pricingRules.delete(id);
      return serviceId;
    },
    onSuccess: (serviceId) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.pricingRulesList(serviceId) });
      toast.success("Règle de tarification supprimée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression de la règle");
    }
  });
}

// Activer une règle de tarification
export function useActivatePricingRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.catalog.pricingRules.activate(id);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.pricingRule(data.id) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.pricingRulesList(data.serviceId) });
      toast.success("Règle de tarification activée");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'activation de la règle");
    }
  });
}

// Désactiver une règle de tarification
export function useDeactivatePricingRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.catalog.pricingRules.deactivate(id);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.pricingRule(data.id) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.pricingRulesList(data.serviceId) });
      toast.success("Règle de tarification désactivée");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la désactivation de la règle");
    }
  });
}

// Tester une règle de tarification
export function useTestPricingRule() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await client.catalog.pricingRules.test(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Test de la règle réussi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors du test de la règle");
    }
  });
}

// ========================================
// ENDPOINT CONFIGS HOOKS
// ========================================

// Liste des configurations d'endpoints
export function useEndpointConfigs(configId: string, enabled = true) {
  return useQuery({
    queryKey: catalogQueryKeys.endpointConfigsList(configId),
    queryFn: async () => {
      const response = await client.catalog.endpointConfigs.list(configId);
      return response.data;
    },
    enabled: enabled && !!configId
  });
}

// Détail d'une configuration d'endpoint
export function useEndpointConfig(id: string, enabled = true) {
  return useQuery({
    queryKey: catalogQueryKeys.endpointConfig(id),
    queryFn: async () => {
      const response = await client.catalog.endpointConfigs.get(id);
      return response.data;
    },
    enabled: enabled && !!id
  });
}

// Créer une configuration d'endpoint
export function useCreateEndpointConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<EndpointConfig>) => {
      const response = await client.catalog.endpointConfigs.create(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.endpointConfigsList(data.serviceConfigId) });
      toast.success("Endpoint créé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création de l'endpoint");
    }
  });
}

// Mettre à jour une configuration d'endpoint
export function useUpdateEndpointConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EndpointConfig> }) => {
      const response = await client.catalog.endpointConfigs.update(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.endpointConfig(data.id) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.endpointConfigsList(data.serviceConfigId) });
      toast.success("Endpoint mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour de l'endpoint");
    }
  });
}

// Supprimer une configuration d'endpoint
export function useDeleteEndpointConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, configId }: { id: string; configId: string }) => {
      await client.catalog.endpointConfigs.delete(id);
      return configId;
    },
    onSuccess: (configId) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.endpointConfigsList(configId) });
      toast.success("Endpoint supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression de l'endpoint");
    }
  });
}

// Tester une configuration d'endpoint
export function useTestEndpointConfig() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.catalog.endpointConfigs.test(id);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Test de l'endpoint réussi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors du test de l'endpoint");
    }
  });
}

// ========================================
// RESPONSE MAPPINGS HOOKS
// ========================================

// Liste des mappings de réponse
export function useResponseMappings(endpointId: string, enabled = true) {
  return useQuery({
    queryKey: catalogQueryKeys.responseMappingsList(endpointId),
    queryFn: async () => {
      const response = await client.catalog.responseMappings.list(endpointId);
      return response.data;
    },
    enabled: enabled && !!endpointId
  });
}

// Créer un mapping de réponse
export function useCreateResponseMapping() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<ResponseMapping>) => {
      const response = await client.catalog.responseMappings.create(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.responseMappingsList(data.endpointConfigId) });
      toast.success("Mapping créé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création du mapping");
    }
  });
}

// Mettre à jour un mapping de réponse
export function useUpdateResponseMapping() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ResponseMapping> }) => {
      const response = await client.catalog.responseMappings.update(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.responseMappingsList(data.endpointConfigId) });
      toast.success("Mapping mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du mapping");
    }
  });
}

// Supprimer un mapping de réponse
export function useDeleteResponseMapping() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, endpointId }: { id: string; endpointId: string }) => {
      await client.catalog.responseMappings.delete(id);
      return endpointId;
    },
    onSuccess: (endpointId) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.responseMappingsList(endpointId) });
      toast.success("Mapping supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression du mapping");
    }
  });
}

// ========================================
// CONFIGURATION COMPLETE HOOKS
// ========================================

// Hook pour mettre à jour la configuration globale (baseUrl, auth, etc.)
export function useUpdateServiceConfigGlobal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ serviceId, data }: { serviceId: string; data: Partial<ServiceConfig> }) => {
      const response = await client.catalog.serviceConfig.update(serviceId, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfig(data.serviceId) });
      toast.success("Configuration globale mise à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour de la configuration globale");
    }
  });
}

// Hook pour mettre à jour un endpoint complet (y compris ses champs et mappings)
export function useUpdateEndpointComplete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      endpointId, 
      endpointData, 
      serviceId 
    }: { 
      endpointId: string; 
      endpointData: any; 
      serviceId: string;
    }) => {
      const response = await client.catalog.endpointConfigs.update(endpointId, endpointData);
      return { ...response.data, serviceId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfig(data.serviceId) });
      toast.success("Endpoint mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour de l'endpoint");
    }
  });
}

// Hook pour mettre à jour un champ de données avec invalidation complète
export function useUpdateDataFieldComplete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      fieldId, 
      fieldData, 
      serviceId 
    }: { 
      fieldId: string; 
      fieldData: any; 
      serviceId: string;
    }) => {
      const response = await client.catalog.dataFields.update(fieldId, fieldData);
      return { ...response.data, serviceId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfig(data.serviceId) });
      toast.success("Champ mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du champ");
    }
  });
}

// Hook pour mettre à jour un mapping de réponse avec invalidation complète
export function useUpdateResponseMappingComplete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      mappingId, 
      mappingData, 
      serviceId 
    }: { 
      mappingId: string; 
      mappingData: any; 
      serviceId: string;
    }) => {
      const response = await client.catalog.responseMappings.update(mappingId, mappingData);
      return { ...response.data, serviceId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfig(data.serviceId) });
      toast.success("Mapping mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du mapping");
    }
  });
}

// Hook pour ajouter un nouveau champ à un endpoint
export function useAddDataFieldToEndpoint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      endpointId, 
      fieldData, 
      serviceId 
    }: { 
      endpointId: string; 
      fieldData: any; 
      serviceId: string;
    }) => {
      const response = await client.catalog.dataFields.create({ 
        ...fieldData, 
        endpointConfigId: endpointId 
      });
      return { ...response.data, serviceId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfig(data.serviceId) });
      toast.success("Champ ajouté avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout du champ");
    }
  });
}

// Hook pour ajouter un nouveau mapping à un endpoint
export function useAddResponseMappingToEndpoint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      endpointId, 
      mappingData, 
      serviceId 
    }: { 
      endpointId: string; 
      mappingData: any; 
      serviceId: string;
    }) => {
      const response = await client.catalog.responseMappings.create({ 
        ...mappingData, 
        endpointConfigId: endpointId 
      });
      return { ...response.data, serviceId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfig(data.serviceId) });
      toast.success("Mapping ajouté avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout du mapping");
    }
  });
}

// Hook pour supprimer un champ avec invalidation complète
export function useDeleteDataFieldComplete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      fieldId, 
      serviceId 
    }: { 
      fieldId: string; 
      serviceId: string;
    }) => {
      await client.catalog.dataFields.delete(fieldId);
      return serviceId;
    },
    onSuccess: (serviceId) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfig(serviceId) });
      toast.success("Champ supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression du champ");
    }
  });
}

// Hook pour supprimer un mapping avec invalidation complète
export function useDeleteResponseMappingComplete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      mappingId, 
      serviceId 
    }: { 
      mappingId: string; 
      serviceId: string;
    }) => {
      await client.catalog.responseMappings.delete(mappingId);
      return serviceId;
    },
    onSuccess: (serviceId) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.serviceConfig(serviceId) });
      toast.success("Mapping supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression du mapping");
    }
  });
}

// ========================================
// UTILITY HOOKS
// ========================================

// Hook pour filtrer les services par nature
export function useServicesByNature(nature: ServiceNature | ServiceNature[], structureId?: string) {
  const natures = Array.isArray(nature) ? nature : [nature];
  
  return useServicesProducts({
    serviceNatures: natures,
    structureId,
    status: 'ACTIVE',
    size: 100
  });
}

// ========================================
// PRICING CALCULATION
// ========================================

interface PricingCalculationRequest {
  serviceId: string;
  fieldData: Record<string, any>;
  simulationMode: boolean;
  clientReference?: string;
  userContext?: string;
}

// Hook pour simuler le calcul de pricing
export function useSimulatePricing() {
  return useMutation({
    mutationFn: async (data: PricingCalculationRequest) => {
      const response = await client.catalog.pricingRules.pricingCalculate({
        ...data
      })
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la simulation");
    }
  });
}

// Hook pour calculer le pricing en production
export function useCalculatePricing() {
  return useMutation({
    mutationFn: async (data: PricingCalculationRequest) => {
      const response = await client.post('/api/v1/catalog/pricing/calculate', {
        ...data,
        simulationMode: false
      });
      return response.data.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors du calcul");
    }
  });
}


// Hook pour simuler l'exécution de service externe
export function useSimulateExternalService() {
  return useMutation({
    mutationFn: async (data: ExternalServiceExecutionRequest): Promise<ExternalServiceSimulationResultDto> => {
      const response = await client.catalog.externalServiceSimulation.execute(data);
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la simulation du service externe");
    }
  });
}