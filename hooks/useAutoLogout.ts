"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLogout } from "@/data/auth";
import { SECURITY_CONFIG } from "@/data/user";

// ======================================
// AUTO-LOGOUT HOOK
// ======================================

export function useAutoLogout() {
  const logout = useLogout();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Refs pour les timers
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();

  // Reset du timer d'inactivité
  const resetTimer = useCallback(() => {
    // Clear tous les timers existants
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearTimeout(countdownRef.current);
    
    setShowWarning(false);
    setTimeRemaining(0);

    // Timer pour l'avertissement (5 minutes avant déconnexion)
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(SECURITY_CONFIG.WARNING_BEFORE_LOGOUT);
      
      // Countdown pour l'avertissement
      const startCountdown = () => {
        const interval = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1000) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);
        countdownRef.current = interval;
      };
      
      startCountdown();
      
      // Toast d'avertissement
      toast.warning("Session expire bientôt !", {
        description: "Activité requise pour continuer votre session",
        duration: Infinity,
        id: "session-warning",
        action: {
          label: "Continuer",
          onClick: () => {
            setShowWarning(false);
            resetTimer();
            toast.dismiss("session-warning");
          }
        }
      });
    }, SECURITY_CONFIG.INACTIVITY_TIMEOUT - SECURITY_CONFIG.WARNING_BEFORE_LOGOUT);

    // Timer pour la déconnexion automatique
    timeoutRef.current = setTimeout(() => {
      console.log("🚪 Auto-logout: Session expirée par inactivité");
      
      toast.dismiss("session-warning");
      toast.error("Session expirée par inactivité", {
        description: "Vous avez été déconnecté pour des raisons de sécurité"
      });
      
      logout();
    }, SECURITY_CONFIG.INACTIVITY_TIMEOUT);

    if (process.env.NODE_ENV === 'development') {
      console.log("⏱️ Activity timer reset at:", new Date().toISOString());
    }
  }, [logout]);

  // Extension manuelle de la session
  const extendSession = useCallback(() => {
    resetTimer();
    toast.dismiss("session-warning");
    toast.success("Session étendue avec succès");
  }, [resetTimer]);

  // Setup des event listeners
  useEffect(() => {
    const events = SECURITY_CONFIG.ACTIVITY_EVENTS;
    
    // Ajouter les listeners d'activité
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // Listener pour la visibilité de la page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        resetTimer(); // Reset si l'utilisateur revient sur l'onglet
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initialiser le timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearTimeout(countdownRef.current);
      
      toast.dismiss("session-warning");
    };
  }, [resetTimer]);

  return { 
    showWarning, 
    timeRemaining, 
    extendSession,
    resetTimer 
  };
}

// ======================================
// UTILITAIRES
// ======================================

/**
 * Formate le temps restant en minutes:secondes
 */
export const formatTimeRemaining = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Hook pour surveiller l'activité utilisateur
 */
export function useActivityMonitor() {
  const [isActive, setIsActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  useEffect(() => {
    const updateActivity = () => {
      setIsActive(true);
      setLastActivity(Date.now());
    };
    
    const checkInactivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity > 5 * 60 * 1000) { // 5 minutes
        setIsActive(false);
      }
    };
    
    // Listeners d'activité
    SECURITY_CONFIG.ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
    
    // Check périodique d'inactivité
    const interval = setInterval(checkInactivity, 30000); // Toutes les 30 secondes
    
    return () => {
      SECURITY_CONFIG.ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, [lastActivity]);
  
  return { isActive, lastActivity };
}