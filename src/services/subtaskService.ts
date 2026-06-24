import { get, post, patch } from './apiClient';
import { ChildItemType } from '../common/enums';

/** Sub-tasks / child items attach to exactly one Story, Task, or Bug (PRD §8.7). */
export type SubtaskParentType = 'stories' | 'tasks' | 'bugs';

/**
 * The type of this child item.
 * Built-in values come from ChildItemType; freeform custom labels are stored
 * in `customTypeName` when `childItemType === ChildItemType.CUSTOM`.
 */
export type ChildItemTypeValue = ChildItemType | string;

export interface Subtask {
  id: string;
  parentType: SubtaskParentType;
  parentId: string;
  title: string;
  assigneeId?: string | null;
  assignee?: { id: string; firstName: string; lastName: string } | null;
  estimatedHours?: number | null;
  status: string;
  /** The type of this child item (e.g. SUBTASK, STORY, TASK, BUG, or CUSTOM). */
  childItemType: ChildItemTypeValue;
  /** Only set when childItemType === 'CUSTOM' — the user-provided label. */
  customTypeName?: string | null;
  // Extra fields populated for typed children ─────────────────────────────
  /** Story-type children */
  asA?: string | null;
  iWant?: string | null;
  soThat?: string | null;
  /** Task/Subtask-type children */
  dueDate?: string | null;
  /** Bug-type children */
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
  /** Required — specifies which type of child item this is. */
  childItemType: ChildItemTypeValue;
  customTypeName?: string | null;
  // Optional type-specific fields
  asA?: string | null;
  iWant?: string | null;
  soThat?: string | null;
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
};
