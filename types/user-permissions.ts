export interface PermissionDetails {
  permissionId: string;
  permissionCode: string;
  permissionName: string;
  permissionDescription?: string;
  action: string;
  displayOrder?: number;
  isSystem?: boolean;
  
  // Champs spécifiques aux permissions directes
  isDirect?: boolean;
  reason?: string;
  permissionType?: 'DIRECT' | 'TEMPORARY';
  
  // Champs temporels
  validFrom?: string;
  expiresAt?: string;
  grantedAt?: string;
  grantedByName?: string;
  
  // Statuts calculés pour les permissions temporaires
  isExpired?: boolean;
  isValidNow?: boolean;
}

export interface ModuleWithPermissions {
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  moduleDescription?: string;
  moduleIcon?: string;
  moduleColor?: string;
  displayOrder?: number;
  permissions: PermissionDetails[];
}

export interface RoleWithModules {
  roleId: string;
  roleCode: string;
  roleName: string;
  roleDescription?: string;
  roleStatus: string;
  modules: ModuleWithPermissions[];
}

export interface DirectPermissionsByModules {
  modules: ModuleWithPermissions[];
}

export interface PermissionsSummary {
  totalRoles: number;
  totalModules: number;
  totalRolePermissions: number;
  totalDirectPermissions: number;
  totalPermanentDirectPermissions: number;
  totalTemporaryPermissions: number;
  totalPermissions: number;
  modulesWithRolePermissions: number;
  modulesWithDirectPermissions: number;
}

export interface UserRolesPermissionsResponse {
  // Informations utilisateur
  userId: string;
  userEmail: string;
  userFullName: string;
  userOrganization: string;
  
  // Rôles avec permissions par modules
  roles: RoleWithModules[];
  
  // Permissions directes par modules
  directPermissions: DirectPermissionsByModules;
  
  // Résumé
  summary: PermissionsSummary;
}

// Interfaces pour la révocation des permissions
export interface RevokePermissionRequest {
  userId: string;
  permissionId: string;
  reason?: string;
}

export interface RevokeAllDirectPermissionsRequest {
  userId: string;
  reason?: string;
}