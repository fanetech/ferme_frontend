import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import useAuth from '@/store/useAuth';

const FARM_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

const Axios = axios.create({
  baseURL: FARM_API_URL,
  timeout: 30000,
});

// Attach access token from cookie on every request
Axios.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh on 401, handle common error codes
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = Cookies.get('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${FARM_API_URL}/v1/auth/refresh`, { refreshToken: refresh });
          const newToken = data.data?.accessToken;
          if (newToken) {
            Cookies.set('access_token', newToken, { expires: 1 / 24 });
            original.headers.Authorization = `Bearer ${newToken}`;
            return Axios(original);
          }
        } catch {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          useAuth.getState().logoutUser?.();
        }
      }
      toast.error('Session expirée, veuillez vous reconnecter', { position: 'top-center' });
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
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
