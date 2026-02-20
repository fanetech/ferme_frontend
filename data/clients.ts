import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpClient } from "@/data/client/http-client";
import type {
  Client,
  ClientResponse,
  CreateClientRequest,
  UpdateClientRequest,
  QuickClientRegistrationDto,
  ClientSearchCriteria,
  ClientSearchParams,
  ClientStatsResponse,
  PaginatedClientsResponse
} from "@/types/clients";
import type { ApiResponse } from "@/types";

// ========================================
// QUERY KEYS
// ========================================

export const clientsQueryKeys = {
  all: ['clients'] as const,
  
  // Clients
  clients: () => [...clientsQueryKeys.all, 'clients'] as const,
  clientsList: (params?: ClientSearchParams) => 
    [...clientsQueryKeys.clients(), 'list', params] as const,
  client: (id: string) => 
    [...clientsQueryKeys.clients(), 'detail', id] as const,
  clientByCode: (code: string) => 
    [...clientsQueryKeys.clients(), 'code', code] as const,
  clientsActive: () => 
    [...clientsQueryKeys.clients(), 'active'] as const,
  clientsByType: (type: string) => 
    [...clientsQueryKeys.clients(), 'type', type] as const,
  clientsStats: () => 
    [...clientsQueryKeys.clients(), 'stats'] as const,
};

// ========================================
// CLIENTS HOOKS
// ========================================

// Liste des clients avec recherche et filtres
export function useClients(params?: ClientSearchParams) {
  const searchParams = new URLSearchParams();
  
  if (params) {
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    // For the GET endpoint, we only send the first type/status if multiple
    if (params.type?.length) {
      searchParams.append('type', params.type[0]);
    }
    if (params.status?.length) {
      searchParams.append('status', params.status[0]);
    }
    if (params.city) searchParams.append('city', params.city);
    if (params.country) searchParams.append('country', params.country);
    if (params.organizationId) searchParams.append('organizationId', params.organizationId);
    if (params.organizationType) searchParams.append('organizationType', params.organizationType);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortDir) searchParams.append('sortDir', params.sortDir);
  }
  
  return useQuery({
    queryKey: clientsQueryKeys.clientsList(params),
    queryFn: async () => {
      const response = await HttpClient.get<ApiResponse<PaginatedClientsResponse>>(
        `/clients/search?${searchParams.toString()}`
      );
      return response.data;
    }
  });
}

// Détail d'un client
export function useClient(id: string, enabled = true) {
  return useQuery({
    queryKey: clientsQueryKeys.client(id),
    queryFn: async () => {
      const response = await HttpClient.get<ApiResponse<ClientResponse>>(`/clients/${id}`);
      return response.data;
    },
    enabled: enabled && !!id
  });
}

// Client par code
export function useClientByCode(code: string, enabled = true) {
  return useQuery({
    queryKey: clientsQueryKeys.clientByCode(code),
    queryFn: async () => {
      const response = await HttpClient.get<ApiResponse<ClientResponse>>(`/clients/code/${code}`);
      return response.data;
    },
    enabled: enabled && !!code
  });
}

// Clients par type
export function useClientsByType(type: string, status = 'ACTIVE') {
  return useQuery({
    queryKey: clientsQueryKeys.clientsByType(type),
    queryFn: async () => {
      const response = await HttpClient.get<ApiResponse<ClientResponse[]>>(
        `/clients/type/${type}?status=${status}`
      );
      return response.data;
    }
  });
}

// Statistiques des clients
export function useClientsStats() {
  return useQuery({
    queryKey: clientsQueryKeys.clientsStats(),
    queryFn: async () => {
      const response = await HttpClient.get<ApiResponse<ClientStatsResponse>>('/clients/stats');
      return response.data;
    }
  });
}

// Créer un client
export function useCreateClient(options: { showToast?: boolean } = {}) {
  const queryClient = useQueryClient();
  const { showToast = true } = options;
  
  return useMutation({
    mutationFn: async (data: CreateClientRequest) => {
      const response = await HttpClient.post<ApiResponse<ClientResponse>>('/clients', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.clients() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.clientsStats() });
      if (showToast) {
        toast.success("Client créé avec succès");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création du client");
    }
  });
}

// Enregistrement rapide d'un client
export function useQuickRegisterClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: QuickClientRegistrationDto) => {
      const response = await HttpClient.post<ApiResponse<ClientResponse>>('/clients/quick-register', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.clients() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.clientsStats() });
      toast.success("Client enregistré avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement du client");
    }
  });
}

// Mettre à jour un client
export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateClientRequest }) => {
      const response = await HttpClient.put<ApiResponse<ClientResponse>>(`/clients/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.client(variables.id) });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.clients() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.clientsStats() });
      toast.success("Client mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du client");
    }
  });
}

// Supprimer un client
export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await HttpClient.delete(`/clients/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.clients() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.clientsStats() });
      toast.success("Client supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression du client");
    }
  });
}

