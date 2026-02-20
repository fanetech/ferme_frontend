import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpClient } from "@/data/client/http-client";
import client from "@/data/client";
import type {
  User,
  UserSearchParams,
  CreateUserRequest,
  UpdateUserRequest,
  UserPermission,
  UserSession,
  UserActivity,
  UserSessionSummary,
  PaginatedUsersResponse,
  ChangePasswordRequest,
  ResetPasswordRequest,
  PermissionCheckRequest,
  PermissionCheckResponse
} from "@/types/users";
import type { UserRolesPermissionsResponse } from "@/types/user-permissions";
import type { 
  Role, 
  AssignableRolesParams, 
  AssignableRolesResponse 
} from "@/types/auth";
import type { ApiResponse } from "@/types";

// ========================================
// QUERY KEYS
// ========================================

export const usersQueryKeys = {
  all: ['users'] as const,
  
  // Users
  users: () => [...usersQueryKeys.all, 'users'] as const,
  usersList: (params?: UserSearchParams) => 
    [...usersQueryKeys.users(), 'list', params] as const,
  user: (id: string) => 
    [...usersQueryKeys.users(), 'detail', id] as const,
  usersActive: () => 
    [...usersQueryKeys.users(), 'active'] as const,
  usersByStructure: (structureId: string) => 
    [...usersQueryKeys.users(), 'structure', structureId] as const,
  usersStats: (structureId?: string) => 
    [...usersQueryKeys.users(), 'stats', structureId] as const,
  
  // Roles
  roles: () => [...usersQueryKeys.all, 'roles'] as const,
  availableRoles: (params?: AssignableRolesParams) => 
    [...usersQueryKeys.roles(), 'available', params] as const,
  
  // User Permissions
  userPermissions: () => [...usersQueryKeys.all, 'permissions'] as const,
  userPermissionsList: (userId: string) => 
    [...usersQueryKeys.userPermissions(), 'list', userId] as const,
  userRolesPermissions: (userId: string) => 
    [...usersQueryKeys.userPermissions(), 'roles-permissions', userId] as const,
  
  // User Sessions
  userSessions: () => [...usersQueryKeys.all, 'sessions'] as const,
  userSessionsList: (userId: string) => 
    [...usersQueryKeys.userSessions(), 'list', userId] as const,
  
  // User Activity
  userActivity: () => [...usersQueryKeys.all, 'activity'] as const,
  userActivityList: (userId: string) => 
    [...usersQueryKeys.userActivity(), 'list', userId] as const,
};

// ========================================
// USERS HOOKS
// ========================================

// Liste des utilisateurs avec recherche et filtres
export function useUsers(params?: UserSearchParams) {
  const searchParams = new URLSearchParams();
  
  if (params) {
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    if (params.userType?.length) {
      params.userType.forEach(type => searchParams.append('userType', type));
    }
    if (params.userStatus?.length) {
      params.userStatus.forEach(status => searchParams.append('status', status));
    }
    if (params.accountStatus?.length) {
      params.accountStatus.forEach(status => searchParams.append('accountStatus', status));
    }
    if (params.structureId) searchParams.append('structureId', params.structureId);
    if (params.superStructureId) searchParams.append('superStructureId', params.superStructureId);
    if (params.roleId) searchParams.append('roleId', params.roleId);
    if (params.createdFrom) searchParams.append('createdFrom', params.createdFrom);
    if (params.createdTo) searchParams.append('createdTo', params.createdTo);
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params.hasRecentActivity !== undefined) searchParams.append('hasRecentActivity', params.hasRecentActivity.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortDir) searchParams.append('sortDir', params.sortDir);
  }
  
  return useQuery({
    queryKey: usersQueryKeys.usersList(params),
    queryFn: async () => {
      const response = await client.users.list(searchParams);
      return response.data;
    }
  });
}

// Détail d'un utilisateur
export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: usersQueryKeys.user(id),
    queryFn: async () => {
      const response = await client.users.get(id);
      return response.data;
    },
    enabled: enabled && !!id
  });
}

