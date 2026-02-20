import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import type {
  Role,
  RoleListResponse,
  RoleSearchParams,
  CreateRoleRequest,
  UpdateRoleRequest,
  DuplicateRoleRequest,
  DeleteRoleRequest
} from "@/types/roles";
import { toast } from "sonner";

// ========================================
// QUERY KEYS
// ========================================

export const roleQueryKeys = {
  all: ['roles'] as const,
  lists: () => [...roleQueryKeys.all, 'list'] as const,
  list: (params?: RoleSearchParams) => [...roleQueryKeys.lists(), params] as const,
  details: () => [...roleQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleQueryKeys.details(), id] as const,
  permissions: (id: string) => [...roleQueryKeys.detail(id), 'permissions'] as const,
  users: (id: string) => [...roleQueryKeys.detail(id), 'users'] as const,
  active: () => [...roleQueryKeys.all, 'active'] as const,
  assignable: (userMaxLevel: number) => [...roleQueryKeys.all, 'assignable', userMaxLevel] as const,
};

// ========================================
// HOOKS POUR LES RÔLES
// ========================================

// Lister les rôles avec pagination et filtres
export function useRoles(params?: RoleSearchParams, enabled = true) {
  return useQuery({
    queryKey: roleQueryKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.append('page', params.page.toString());
      if (params?.size !== undefined) searchParams.append('size', params.size.toString());
      if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params?.sortDir) searchParams.append('sortDir', params.sortDir);
      if (params?.type) searchParams.append('type', params.type);
      if (params?.active !== undefined) searchParams.append('active', params.active.toString());
      if (params?.search) searchParams.append('search', params.search);
      
      // NOUVEAUX PARAMÈTRES D'OWNERSHIP
      if (params?.ownerId) searchParams.append('ownerId', params.ownerId);
      if (params?.ownerType) searchParams.append('ownerType', params.ownerType);

      const response = await client.auth.roles.list(searchParams);
      return response.data;
    },
    enabled,
    staleTime: 30000, // 30 secondes
  });
}

// Récupérer un rôle par son ID
export function useRole(id: string, enabled = true) {
  return useQuery({
    queryKey: roleQueryKeys.detail(id),
    queryFn: async () => {
      const response = await client.auth.roles.get(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 60000, // 1 minute
  });
}

// Lister tous les rôles actifs (sans pagination)
export function useActiveRoles(enabled = true) {
  return useQuery({
    queryKey: roleQueryKeys.active(),
    queryFn: async () => {
      const response = await client.auth.roles.getAllActive();
      return response.data;
    },
    enabled,
    staleTime: 300000, // 5 minutes
  });
}

// Lister les rôles assignables selon le niveau hiérarchique
export function useAssignableRoles(userMaxLevel: number, enabled = true) {
  return useQuery({
    queryKey: roleQueryKeys.assignable(userMaxLevel),
    queryFn: async () => {
      const response = await client.auth.roles.getAssignable(userMaxLevel);
      return response.data;
    },
    enabled: enabled && !!userMaxLevel,
    staleTime: 300000, // 5 minutes
  });
}

// Récupérer les permissions d'un rôle organisées par modules
export function useRolePermissions(roleId: string, enabled = true) {
  return useQuery({
    queryKey: roleQueryKeys.permissions(roleId),
    queryFn: async () => {
      const response = await client.auth.roles.getPermissions(roleId);
      return response.data as import("@/types/role-permissions").RolePermissionsResponse;
    },
    enabled: enabled && !!roleId,
    staleTime: 60000, // 1 minute
  });
}

// Récupérer TOUS les modules avec leurs permissions disponibles
export function useAllModulesWithPermissions(activeOnly = true, enabled = true) {
  return useQuery({
    queryKey: ['modules', 'permissions', activeOnly],
    queryFn: async () => {
      const response = await client.auth.modules.getWithPermissions(activeOnly);
      return response.data;
    },
    enabled,
    staleTime: 300000, // 5 minutes car ça change rarement
  });
}

// Récupérer les utilisateurs d'un rôle
export function useRoleUsers(roleId: string, page = 0, size = 20, enabled = true) {
  return useQuery({
    queryKey: roleQueryKeys.users(roleId),
    queryFn: async () => {
      const response = await client.auth.roles.getUsers(roleId, page, size);
      return response.data;
    },
    enabled: enabled && !!roleId,
    staleTime: 30000, // 30 secondes
  });
}

// ========================================
// MUTATIONS POUR LES RÔLES
// ========================================

// Créer un nouveau rôle
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleRequest) => {
      const response = await client.auth.roles.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalider les listes de rôles pour les recharger
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.active() });
    },
  });
}

