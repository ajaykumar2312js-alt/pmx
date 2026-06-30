import { get, post, patch, del, buildPaginationParams, PaginationParams } from './apiClient';
import { PaginationMeta } from '../common/types';
import { Priority } from '../common/enums';

export interface ACEntry {
  id: string;
  given: string;
  when: string;
  then: string;
}



export interface Story {
  id: string;
  projectId: string;
  epicId?: string | null;
  sprintId?: string | null;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: ACEntry[];
  priority: Priority;
  assigneeId?: string | null;
  assignee?: { id: string; firstName: string; lastName: string };
  status: string;
  storyPoints?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoryPayload {
  title: string;
  epicId?: string | null;
  sprintId?: string | null;
  asA?: string;
  iWant?: string;
  soThat?: string;
  acceptanceCriteria?: ACEntry[];
  priority?: Priority;
  assigneeId?: string | null;
  status?: string;
  storyPoints?: number;
}

export interface StoryListParams extends PaginationParams {
  epicId?: string;
  sprintId?: string;
  assigneeId?: string;
  status?: string;
}

export const storyService = {
  list: async (projectId: string, params: StoryListParams) => {
    const res = await get<Story[]>(`/api/v1/projects/${projectId}/stories`, {
      params: buildPaginationParams(params),
    });
    return { items: res.data, meta: res.meta as PaginationMeta };
  },

  getById: async (id: string) => {
    const res = await get<Story>(`/api/v1/stories/${id}`);
    return res.data;
  },

  create: async (projectId: string, payload: StoryPayload) => {
    const res = await post<Story>(`/api/v1/projects/${projectId}/stories`, payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<StoryPayload>) => {
    const res = await patch<Story>(`/api/v1/stories/${id}`, payload);
    return res.data;
  },

  changeStatus: async (id: string, status: string) => {
    const res = await post<Story>(`/api/v1/stories/${id}/status`, { status });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await del(`/api/v1/stories/${id}`);
  }
};
