// ======================================
// ROLE & PERMISSION TYPES
// ======================================

export interface PermissionResponse {
  id: string
  code: string
  name: string
  description?: string
  module: string
  resource: string
  action: string
  createdAt: string
  updatedAt?: string
}

export interface RoleResponse {
  id: string
  code: string
  name: string
  description?: string
  level?: number
  parentRoleId?: string
  parentRoleName?: string
  isSystem: boolean
  metadata?: Record<string, any>
  permissions: PermissionResponse[]
  createdAt: string
  updatedAt?: string
}

export interface CreateRoleRequest {
  code: string
  name: string
  description?: string
  level?: number
  parentRoleId?: string
  permissionIds?: string[]
  metadata?: Record<string, any>
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  level?: number
  parentRoleId?: string
  permissionIds?: string[]
  metadata?: Record<string, any>
}

export interface AddPermissionsToRoleRequest {
  permissionIds: string[]
}

// ======================================
// MODULE TYPES
// ======================================

export interface ModuleResponse {
  id: string
  code: string
  name: string
  description?: string
  icon?: string
  displayOrder?: number
  active: boolean
  isSystem: boolean
  permissionCount: number
  permissions: PermissionResponse[]
  createdAt: string
  updatedAt?: string
}

export interface CreateModuleRequest {
  code: string
  name: string
  description?: string
  icon?: string
  displayOrder?: number
  permissionIds?: string[]
}

export interface UpdateModuleRequest {
  name?: string
  description?: string
  icon?: string
  displayOrder?: number
  active?: boolean
}
