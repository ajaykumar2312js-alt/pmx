import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  severity: ToastSeverity;
}

export interface UiState {
  globalLoading: boolean;
  toasts: ToastMessage[];
  activeProjectId: string | null;
}

const initialState: UiState = {
  globalLoading: false,
  toasts: [],
  activeProjectId: localStorage.getItem('pmx_active_project_id') || null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
    enqueueToast(state, action: PayloadAction<Omit<ToastMessage, 'id'>>) {
      state.toasts.push({
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      });
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    setActiveProject(state, action: PayloadAction<string | null>) {
      state.activeProjectId = action.payload;
      if (action.payload) {
        localStorage.setItem('pmx_active_project_id', action.payload);
      } else {
        localStorage.removeItem('pmx_active_project_id');
      }
    },
  },
});

export const { setGlobalLoading, enqueueToast, dismissToast, setActiveProject } = uiSlice.actions;

export default uiSlice.reducer;
