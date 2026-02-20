// ========================================
// ENUMS
// ========================================

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
  BLOCKED = "BLOCKED"
}

export enum AccountStatus {
  VERIFIED = "VERIFIED",
  UNVERIFIED = "UNVERIFIED",
  LOCKED = "LOCKED",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED"
}

export enum UserType {
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  USER = "USER",
  GUEST = "GUEST",
  SERVICE_ACCOUNT = "SERVICE_ACCOUNT"
}

export enum AuthProvider {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
  MICROSOFT = "MICROSOFT",
  LDAP = "LDAP",
  SAML = "SAML",
  OAUTH2 = "OAUTH2"
}

export enum PermissionType {
  READ = "READ",
  WRITE = "WRITE",
  DELETE = "DELETE",
  EXECUTE = "EXECUTE",
  ADMIN = "ADMIN"
}

export enum ResourceType {
  USER = "USER",
  ROLE = "ROLE",
  STRUCTURE = "STRUCTURE",
  SERVICE = "SERVICE",
  CATEGORY = "CATEGORY",
  TRANSACTION = "TRANSACTION",
  REPORT = "REPORT",
  SYSTEM = "SYSTEM"
}

export enum SessionStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
  IDLE = "IDLE"
}

export enum TwoFactorMethod {
  NONE = "NONE",
  SMS = "SMS",
  EMAIL = "EMAIL",
  AUTHENTICATOR = "AUTHENTICATOR",
  BIOMETRIC = "BIOMETRIC"
}

export enum NotificationPreference {
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH",
  IN_APP = "IN_APP",
  NONE = "NONE"
}

// ========================================
// MAIN ENTITIES
// ========================================

// ========================================
// ROLE SIMPLE DTO (correspond au DTO Java)
// ========================================

export interface SimpleRole {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: string;
  hierarchyLevel: number;
  color?: string;
  icon?: string;
}

// ========================================
// USER INTERFACE (correspond au DTO Java)
// ========================================

export interface User {
  // Identifiants
  id: string;
  code: string;
  email: string;
  
  // Organisation polymorphique
  organizationId: string;
  organizationType: "STRUCTURE" | "SUPER_STRUCTURE";
  organizationName: string;
  organizationCode: string;
  parentSuperStructureId?: string;
  parentSuperStructureName?: string;
  
  // Compatibilité legacy
  structureId?: string;
  structureName?: string;
  structureCode?: string;
  
  // Informations personnelles
  firstName: string;
  lastName: string;
  phone?: string;
  title?: string;
  bio?: string;
  profilePicture?: string;
  birthDate?: string;
  gender?: string;
  
  // Préférences
  language?: string;
  timezone?: string;
  theme?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  
  // Statut et métadonnées
  status: UserStatus;
  accountStatus: string;
  
  // Informations calculées
  fullName: string;
  displayName: string;
  fullDescription?: string;
  roleCodes: string[];
  roles?: SimpleRole[];
  permissions?: string[];
  
  // Authentification et sécurité
  lastLoginAt?: string;
  failedLoginAttempts: number;
  accountLockedUntil?: string;
  passwordChangedAt?: string;
  otpEnabled: boolean;
  preferredOtpChannel?: string;
  locked: boolean;
  phoneVerified?: boolean;
  phoneVerifiedAt?: string;
  emailVerified?: boolean;
  identityVerified?: boolean;
  identityVerifiedAt?: string;
  active: boolean;
  
  // Metadata et tags
  metadata?: Record<string, any>;
  tags?: string[];
  attributes?: Record<string, string>;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  version?: number;
  
  // Session properties
  activeSessions?: number;
}

export interface UserRole {
  id: string;
  code: string;
  name: string;
  description?: string;
  priority?: number;
  isSystem: boolean;
  isDefault: boolean;
  
  // Scope
  structureId?: string;
  superStructureId?: string;
  scope?: string; // GLOBAL, SUPER_STRUCTURE, STRUCTURE
  
