import { get, post, patch, del } from './apiClient';
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
  completedAt?: string;
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

export interface SprintIssue {
  id: string;
  type: 'STORY' | 'TASK' | 'BUG' | 'SUBTASK' | 'EPIC';
  title: string;
  status: string;
  priority?: string;
  assigneeId?: string;
  epicId?: string;
  storyPoints?: number;
  projectId: string;
  sprintId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Unassigned issue eligible to be added to a sprint */
export type SprintCandidate = SprintIssue;

export interface SprintIssuesResult {
  issues: SprintIssue[];
  summary: {
    total: number;
    incomplete: number;
    byType: Record<string, number>;
  };
}

export type CompleteSprintAction = 'move_to_backlog' | 'move_to_sprint';

export interface CompleteSprintPayload {
  action: CompleteSprintAction;
  nextSprintId?: string;
}

export interface CompleteSprintResult {
  sprint: Sprint;
  movedIssues: number;
  action: CompleteSprintAction;
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
  },

  getIssues: async (id: string) => {
    const res = await get<SprintIssuesResult>(`/api/v1/sprints/${id}/issues`);
    return res.data;
  },

  getCandidates: async (projectId: string) => {
    const res = await get<SprintCandidate[]>(`/api/v1/projects/${projectId}/sprint-candidates`);
    return res.data;
  },

  assignIssueToSprint: async (issueId: string, sprintId: string | null) => {
    const res = await patch<SprintIssue>(`/api/v1/issues/${issueId}/sprint`, { sprintId });
    return res.data;
  },

  updateIssueAssignee: async (issueId: string, assigneeId: string | null) => {
    const res = await patch<SprintIssue>(`/api/v1/issues/${issueId}/sprint`, { assigneeId });
    return res.data;
  },

  complete: async (id: string, payload: CompleteSprintPayload) => {
    const res = await post<CompleteSprintResult>(`/api/v1/sprints/${id}/complete`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await del(`/api/v1/sprints/${id}`);
  },
};
