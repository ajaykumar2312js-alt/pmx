import { get } from './apiClient';

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  timestamp: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface AuditLogMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogListParams {
  skip?: number;
  limit?: number;
  entityType?: string;
  action?: string;
  userId?: string;
}

interface AuditLogPage {
  items: AuditLog[];
  total: number;
  skip: number;
  limit: number;
}

export interface AuditLogResponse {
  items: AuditLog[];
  meta: AuditLogMeta;
}

export const auditLogService = {
  list: async (params: AuditLogListParams = {}): Promise<AuditLogResponse> => {
    const res = await get<AuditLogPage>('/api/v1/audit-logs', { params });
    const { items, total, skip, limit } = res.data;
    const safeLimit = limit ?? 50;
    return {
      items: items ?? [],
      meta: {
        total: total ?? 0,
        page: Math.floor((skip ?? 0) / safeLimit) + 1,
        limit: safeLimit,
        totalPages: Math.ceil((total ?? 0) / safeLimit),
      },
    };
  },
};
