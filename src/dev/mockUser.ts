/**
 * mockUser.ts — Development-only auth bypass.
 *
 * Used when VITE_BYPASS_AUTH=true (set in .env.local, which is gitignored).
 * This file is NEVER imported in production builds because the ProtectedRoute
 * that imports it is guarded by an `import.meta.env.VITE_BYPASS_AUTH` check,
 * which Vite's tree-shaker eliminates in production mode.
 */

import { UserProfile, AuthState } from '../redux/slices/authSlice';
import { Role } from '../common/enums';

export const MOCK_USER: UserProfile = {
  id: 'dev-user-001',
  email: 'dev@pmx.local',
  firstName: 'Dev',
  lastName: 'User',
  status: 'Active',
};

export const MOCK_AUTH_STATE: Pick<AuthState, 'user' | 'roles' | 'permissions'> = {
  user: MOCK_USER,
  // Grant Admin role so all features are accessible
  roles: [Role.ADMIN],
  permissions: ['*'],
};