// Mettre à jour un rôle
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoleRequest }) => {
      const response = await client.auth.roles.update(id, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // Invalider les données du rôle spécifique et les listes
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.active() });
    },
  });
}

// Supprimer un rôle
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reassignToRoleId }: { id: string; reassignToRoleId?: string }) => {
      const response = await client.auth.roles.delete(id, reassignToRoleId);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // Retirer le rôle du cache et invalider les listes
      queryClient.removeQueries({ queryKey: roleQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.active() });
    },
  });
}

// Activer un rôle
export function useActivateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.auth.roles.activate(id);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.active() });
    },
  });
}

// Désactiver un rôle
export function useDeactivateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.auth.roles.deactivate(id);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.active() });
    },
  });
}

// Dupliquer un rôle
export function useDuplicateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newName, newDisplayName }: { id: string; newName: string; newDisplayName: string }) => {
      const response = await client.auth.roles.duplicate(id, newName, newDisplayName);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.active() });
    },
  });
}

// Ajouter une permission à un rôle
export function useAddPermissionToRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
      const response = await client.auth.roles.addPermission(roleId, permissionId);
      return response.data;
    },
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.permissions(roleId) });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
    },
  });
}

// Retirer une permission d'un rôle
export function useRemovePermissionFromRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
      const response = await client.auth.roles.removePermission(roleId, permissionId);
      return response.data;
    },
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.permissions(roleId) });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
    },
  });
}

// Mettre à jour toutes les permissions d'un rôle en une fois
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => {
      // Récupérer les permissions actuelles
      const currentPermissionsResponse = await client.auth.roles.getPermissions(roleId);
      const currentPermissions = new Set<string>();
      
      if (currentPermissionsResponse.data?.modules) {
        currentPermissionsResponse.data.modules.forEach(module => {
          module.permissions.forEach(permission => {
            currentPermissions.add(permission.permissionId);
          });
        });
      }
      
      const newPermissions = new Set(permissionIds);
      
      // Permissions à ajouter
      const toAdd = permissionIds.filter(id => !currentPermissions.has(id));
      
      // Permissions à retirer
      const toRemove = Array.from(currentPermissions).filter(id => !newPermissions.has(id));
      
      // Exécuter toutes les opérations
      const promises = [];
      
      for (const permissionId of toAdd) {
        promises.push(client.auth.roles.addPermission(roleId, permissionId));
      }
      
      for (const permissionId of toRemove) {
        promises.push(client.auth.roles.removePermission(roleId, permissionId));
      }
      
      await Promise.all(promises);
      
      return { added: toAdd.length, removed: toRemove.length };
    },
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.permissions(roleId) });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
    },
    onError: (error: any) => {
      toast.dismiss();
      // Gestion des erreurs specifiques
      let errorMessage = "Erreur lors de l'enregistrement";
      
      if (error?.response?.data?.message) {
        errorMessage = error?.response?.data?.message;
      }else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    },
  });
}

// ========================================
// HOOKS UTILITAIRES
// ========================================

// Hook pour vérifier si un nom de rôle est disponible
export function useCheckRoleCode(code: string, excludeId?: string, enabled = true) {
  return useQuery({
    queryKey: ['roles', 'check-code', code, excludeId],
    queryFn: async () => {
      const response = await client.auth.roles.checkCode(code, excludeId);
      return response.data;
    },
    enabled: enabled && !!code && code.length >= 3,
    staleTime: 10000, // 10 secondes
  });
}