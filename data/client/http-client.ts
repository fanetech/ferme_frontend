import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import useAuth from '@/store/useAuth';

// Use relative /api path so requests go through Next.js proxy (avoids CORS)
const FARM_API_URL = typeof window !== 'undefined' ? '/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api');

const Axios = axios.create({
  baseURL: FARM_API_URL,
  timeout: 30000,
});

// Attach access token on every request (cookie first, then Zustand store fallback)
Axios.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token') || useAuth.getState().getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Force logout and redirect to login
function forceLogout() {
  useAuth.getState().logoutUser();
  toast.error('Session expirée, veuillez vous reconnecter', { position: 'top-center' });
  if (typeof window !== 'undefined') {
    window.location.href = '/dashboard/login/v2';
  }
}

// Try to refresh the access token using the refresh token
async function tryRefreshToken(original: any): Promise<boolean> {
  const refresh = Cookies.get('refresh_token');
  if (!refresh) return false;

  try {
    const { data } = await axios.post(`${FARM_API_URL}/v1/auth/refresh`, { refreshToken: refresh });
    const newToken = data.data?.accessToken;
    const newRefresh = data.data?.refreshToken;
    if (newToken) {
      Cookies.set('access_token', newToken, { expires: 1 / 24, path: '/', sameSite: 'lax' });
      if (newRefresh) {
        Cookies.set('refresh_token', newRefresh, { expires: 30, path: '/', sameSite: 'lax' });
      }
      // Update localStorage session with new token
      try {
        const raw = localStorage.getItem('farm_auth_session');
        if (raw) {
          const session = JSON.parse(raw);
          session.token = newToken;
          localStorage.setItem('farm_auth_session', JSON.stringify(session));
        }
      } catch {}
      useAuth.getState().token && useAuth.setState({ token: newToken });
      original.headers.Authorization = `Bearer ${newToken}`;
      return true;
    }
  } catch {
    // Refresh token also expired or invalid
  }
  return false;
}

// Auto-refresh on 401/403, handle common error codes
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthEndpoint = original?.url?.includes('/auth/');
    const hadToken = !!original?.headers?.Authorization;

    // Detect expired token: 401, or 403 with empty body when we sent a token
    const is401 = status === 401;
    const is403Expired = status === 403 && hadToken && (!error.response?.data || !error.response?.data?.message);

    if ((is401 || is403Expired) && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      // Try refresh
      const refreshed = await tryRefreshToken(original);
      if (refreshed) {
        return Axios(original); // Retry the original request with new token
      }

      // Refresh failed — force logout
      forceLogout();
      return Promise.reject(error);
    }

    // Already retried and still failing
    if ((is401 || is403Expired) && original._retry) {
      forceLogout();
      return Promise.reject(error);
    }

    // Real 403 (permission denied, not expired token)
    if (status === 403 && !is403Expired) {
      const message = error.response?.data?.message || '';
      toast.error(message || "Vous n'avez pas les droits pour effectuer cette action", { position: 'top-center' });
      return Promise.reject(error);
    }

    if (error.response?.status === 413) {
      toast.error('La taille du fichier dépasse la limite autorisée');
      return Promise.reject(error);
    }

    if (error.code === 'ERR_NETWORK') {
      toast.error('Erreur de connexion réseau. Vérifiez votre connexion.', { position: 'top-center' });
    }

    return Promise.reject(error);
  }
);

export class HttpClient {
  static async get<T>(url: string, options?: any) {
    const response = await Axios.get<T>(url, options);
    return response.data;
  }

  static async post<T>(url: string, data: unknown, options?: any) {
    const defaultOptions = data instanceof FormData ? {} : { headers: { 'Content-Type': 'application/json' } };
    const response = await Axios.post<T>(url, data, { ...defaultOptions, ...options });
    return response.data;
  }

  static async put<T>(url: string, data: unknown, options?: any) {
    const defaultOptions = data instanceof FormData ? {} : { headers: { 'Content-Type': 'application/json' } };
    const response = await Axios.put<T>(url, data, { ...defaultOptions, ...options });
    return response.data;
  }

  static async delete<T>(url: string, options?: any) {
    const response = await Axios.delete<T>(url, options);
    return response.data;
  }

  static async getBlob(url: string, options?: any): Promise<Blob> {
    const response = await Axios.get(url, { responseType: 'blob', ...options });
    return response.data;
  }
}

export default Axios;
