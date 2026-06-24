import React from 'react';
import { useAppSelector } from '../../redux/hooks';
import { Role } from '../../common/enums';
import { hasRole as checkRole, hasPermission as checkPerm } from '../../redux/slices/authSlice';

interface RoleGuardProps {
  children: React.ReactNode;
  requireRoles?: Role[];
  requirePermissions?: string[];
  fallback?: React.ReactNode;
}

export const RoleGuard = ({ children, requireRoles, requirePermissions, fallback = null }: RoleGuardProps) => {
  const authState = useAppSelector((state) => state.auth);

  if (requireRoles && requireRoles.length > 0) {
    const hasAnyRequiredRole = requireRoles.some((role) => checkRole({ auth: authState }, role));
    if (!hasAnyRequiredRole) return <>{fallback}</>;
  }

  if (requirePermissions && requirePermissions.length > 0) {
    const hasAllRequiredPerms = requirePermissions.every((perm) => checkPerm({ auth: authState }, perm));
    if (!hasAllRequiredPerms) return <>{fallback}</>;
  }

  return <>{children}</>;
};
