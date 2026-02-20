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

// Backward compat alias
export type PaginatedResponse<T> = PagedData<T>

// ======================================
// JWT PAYLOAD (decoded from token)
// ======================================

export interface JwtPayload {
  sub: string          // phone number
  userId: number
  roles: string[]
  permissions: string[]
  exp: number
}

// ======================================
// AUTH TYPES
// ======================================

export interface LoginRequest {
  phoneNumber: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType?: string
  expiresIn?: number
}

export interface User {
  id: number
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
// ACCOUNT STATUS CODES (kept for http-client backward compat)
// ======================================

export const ACCOUNT_STATUS_CODES = {
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  FIRST_LOGIN_PASSWORD_CHANGE_REQUIRED: 'FIRST_LOGIN_PASSWORD_CHANGE_REQUIRED',
} as const

export type AccountStatusCode = keyof typeof ACCOUNT_STATUS_CODES

// ======================================
// RE-EXPORTS FROM SUBMODULES
// ======================================

export * from './terminal'