// Tous les utilisateurs actifs
export function useActiveUsers() {
  return useQuery({
    queryKey: usersQueryKeys.usersActive(),
    queryFn: async () => {
      const response = await HttpClient.get<ApiResponse<User[]>>('/users/active');
      return response.data;
    }
  });
}

// Utilisateurs par structure
export function useUsersByStructure(structureId: string, enabled = true) {
  return useQuery({
    queryKey: usersQueryKeys.usersByStructure(structureId),
    queryFn: async () => {
      const response = await HttpClient.get<ApiResponse<User[]>>(`/users/structure/${structureId}`);
      return response.data;
    },
    enabled: enabled && !!structureId
  });
}

// Statistiques des utilisateurs
export function useUsersStats(structureId?: string) {
  return useQuery({
    queryKey: usersQueryKeys.usersStats(structureId),
    queryFn: async () => {
      const params = structureId ? `?structureId=${structureId}` : "";
      const response = await HttpClient.get<ApiResponse<any>>(`/users/stats${params}`);
      return response.data;
    }
  });
}

// Créer un utilisateur
export function useCreateUser(options: { showToast?: boolean } = {}) {
  const queryClient = useQueryClient();
  const { showToast = true } = options;
  
  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const response = await client.users.create(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.usersStats() });
      if (showToast) {
        toast.success("Utilisateur créé avec succès");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création de l'utilisateur");
    }
  });
}

// Mettre à jour un utilisateur
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserRequest }) => {
      const response = await client.users.update(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(variables.id) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.usersStats() });
      toast.success("Utilisateur mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour de l'utilisateur");
    }
  });
}

// Supprimer un utilisateur
export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await client.users.delete(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.usersStats() });
      toast.success("Utilisateur supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression de l'utilisateur");
    }
  });
}

// Activer un utilisateur
export function useActivateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await HttpClient.post<ApiResponse<User>>(`/users/${id}/activate`, {});
      return response.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.usersStats() });
      toast.success("Utilisateur activé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'activation de l'utilisateur");
    }
  });
}

// Désactiver un utilisateur
export function useDeactivateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await HttpClient.post<ApiResponse<User>>(`/users/${id}/deactivate`, {});
      return response.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.usersStats() });
      toast.success("Utilisateur désactivé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la désactivation de l'utilisateur");
    }
  });
}

// Suspendre un utilisateur
export function useSuspendUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
      const response = await HttpClient.post<ApiResponse<User>>(`/users/${id}/suspend${params}`, {});
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(variables.id) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.usersStats() });
      toast.success("Utilisateur suspendu avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suspension de l'utilisateur");
    }
  });
}

// Verrouiller un utilisateur
export function useLockUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
      const response = await client.users.lock(id, params);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(variables.id) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.usersStats() });
      toast.success("Utilisateur verrouillé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors du verrouillage de l'utilisateur");
    }
  });
}

// Déverrouiller un utilisateur
export function useUnlockUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.users.unlock(id);
      return response.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.usersStats() });
      toast.success("Utilisateur déverrouillé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors du déverrouillage de l'utilisateur");
    }
  });
}

// Débloquer un utilisateur (legacy - sera déprécié)
export function useUnblockUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await HttpClient.put<ApiResponse<User>>(`/users/${id}/unblock`, {});
      return response.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.usersStats() });
      toast.success("Utilisateur débloqué avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors du déblocage de l'utilisateur");
    }
  });
}

// ========================================
// ROLES HOOKS
// ========================================

// Récupérer les rôles assignables pour une organisation
export function useAvailableRoles(params: AssignableRolesParams) {

  const queryEnabled = !!(
    params.targetOrganizationType && 
    params.targetOrganizationId &&
    params.targetOrganizationType.length > 0 &&
    params.targetOrganizationId.length > 0
  );


  return useQuery({
    queryKey: usersQueryKeys.availableRoles(params),
    queryFn: async () => {
      const response = await client.auth.roles.getAvailableForAssignment(params);
      return response?.data as AssignableRolesResponse;
    },
    enabled: queryEnabled,
    refetchOnMount: true
  });
}

