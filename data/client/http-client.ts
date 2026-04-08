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

// Auto-refresh on 401, handle common error codes
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Skip auth endpoints to avoid infinite loops
    const isAuthEndpoint = original?.url?.includes('/auth/');

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      const refresh = Cookies.get('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${FARM_API_URL}/v1/auth/refresh`, { refreshToken: refresh });
          const newToken = data.data?.accessToken;
          if (newToken) {
            Cookies.set('access_token', newToken, { expires: 1 / 24, path: '/', sameSite: 'lax' });
            original.headers.Authorization = `Bearer ${newToken}`;
            return Axios(original);
          }
        } catch {
          // Refresh failed — force logout
          forceLogout();
          return Promise.reject(error);
        }
      }
      // No refresh token — force logout
      forceLogout();
      return Promise.reject(error);
    }

    // Expired JWT also comes as 401 on retry or 403 with specific message
    if (error.response?.status === 401 && original._retry) {
      forceLogout();
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      const message = error.response?.data?.message || '';
      // Expired JWT sometimes returns 403
      if (message.toLowerCase().includes('expired') || message.toLowerCase().includes('jwt')) {
        forceLogout();
        return Promise.reject(error);
      }
      toast.error("Vous n'avez pas les droits pour effectuer cette action", { position: 'top-center' });
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
