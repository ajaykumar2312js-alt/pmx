import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sprintService, Sprint, SprintPayload } from '../../services/sprintService';

interface SprintState {
  items: Sprint[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SprintState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchSprints = createAsyncThunk(
  'sprints/fetchSprints',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await sprintService.list(projectId);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to fetch sprints');
    }
  }
);

export const createSprint = createAsyncThunk(
  'sprints/createSprint',
  async ({ projectId, payload }: { projectId: string; payload: SprintPayload }, { rejectWithValue }) => {
    try {
      const response = await sprintService.create(projectId, payload);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to create sprint');
    }
  }
);

export const updateSprint = createAsyncThunk(
  'sprints/updateSprint',
  async ({ id, payload }: { id: string; payload: Partial<SprintPayload> }, { rejectWithValue }) => {
    try {
      const response = await sprintService.update(id, payload);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to update sprint');
    }
  }
);

export const startSprint = createAsyncThunk(
  'sprints/startSprint',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await sprintService.start(id);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to start sprint');
    }
  }
);

const sprintSlice = createSlice({
  name: 'sprints',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSprints.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSprints.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchSprints.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createSprint.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateSprint.fulfilled, (state, action) => {
        const idx = state.items.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(startSprint.fulfilled, (state, action) => {
        const idx = state.items.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      });
  },
});

export const selectSprints = (state: { sprints: SprintState }) => state.sprints.items;
export const selectSprintStatus = (state: { sprints: SprintState }) => state.sprints.status;

export default sprintSlice.reducer;
