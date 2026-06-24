import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectAuthStatus, selectCurrentUser, fetchCurrentUser, hasRole as checkRole, hasPermission as checkPerm, AuthState } from '../redux/slices/authSlice';
// eslint-disable-next-line no-restricted-imports
import { PageLoader } from '../components/common/ui';
import { Role } from '../common/enums';

// ─── Dev Bypass ──────────────────────────────────────────────────────────────
// When VITE_BYPASS_AUTH=true (set in .env.local, which is gitignored), all
// route protection is skipped and a mock admin session is used instead.
// Vite replaces import.meta.env.VITE_BYPASS_AUTH with its literal value at
// build time, so this entire block is dead-code-eliminated in production.
const BYPASS = import.meta.env.VITE_BYPASS_AUTH === 'true';
// ─────────────────────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRoles?: Role[];
  requirePermissions?: string[];
}

export const ProtectedRoute = ({ children, requireRoles, requirePermissions }: ProtectedRouteProps) => {
  const status = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectCurrentUser);
  const authState = useAppSelector((state: { auth: AuthState }) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  // When bypassing auth, start already initialised so no loader flickers.
  const [isInitializing, setIsInitializing] = useState(!BYPASS);

  useEffect(() => {
    if (BYPASS) {
      // Populate Redux with mock session to ensure UI components checking roles function correctly.
      import('../dev/mockUser').then(({ MOCK_AUTH_STATE }) => {
        dispatch({ type: 'auth/fetchCurrentUser/fulfilled', payload: MOCK_AUTH_STATE });
      });
      return;
    }
    const init = async () => {
      if (status === 'idle') {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch {
          // fetchCurrentUser will handle setting error state
        }
      }
      setIsInitializing(false);
    };
    init();
  }, [status, dispatch]);

  // ── Bypass: render children immediately with mock session ──────────────────
  if (BYPASS) {
    // requireRoles is still enforced so role-gating can be tested locally
    // by adjusting MOCK_ROLES or removing ADMIN from the list.
    if (requireRoles && requireRoles.length > 0) {
      const MOCK_ROLES: Role[] = [Role.ADMIN];
      const hasAny = requireRoles.some(r => MOCK_ROLES.includes(r));
      if (!hasAny) return <Navigate to="/403" replace />;
    }
    return <>{children}</>;
  }
  // ──────────────────────────────────────────────────────────────────────────

  if (isInitializing || status === 'authenticating' || (status === 'idle' && !isInitializing)) {
    return <PageLoader />;
  }

  if (status === 'error' || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check route-level permissions if specified
  if (requireRoles && requireRoles.length > 0) {
    const hasAnyRequiredRole = requireRoles.some(role => checkRole({ auth: authState }, role));
    if (!hasAnyRequiredRole) {
      return <Navigate to="/403" replace />;
    }
  }

  if (requirePermissions && requirePermissions.length > 0) {
    const hasAllRequiredPerms = requirePermissions.every(perm => checkPerm({ auth: authState }, perm));
    if (!hasAllRequiredPerms) {
      return <Navigate to="/403" replace />;
    }
  }

  return <>{children}</>;
};
