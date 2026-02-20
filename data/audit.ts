import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import client from "@/data/client";
import type {
  UserAuditLogsResponse,
  AuditLogResponse,
  AuditStatsResponse,
  AuditSearchParams,
  AuditLogEntry
} from "@/types/audit";
import type { UserActivity } from "@/types/users";
import type { ApiResponse } from "@/types";

// ========================================
// QUERY KEYS
// ========================================

export const auditQueryKeys = {
  all: ['audit'] as const,
  
  // Logs utilisateur
  userLogs: (userId: string) => [...auditQueryKeys.all, 'user', userId] as const,
  userLogsDetailed: (userId: string, params?: AuditSearchParams) => 
    [...auditQueryKeys.userLogs(userId), 'detailed', params] as const,
  userLogsBasic: (userId: string, params?: AuditSearchParams) => 
    [...auditQueryKeys.userLogs(userId), 'basic', params] as const,
  
  // Logs de session
  sessionLogs: (sessionId: string) => [...auditQueryKeys.all, 'session', sessionId] as const,
  
  // Statistiques
  stats: (startDate?: string, endDate?: string) => 
    [...auditQueryKeys.all, 'stats', startDate, endDate] as const,
  
  // Erreurs et violations
  errors: (params?: any) => [...auditQueryKeys.all, 'errors', params] as const,
  securityViolations: (params?: any) => [...auditQueryKeys.all, 'security-violations', params] as const,
  unauthorizedAttempts: (startDate: string, endDate: string, threshold: number) => 
    [...auditQueryKeys.all, 'unauthorized-attempts', startDate, endDate, threshold] as const,
};

// ========================================
// HOOKS POUR LES LOGS UTILISATEUR
// ========================================

// Récupérer les logs d'activité/audit d'un utilisateur (endpoint existant)
export function useUserAuditLogs(userId: string, params?: AuditSearchParams, enabled = true) {
  return useQuery({
    queryKey: auditQueryKeys.userLogsDetailed(userId, params),
    queryFn: async () => {
      // Utilise l'endpoint correct /api/v1/audit/users/{userId}/logs
      const response = await client.auth.audit.getUserLogs(userId, params);
      return response.data;
    },
    enabled: enabled && !!userId,
    staleTime: 30000, // 30 secondes
  });
}

// Récupérer les logs basiques d'un utilisateur (version simple)
export function useUserAuditLogsBasic(userId: string, params?: AuditSearchParams, enabled = true) {
  return useQuery({
    queryKey: auditQueryKeys.userLogsBasic(userId, params),
    queryFn: async () => {
      const response = await client.auth.audit.getUserLogsBasic(userId, params);
      return response.data;
    },
    enabled: enabled && !!userId,
    staleTime: 30000,
  });
}

// Récupérer les logs d'une session spécifique
export function useSessionAuditLogs(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: auditQueryKeys.sessionLogs(sessionId),
    queryFn: async () => {
      const response = await client.auth.audit.getSessionLogs(sessionId);
      return response.data;
    },
    enabled: enabled && !!sessionId,
    staleTime: 60000, // 1 minute
  });
}

// ========================================
// HOOKS POUR LES STATISTIQUES
// ========================================

// Récupérer les statistiques d'audit pour une période
export function useAuditStats(startDate?: string, endDate?: string, enabled = true) {
  return useQuery({
    queryKey: auditQueryKeys.stats(startDate, endDate),
    queryFn: async () => {
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }
      const response = await client.auth.audit.getStats(startDate, endDate);
      return response.data;
    },
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 300000, // 5 minutes
  });
}

// Récupérer les logs d'erreur
export function useAuditErrors(params?: any, enabled = true) {
  return useQuery({
    queryKey: auditQueryKeys.errors(params),
    queryFn: async () => {
      const response = await client.auth.audit.getErrors(params);
      return response.data;
    },
    enabled,
    staleTime: 60000, // 1 minute
  });
}

