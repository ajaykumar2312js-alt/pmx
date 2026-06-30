import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bugService, Bug, BugPayload, BugListParams } from '../../services/bugService';
import { PaginationMeta } from '../../common/types';

interface BugState {
  items: Bug[];
  meta: PaginationMeta | null;
  status: string;
  error: string | null;
  
  // Specific Bug detail view
  currentBug: Bug | null;
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: BugState = {
  items: [],
  meta: null,
  status: 'idle',
  error: null,
  
  currentBug: null,
  detailStatus: 'idle',
};

export const fetchBugs = createAsyncThunk(
  'bugs/fetchBugs',
  async ({ projectId, params }: { projectId: string; params: BugListParams }, { rejectWithValue }) => {
    try {
      const response = await bugService.list(projectId, params);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to fetch bugs');
    }
  }
);

export const fetchBugDetail = createAsyncThunk(
  'bugs/fetchBugDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bugService.getById(id);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to fetch bug details');
    }
  }
);

export const createBug = createAsyncThunk(
  'bugs/createBug',
  async ({ projectId, payload }: { projectId: string; payload: BugPayload }, { rejectWithValue }) => {
    try {
      const response = await bugService.create(projectId, payload);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to create bug');
    }
  }
);

export const updateBug = createAsyncThunk(
  'bugs/updateBug',
  async ({ id, payload }: { id: string; payload: Partial<BugPayload> }, { rejectWithValue }) => {
    try {
      const response = await bugService.update(id, payload);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to update bug');
    }
  }
);

export const transitionBug = createAsyncThunk(
  'bugs/transitionBug',
  async ({ id, action, reason }: { id: string; action: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await bugService.transition(id, action, reason);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to transition bug');
    }
  }
);

export const deleteBug = createAsyncThunk(
  'bugs/deleteBug',
  async (id: string, { rejectWithValue }) => {
    try {
      await bugService.delete(id);
      return id;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to delete bug');
    }
  }
);

const bugSlice = createSlice({
  name: 'bugs',
  initialState,
  reducers: {
    clearCurrentBug(state) {
      state.currentBug = null;
      state.detailStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchBugs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBugs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchBugs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Fetch Detail
      .addCase(fetchBugDetail.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchBugDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.currentBug = action.payload;
      })
      .addCase(fetchBugDetail.rejected, (state) => {
        state.detailStatus = 'failed';
      })
      // Create
      .addCase(createBug.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update
      .addCase(updateBug.fulfilled, (state, action) => {
        const index = state.items.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentBug?.id === action.payload.id) {
          state.currentBug = action.payload;
        }
      })
      // Transition
      .addCase(transitionBug.fulfilled, (state, action) => {
        const index = state.items.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentBug?.id === action.payload.id) {
          state.currentBug = action.payload;
        }
      })
      // Delete
      .addCase(deleteBug.fulfilled, (state, action) => {
        state.items = state.items.filter(b => b.id !== action.payload);
        if (state.currentBug?.id === action.payload) {
          state.currentBug = null;
        }
      });
  },
});

export const { clearCurrentBug } = bugSlice.actions;

export const selectBugs = (state: { bugs: BugState }) => state.bugs.items;
export const selectBugMeta = (state: { bugs: BugState }) => state.bugs.meta;
export const selectBugStatus = (state: { bugs: BugState }) => state.bugs.status;
export const selectCurrentBug = (state: { bugs: BugState }) => state.bugs.currentBug;
export const selectBugDetailStatus = (state: { bugs: BugState }) => state.bugs.detailStatus;

export default bugSlice.reducer;
