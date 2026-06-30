import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  sprintService,
  Sprint,
  SprintPayload,
  SprintCandidate,
  SprintIssuesResult,
  CompleteSprintPayload,
} from '../../services/sprintService';

interface SprintState {
  items: Sprint[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentSprintIssues: SprintIssuesResult | null;
  sprintIssuesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  candidates: SprintCandidate[];
  candidatesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: SprintState = {
  items: [],
  status: 'idle',
  error: null,
  currentSprintIssues: null,
  sprintIssuesStatus: 'idle',
  candidates: [],
  candidatesStatus: 'idle',
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

export const deleteSprint = createAsyncThunk(
  'sprints/deleteSprint',
  async (id: string, { rejectWithValue }) => {
    try {
      await sprintService.delete(id);
      return id;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to delete sprint');
    }
  }
);

export const fetchSprintIssues = createAsyncThunk(
  'sprints/fetchSprintIssues',
  async (id: string, { rejectWithValue }) => {
    try {
      return await sprintService.getIssues(id);
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to fetch sprint issues');
    }
  }
);

export const completeSprint = createAsyncThunk(
  'sprints/completeSprint',
  async ({ id, payload }: { id: string; payload: CompleteSprintPayload }, { rejectWithValue }) => {
    try {
      return await sprintService.complete(id, payload);
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to complete sprint');
    }
  }
);

export const fetchSprintCandidates = createAsyncThunk(
  'sprints/fetchSprintCandidates',
  async (projectId: string, { rejectWithValue }) => {
    try {
      return await sprintService.getCandidates(projectId);
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to fetch sprint candidates');
    }
  }
);

export const assignIssueToSprint = createAsyncThunk(
  'sprints/assignIssueToSprint',
  async ({ issueId, sprintId }: { issueId: string; sprintId: string | null }, { rejectWithValue }) => {
    try {
      return await sprintService.assignIssueToSprint(issueId, sprintId);
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to update sprint assignment');
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
      })
      .addCase(deleteSprint.fulfilled, (state, action) => {
        state.items = state.items.filter(s => s.id !== action.payload);
      })
      .addCase(fetchSprintIssues.pending, (state) => {
        state.sprintIssuesStatus = 'loading';
        state.currentSprintIssues = null;
      })
      .addCase(fetchSprintIssues.fulfilled, (state, action) => {
        state.sprintIssuesStatus = 'succeeded';
        state.currentSprintIssues = action.payload;
      })
      .addCase(fetchSprintIssues.rejected, (state) => {
        state.sprintIssuesStatus = 'failed';
      })
      .addCase(completeSprint.fulfilled, (state, action) => {
        const idx = state.items.findIndex(s => s.id === action.payload.sprint.id);
        if (idx !== -1) {
          state.items[idx] = action.payload.sprint;
        }
        state.currentSprintIssues = null;
        // Completed sprint's items return to candidates pool — re-fetch externally
      })
      .addCase(fetchSprintCandidates.pending, (state) => {
        state.candidatesStatus = 'loading';
      })
      .addCase(fetchSprintCandidates.fulfilled, (state, action) => {
        state.candidatesStatus = 'succeeded';
        state.candidates = action.payload;
      })
      .addCase(fetchSprintCandidates.rejected, (state) => {
        state.candidatesStatus = 'failed';
      })
      .addCase(assignIssueToSprint.fulfilled, (state, action) => {
        const updated = action.payload;
        // If assigned to a sprint, remove from candidates
        if (updated.sprintId) {
          state.candidates = state.candidates.filter(c => c.id !== updated.id);
          // Add to currentSprintIssues if it belongs to the displayed sprint
          if (state.currentSprintIssues) {
            const already = state.currentSprintIssues.issues.find(i => i.id === updated.id);
            if (!already) {
              state.currentSprintIssues.issues.push(updated);
              state.currentSprintIssues.summary.total += 1;
              state.currentSprintIssues.summary.incomplete += 1;
            }
          }
        } else {
          // Removed from sprint — add back to candidates, remove from sprint issues
          state.candidates.unshift(updated);
          if (state.currentSprintIssues) {
            state.currentSprintIssues.issues = state.currentSprintIssues.issues.filter(i => i.id !== updated.id);
            state.currentSprintIssues.summary.total = Math.max(0, state.currentSprintIssues.summary.total - 1);
          }
        }
      });
  },
});

export const selectSprints = (state: { sprints: SprintState }) => state.sprints.items;
export const selectSprintStatus = (state: { sprints: SprintState }) => state.sprints.status;
export const selectCurrentSprintIssues = (state: { sprints: SprintState }) => state.sprints.currentSprintIssues;
export const selectSprintIssuesStatus = (state: { sprints: SprintState }) => state.sprints.sprintIssuesStatus;
export const selectSprintCandidates = (state: { sprints: SprintState }) => state.sprints.candidates;
export const selectCandidatesStatus = (state: { sprints: SprintState }) => state.sprints.candidatesStatus;

export default sprintSlice.reducer;
