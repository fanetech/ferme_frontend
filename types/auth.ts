// ========================================
// ROLE TYPES
// ========================================

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: string;
  hierarchyLevel: number;
  isSystem: boolean;
  isDefault: boolean;
  color?: string;
  icon?: string;
  canBeDeleted: boolean;
  displayName?: string;
  isActive: boolean;
  type?: string; 
  userCount: BigInteger;
  level: BigInteger;
  ownerCode: string;
  ownerType: string;
  isSystemRole: boolean;
  
  // Statistiques d'utilisation
  totalUsers?: number;
  activeUsers?: number;
  totalPermissions?: number;
  activePermissions?: number;
  
  // Informations additionnelles
  source?: string; // "Système", "Super Structure", etc.
  permissionCodes?: string[];
}

export interface AssignableRolesParams {
  targetOrganizationType: "STRUCTURE" | "SUPER_STRUCTURE";
  targetOrganizationId: string;
}

export interface AssignableRolesResponse {
  success: boolean;
  status: number;
  message: string;
  data: Role[];
}

// ========================================
// ROLE STATUS TYPES
// ========================================

export enum RoleStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

// ========================================
// PERMISSION TYPES
// ========================================

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  resourceType: string;
  permissionType: string;
  isActive: boolean;
}

export interface RolePermission {
  id: string;
  roleId: string;
  resourceType: string;
  resourceId?: string;
  permissionType: string;
  scope?: string;
  conditions?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}