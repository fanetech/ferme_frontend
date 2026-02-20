import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import type {
  SessionInfoResponse,
  SessionsListResponse,
  SessionSearchParams,
  SessionStatsResponse,
  RevokeMultipleSessionsRequest,
  RevokeMultipleSessionsResponse,
  SuspiciousSessionsParams,
  SessionValidationResponse
} from "@/types/sessions";

// ========================================
// QUERY KEYS
// ========================================

export const sessionQueryKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionQueryKeys.all, 'list'] as const,
  list: (params?: SessionSearchParams) => [...sessionQueryKeys.lists(), params] as const,
  details: () => [...sessionQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionQueryKeys.details(), id] as const,
  stats: () => [...sessionQueryKeys.all, 'stats'] as const,
  suspicious: () => [...sessionQueryKeys.all, 'suspicious'] as const,
  longSessions: () => [...sessionQueryKeys.all, 'long-sessions'] as const,
  userSessions: (userId: string) => [...sessionQueryKeys.all, 'user', userId] as const,
};

// ========================================
// HOOKS POUR LES SESSIONS
// ========================================

// Lister toutes les sessions actives (Admin)
export function useActiveSessions(params?: SessionSearchParams, enabled = true) {
  return useQuery({
    queryKey: sessionQueryKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.append('page', params.page.toString());
      if (params?.size !== undefined) searchParams.append('size', params.size.toString());
      if (params?.searchTerm) searchParams.append('searchTerm', params.searchTerm);
      if (params?.deviceType) searchParams.append('deviceType', params.deviceType);
      if (params?.since) searchParams.append('since', params.since);
      if (params?.userId) searchParams.append('userId', params.userId);
      if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params?.sortDir) searchParams.append('sortDir', params.sortDir);

      const response = await client.auth.sessions.listActive(searchParams);
      return response.data;
    },
    enabled,
    staleTime: 30000, // 30 secondes
  });
}

// Obtenir les détails d'une session spécifique
export function useSessionDetails(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: sessionQueryKeys.detail(sessionId),
    queryFn: async () => {
      const response = await client.auth.sessions.getDetails(sessionId);
      return response.data;
    },
    enabled: enabled && !!sessionId,
    staleTime: 60000, // 1 minute
  });
}

// Obtenir les statistiques globales des sessions
export function useSessionStats(enabled = true) {
  return useQuery({
    queryKey: sessionQueryKeys.stats(),
    queryFn: async () => {
      const response = await client.auth.sessions.getStats();
      return response.data;
    },
    enabled,
    staleTime: 60000, // 1 minute
  });
}

// Lister les sessions suspectes
export function useSuspiciousSessions(params?: SuspiciousSessionsParams, enabled = true) {
  return useQuery({
    queryKey: [...sessionQueryKeys.suspicious(), params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.userId) searchParams.append('userId', params.userId);
      if (params?.currentIp) searchParams.append('currentIp', params.currentIp);

      const response = await client.auth.sessions.getSuspicious(searchParams);
      return response.data;
    },
    enabled,
    staleTime: 30000, // 30 secondes
  });
}

// Lister les sessions de longue durée
export function useLongSessions(userId?: string, enabled = true) {
  return useQuery({
    queryKey: [...sessionQueryKeys.longSessions(), userId],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (userId) searchParams.append('userId', userId);

      const response = await client.auth.sessions.getLongSessions(searchParams);
      return response.data;
    },
    enabled,
    staleTime: 60000, // 1 minute
  });
}

// Lister les sessions d'un utilisateur spécifique
export function useUserSessions(userId: string, activeOnly = true, enabled = true) {
  return useQuery({
    queryKey: sessionQueryKeys.userSessions(userId),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('activeOnly', activeOnly.toString());

      const response = await client.auth.sessions.getUserSessions(userId, searchParams);
      return response.data;
    },
    enabled: enabled && !!userId,
    staleTime: 30000, // 30 secondes
  });
}

// ========================================
// MUTATIONS POUR LES SESSIONS
// ========================================

// Révoquer une session spécifique
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await client.auth.sessions.revoke(sessionId);
      return response.data;
    },
    onSuccess: () => {
      // Invalider les listes de sessions pour les recharger
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.stats() });
    },
  });
}

// Révoquer toutes les sessions d'un utilisateur
export function useRevokeAllUserSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await client.auth.sessions.revokeAllUser(userId);
      return response.data;
    },
    onSuccess: (_, userId) => {
      // Invalider les sessions spécifiques de l'utilisateur et les listes globales
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.userSessions(userId) });
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.stats() });
    },
  });
}

// Révoquer plusieurs sessions simultanément
export function useRevokeMultipleSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RevokeMultipleSessionsRequest) => {
      const response = await client.auth.sessions.revokeMultiple(request);
      return response.data;
    },
    onSuccess: () => {
      // Invalider toutes les listes de sessions
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.suspicious() });
    },
  });
}

// Expirer une session
export function useExpireSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await client.auth.sessions.expire(sessionId);
      return response.data;
    },
    onSuccess: (_, sessionId) => {
      // Invalider les détails de la session et les listes
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.detail(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.stats() });
    },
  });
}

// Déclencher le nettoyage des sessions expirées
export function useCleanupSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await client.auth.sessions.cleanup();
      return response.data;
    },
    onSuccess: () => {
      // Invalider toutes les données de sessions
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
    },
  });
}

// Mettre à jour le dernier accès d'une session
export function useTouchSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await client.auth.sessions.touch(sessionId);
      return response.data;
    },
    onSuccess: (_, sessionId) => {
      // Invalider les détails de la session
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.detail(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.lists() });
    },
  });
}

// Valider une session
export function useValidateSession() {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await client.auth.sessions.validate(sessionId);
      return response.data;
    },
  });
}