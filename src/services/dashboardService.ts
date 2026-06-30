import { get } from './apiClient';

export interface EpicProgressItem {
  id: string;
  name: string;
  status: string;
  completionPercentage: number;
  owner?: { id: string; firstName: string; lastName: string };
}

export interface DashboardSummary {
  totalEpics: number;
  activeEpics: number;
  totalStories: number;
  totalTasks: number;
  totalBugs: number;
  openBugs: number;
  criticalBugs: number;
  unassignedBacklog: number;
  workDistribution: { todo: number; inProgress: number; done: number };
  epicProgress: EpicProgressItem[];
}

export const dashboardService = {
  getSummary: async (projectId: string): Promise<DashboardSummary> => {
    const res = await get<DashboardSummary>(`/api/v1/projects/${projectId}/dashboard`);
    return res.data;
  },
};
