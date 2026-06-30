import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { epicService, Epic, EpicPayload, EpicListParams, ChildItem } from '../../services/epicService';
import { PaginationMeta } from '../../common/types';

interface EpicState {
  items: Epic[];
  meta: PaginationMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  
  // Specific Epic detail view
  currentEpic: Epic | null;
  currentEpicChildren: ChildItem[];
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: EpicState = {
  items: [],
  meta: null,
  status: 'idle',
  error: null,
  
  currentEpic: null,
  currentEpicChildren: [],
  detailStatus: 'idle',
};

export const fetchEpics = createAsyncThunk(
  'epics/fetchEpics',
  async ({ projectId, params }: { projectId: string; params: EpicListParams }, { rejectWithValue }) => {
    try {
      const response = await epicService.list(projectId, params);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to fetch epics');
    }
  }
);

export const fetchEpicDetail = createAsyncThunk(
  'epics/fetchEpicDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      const epic = await epicService.getById(id);
      const children = await epicService.getChildren(id);
      return { epic, children };
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to fetch epic details');
    }
  }
);

export const createEpic = createAsyncThunk(
  'epics/createEpic',
  async ({ projectId, payload }: { projectId: string; payload: EpicPayload }, { rejectWithValue }) => {
    try {
      const response = await epicService.create(projectId, payload);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to create epic');
    }
  }
);

export const updateEpic = createAsyncThunk(
  'epics/updateEpic',
  async ({ id, payload }: { id: string; payload: Partial<EpicPayload> }, { rejectWithValue }) => {
    try {
      const response = await epicService.update(id, payload);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to update epic');
    }
  }
);

export const deleteEpic = createAsyncThunk(
  'epics/deleteEpic',
  async (id: string, { rejectWithValue }) => {
    try {
      await epicService.delete(id);
      return id;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to delete epic');
    }
  }
);

export const refreshEpicChildren = createAsyncThunk(
  'epics/refreshEpicChildren',
  async (id: string, { rejectWithValue }) => {
    try {
      return await epicService.getChildren(id);
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to refresh epic children');
    }
  }
);

const epicSlice = createSlice({
  name: 'epics',
  initialState,
  reducers: {
    clearCurrentEpic(state) {
      state.currentEpic = null;
      state.currentEpicChildren = [];
      state.detailStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchEpics.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEpics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchEpics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Fetch Detail
      .addCase(fetchEpicDetail.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchEpicDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.currentEpic = action.payload.epic;
        state.currentEpicChildren = action.payload.children;
      })
      .addCase(fetchEpicDetail.rejected, (state) => {
        state.detailStatus = 'failed';
      })
      // Create
      .addCase(createEpic.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update
      .addCase(updateEpic.fulfilled, (state, action) => {
        const index = state.items.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentEpic?.id === action.payload.id) {
          state.currentEpic = action.payload;
        }
      })
      // Delete
      .addCase(deleteEpic.fulfilled, (state, action) => {
        state.items = state.items.filter(e => e.id !== action.payload);
        if (state.currentEpic?.id === action.payload) {
          state.currentEpic = null;
          state.currentEpicChildren = [];
        }
      })
      // Refresh children only (no detailStatus change to avoid spinner flash)
      .addCase(refreshEpicChildren.fulfilled, (state, action) => {
        state.currentEpicChildren = action.payload;
      });
  },
});

export const { clearCurrentEpic } = epicSlice.actions;

export const selectEpics = (state: { epics: EpicState }) => state.epics.items;
export const selectEpicMeta = (state: { epics: EpicState }) => state.epics.meta;
export const selectEpicStatus = (state: { epics: EpicState }) => state.epics.status;
export const selectCurrentEpic = (state: { epics: EpicState }) => state.epics.currentEpic;
export const selectCurrentEpicChildren = (state: { epics: EpicState }) => state.epics.currentEpicChildren;
export const selectEpicDetailStatus = (state: { epics: EpicState }) => state.epics.detailStatus;

export default epicSlice.reducer;
