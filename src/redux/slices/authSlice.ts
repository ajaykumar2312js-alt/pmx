import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Role } from '../../common/enums';
import apiClient from '../../services/apiClient';
import { ApiResponse } from '../../common/types';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  avatarUrl?: string;
  roles?: Role[];
}

export interface AuthState {
  status: 'idle' | 'authenticating' | 'authenticated' | 'error';
  user: UserProfile | null;
  roles: Role[];
  permissions: string[];
}

const initialState: AuthState = {
  status: 'idle',
  user: null,
  roles: [],
  permissions: [],
};

// Thunk to fetch current user profile
export const fetchCurrentUser = createAsyncThunk<{ user: UserProfile; roles: Role[]; permissions: string[] }>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get<unknown, ApiResponse<{ user: UserProfile; roles: Role[]; permissions: string[] }>>('/api/v1/auth/me');
      return res.data;
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Failed to fetch user');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearSession: (state) => {
      state.status = 'idle';
      state.user = null;
      state.roles = [];
      state.permissions = [];
    },
    setAuthStatus: (state, action: PayloadAction<AuthState['status']>) => {
      state.status = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'authenticating';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload.user;
        state.roles = action.payload.roles || [];
        state.permissions = action.payload.permissions || [];
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = 'error';
        state.user = null;
        state.roles = [];
        state.permissions = [];
      });
  },
});

export const { clearSession, setAuthStatus } = authSlice.actions;

// Selectors
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectRoles = (state: { auth: AuthState }) => state.auth.roles;
export const selectPermissions = (state: { auth: AuthState }) => state.auth.permissions;

export const hasPermission = (state: { auth: AuthState }, permission: string) => 
  state.auth.permissions.includes(permission);

export const hasRole = (state: { auth: AuthState }, role: Role) => 
  state.auth.roles.includes(role);

export default authSlice.reducer;