// Changer le statut d'un client (endpoint unifié)
export function useChangeClientStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const response = await HttpClient.put<ApiResponse<ClientResponse>>(
        `/clients/${id}/status`,
        {
          status,
          reason: reason || undefined,
          comment: reason || undefined
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.client(variables.id) });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.clients() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.clientsStats() });
      
      // Message de succès personnalisé selon le statut
      const statusMessages: Record<string, string> = {
        'BLOCKED': 'Client bloqué avec succès',
        'ACTIVE': 'Client activé avec succès',
        'INACTIVE': 'Client désactivé avec succès',
        'SUSPENDED': 'Client suspendu avec succès'
      };
      
      toast.success(statusMessages[variables.status] || 'Statut du client modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors du changement de statut du client");
    }
  });
}

// Bloquer un client (conservé pour compatibilité)
export function useBlockClient() {
  const changeStatus = useChangeClientStatus();
  
  return {
    ...changeStatus,
    mutateAsync: async ({ id, reason }: { id: string; reason: string }) => {
      return changeStatus.mutateAsync({ id, status: 'BLOCKED', reason });
    },
    mutate: ({ id, reason }: { id: string; reason: string }) => {
      changeStatus.mutate({ id, status: 'BLOCKED', reason });
    },
    isPending: changeStatus.isPending,
    isSuccess: changeStatus.isSuccess,
    isError: changeStatus.isError,
    error: changeStatus.error,
    data: changeStatus.data
  };
}

// Débloquer un client (conservé pour compatibilité)
export function useUnblockClient() {
  const changeStatus = useChangeClientStatus();
  
  return {
    ...changeStatus,
    mutateAsync: async (id: string) => {
      return changeStatus.mutateAsync({ id, status: 'ACTIVE', reason: 'Déblocage du client' });
    },
    mutate: (id: string) => {
      changeStatus.mutate({ id, status: 'ACTIVE', reason: 'Déblocage du client' });
    },
    isPending: changeStatus.isPending,
    isSuccess: changeStatus.isSuccess,
    isError: changeStatus.isError,
    error: changeStatus.error,
    data: changeStatus.data
  };
}

// Enrichir le profil d'un client
export function useEnrichClientProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, fields }: { id: string; fields: Record<string, string> }) => {
      const response = await HttpClient.put<ApiResponse<ClientResponse>>(
        `/clients/${id}/enrich`,
        fields
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.client(variables.id) });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.clients() });
      toast.success("Profil enrichi avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'enrichissement du profil");
    }
  });
}

// Inscrire au programme de fidélité
export function useEnrollInLoyalty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await HttpClient.post<ApiResponse<ClientResponse>>(
        `/clients/${id}/enroll-loyalty`,
        {}
      );
      return response.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.client(id) });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.clients() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.clientsStats() });
      toast.success("Client inscrit au programme de fidélité avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'inscription au programme de fidélité");
    }
  });
}

// Recherche avancée de clients
export function useSearchClients() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ criteria, page = 0, size = 20, sortBy = 'createdAt', sortDir = 'DESC' }: {
      criteria: ClientSearchCriteria;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: 'ASC' | 'DESC';
    }) => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: `${sortBy},${sortDir.toLowerCase()}`
      });
      
      const response = await HttpClient.post<ApiResponse<PaginatedClientsResponse>>(
        `/clients/search?${params.toString()}`,
        criteria
      );
      return response.data;
    }
  });
}

// Recherche par contact (email ou téléphone)
export function useSearchClientByContact(email?: string, phone?: string) {
  const params = new URLSearchParams();
  if (email) params.append('email', email);
  if (phone) params.append('phone', phone);
  
  return useQuery({
    queryKey: ['clients', 'contact', { email, phone }],
    queryFn: async () => {
      const response = await HttpClient.get<ApiResponse<ClientResponse>>(
        `/clients/search-by-contact?${params.toString()}`
      );
      return response.data;
    },
    enabled: !!(email || phone)
  });
}

// ========================================
// UTILITY HOOKS
// ========================================

// Hook pour rechercher des clients
export function useSearchClientsSimple(searchTerm: string, enabled = true) {
  return useClients({
    searchTerm,
    size: 20
  });
}

// Hook pour obtenir les clients récemment créés
export function useRecentClients(days = 7) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  
  return useClients({
    createdFrom: fromDate.toISOString(),
    sortBy: 'createdAt',
    sortDir: 'DESC',
    size: 10
  });
}

// Hook pour obtenir les clients VIP (avec beaucoup de transactions)
export function useVipClients(minTransactions = 10, minAmount = 100000) {
  return useSearchClients().mutate({
    criteria: {
      minTransactions,
      minAmount
    },
    sortBy: 'totalAmount',
    sortDir: 'DESC'
  });
}

// Hook pour obtenir les membres du programme de fidélité
export function useLoyaltyMembers() {
  return useClients({
    isLoyaltyMember: true,
    sortBy: 'loyaltyPoints',
    sortDir: 'DESC'
  });
}
