"use client";

import React, { ReactNode } from 'react';
import useAuth from '@/store/useAuth';
import { Loader2 } from 'lucide-react';

interface PermissionGateProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  excludePermissions?: string[];
  excludeRoles?: string[];
  requireAll?: boolean;
}

export default function PermissionGate({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  excludePermissions = [],
  excludeRoles = [],
  requireAll = false,
}: PermissionGateProps) {
  const { user, isLoading, permissions: userPermissions, roles: userRoles } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No user
  if (!user) {
    return null;
  }

  // Super admin bypass
  if (userRoles.includes('SUPER_ADMIN')) {
    return <>{children}</>;
  }

  // Check excluded roles first
  if ((excludeRoles || []).length > 0 && (excludeRoles || []).some(r => userRoles.includes(r))) {
    return null;
  }

  // Check excluded permissions
  if ((excludePermissions || []).length > 0 && (excludePermissions || []).some(p => userPermissions.includes(p))) {
    return null;
  }

  // Collect permissions to check
  const permissionsToCheck = permission ? [permission] : (permissions || []);
  
  // Collect roles to check
  const rolesToCheck = role ? [role] : (roles || []);

  // Check permissions
  let hasRequiredPermissions = true;
  if (permissionsToCheck.length > 0) {
    hasRequiredPermissions = requireAll
      ? permissionsToCheck.every(p => userPermissions.includes(p))
      : permissionsToCheck.some(p => userPermissions.includes(p));
  }

  // Check roles
  let hasRequiredRoles = true;
  if (rolesToCheck.length > 0) {
    hasRequiredRoles = requireAll
      ? rolesToCheck.every(r => userRoles.includes(r))
      : rolesToCheck.some(r => userRoles.includes(r));
  }

  // Both permissions and roles must pass
  const isAuthorized = hasRequiredPermissions && hasRequiredRoles;

  return isAuthorized ? <>{children}</> : null;
}
