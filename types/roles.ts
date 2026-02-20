// Types pour la gestion des rôles
// Basés sur les DTOs Java du RoleController

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: 'SYSTEM' | 'CUSTOM';
  level: number;
  isActive: boolean;
  isSystemRole: boolean;
  canBeDeleted: boolean;
  userCount: number;
  permissionCount: number;
  permissions: PermissionInfo[];
  statistics?: RoleStatistics;
  metadata?: RoleMetadata;
  // Nouveaux champs pour l'organisation propriétaire
  ownerId?: string;
  ownerType?: 'STRUCTURE' | 'SUPER_STRUCTURE';
  isInheritable?: boolean;
  // Dates de création et modification
  createdAt?: string;
  createdBy?: string;
  lastModifiedAt?: string;
}

export interface PermissionInfo {
  id: string;
  code: string;
  name: string;
  module: string;
}

export interface RoleStatistics {
  totalPermissions: number;
  modulesCovered: string[];
  activeUsers: number;
  inactiveUsers: number;
  lastAssignedAt?: string;
}

export interface RoleMetadata {
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Types pour la liste des rôles
export interface RoleSummary {
  id: string;
  name: string;
  displayName: string;
  type: 'SYSTEM' | 'CUSTOM';
  userCount: number;
  isActive: boolean;
  canBeDeleted: boolean;
  permissionCount: number;
  
  // NOUVELLES PROPRIÉTÉS D'OWNERSHIP
  ownerId?: string;
  ownerType?: 'STRUCTURE' | 'SUPER_STRUCTURE';
  ownerName?: string;
  ownerCode?: string;
}

export interface RoleListResponse {
  roles: RoleSummary[];
  pagination: PaginationInfo;
  summary: RoleSummaryStats;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface RoleSummaryStats {
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
  activeRoles: number;
  totalUsersWithRoles: number;
}

// Types pour les requêtes
export interface CreateRoleRequest {
  name: string;
  displayName: string;
  description?: string;
  level: number;
  isActive: boolean;
  permissionIds?: string[];
  // Organisation propriétaire (obligatoire)
  ownerId: string;
  ownerType: 'STRUCTURE' | 'SUPER_STRUCTURE';
  isInheritable?: boolean;
}

export interface UpdateRoleRequest {
  name?: string; // Peut être modifié pour les rôles non-système
  displayName?: string;
  description?: string;
  level?: number;
  isActive?: boolean;
  isInheritable?: boolean; // Modifiable pour les rôles SUPER_STRUCTURE
  // Note: ownerType et ownerId ne sont pas modifiables après création
}

// Types pour les paramètres de recherche
export interface RoleSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  type?: 'SYSTEM' | 'CUSTOM';
  active?: boolean;
  search?: string;
  
  // NOUVEAUX FILTRES D'OWNERSHIP
  ownerId?: string;
  ownerType?: 'STRUCTURE' | 'SUPER_STRUCTURE';
}

// Types pour la duplication
export interface DuplicateRoleRequest {
  newName: string;
  newDisplayName: string;
}

// Types pour la suppression avec réassignation
export interface DeleteRoleRequest {
  reassignToRoleId?: string;
  reason?: string;
}

// Types pour les permissions par module
export interface ModulePermission {
  id: string;
  code: string;
  name: string;
  description?: string;
  isGranted: boolean;
}

export interface ModulePermissionsGroup {
  moduleName: string;
  moduleDisplayName: string;
  permissions: ModulePermission[];
}

// Types pour les utilisateurs d'un rôle
export interface RoleUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  assignedAt: string;
  assignedBy?: string;
}

