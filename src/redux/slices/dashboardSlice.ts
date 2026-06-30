import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService, DashboardSummary } from '../../services/dashboardService';

interface DashboardState {
  summary: DashboardSummary | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  status: 'idle',
  error: null,
};

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (projectId: string, { rejectWithValue }) => {
    try {
      return await dashboardService.getSummary(projectId);
    } catch (e: unknown) {
      const err = e as { message?: string };
      return rejectWithValue(err.message ?? 'Failed to load dashboard');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchDashboardSummary.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.summary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const selectDashboardSummary = (state: { dashboard: DashboardState }) => state.dashboard.summary;
export const selectDashboardStatus  = (state: { dashboard: DashboardState }) => state.dashboard.status;

export default dashboardSlice.reducer;
