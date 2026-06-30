import { Role } from '../common/enums';
import { UserProfile } from '../redux/slices/authSlice';

export const MOCK_USER: UserProfile = {
  id: 'dev-user-001',
  email: 'dev@pmx.local',
  firstName: 'Dev',
  lastName: 'Admin',
  status: 'Active',
};

export const MOCK_AUTH_STATE = {
  user: MOCK_USER,
  roles: [Role.ADMIN, Role.DEVELOPER, Role.SCRUM_MASTER],
  permissions: ['*'],
};
