import { get, post, patch, del, buildPaginationParams, PaginationParams } from './apiClient';
import { PaginationMeta } from '../common/types';
import { WorkItemType, Priority } from '../common/enums';

export type EpicStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done';

export interface Epic {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  ownerId?: string;
  owner?: { id: string; firstName: string; lastName: string };
  targetRelease?: string;
  status: EpicStatus;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChildItem {
  id: string;
  title: string;
  type: WorkItemType;
  status: string;
  priority: Priority;
  owner?: { id: string; firstName: string; lastName: string };
}

export interface EpicPayload {
  name: string;
  description?: string;
  ownerId?: string;
  targetRelease?: string;
  status: EpicStatus;
}

export interface EpicListParams extends PaginationParams {
  status?: EpicStatus;
}

export const epicService = {
  list: async (projectId: string, params: EpicListParams) => {
    const res = await get<Epic[]>(`/api/v1/projects/${projectId}/epics`, { params: buildPaginationParams(params) });
    return { items: res.data, meta: res.meta as PaginationMeta };
  },

  getById: async (id: string) => {
    const res = await get<Epic>(`/api/v1/epics/${id}`);
    return res.data;
  },

  create: async (projectId: string, payload: EpicPayload) => {
    const res = await post<Epic>(`/api/v1/projects/${projectId}/epics`, payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<EpicPayload>) => {
    const res = await patch<Epic>(`/api/v1/epics/${id}`, payload);
    return res.data;
  },

  getChildren: async (id: string) => {
    const res = await get<ChildItem[]>(`/api/v1/epics/${id}/children`);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await del(`/api/v1/epics/${id}`);
  }
};
