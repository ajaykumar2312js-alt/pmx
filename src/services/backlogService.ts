import { get, post, patch, del, buildPaginationParams } from './apiClient';
import { PaginationMeta } from '../common/types';
import { Priority, WorkItemType } from '../common/enums';

export type BacklogItemStatus = 'New' | 'Ready' | 'Closed';

export interface BacklogItem {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  type?: WorkItemType;
  priority: Priority;
  businessValue?: number;
  status: BacklogItemStatus;
  sprintId?: string;
  assigneeId?: string;
  assignee?: { id: string; firstName: string; lastName: string; avatarUrl?: string };
  rank: string; // Lexicographical ordering rank
  createdAt: string;
  updatedAt: string;
}

export interface BacklogListParams {
  projectId: string;
  cursor?: string;
  limit?: number;
  direction?: 'next' | 'prev';
  search?: string;
  priority?: string;
  status?: string;
}

export interface CreateBacklogItemPayload {
  title: string;
  description?: string;
  priority: Priority;
  businessValue?: number;
  status: BacklogItemStatus;
  type?: WorkItemType;
}

export interface UpdateBacklogItemPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  businessValue?: number;
  status?: BacklogItemStatus;
  type?: WorkItemType;
}

export interface ReorderPayload {
  sourceId: string;
  destinationId: string;
  newRank: string;
}

export interface RefinePayload {
  type: WorkItemType;
  // Dynamic fields depending on the target work item
  [key: string]: unknown; 
}

export interface BulkUpdatePayload {
  itemIds: string[];
  priority?: Priority;
  status?: string;
  sprintId?: string | null;
  assigneeId?: string | null;
  assignee?: { id: string; firstName: string; lastName: string; avatarUrl?: string } | null;
}

export const backlogService = {
  list: async (params: BacklogListParams) => {
    const { projectId, ...queryParams } = params;
    const res = await get<BacklogItem[]>(`/api/v1/projects/${projectId}/backlog-items`, { params: buildPaginationParams(queryParams) });
    return { items: res.data, meta: res.meta as PaginationMeta };
  },

  create: async (projectId: string, payload: CreateBacklogItemPayload) => {
    const res = await post<BacklogItem>(`/api/v1/projects/${projectId}/backlog-items`, payload);
    return res.data;
  },

  update: async (itemId: string, payload: UpdateBacklogItemPayload) => {
    const res = await patch<BacklogItem>(`/api/v1/backlog-items/${itemId}`, payload);
    return res.data;
  },

  reorder: async (projectId: string, payload: ReorderPayload) => {
    await patch<void>(`/api/v1/projects/${projectId}/backlog-items/reorder`, payload);
  },

  refine: async (itemId: string, payload: RefinePayload) => {
    const res = await post<{ message: string, newId: string }>(`/api/v1/backlog-items/${itemId}/refine`, payload);
    return res.data;
  },

  bulkUpdate: async (projectId: string, payload: BulkUpdatePayload) => {
    const res = await patch<{ updatedCount: number }>(`/api/v1/projects/${projectId}/backlog-items/bulk`, payload);
    return res.data;
  },

  bulkDelete: async (projectId: string, payload: { itemIds: string[] }) => {
    const res = await del<{ deletedCount: number }>(`/api/v1/projects/${projectId}/backlog-items/bulk`, { data: payload });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await del(`/api/v1/backlog-items/${id}`);
  }
};
