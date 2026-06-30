import { patch, del } from './apiClient';
import { Priority } from '../common/enums';

export interface IssueBulkUpdatePayload {
  itemIds: string[];
  priority?: Priority;
  status?: string;
  sprintId?: string | null;
  assigneeId?: string | null;
  assignee?: { id: string; firstName: string; lastName: string; avatarUrl?: string } | null;
}

export const issueService = {
  bulkUpdate: async (projectId: string, payload: IssueBulkUpdatePayload) => {
    const res = await patch<{ updatedCount: number }>(`/api/v1/projects/${projectId}/issues/bulk`, payload);
    return res.data;
  },

  bulkDelete: async (projectId: string, payload: { itemIds: string[] }) => {
    const res = await del<{ deletedCount: number }>(`/api/v1/projects/${projectId}/issues/bulk`, { data: payload });
    return res.data;
  },
};
