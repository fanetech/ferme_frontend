export interface PermissionSummary {
  id: string;
  code: string;
  name: string;
  description?: string;
  action: string;
  displayOrder?: number;
  status: string;
  isSystem?: boolean;
  totalRoles?: number;
  totalDirectUsers?: number;
  fullCode: string;
}

export interface ModulePermissionsResponse {
  // Informations module
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  moduleDescription?: string;
  displayOrder?: number;
  status: string;
  isSystem?: boolean;
  
  // Permissions du module
  permissions: PermissionSummary[];
  
  // Statistiques
  totalPermissions: number;
  activePermissions: number;
}

// Interface pour l'assignation de permissions directes (mise à jour selon le backend Java)
export interface AssignUserPermissionRequest {
  userId: string;
  permissionId: string;
  permissionType?: 'DIRECT' | 'TEMPORARY';
  reason?: string;
  validFrom?: string; // ISO date string
  expiresAt?: string; // ISO date string
}

export interface RemoveDirectPermissionRequest {
  userId: string;
  permissionId: string;
}

// Interface pour la réponse d'une permission utilisateur
export interface UserPermissionResponse {
  id: string;
  userId: string;
  permissionId: string;
  permissionType: string;
  status: string;
  reason?: string;
  validFrom?: string;
  expiresAt?: string;
  grantedBy?: string;
  grantedAt?: string;
  isActive: boolean;
  isExpired: boolean;
  isTemporary: boolean;
}

// Interface pour les données du formulaire d'assignation
export interface AssignPermissionFormData {
  permissionType: 'DIRECT' | 'TEMPORARY';
  reason: string;
  validFrom?: Date;
  expiresAt?: Date;
}