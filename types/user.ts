// ======================================
// USER TYPES
// ======================================

export type Gender = 'M' | 'F' | 'OTHER'
export type LiteracyLevel = 'NONE' | 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'DELETED'

export interface UserResponse {
  id: string
  code: string
  phoneNumber: string
  email?: string
  firstName: string
  lastName: string
  otherNames?: string
  gender?: Gender
  birthDate?: string
  nationalId?: string
  languagePreference: string
  literacyLevel?: LiteracyLevel
  profilePicture?: string
  lastLoginAt?: string
  lastSyncAt?: string
  status: UserStatus
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateUserRequest {
  code: string
  phoneNumber: string
  email?: string
  firstName: string
  lastName: string
  otherNames?: string
  gender?: Gender
  birthDate?: string
  nationalId?: string
  password: string
  pinCode?: string
  languagePreference?: string
  literacyLevel?: LiteracyLevel
  profilePicture?: string
  metadata?: Record<string, any>
}

export interface UpdateUserRequest {
  email?: string
  firstName?: string
  lastName?: string
  otherNames?: string
  gender?: Gender
  birthDate?: string
  nationalId?: string
  pinCode?: string
  languagePreference?: string
  literacyLevel?: LiteracyLevel
  profilePicture?: string
  status?: UserStatus
  metadata?: Record<string, any>
}

// ======================================
// USER-ORGANIZATION
// ======================================

export interface UserOrganizationResponse {
  id: string
  userId: string
  userCode: string
  userName: string
  userPhoneNumber: string
  organizationId: string
  organizationCode: string
  organizationName: string
  roleId: string
  roleCode: string
  roleName: string
  addedById?: string
  addedByName?: string
  isPrimary: boolean
  isActive: boolean
  joinedAt: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface AddUserToOrganizationRequest {
  userId: string
  roleCode: string
  isPrimary?: boolean
  notes?: string
}

export interface UpdateUserOrganizationRoleRequest {
  roleCode: string
  notes?: string
}

// ======================================
// USER-FARM ACCESS
// ======================================

export interface UserFarmAccessResponse {
  id: string
  userId: string
  userCode: string
  userName: string
  farmId: string
  farmCode: string
  farmName: string
  roleId: string
  roleCode: string
  roleName: string
  grantedById?: string
  grantedByName?: string
  validFrom?: string
  validUntil?: string
  isActive: boolean
  isPrimaryFarm: boolean
  notes?: string
  isValidNow: boolean
  isExpired: boolean
  createdAt: string
  updatedAt?: string
}

export interface GrantFarmAccessRequest {
  roleId: string
  validFrom?: string
  validUntil?: string
  isPrimaryFarm?: boolean
  notes?: string
}
