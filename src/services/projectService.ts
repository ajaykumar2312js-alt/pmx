import { get, post, patch, del, buildPaginationParams, PaginationParams } from './apiClient';
import { PaginationMeta } from '../common/types';

export interface ProjectTeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export type WorkflowCategory = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface WorkflowStatus {
  id: string;
  label: string;
  category: WorkflowCategory;
  color?: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'Active' | 'Archived' | 'Completed';
  poId: string;
  po?: ProjectTeamMember;
  teamIds: string[];
  team?: ProjectTeamMember[];
  workflowStatuses: WorkflowStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListParams extends PaginationParams {
  status?: string;
}

export interface ProjectPayload {
  name: string;
  key: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'Active' | 'Archived' | 'Completed';
  poId: string;
  teamIds: string[];
  workflowStatuses?: WorkflowStatus[];
}

export const projectService = {
  async list(params: ProjectListParams): Promise<{ items: Project[]; meta: PaginationMeta }> {
    const res = await get<Project[]>('/api/v1/projects', {
      params: buildPaginationParams(params),
    });
    return { items: res.data, meta: res.meta as PaginationMeta };
  },

  async getById(id: string): Promise<Project> {
    const res = await get<Project>(`/api/v1/projects/${id}`);
    return res.data;
  },

  async create(payload: ProjectPayload): Promise<Project> {
    const res = await post<Project>('/api/v1/projects', payload);
    return res.data;
  },

  async update(id: string, payload: Partial<ProjectPayload>): Promise<Project> {
    const res = await patch<Project>(`/api/v1/projects/${id}`, payload);
    return res.data;
  },

  async archive(id: string): Promise<Project> {
    const res = await post<Project>(`/api/v1/projects/${id}/archive`);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await del(`/api/v1/projects/${id}`);
  },
};