// ========================================
// USER PERMISSIONS HOOKS
// ========================================

// Permissions d'un utilisateur
export function useUserPermissions(userId: string, enabled = true) {
  return useQuery({
    queryKey: usersQueryKeys.userPermissionsList(userId),
    queryFn: async () => {
      const response = await HttpClient.get<ApiResponse<UserPermission[]>>(`/users/${userId}/permissions`);
      return response.data;
    },
    enabled: enabled && !!userId
  });
}

// Mettre à jour les permissions d'un utilisateur
export function useUpdateUserPermissions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, permissions }: { userId: string; permissions: Partial<UserPermission>[] }) => {
      const response = await HttpClient.put<ApiResponse<UserPermission[]>>(`/users/${userId}/permissions`, { permissions });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.userPermissionsList(variables.userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(variables.userId) });
      toast.success("Permissions mises à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour des permissions");
    }
  });
}

// Ajouter une permission à un utilisateur
export function useAddUserPermission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, permission }: { userId: string; permission: Partial<UserPermission> }) => {
      const response = await HttpClient.post<ApiResponse<UserPermission>>(`/users/${userId}/permissions`, permission);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.userPermissionsList(variables.userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(variables.userId) });
      toast.success("Permission ajoutée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout de la permission");
    }
  });
}

