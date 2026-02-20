import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { farmClient } from "@/data/client";
import useAuth from "@/store/useAuth";
import { AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/constants/routes";

// ======================================
// QUERY KEYS
// ======================================

export const AUTH_QUERY_KEYS = {
  LOGIN: ["auth", "login"],
  LOGOUT: ["auth", "logout"],
  FORGOT_PASSWORD: ["auth", "forgot-password"],
  CHANGE_PASSWORD: ["auth", "change-password"],
} as const;

// ======================================
// LOGIN MUTATION
// ======================================

export function useLoginMutation() {
  const router = useRouter();
  const { loginUser, setLoading } = useAuth();

  return useMutation({
    mutationKey: AUTH_QUERY_KEYS.LOGIN,
    mutationFn: async (data: { phoneNumber: string; password: string }) => {
      setLoading(true);
      toast.loading("Connexion en cours...");
      try {
        const res = await farmClient.auth.login(data);
        if (!res.success) throw new Error(res.message || "Erreur de connexion");
        return res.data!;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    onSuccess: (data) => {
      loginUser(data);
      toast.dismiss();
      toast.success("Connexion réussie !");
      router.push(DASHBOARD_ROUTES.DEFAULT);
      setLoading(false);
    },
    onError: (error: any) => {
      setLoading(false);
      toast.dismiss();

      let message = "Erreur de connexion";
      if (error?.response?.status === 401) {
        message = "Numéro ou mot de passe incorrect";
      } else if (error?.response?.status === 423) {
        message = error.response.data?.message || "Compte verrouillé";
      } else if (error?.response?.status === 403) {
        message = error.response.data?.message || "Accès refusé";
      } else if (error?.message) {
        message = error.message;
      }

      toast.error(message);
    },
  });
}

// ======================================
// LOGOUT MUTATION
// ======================================

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logoutUser, setLoading } = useAuth();

  return useMutation({
    mutationKey: AUTH_QUERY_KEYS.LOGOUT,
    mutationFn: async () => {
      setLoading(true);
      await farmClient.auth.logout();
    },
    onSuccess: () => {
      logoutUser();
      queryClient.clear();
      toast.success("Déconnexion réussie");
      router.push(AUTH_ROUTES.LOGIN_V2);
      setLoading(false);
    },
    onError: () => {
      logoutUser();
      queryClient.clear();
      router.push(AUTH_ROUTES.LOGIN_V2);
      setLoading(false);
    },
  });
}

// ======================================
// FORGOT PASSWORD MUTATION
// ======================================

export function useForgotPasswordMutation() {
  return useMutation({
    mutationKey: AUTH_QUERY_KEYS.FORGOT_PASSWORD,
    mutationFn: async (phoneNumber: string) => {
      const res = await farmClient.auth.forgotPassword(phoneNumber);
      if (!res.success) throw new Error(res.message || "Erreur lors de l'envoi");
    },
    onSuccess: () => toast.success("Instructions envoyées par SMS"),
    onError: (error: any) => toast.error(error?.message || "Erreur lors de l'envoi"),
  });
}

// ======================================
// CHANGE PASSWORD MUTATION
// ======================================

export function useChangePasswordMutation() {
  return useMutation({
    mutationKey: AUTH_QUERY_KEYS.CHANGE_PASSWORD,
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const res = await farmClient.auth.changePassword(payload);
      if (!res.success) throw new Error(res.message || "Erreur lors du changement de mot de passe");
      return res;
    },
    onSuccess: () => toast.success("Mot de passe modifié avec succès"),
    onError: (error: any) => toast.error(error?.message || "Erreur lors du changement de mot de passe"),
  });
}

// ======================================
// UTILITY HOOKS
// ======================================

export function useLogout() {
  const logoutMutation = useLogoutMutation();
  return () => logoutMutation.mutate();
}

export function useAuthLoading() {
  const { isLoading } = useAuth();
  return isLoading;
}
