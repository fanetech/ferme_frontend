import { API_ENDPOINTS } from "./endpoints";
import { HttpClient } from "./http-client";
import Cookies from "js-cookie";
import type { ApiResponse, LoginResponse } from "@/types";

class Client {
  auth = {
    login: async (payload: { phoneNumber: string; password: string }): Promise<ApiResponse<LoginResponse>> => {
      const data = await HttpClient.post<ApiResponse<LoginResponse>>(API_ENDPOINTS.auth.login, payload);
      if (data.success && data.data) {
        Cookies.set("access_token", data.data.accessToken, { expires: 1 / 24 });
        Cookies.set("refresh_token", data.data.refreshToken, { expires: 30 });
      }
      return data;
    },

    logout: async (): Promise<void> => {
      try {
        await HttpClient.post(API_ENDPOINTS.auth.logout, {});
      } finally {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
      }
    },

    logoutAll: async (): Promise<void> => {
      try {
        await HttpClient.post(API_ENDPOINTS.auth.logoutAll, {});
      } finally {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
      }
    },

    forgotPassword: async (phoneNumber: string): Promise<ApiResponse<any>> => {
      return await HttpClient.post<ApiResponse<any>>(API_ENDPOINTS.auth.forgotPassword, { phoneNumber });
    },

    resetPassword: async (payload: { token: string; newPassword: string }): Promise<ApiResponse<any>> => {
      return await HttpClient.post<ApiResponse<any>>(API_ENDPOINTS.auth.resetPassword, payload);
    },

    changePassword: async (payload: { currentPassword: string; newPassword: string }): Promise<ApiResponse<any>> => {
      return await HttpClient.post<ApiResponse<any>>(API_ENDPOINTS.auth.changePassword, payload);
    },

    setPin: async (payload: { pin: string; password: string }): Promise<ApiResponse<any>> => {
      return await HttpClient.post<ApiResponse<any>>(API_ENDPOINTS.auth.pin.set, payload);
    },

    updatePin: async (payload: { currentPin: string; newPin: string }): Promise<ApiResponse<any>> => {
      return await HttpClient.put<ApiResponse<any>>(API_ENDPOINTS.auth.pin.update, payload);
    },

    removePin: async (payload: { pin: string }): Promise<ApiResponse<any>> => {
      return await HttpClient.delete<ApiResponse<any>>(API_ENDPOINTS.auth.pin.remove, { data: payload });
    },
  };
}

export const farmClient = new Client();
export default farmClient;
