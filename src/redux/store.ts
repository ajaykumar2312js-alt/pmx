import { configureStore } from '@reduxjs/toolkit';
import { setSessionExpiredHandler } from '../services/apiClient';
import uiReducer from './slices/uiSlice';
import authReducer, { clearSession } from './slices/authSlice';
import userReducer from './slices/userSlice';
import projectReducer from './slices/projectSlice';
import backlogReducer from './slices/backlogSlice';
import epicReducer from './slices/epicSlice';
import storyReducer from './slices/storySlice';
import taskReducer from './slices/taskSlice';
import bugReducer from './slices/bugSlice';
import subtaskReducer from './slices/subtaskSlice';
import sprintReducer from './slices/sprintSlice';
import notificationReducer from './slices/notificationSlice';
import dashboardReducer from './slices/dashboardSlice';
import auditLogReducer from './slices/auditLogSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    users: userReducer,
    projects: projectReducer,
    backlog: backlogReducer,
    epics: epicReducer,
    stories: storyReducer,
    tasks: taskReducer,
    bugs: bugReducer,
    subtasks: subtaskReducer,
    sprints: sprintReducer,
    notifications: notificationReducer,
    dashboard: dashboardReducer,
    auditLogs: auditLogReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Clear Redux auth state whenever a token refresh fails in apiClient.
setSessionExpiredHandler(() => {
  store.dispatch(clearSession());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
