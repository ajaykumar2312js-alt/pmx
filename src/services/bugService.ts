import { get, post, patch, buildPaginationParams, PaginationParams } from './apiClient';
import { PaginationMeta } from '../common/types';
import { Severity, Priority } from '../common/enums';

export interface Bug {
  id: string;
  projectId: string;
  title: string;
  stepsToReproduce: string;
  expectedResult?: string;
  actualResult?: string;
  severity: Severity;
  priority: Priority;
  environment?: string;
  browserOs?: string;
  parentId?: string;
  parentType?: 'EPIC' | 'STORY' | 'TASK';
  parent?: { id: string; title: string; type: string };
  reporterId: string;
  reporter?: { id: string; firstName: string; lastName: string; avatarUrl?: string };
  assigneeId?: string;
  assignee?: { id: string; firstName: string; lastName: string; avatarUrl?: string };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BugPayload {
  title: string;
  stepsToReproduce: string;
  expectedResult?: string;
  actualResult?: string;
  severity: Severity;
  priority: Priority;
  environment?: string;
  browserOs?: string;
  parentId?: string;
  parentType?: 'EPIC' | 'STORY' | 'TASK';
  assigneeId?: string;
  status: string;
}

export interface BugListParams extends PaginationParams {
  severity?: Severity;
  status?: string;
  assigneeId?: string;
  sprintId?: string;
  epicId?: string;
}

export const bugService = {
  list: async (projectId: string, params: BugListParams) => {
    const res = await get<Bug[]>(`/api/v1/projects/${projectId}/bugs`, { params: buildPaginationParams(params) });
    return { items: res.data, meta: res.meta as PaginationMeta };
  },

  getById: async (id: string) => {
    const res = await get<Bug>(`/api/v1/bugs/${id}`);
    return res.data;
  },

  create: async (projectId: string, payload: BugPayload) => {
    const res = await post<Bug>(`/api/v1/projects/${projectId}/bugs`, payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<BugPayload>) => {
    const res = await patch<Bug>(`/api/v1/bugs/${id}`, payload);
    return res.data;
  },
  
  transition: async (id: string, action: string, reason?: string) => {
    const res = await post<Bug>(`/api/v1/bugs/${id}/transition`, { action, reason });
    return res.data;
  }
};
