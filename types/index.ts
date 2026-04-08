// ======================================
// STANDARD API RESPONSE
// ======================================

export interface ApiResponse<T = any> {
  success: boolean
  status: number
  message: string
  data?: T
}

export interface PagedData<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

export type PaginatedResponse<T> = PagedData<T>

// ======================================
// COMMON
// ======================================

export interface GpsPoint {
  latitude: number
  longitude: number
}

export interface GpsBoundary {
  points: GpsPoint[]
}

// ======================================
// JWT PAYLOAD (decoded from token)
// ======================================

export interface JwtPayload {
  sub: string          // UUID on develop, phone on koumbem
  userId: string       // UUID
  phoneNumber?: string
  firstName?: string
  lastName?: string
  code?: string
  roles: string[]
  permissions: string[]
  tokenType?: string
  exp: number
}

// ======================================
// AUTH TYPES
// ======================================

export interface LoginRequest {
  phoneNumber: string
  password?: string
  pinCode?: string
  deviceId?: string
  deviceName?: string
  deviceType?: string
}

export interface LoginResponse {
  userId: string
  code: string
  firstName: string
  lastName: string
  email?: string
  phoneNumber: string
  status: string
  languagePreference: string
  profilePicture?: string
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  roles: string[]
  permissions: string[]
  currentOrganizationId?: string
  currentOrganizationName?: string
  currentFarmId?: string
  currentFarmName?: string
  lastLoginAt?: string
  lastSyncAt?: string
  message?: string
  success?: boolean
}

export interface RegisterRequest {
  code: string
  firstName: string
  lastName: string
  email?: string
  phoneNumber: string
  password: string
  passwordConfirmation: string
  languagePreference?: string
  pinCode?: string
}

export interface RegisterResponse {
  userId: string
  code: string
  firstName: string
  lastName: string
  email?: string
  phoneNumber: string
  roles: string[]
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  message?: string
  success?: boolean
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface User {
  id: string
  code?: string
  firstName?: string
  lastName?: string
  phoneNumber: string
  roles: string[]
  permissions: string[]
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  isLoading: boolean
  permissions: string[]
  roles: string[]
}

// ======================================
// ERROR TYPES
// ======================================

export interface ApiError {
  success: false
  status: number
  message: string
  errors?: Record<string, string[]>
}

// ======================================
// RE-EXPORTS FROM SUBMODULES
// ======================================

export * from './user'
export * from './role'
export * from './organization'
export * from './farm'
export * from './crop'
export * from './livestock'
export * from './inventory'
export * from './hr'
export * from './marketplace'
export * from './iot'
export * from './notification'