  // Permissions
  permissions?: RolePermission[];
  permissionCount?: number;
  
  // Users
  userCount?: number;
  
  // Status
  status: string;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface UserPermission {
  id: string;
  userId?: string;
  roleId?: string;
  resourceType: ResourceType;
  resourceId?: string;
  permissionType: PermissionType;
  
  // Scope
  structureId?: string;
  superStructureId?: string;
  scope?: string;
  
  // Conditions
  conditions?: Record<string, any>;
  validFrom?: string;
  validTo?: string;
  
  // Grant information
  grantedBy?: string;
  grantedAt?: string;
  reason?: string;
  
  // Status
  isActive: boolean;
  isDenied: boolean; // For explicit denials
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  resourceType: ResourceType;
  resourceId?: string;
  permissionType: PermissionType;
  
  // Scope
  scope?: string;
  conditions?: Record<string, any>;
  
  // Status
  isActive: boolean;
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  username?: string;
  userFullName?: string;
  
  // Session Information
  sessionToken: string; // Hashed
  refreshToken?: string; // Hashed
  sessionStatus: SessionStatus;
  
  // Device Information
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  
  // Location
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  
  // Activity
  loginAt: string;
  lastActivityAt: string;
  logoutAt?: string;
  expiresAt: string;
  idleTimeoutAt?: string;
  
  // Security
  isSecure: boolean;
  isTrusted: boolean;
  riskScore?: number;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  
  // Personal Information
  title?: string;
  middleName?: string;
  displayName?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  
  // Contact Information
  personalEmail?: string;
  workEmail?: string;
  homePhone?: string;
  workPhone?: string;
  mobilePhone?: string;
  fax?: string;
  
  // Address Information
  homeAddress?: Address;
  workAddress?: Address;
  billingAddress?: Address;
  shippingAddress?: Address;
  
  // Professional Information
  jobTitle?: string;
  department?: string;
  manager?: string;
  employeeId?: string;
  hireDate?: string;
  workLocation?: string;
  
  // Social Media
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  
  // Preferences
  communicationPreferences?: Record<string, boolean>;
  marketingOptIn?: boolean;
  dataRetentionPreference?: string;
  
  // Documents
  documents?: UserDocument[];
  
  // Custom Fields
  customFields?: Record<string, any>;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
}

export interface Address {
  type?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
  isVerified?: boolean;
}

export interface UserDocument {
  id: string;
  type: string;
  name: string;
  url?: string;
  size?: number;
  mimeType?: string;
  uploadedAt: string;
  expiresAt?: string;
  isVerified?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

// ========================================
// REQUEST/RESPONSE DTOs
// ========================================

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password?: string;
  
  // Account
  userType?: UserType;
  userStatus?: UserStatus;
  authProvider?: AuthProvider;
  
  // Organization
  structureId?: string;
  departmentId?: string;
  
  // Roles
  roleIds?: string[];
  
  // Preferences
  language?: string;
  timezone?: string;
  
  // Options
  sendWelcomeEmail?: boolean;
  requirePasswordChange?: boolean;
  skipEmailVerification?: boolean;
  
  // Metadata
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  title?: string;
  bio?: string;
  birthDate?: string;
  gender?: string;
  profilePicture?: string;
  
  // Account
  userStatus?: UserStatus;
  accountStatus?: AccountStatus;
  
  // Organization
  organizationType?: "STRUCTURE" | "SUPER_STRUCTURE";
  organizationId?: string;
  
  // Roles
  roleIds?: string[];
  
