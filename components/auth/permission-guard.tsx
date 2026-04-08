"use client";

import useAuth from "@/store/useAuth";

interface PermissionGuardProps {
  children: React.ReactNode;
  /** Single permission required */
  permission?: string;
  /** Multiple permissions — combined with requireAll */
  permissions?: string[];
  /** If true, ALL permissions must match. Default: false (any match) */
  requireAll?: boolean;
  /** Shown when permission denied. Default: nothing */
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  // Single permission check
  if (permission) {
    if (!hasPermission(permission)) return <>{fallback}</>;
    return <>{children}</>;
  }

  // Multiple permissions check
  if (permissions && permissions.length > 0) {
    const allowed = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    if (!allowed) return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook version for conditional logic outside JSX
 */
export function usePermission(permission: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

export function useAnyPermission(permissions: string[]): boolean {
  const { hasAnyPermission } = useAuth();
  return hasAnyPermission(permissions);
}
