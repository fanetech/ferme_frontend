import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import type { User, AuthState, JwtPayload, LoginResponse } from '@/types'

const AUTH_STORAGE_KEY = 'farm_auth_session'

interface StoredSession {
  user: User
  token: string
  permissions: string[]
  roles: string[]
  expiresAt: number // ms timestamp
}

function saveSession(session: StoredSession) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  } catch {}
}

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const session: StoredSession = JSON.parse(raw)
    // Check expiration
    if (session.expiresAt && session.expiresAt <= Date.now()) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

function clearSession() {
  try { localStorage.removeItem(AUTH_STORAGE_KEY) } catch {}
}

interface AuthActions {
  initialize: () => void
  loginUser: (response: LoginResponse) => void
  logoutUser: () => void
  removeData: () => void
  clear: () => void
  setLoading: (isLoading: boolean) => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  getToken: () => string | null
}

const useAuth = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  isLoading: true,
  permissions: [],
  roles: [],

  initialize() {
    // Already authenticated by loginUser() in this session
    if (get().isLoggedIn && get().token) {
      set({ isLoading: false })
      return
    }

    // 1. Try to restore from localStorage (survives refresh)
    const stored = loadSession()
    if (stored && stored.token) {
      // Also ensure the cookie is still present (for API calls)
      if (!Cookies.get('access_token')) {
        Cookies.set('access_token', stored.token, { expires: 1 / 24, path: '/', sameSite: 'lax' })
      }
      set({
        user: stored.user,
        token: stored.token,
        isLoggedIn: true,
        permissions: stored.permissions,
        roles: stored.roles,
        isLoading: false,
      })
      return
    }

    // 2. Fallback: try to decode from cookie (e.g. if localStorage was cleared)
    const token = Cookies.get('access_token')
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token)
        const isExpired = decoded.exp != null && decoded.exp * 1000 <= Date.now()
        if (!isExpired) {
          const user: User = {
            id: decoded.userId || decoded.sub,
            code: decoded.code,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            phoneNumber: decoded.phoneNumber || decoded.sub || '',
            roles: decoded.roles ?? [],
            permissions: decoded.permissions ?? [],
          }
          // Save to localStorage for next refresh
          saveSession({
            user,
            token,
            permissions: decoded.permissions ?? [],
            roles: decoded.roles ?? [],
            expiresAt: decoded.exp * 1000,
          })
          set({
            user,
            token,
            isLoggedIn: true,
            permissions: decoded.permissions ?? [],
            roles: decoded.roles ?? [],
            isLoading: false,
          })
          return
        }
      } catch {
        // Invalid token
      }
    }

    // 3. No valid session found
    clearSession()
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    set({ user: null, token: null, isLoggedIn: false, permissions: [], roles: [], isLoading: false })
  },

  loginUser(response: LoginResponse) {
    const user: User = {
      id: response.userId,
      code: response.code,
      firstName: response.firstName,
      lastName: response.lastName,
      phoneNumber: response.phoneNumber,
      roles: response.roles ?? [],
      permissions: response.permissions ?? [],
    }

    // Decode token to get expiration
    let expiresAt = Date.now() + 3600 * 1000 // default 1h
    try {
      const decoded = jwtDecode<JwtPayload>(response.accessToken)
      if (decoded.exp) expiresAt = decoded.exp * 1000
    } catch {}

    // Persist to localStorage
    saveSession({
      user,
      token: response.accessToken,
      permissions: response.permissions ?? [],
      roles: response.roles ?? [],
      expiresAt,
    })

    set({
      user,
      token: response.accessToken,
      isLoggedIn: true,
      permissions: response.permissions ?? [],
      roles: response.roles ?? [],
      isLoading: false,
    })
  },

  logoutUser() {
    clearSession()
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    set({ user: null, token: null, isLoggedIn: false, permissions: [], roles: [], isLoading: false })
  },

  removeData() {
    get().logoutUser()
  },

  clear() {
    get().logoutUser()
  },

  setLoading: (isLoading) => set({ isLoading }),

  hasPermission: (permission) => get().permissions.includes(permission),
  hasRole: (role) => get().roles.includes(role),
  hasAnyPermission: (perms) => perms.some((p) => get().permissions.includes(p)),
  hasAllPermissions: (perms) => perms.every((p) => get().permissions.includes(p)),
  getToken: () => get().token,
}))

export default useAuth
