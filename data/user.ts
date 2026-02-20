import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Client from "@/data/client";
import useAuth from "@/store/useAuth";
import { API_ENDPOINTS } from "@/data/client/endpoints";
import { AUTH_ROUTES } from "@/lib/constants/routes";
import type { LoginResponse } from "@/types";

// ======================================
// CONFIGURATION SÉCURISÉE
// ======================================

export const SECURITY_CONFIG = {
  // Auto-déconnexion après inactivité (1 heure)
  INACTIVITY_TIMEOUT: 60 * 60 * 1000,        // 1 heure
  WARNING_BEFORE_LOGOUT: 5 * 60 * 1000,      // Avertissement 5 min avant
  
  // Events qui réinitialisent le timer d'inactivité
  ACTIVITY_EVENTS: [
    'mousedown', 'mousemove', 'keypress', 
    'scroll', 'touchstart', 'click'
  ],
  
  // Refresh automatique des données utilisateur
  CURRENT_USER_INTERVAL: 3 * 60 * 1000,      // Ping toutes les 3 minutes
  TOKEN_REFRESH_BUFFER: 5 * 60 * 1000,       // 5 min avant expiration
  
  // Retry et stale time
  STALE_TIME: 90 * 1000,                     // 1.5 min
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;

// ======================================
// QUERY KEYS
// ======================================

export const USER_QUERY_KEYS = {
  CURRENT_USER: [API_ENDPOINTS.CURRENT_USER],
} as const;

// ======================================
// CURRENT USER QUERY
// ======================================

export function useCurrentUser() {
  const { loginUser, isLoggedIn, token } = useAuth();
  
  return useQuery({
    queryKey: USER_QUERY_KEYS.CURRENT_USER,
    queryFn: async (): Promise<LoginResponse> => {
      const response = await Client.auth.currentUser();
      if (!response.success) {
        throw new Error(response.message || "Erreur lors de la récupération des données utilisateur");
      }
      if (response.data) {
        loginUser(response.data)
      }
      return response.data!;
    },
    
    // Configuration de refresh automatique
    refetchInterval: SECURITY_CONFIG.CURRENT_USER_INTERVAL,
    staleTime: SECURITY_CONFIG.STALE_TIME,
    
    // Triggers de refresh
    refetchOnWindowFocus: true,
    refetchOnMount: false, // Désactiver le fetch au montage pour éviter les requêtes sans token
    refetchOnReconnect: true,
    
    // Retry configuration
    retry: SECURITY_CONFIG.MAX_RETRY_ATTEMPTS,
    retryDelay: SECURITY_CONFIG.RETRY_DELAY,
    // Activer seulement si utilisateur connecté ET token présent
    enabled: isLoggedIn && !!token,
    
    // Délai d'initialisation pour permettre au store de se mettre à jour
    initialDataUpdatedAt: 0
  } as any);
}

// ======================================
// VALIDATION AVANT ACTIONS CRITIQUES
// ======================================

export function useSecureAction() {
  const queryClient = useQueryClient();
  
  const validateBeforeAction = async (actionType: string) => {
    const criticalActions = ['payment', 'user-management', 'settings', 'transaction'];
    
    if (criticalActions.includes(actionType)) {
      try {
        // Force refresh des données utilisateur avant action critique
        await queryClient.refetchQueries({ 
          queryKey: USER_QUERY_KEYS.CURRENT_USER 
        });
        
        return true;
      } catch (error) {
        toast.error("Validation de sécurité échouée, veuillez vous reconnecter");
        return false;
      }
    }
    
    return true;
  };
  
  return { validateBeforeAction };
}

// ======================================
// UTILITAIRES DE SÉCURITÉ
// ======================================

/**
 * Obtient l'interval de refresh adaptatif selon l'activité
 */
export const getAdaptiveInterval = () => {
  // Peut être étendu pour détecter l'activité réelle de l'utilisateur
  return SECURITY_CONFIG.CURRENT_USER_INTERVAL;
};

/**
 * Vérifie si le token expire bientôt
 */
export const isTokenExpiringSoon = (expiresAt: string): boolean => {
  const expirationTime = new Date(expiresAt).getTime();
  const currentTime = Date.now();
  const timeUntilExpiry = expirationTime - currentTime;
  
  return timeUntilExpiry <= SECURITY_CONFIG.TOKEN_REFRESH_BUFFER;
};

/**
 * Hook pour forcer le refresh des données utilisateur
 */
export function useRefreshUserData() {
  const queryClient = useQueryClient();
  
  const refreshUserData = async () => {
    try {
      await queryClient.refetchQueries({ 
        queryKey: USER_QUERY_KEYS.CURRENT_USER 
      });
      toast.success("Données utilisateur mises à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };
  
  return { refreshUserData };
}