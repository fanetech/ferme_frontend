// Types pour la réponse des permissions d'un rôle organisées par modules
// Basés sur le DTO Java RolePermissionsResponse

export interface RolePermissionsResponse {
  // Informations du rôle
  roleId: string;
  roleCode: string;
  roleName: string;
  roleDescription?: string;
  roleStatus: string;
  roleType: 'SYSTEM' | 'CUSTOM';
  
  // Modules avec leurs permissions
  modules: ModuleWithPermissions[];
  
  // Résumé statistique
  summary: PermissionsSummary;
}

export interface ModuleWithPermissions {
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  moduleDescription?: string;
  moduleIcon?: string;
  moduleColor?: string;
  displayOrder: number;
  permissions: PermissionDetails[];
}

export interface PermissionDetails {
  permissionId: string;
  permissionCode: string;
  permissionName: string;
  permissionDescription?: string;
  action: string;
  displayOrder: number;
  isSystem: boolean;
  status: string;
  
  // Métadonnées d'attribution
  grantedAt?: string;
  grantedByName?: string;
  reason?: string;
}

export interface PermissionsSummary {
  totalModules: number;
  totalPermissions: number;
  totalSystemPermissions: number;
  totalCustomPermissions: number;
  totalActivePermissions: number;
  totalInactivePermissions: number;
  modulesWithPermissions: number;
  lastModified?: string;
  lastModifiedBy?: string;
}

// Types pour les mutations
export interface UpdateRolePermissionsRequest {
  roleId: string;
  permissionIds: string[];
  reason?: string;
}