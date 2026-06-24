import { get, patch } from './apiClient';

export type NotificationType = 'ASSIGNMENT' | 'STATUS_CHANGE' | 'COMMENT' | 'MENTION';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: NotificationType;
  relatedItemId?: string;
  relatedItemType?: 'tasks' | 'stories' | 'bugs' | 'epics';
}

export const notificationService = {
  list: async (): Promise<Notification[]> => {
    const res = await get<Notification[]>('/api/v1/notifications');
    return res.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const res = await patch<Notification>(`/api/v1/notifications/${id}/read`, {});
    return res.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await patch<void>('/api/v1/notifications/read-all', {});
  }
};
