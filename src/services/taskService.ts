import { get, post, patch, buildPaginationParams, PaginationParams } from './apiClient';
import { PaginationMeta } from '../common/types';
export interface Task {
  id: string;
  projectId: string;
  epicId: string;
  epic?: { id: string; name: string };
  title: string;
  description?: string;
  assigneeId?: string;
  assignee?: { id: string; firstName: string; lastName: string; avatarUrl?: string };
  storyPoints?: number;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPayload {
  epicId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  storyPoints?: number;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  status: string;
}

export interface TaskListParams extends PaginationParams {
  epicId?: string;
  assigneeId?: string;
  status?: string;
}

export const taskService = {
  list: async (projectId: string, params: TaskListParams) => {
    const res = await get<Task[]>(`/api/v1/projects/${projectId}/tasks`, { params: buildPaginationParams(params) });
    return { items: res.data, meta: res.meta as PaginationMeta };
  },

  getById: async (id: string) => {
    const res = await get<Task>(`/api/v1/tasks/${id}`);
    return res.data;
  },

  create: async (projectId: string, payload: TaskPayload) => {
    const res = await post<Task>(`/api/v1/projects/${projectId}/tasks`, payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<TaskPayload>) => {
    const res = await patch<Task>(`/api/v1/tasks/${id}`, payload);
    return res.data;
  },
  
  updateStatus: async (id: string, status: string) => {
    const res = await post<Task>(`/api/v1/tasks/${id}/status`, { status });
    return res.data;
  }
};
