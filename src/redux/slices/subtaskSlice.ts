import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  subtaskService,
  Subtask,
  SubtaskPayload,
  SubtaskParentType,
} from '../../services/subtaskService';

interface SubtaskState {
  /** Keyed by `${parentType}:${parentId}` so each parent owns its own list. */
  byParent: Record<string, Subtask[]>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SubtaskState = {
  byParent: {},
  status: 'idle',
  error: null,
};

const keyOf = (parentType: SubtaskParentType, parentId: string) => `${parentType}:${parentId}`;

const wrap = async <T>(fn: () => Promise<T>, rejectWithValue: (v: string) => unknown) => {
  try { return await fn(); }
  catch (e: unknown) { return rejectWithValue((e as { message?: string }).message ?? 'Error'); }
};

export const fetchSubtasks = createAsyncThunk(
  'subtasks/fetch',
  async ({ parentType, parentId }: { parentType: SubtaskParentType; parentId: string }, { rejectWithValue }) =>
    wrap(
      async () => ({ key: keyOf(parentType, parentId), items: await subtaskService.listByParent(parentType, parentId) }),
      rejectWithValue as (v: string) => unknown,
    )
);

export const createSubtask = createAsyncThunk(
  'subtasks/create',
  async (payload: SubtaskPayload, { rejectWithValue }) =>
    wrap(
      async () => ({ key: keyOf(payload.parentType, payload.parentId), item: await subtaskService.create(payload) }),
      rejectWithValue as (v: string) => unknown,
    )
);

export const setSubtaskStatus = createAsyncThunk(
  'subtasks/setStatus',
  async (
    { id, status, parentType, parentId }: { id: string; status: string; parentType: SubtaskParentType; parentId: string },
    { rejectWithValue },
  ) =>
    wrap(
      async () => ({ key: keyOf(parentType, parentId), item: await subtaskService.setStatus(id, status) }),
      rejectWithValue as (v: string) => unknown,
    )
);

const subtaskSlice = createSlice({
  name: 'subtasks',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSubtasks.pending, state => { state.status = 'loading'; state.error = null; })
      .addCase(fetchSubtasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { key, items } = action.payload as { key: string; items: Subtask[] };
        state.byParent[key] = items;
      })
      .addCase(fetchSubtasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createSubtask.fulfilled, (state, action) => {
        const { key, item } = action.payload as { key: string; item: Subtask };
        state.byParent[key] = [...(state.byParent[key] ?? []), item];
      })
      .addCase(setSubtaskStatus.fulfilled, (state, action) => {
        const { key, item } = action.payload as { key: string; item: Subtask };
        const list = state.byParent[key];
        if (list) {
          const idx = list.findIndex(s => s.id === item.id);
          if (idx !== -1) list[idx] = item;
        }
      });
  },
});

export const selectSubtasks =
  (parentType: SubtaskParentType, parentId: string) =>
  (state: { subtasks: SubtaskState }) =>
    state.subtasks.byParent[keyOf(parentType, parentId)] ?? [];

export const selectSubtaskStatus = (state: { subtasks: SubtaskState }) => state.subtasks.status;

export default subtaskSlice.reducer;
