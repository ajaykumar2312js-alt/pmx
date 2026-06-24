import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService, Notification } from '../../services/notificationService';

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  status: 'idle',
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async () => {
    return await notificationService.list();
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string) => {
    return await notificationService.markAsRead(id);
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    await notificationService.markAllAsRead();
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notifications = action.payload.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n.id === action.payload.id);
        if (index !== -1 && !state.notifications[index].read) {
          state.notifications[index].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.read = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const selectNotifications = (state: { notifications: NotificationState }) => state.notifications.notifications;
export const selectUnreadCount = (state: { notifications: NotificationState }) => state.notifications.unreadCount;

export default notificationSlice.reducer;
