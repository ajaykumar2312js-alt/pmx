import apiClient, { setApiAuthHandlers } from './apiClient';
import { ApiResponse } from '../common/types';

// In-memory token storage (never persist to localStorage)
let accessToken: string | null = null;

export const getToken = () => accessToken;

export const setToken = (token: string | null) => {
  accessToken = token;
};

// Login credentials
export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  expiresIn?: number;
}

// Single-flight refresh mutex
let refreshPromise: Promise<void> | null = null;

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<unknown, ApiResponse<AuthResponse>>('/api/v1/auth/login', payload);
    if (res.data?.token) {
      setToken(res.data.token);
    }
    return res.data;
  },

  async microsoft(code: string): Promise<AuthResponse> {
    const res = await apiClient.post<unknown, ApiResponse<AuthResponse>>('/api/v1/auth/microsoft', { code });
    if (res.data?.token) {
      setToken(res.data.token);
    }
    return res.data;
  },

  async refreshSession(): Promise<void> {
    // If a refresh is already in flight, wait for it
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        // The endpoint should rely on HttpOnly cookies for the refresh token
        const res = await apiClient.post<unknown, ApiResponse<AuthResponse>>('/api/v1/auth/refresh', {}, {
          withCredentials: true,
          _retry: true // prevent infinite loops
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        if (res.data?.token) {
          setToken(res.data.token);
        } else {
          throw new Error('No token returned from refresh');
        }
      } catch (err) {
        setToken(null);
        throw err;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch (err) {
      // Ignore API errors on logout to ensure client cleans up anyway
      console.warn('Logout API failed', err);
    } finally {
      setToken(null);
    }
  }
};

// Register handlers with apiClient to break circular dependency
setApiAuthHandlers(getToken, authService.refreshSession);
