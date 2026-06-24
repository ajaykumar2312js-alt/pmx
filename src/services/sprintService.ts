import { get, post, patch } from './apiClient';
import { SprintStatus, Priority } from '../common/enums';

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  assigneeId?: string;
  assignee?: { id: string; firstName: string; lastName: string };
  priority?: Priority;
  createdAt: string;
  updatedAt: string;
}

export interface SprintPayload {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status?: SprintStatus;
  assigneeId?: string;
  priority?: Priority;
}

export const sprintService = {
  list: async (projectId: string) => {
    const res = await get<Sprint[]>(`/api/v1/projects/${projectId}/sprints`);
    return res.data;
  },

  create: async (projectId: string, payload: SprintPayload) => {
    const res = await post<Sprint>(`/api/v1/projects/${projectId}/sprints`, payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<SprintPayload>) => {
    const res = await patch<Sprint>(`/api/v1/sprints/${id}`, payload);
    return res.data;
  },

  start: async (id: string) => {
    const res = await post<Sprint>(`/api/v1/sprints/${id}/start`);
    return res.data;
  }
};