// Récupérer les violations de sécurité
export function useSecurityViolations(params?: any, enabled = true) {
  return useQuery({
    queryKey: auditQueryKeys.securityViolations(params),
    queryFn: async () => {
      const response = await client.auth.audit.getSecurityViolations(params);
      return response.data;
    },
    enabled,
    staleTime: 30000, // 30 secondes pour les violations de sécurité
  });
}

// Analyser les tentatives d'accès non autorisées
export function useUnauthorizedAttempts(
  startDate: string, 
  endDate: string, 
  threshold = 10, 
  enabled = true
) {
  return useQuery({
    queryKey: auditQueryKeys.unauthorizedAttempts(startDate, endDate, threshold),
    queryFn: async () => {
      const response = await client.auth.audit.getUnauthorizedAttempts(startDate, endDate, threshold);
      return response.data;
    },
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 120000, // 2 minutes
  });
}

// ========================================
// HOOKS DE RECHERCHE
// ========================================

// Recherche avancée dans les logs d'audit
export function useAuditSearch() {
  return useMutation({
    mutationFn: async ({ searchRequest, params }: { searchRequest: any; params?: any }) => {
      const response = await client.auth.audit.search(searchRequest, params);
      return response.data;
    },
    onError: (error: any) => {
      console.error('Erreur lors de la recherche dans les logs d\'audit:', error);
      toast.error("Erreur lors de la recherche dans les logs d'audit");
    }
  });
}

// ========================================
// HOOKS UTILITAIRES
// ========================================

// Hook pour précharger les logs d'un utilisateur
export function usePrefetchUserAuditLogs() {
  const queryClient = useQueryClient();

  return (userId: string, params?: AuditSearchParams) => {
    queryClient.prefetchQuery({
      queryKey: auditQueryKeys.userLogsDetailed(userId, params),
      queryFn: async () => {
        const response = await client.auth.audit.getUserLogs(userId, params);
        return response.data;
      },
      staleTime: 30000,
    });
  };
}

// Hook pour invalider les caches d'audit
export function useInvalidateAuditQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateUserLogs: (userId: string) => {
      queryClient.invalidateQueries({ queryKey: auditQueryKeys.userLogs(userId) });
    },
    invalidateSessionLogs: (sessionId: string) => {
      queryClient.invalidateQueries({ queryKey: auditQueryKeys.sessionLogs(sessionId) });
    },
    invalidateStats: () => {
      queryClient.invalidateQueries({ queryKey: auditQueryKeys.all });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: auditQueryKeys.all });
    }
  };
}

// ========================================
// HOOKS POUR LES FILTRES ET PARAMÈTRES
// ========================================

// Hook pour construire les paramètres de recherche
export function useAuditSearchParams() {
  const buildParams = (filters: Partial<AuditSearchParams>): AuditSearchParams => {
    const params: AuditSearchParams = {
      page: 0,
      size: 20,
      sortBy: 'requestTime',
      sortDir: 'DESC',
      ...filters
    };

    // Nettoyer les paramètres undefined
    Object.keys(params).forEach(key => {
      if (params[key as keyof AuditSearchParams] === undefined) {
        delete params[key as keyof AuditSearchParams];
      }
    });

    return params;
  };

  const buildQueryString = (params: AuditSearchParams): string => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return searchParams.toString();
  };

  return { buildParams, buildQueryString };
}

// Hook pour les statistiques en temps réel (avec auto-refresh)
export function useRealTimeAuditStats(
  startDate?: string, 
  endDate?: string, 
  refreshInterval = 60000 // 1 minute par défaut
) {
  return useQuery({
    queryKey: auditQueryKeys.stats(startDate, endDate),
    queryFn: async () => {
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }
      const response = await client.auth.audit.getStats(startDate, endDate);
      return response.data;
    },
    enabled: !!startDate && !!endDate,
    staleTime: refreshInterval,
    refetchInterval: refreshInterval,
  });
}