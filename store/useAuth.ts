import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import type { User, AuthState, JwtPayload, LoginResponse } from '@/types'

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
    const token = Cookies.get('access_token')
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token)
        if (decoded.exp * 1000 > Date.now()) {
          const user: User = {
            id: decoded.userId,
            phoneNumber: decoded.sub,
            roles: decoded.roles ?? [],
            permissions: decoded.permissions ?? [],
          }
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
        // Invalid token — fall through to clear state
      }
    }
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    set({ user: null, token: null, isLoggedIn: false, permissions: [], roles: [], isLoading: false })
  },

  loginUser(response: LoginResponse) {
    try {
      const decoded = jwtDecode<JwtPayload>(response.accessToken)
      const user: User = {
        id: decoded.userId,
        phoneNumber: decoded.sub,
        roles: decoded.roles ?? [],
        permissions: decoded.permissions ?? [],
      }
      set({
        user,
        token: response.accessToken,
        isLoggedIn: true,
        permissions: decoded.permissions ?? [],
        roles: decoded.roles ?? [],
        isLoading: false,
      })
    } catch {
      // JWT decode failed
    }
  },

  logoutUser() {
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