  // Preferences
  language?: string;
  timezone?: string;
  theme?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  
  // Metadata
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  logoutAllSessions?: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserSearchParams {
  page?: number;
  size?: number;
  searchTerm?: string;
  
  // Filters
  userType?: UserType[];
  userStatus?: UserStatus[];
  accountStatus?: AccountStatus[];
  structureId?: string;
  superStructureId?: string;
  roleIds?: string[];
  roleId?: string;
  organizationType?: "STRUCTURE" | "SUPER_STRUCTURE";
  gender?: string;
  
  // Date filters
  createdFrom?: string;
  createdTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
  
  // Verification filters
  emailVerified?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  
  // Activity filters
  isActive?: boolean;
  hasRecentActivity?: boolean;
  
  // Sorting
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  userType: UserType;
  userStatus: UserStatus;
  structureId?: string;
  roleIds: string[];
  language?: string;
  timezone?: string;
  sendWelcomeEmail?: boolean;
  metadata?: Record<string, any>;
}

// ========================================
// SIMPLIFIED DTOs FOR LISTS
// ========================================

export interface UserListItem {
  id: string;
  username: string;
  email: string;
  fullName: string;
  userType: UserType;
  userStatus: UserStatus;
  accountStatus: AccountStatus;
  structureName?: string;
  roles?: string[];
  lastLoginAt?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface UserRoleSummary {
  id: string;
  code: string;
  name: string;
  userCount?: number;
  permissionCount?: number;
  isSystem: boolean;
}

export interface UserSessionSummary {
  id: string;
  userId: string;
  username: string;
  deviceName?: string;
  ipAddress?: string;
  location?: string;
  loginAt: string;
  lastActivityAt: string;
  sessionStatus: SessionStatus;
  isCurrentSession?: boolean;
}

// ========================================
// UTILITY TYPES
// ========================================

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  twoFactorEnabledUsers: number;
  newUsersThisMonth: number;
  activeSessionsCount: number;
  lastUpdate: string;
}

export interface UserActivity {
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface LoginAttempt {
  id: string;
  userId?: string;
  username?: string;
  email?: string;
  ipAddress: string;
  userAgent?: string;
  attemptedAt: string;
  success: boolean;
  failureReason?: string;
  riskScore?: number;
  blocked?: boolean;
}

// ========================================
// FILTERS AND CONFIGS
// ========================================

export interface UserFilterConfig {
  userTypes?: Array<{ value: UserType; label: string }>;
  userStatuses?: Array<{ value: UserStatus; label: string }>;
  accountStatuses?: Array<{ value: AccountStatus; label: string }>;
  structures?: Array<{ id: string; name: string }>;
  roles?: Array<{ id: string; name: string }>;
}

export interface UserFormConfig {
  mode: 'create' | 'edit';
  userType?: UserType;
  structureId?: string;
  availableRoles?: UserRole[];
  requirePassword?: boolean;
  allowPasswordChange?: boolean;
}

export interface PermissionCheckRequest {
  userId: string;
  resourceType: ResourceType;
  resourceId?: string;
  permissionType: PermissionType;
  context?: Record<string, any>;
}

export interface PermissionCheckResponse {
  allowed: boolean;
  reason?: string;
  appliedRules?: string[];
  effectivePermissions?: string[];
}

// ========================================
// PAGINATION RESPONSE
// ========================================

export interface PaginatedUsersResponse {
  content: User[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// ========================================
// RESPONSE TYPES FOR DATA LAYER
// ========================================

export interface UsersListResponse {
  content: User[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface UserPermissionsResponse {
  permissions: UserPermission[];
  roles: UserRole[];
  effectivePermissions: string[];
  inheritedPermissions: UserPermission[];
  directPermissions: UserPermission[];
}

export interface UserSessionsResponse {
  sessions: UserSession[];
  activeSessions: UserSession[];
  totalSessions: number;
  currentSessionId?: string;
}

export interface UserActivityResponse {
  activities: UserActivity[];
  totalActivities: number;
  page: number;
  size: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface UpdateUserPermissionsRequest {
  roleIds?: string[];
  directPermissions?: {
    resourceType: ResourceType;
    resourceId?: string;
    permissionType: PermissionType;
    scope?: string;
    conditions?: Record<string, any>;
  }[];
  revokedPermissions?: string[];
}

// Re-export common paginated response type
export type { PaginatedResponse } from "./organization";