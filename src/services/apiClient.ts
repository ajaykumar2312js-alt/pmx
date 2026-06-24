import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ApiErrorResponse } from '../common/types';

// Types for injected handlers
export type TokenGetter = () => string | null;
export type RefreshSessionHandler = () => Promise<void>;

let getTokenVal: TokenGetter = () => null;
let refreshSession: RefreshSessionHandler = async () => {};
let onSessionExpired: () => void = () => {};

export const setApiAuthHandlers = (
  tokenGetter: TokenGetter,
  refreshHandler: RefreshSessionHandler,
) => {
  getTokenVal = tokenGetter;
  refreshSession = refreshHandler;
};

// Registered by the store so a failed token refresh clears the Redux auth state.
export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1/',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getTokenVal();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Request-ID'] = uuidv4();
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) {
        return Promise.reject({
          statusCode: body.statusCode || response.status,
          message: body.message || 'Unknown error',
          errors: body.errors || [],
          code: body.errors?.[0]?.code || 'UNKNOWN',
        });
      }
      return { data: body.data, meta: body.meta } as unknown as AxiosResponse;
    }
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshSession();
        // The token getter will now return the new token
        const newToken = getTokenVal();
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient.request(originalRequest);
      } catch (refreshError) {
        // Refresh failed — the session is no longer valid. Clear auth state so
        // the app stops rendering protected views with a stale user.
        onSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    const body = error.response?.data;
    const statusCode = body?.statusCode || error.response?.status || 500;
    const message = body?.message || error.message;
    const errors = body?.errors || [];
    const code = errors[0]?.code || 'UNKNOWN';

    return Promise.reject({ statusCode, message, errors, code });
  },
);

// Generic request helper
export async function request<T>(config: AxiosRequestConfig): Promise<{ data: T; meta: unknown }> {
  return apiClient.request(config) as Promise<unknown> as Promise<{ data: T; meta: unknown }>;
}

export const get = <T>(url: string, config?: AxiosRequestConfig) =>
  request<T>({ ...config, method: 'GET', url });
export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>({ ...config, method: 'POST', url, data });
export const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>({ ...config, method: 'PUT', url, data });
export const patch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>({ ...config, method: 'PATCH', url, data });
export const del = <T>(url: string, config?: AxiosRequestConfig) =>
  request<T>({ ...config, method: 'DELETE', url });

// Pagination helper
export interface PaginationParams {
  limit?: number;
  cursor?: string;
  direction?: 'next' | 'prev';
  [key: string]: unknown;
}

export const buildPaginationParams = (params: PaginationParams) => {
  const { limit, cursor, direction, ...rest } = params;
  return {
    ...rest,
    limit: limit ?? 20,
    ...(cursor ? { cursor } : {}),
    ...(direction ? { direction } : {}),
  };
};

export default apiClient;
