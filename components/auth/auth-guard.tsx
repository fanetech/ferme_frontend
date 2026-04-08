"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/store/useAuth";
import { AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/constants/routes";
import AppLoader from "@/components/app-loader";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, requireAuth = true, fallback }: AuthGuardProps) {
  const { isLoggedIn, isLoading, initialize } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state from cookie on mount
  useEffect(() => {
    initialize();
  }, []);

  // Wait for loading to finish before making redirect decisions
  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isLoggedIn) {
      const loginUrl =
        pathname !== AUTH_ROUTES.LOGIN_V2
          ? `${AUTH_ROUTES.LOGIN_V2}?redirect=${encodeURIComponent(pathname)}`
          : AUTH_ROUTES.LOGIN_V2;
      router.push(loginUrl);
      return;
    }

    if (!requireAuth && isLoggedIn) {
      const searchParams = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      const redirectUrl = searchParams.get("redirect");
      router.push(redirectUrl || DASHBOARD_ROUTES.DEFAULT);
    }
  }, [isLoading, isLoggedIn, requireAuth, router, pathname]);

  // Still initializing
  if (isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <AppLoader />
        </div>
      )
    );
  }

  // Redirect pending — show nothing
  if (requireAuth && !isLoggedIn) {
    return fallback || (
      <div className="flex min-h-screen items-center justify-center">
        <AppLoader />
      </div>
    );
  }

  if (!requireAuth && isLoggedIn) {
    return fallback || (
      <div className="flex min-h-screen items-center justify-center">
        <AppLoader />
      </div>
    );
  }

  return <>{children}</>;
}

// ======================================
// UTILITY HOOKS
// ======================================

export function useAuthStatus() {
  const { isLoggedIn, isLoading, user } = useAuth();
  return {
    isAuthenticated: isLoggedIn,
    isLoading,
    user,
    isGuest: !isLoggedIn && !isLoading,
  };
}

export function useAuthRedirect() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  const redirectToLogin = (returnUrl?: string) => {
    const loginUrl = returnUrl
      ? `${AUTH_ROUTES.LOGIN_V2}?redirect=${encodeURIComponent(returnUrl)}`
      : AUTH_ROUTES.LOGIN_V2;
    router.push(loginUrl);
  };

  const redirectToDashboard = () => {
    router.push(DASHBOARD_ROUTES.DEFAULT);
  };

  return {
    redirectToLogin,
    redirectToDashboard,
    isAuthenticated: isLoggedIn,
    isLoading,
  };
}
