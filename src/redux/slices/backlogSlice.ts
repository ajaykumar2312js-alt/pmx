import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { backlogService, BacklogItem, BacklogListParams, CreateBacklogItemPayload, ReorderPayload, BulkUpdatePayload, RefinePayload } from '../../services/backlogService';
import { PaginationMeta } from '../../common/types';

export interface BacklogState {
  items: BacklogItem[];
  meta: PaginationMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedIds: string[];
}

const initialState: BacklogState = {
  items: [],
  meta: null,
  status: 'idle',
  error: null,
  selectedIds: [],
};

export const fetchBacklogItems = createAsyncThunk(
  'backlog/fetchBacklogItems',
  async (params: BacklogListParams, { rejectWithValue }) => {
    try {
      const response = await backlogService.list(params);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to fetch backlog items');
    }
  }
);

export const createBacklogItem = createAsyncThunk(
  'backlog/createBacklogItem',
  async ({ projectId, payload }: { projectId: string; payload: CreateBacklogItemPayload }, { rejectWithValue }) => {
    try {
      const response = await backlogService.create(projectId, payload);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error);
    }
  }
);

export const reorderBacklogItem = createAsyncThunk(
  'backlog/reorderBacklogItem',
  async ({ projectId, payload, originalItems }: { projectId: string; payload: ReorderPayload, originalItems: BacklogItem[] }, { rejectWithValue }) => {
    try {
      await backlogService.reorder(projectId, payload);
      return payload;
    } catch (error: unknown) {
      const err = error as { message?: string };
      // Rollback payload will be used by the reducer to restore order
      return rejectWithValue({ error: err.message || 'Failed to reorder', originalItems });
    }
  }
);

export const bulkUpdateBacklogItems = createAsyncThunk(
  'backlog/bulkUpdateBacklogItems',
  async ({ projectId, payload }: { projectId: string; payload: BulkUpdatePayload }, { rejectWithValue }) => {
    try {
      const response = await backlogService.bulkUpdate(projectId, payload);
      return { payload, response };
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to perform bulk update');
    }
  }
);

export const refineBacklogItem = createAsyncThunk(
  'backlog/refineBacklogItem',
  async ({ itemId, payload }: { itemId: string; payload: RefinePayload }, { rejectWithValue }) => {
    try {
      const response = await backlogService.refine(itemId, payload);
      return { itemId, response };
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to refine item');
    }
  }
);

const backlogSlice = createSlice({
  name: 'backlog',
  initialState,
  reducers: {
    toggleSelection(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter(i => i !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    selectAll(state, action: PayloadAction<boolean>) {
      if (action.payload) {
        state.selectedIds = state.items.filter(i => !i.sprintId).map(i => i.id);
      } else {
        state.selectedIds = [];
      }
    },
    clearSelection(state) {
      state.selectedIds = [];
    },
    optimisticReorder(state, action: PayloadAction<BacklogItem[]>) {
      state.items = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchBacklogItems.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBacklogItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchBacklogItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Create
      .addCase(createBacklogItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // prepend the new item
      })
      // Reorder (failure triggers rollback)
      .addCase(reorderBacklogItem.rejected, (state, action) => {
        const payload = action.payload as { originalItems?: BacklogItem[] };
        if (payload?.originalItems) {
          state.items = payload.originalItems;
        }
      })
      // Bulk update
      .addCase(bulkUpdateBacklogItems.fulfilled, (state, action) => {
        const { itemIds, priority, sprintId, assigneeId, assignee } = action.payload.payload;
        state.items.forEach(item => {
          if (itemIds.includes(item.id)) {
            if (priority !== undefined) item.priority = priority;
            if (sprintId !== undefined) item.sprintId = sprintId === null ? undefined : sprintId;
            if (assigneeId !== undefined) item.assigneeId = assigneeId === null ? undefined : assigneeId;
            if (assignee !== undefined) item.assignee = assignee === null ? undefined : assignee;
          }
        });
        state.selectedIds = [];
      })
      // Refine
      .addCase(refineBacklogItem.fulfilled, (state, action) => {
        const { itemId } = action.payload;
        const item = state.items.find(i => i.id === itemId);
        if (item) {
          item.status = 'Refined';
        }
      });
  },
});

export const { toggleSelection, selectAll, clearSelection, optimisticReorder } = backlogSlice.actions;

export const selectBacklogItems = (state: { backlog: BacklogState }) => state.backlog.items;
export const selectBacklogMeta = (state: { backlog: BacklogState }) => state.backlog.meta;
export const selectBacklogStatus = (state: { backlog: BacklogState }) => state.backlog.status;
export const selectSelectedIds = (state: { backlog: BacklogState }) => state.backlog.selectedIds;

export default backlogSlice.reducer;
