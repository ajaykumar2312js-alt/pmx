import { get, post, patch, del } from './apiClient';
import { ChildItemType } from '../common/enums';

/** Sub-tasks / child items attach to exactly one Story, Task, or Bug (PRD §8.7). */
export type SubtaskParentType = 'stories' | 'tasks' | 'bugs';

export type ChildItemTypeValue = ChildItemType;

export interface Subtask {
  id: string;
  parentType: SubtaskParentType;
  parentId: string;
  title: string;
  assigneeId?: string | null;
  assignee?: { id: string; firstName: string; lastName: string } | null;
  estimatedHours?: number | null;
  status: string;
  childItemType: ChildItemTypeValue;
  dueDate?: string | null;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubtaskPayload {
  parentType: SubtaskParentType;
  parentId: string;
  title: string;
  assigneeId?: string | null;
  estimatedHours?: number | null;
  status?: string;
  childItemType: ChildItemTypeValue;
  dueDate?: string | null;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
}

export const subtaskService = {
  listByParent: async (parentType: SubtaskParentType, parentId: string) => {
    const res = await get<Subtask[]>(`/api/v1/${parentType}/${parentId}/subtasks`);
    return res.data;
  },

  create: async (payload: SubtaskPayload) => {
    const res = await post<Subtask>('/api/v1/subtasks', payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<SubtaskPayload>) => {
    const res = await patch<Subtask>(`/api/v1/subtasks/${id}`, payload);
    return res.data;
  },

  setStatus: async (id: string, status: string) => {
    const res = await patch<Subtask>(`/api/v1/subtasks/${id}`, { status });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await del(`/api/v1/subtasks/${id}`);
  }
};
