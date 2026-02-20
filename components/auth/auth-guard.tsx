"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/store/useAuth";
import { AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/constants/routes";
import AvePayLoader from "@/components/avepay-loader";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, requireAuth = true, fallback }: AuthGuardProps) {
  const { isLoggedIn, isLoading, initialize } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // Initialize auth state from cookie on mount
  useEffect(() => {
    initialize();
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

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
  }, [ready, isLoggedIn, requireAuth, router, pathname]);

  // Still initializing
  if (!ready || isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <AvePayLoader />
        </div>
      )
    );
  }

  // Redirect pending — show nothing
  if (requireAuth && !isLoggedIn) {
    return fallback || (
      <div className="flex min-h-screen items-center justify-center">
        <AvePayLoader />
      </div>
    );
  }

  if (!requireAuth && isLoggedIn) {
    return fallback || (
      <div className="flex min-h-screen items-center justify-center">
        <AvePayLoader />
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return {
    isAuthenticated: isLoggedIn,
    isLoading: isLoading || !ready,
    user,
    isGuest: !isLoggedIn && !isLoading && ready,
  };
}

export function useAuthRedirect() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

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
    isLoading: isLoading || !ready,
  };
}