// Supprimer une permission d'un utilisateur
export function useRemoveUserPermission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, permissionId }: { userId: string; permissionId: string }) => {
      await HttpClient.delete(`/users/${userId}/permissions/${permissionId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.userPermissionsList(variables.userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(variables.userId) });
      toast.success("Permission supprimée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression de la permission");
    }
  });
}

// Vérifier une permission
export function useCheckUserPermission() {
  return useMutation({
    mutationFn: async (data: PermissionCheckRequest) => {
      const response = await HttpClient.post<ApiResponse<PermissionCheckResponse>>('/users/check-permission', data);
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la vérification de la permission");
    }
  });
}

// ========================================
// USER SESSIONS HOOKS
// ========================================

// Sessions d'un utilisateur
export function useUserSessions(userId: string, enabled = true) {
  return useQuery({
    queryKey: usersQueryKeys.userSessionsList(userId),
    queryFn: async () => {
      const response = await HttpClient.get<ApiResponse<UserSessionSummary[]>>(`/users/${userId}/sessions`);
      return response.data;
    },
    enabled: enabled && !!userId
  });
}

// Terminer une session
export function useTerminateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, sessionId }: { userId: string; sessionId: string }) => {
      await HttpClient.delete(`/users/${userId}/sessions/${sessionId}/terminate`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.userSessionsList(variables.userId) });
      toast.success("Session terminée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la terminaison de la session");
    }
  });
}

// Terminer toutes les sessions d'un utilisateur
export function useTerminateAllSessions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      await HttpClient.delete(`/users/${userId}/sessions/terminate-all`);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.userSessionsList(userId) });
      toast.success("Toutes les sessions ont été terminées avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la terminaison des sessions");
    }
  });
}

// ========================================
// USER ACTIVITY HOOKS
// ========================================

// Activité d'un utilisateur
export function useUserActivity(userId: string, enabled = true) {
  return useQuery({
    queryKey: usersQueryKeys.userActivityList(userId),
    queryFn: async () => {
      const response = await HttpClient.get<ApiResponse<UserActivity[]>>(`/users/${userId}/activity`);
      return response.data;
    },
    enabled: enabled && !!userId
  });
}

// Activité d'un utilisateur avec pagination
export function useUserActivityPaginated(userId: string, params?: { page?: number; size?: number; from?: string; to?: string }, enabled = true) {
  const searchParams = new URLSearchParams();
  
  if (params) {
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.from) searchParams.append('from', params.from);
    if (params.to) searchParams.append('to', params.to);
  }
  
  return useQuery({
    queryKey: [...usersQueryKeys.userActivityList(userId), 'paginated', params],
    queryFn: async () => {
      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
      const response = await HttpClient.get<ApiResponse<any>>(`/users/${userId}/activity${queryString}`);
      return response.data;
    },
    enabled: enabled && !!userId
  });
}

// ========================================
// PASSWORD MANAGEMENT HOOKS
// ========================================

// Changer le mot de passe
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: ChangePasswordRequest }) => {
      const response = await HttpClient.post<ApiResponse<any>>(`/users/${userId}/change-password`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Mot de passe modifié avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la modification du mot de passe");
    }
  });
}

// Réinitialiser le mot de passe
export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      const response = await HttpClient.post<ApiResponse<any>>('/users/reset-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Mot de passe réinitialisé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la réinitialisation du mot de passe");
    }
  });
}

// Forcer la réinitialisation du mot de passe
export function useForcePasswordReset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await HttpClient.post<ApiResponse<any>>(`/users/${userId}/force-password-reset`, {});
      return response.data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(userId) });
      toast.success("Réinitialisation du mot de passe forcée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la réinitialisation forcée du mot de passe");
    }
  });
}

// ========================================
// TWO FACTOR AUTHENTICATION HOOKS
// ========================================

// Activer l'authentification à deux facteurs
export function useEnableTwoFactor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, method }: { userId: string; method: string }) => {
      const response = await HttpClient.post<ApiResponse<any>>(`/users/${userId}/enable-2fa`, { method });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(variables.userId) });
      toast.success("Authentification à deux facteurs activée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'activation de l'authentification à deux facteurs");
    }
  });
}

// Désactiver l'authentification à deux facteurs
export function useDisableTwoFactor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await HttpClient.post<ApiResponse<any>>(`/users/${userId}/disable-2fa`, {});
      return response.data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(userId) });
      toast.success("Authentification à deux facteurs désactivée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la désactivation de l'authentification à deux facteurs");
    }
  });
}

// ========================================
// EMAIL VERIFICATION HOOKS
// ========================================

// Envoyer un email de vérification
export function useSendVerificationEmail() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await HttpClient.post<ApiResponse<any>>(`/users/${userId}/send-verification-email`, {});
      return response.data;
    },
    onSuccess: () => {
      toast.success("Email de vérification envoyé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi de l'email de vérification");
    }
  });
}

// Vérifier l'email
export function useVerifyEmail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, token }: { userId: string; token: string }) => {
      const response = await HttpClient.post<ApiResponse<any>>(`/users/${userId}/verify-email`, { token });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(variables.userId) });
      toast.success("Email vérifié avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la vérification de l'email");
    }
  });
}

// ========================================
// UTILITY HOOKS
// ========================================

// Hook pour filtrer les utilisateurs par type
export function useUsersByType(userTypes: string[], structureId?: string) {
  return useUsers({
    userType: userTypes as any,
    structureId,
    size: 100
  });
}

// Hook pour rechercher des utilisateurs
export function useSearchUsers(searchTerm: string, enabled = true) {
  return useUsers({
    searchTerm,
    size: 20
  });
}

// Hook pour obtenir les utilisateurs récemment créés
export function useRecentUsers(days = 7) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  
  return useUsers({
    createdFrom: fromDate.toISOString(),
    sortBy: 'createdAt',
    sortDir: 'DESC',
    size: 10
  });
}

// Hook pour obtenir les utilisateurs inactifs
export function useInactiveUsers(days = 30) {
  const toDate = new Date();
  toDate.setDate(toDate.getDate() - days);
  
  return useUsers({
    lastLoginTo: toDate.toISOString(),
    sortBy: 'lastLoginAt',
    sortDir: 'ASC',
    size: 50
  });
}

// ========================================
// USER ROLES & PERMISSIONS HOOKS
// ========================================

// Récupérer les rôles et permissions détaillés d'un utilisateur
export function useUserRolesPermissions(userId: string, enabled = true) {
  return useQuery({
    queryKey: usersQueryKeys.userRolesPermissions(userId),
    queryFn: async () => {
      const response = await client.users.rolesPermissions(userId);
      return response.data;
    },
    enabled: enabled && !!userId
  });
}

// ========================================
// USER PERMISSIONS MUTATIONS
// ========================================

// Révoquer une permission spécifique
export function useRevokeUserPermission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, permissionId, reason }: { userId: string; permissionId: string; reason?: string }) => {
      await client.auth.userPermissions.revoke(userId, permissionId, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.userRolesPermissions(variables.userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.userPermissionsList(variables.userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(variables.userId) });
      // Don't show toast here, let the component handle it
    },
    onError: (error: any) => {
      console.error('Erreur lors de la révocation:', error);
      throw error; // Re-throw for component handling
    }
  });
}

// Révoquer toutes les permissions directes
export function useRevokeAllUserPermissions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      await client.auth.userPermissions.revokeAll(userId, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.userRolesPermissions(variables.userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.userPermissionsList(variables.userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.user(variables.userId) });
      // Don't show toast here, let the component handle it
    },
    onError: (error: any) => {
      console.error('Erreur lors de la révocation de toutes les permissions:', error);
      throw error; // Re-throw for component handling
    }
  });
}

// ========================================
// USER SESSIONS HOOKS
// ========================================

// Query keys pour les sessions
export const userSessionsQueryKeys = {
  all: ['user-sessions'] as const,
  userSessions: (userId: string) => [...userSessionsQueryKeys.all, 'user', userId] as const,
  userActiveSessions: (userId: string) => [...userSessionsQueryKeys.userSessions(userId), 'active'] as const,
  userStats: (userId: string) => [...userSessionsQueryKeys.userSessions(userId), 'stats'] as const,
};

// Récupérer les sessions actives d'un utilisateur avec détails complets
export function useUserActiveSessions(userId: string, enabled = true) {
  return useQuery({
    queryKey: userSessionsQueryKeys.userActiveSessions(userId),
    queryFn: async () => {
      const response = await client.auth.sessions.getUserActiveSessions(userId);
      return response.data;
    },
    enabled: enabled && !!userId,
    refetchInterval: 30000, // Refresh toutes les 30 secondes
  });
}

// Récupérer les statistiques de sessions d'un utilisateur
export function useUserSessionStats(userId: string, enabled = true) {
  return useQuery({
    queryKey: userSessionsQueryKeys.userStats(userId),
    queryFn: async () => {
      const response = await client.auth.sessions.getUserStats(userId);
      return response.data;
    },
    enabled: enabled && !!userId,
  });
}

// Révoquer une session spécifique
export function useRevokeSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, reason }: { sessionId: string; reason?: string }) => {
      await client.auth.sessions.revokeSession(sessionId, reason);
    },
    onSuccess: (_, variables) => {
      // Invalider toutes les requêtes de sessions pour tous les utilisateurs
      queryClient.invalidateQueries({ queryKey: userSessionsQueryKeys.all });
      // Don't show toast here, let the component handle it
    },
    onError: (error: any) => {
      console.error('Erreur lors de la révocation de la session:', error);
      throw error; // Re-throw for component handling
    }
  });
}

// Révoquer toutes les sessions d'un utilisateur
export function useRevokeAllUserSessions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      await client.auth.sessions.revokeAllUserSessions(userId, reason);
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes de sessions pour cet utilisateur
      queryClient.invalidateQueries({ queryKey: userSessionsQueryKeys.userSessions(variables.userId) });
      // Don't show toast here, let the component handle it
    },
    onError: (error: any) => {
      console.error('Erreur lors de la révocation de toutes les sessions:', error);
      throw error; // Re-throw for component handling
    }
  });
}