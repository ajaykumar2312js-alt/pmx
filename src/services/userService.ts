import { get, post, patch, buildPaginationParams, PaginationParams } from './apiClient';
import { PaginationMeta } from '../common/types';
import { UserProfile } from '../redux/slices/authSlice';
import { Role } from '../common/enums';

export interface UserListParams extends PaginationParams {
  search?: string;
  role?: string;
  status?: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

export const userService = {
  async list(params: UserListParams): Promise<{ items: UserProfile[]; meta: PaginationMeta }> {
    const res = await get<UserProfile[]>('/api/v1/users', {
      params: buildPaginationParams(params),
    });
    return { items: res.data, meta: res.meta as PaginationMeta };
  },

  async create(payload: CreateUserPayload): Promise<UserProfile> {
    const res = await post<UserProfile>('/api/v1/users', payload);
    return res.data;
  },

  async updateRoles(id: string, roles: Role[]): Promise<UserProfile> {
    const res = await patch<UserProfile>(`/api/v1/users/${id}/roles`, { roles });
    return res.data;
  },

  async deactivate(id: string): Promise<UserProfile> {
    const res = await post<UserProfile>(`/api/v1/users/${id}/deactivate`);
    return res.data;
  },
};
