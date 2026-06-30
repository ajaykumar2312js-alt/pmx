import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storyService, Story, StoryPayload, StoryListParams } from '../../services/storyService';
import { PaginationMeta } from '../../common/types';

interface StoryState {
  items: Story[];
  meta: PaginationMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;

  currentStory: Story | null;
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: StoryState = {
  items: [],
  meta: null,
  status: 'idle',
  error: null,
  currentStory: null,
  detailStatus: 'idle',
};

const wrap = async <T>(fn: () => Promise<T>, rejectWithValue: (v: string) => unknown) => {
  try { return await fn(); }
  catch (e: unknown) { return rejectWithValue((e as { message?: string }).message ?? 'Error'); }
};

export const fetchStories = createAsyncThunk(
  'stories/fetchStories',
  async ({ projectId, params }: { projectId: string; params: StoryListParams }, { rejectWithValue }) =>
    wrap(() => storyService.list(projectId, params), rejectWithValue as (v: string) => unknown)
);

export const fetchStoryDetail = createAsyncThunk(
  'stories/fetchStoryDetail',
  async (id: string, { rejectWithValue }) =>
    wrap(() => storyService.getById(id), rejectWithValue as (v: string) => unknown)
);

export const createStory = createAsyncThunk(
  'stories/createStory',
  async ({ projectId, payload }: { projectId: string; payload: StoryPayload }, { rejectWithValue }) =>
    wrap(() => storyService.create(projectId, payload), rejectWithValue as (v: string) => unknown)
);

export const updateStory = createAsyncThunk(
  'stories/updateStory',
  async ({ id, payload }: { id: string; payload: Partial<StoryPayload> }, { rejectWithValue }) =>
    wrap(() => storyService.update(id, payload), rejectWithValue as (v: string) => unknown)
);

export const changeStoryStatus = createAsyncThunk(
  'stories/changeStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) =>
    wrap(() => storyService.changeStatus(id, status), rejectWithValue as (v: string) => unknown)
);

export const deleteStory = createAsyncThunk(
  'stories/deleteStory',
  async (id: string, { rejectWithValue }) => {
    try {
      await storyService.delete(id);
      return id;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to delete story');
    }
  }
);

const upsertInList = (items: Story[], story: Story) => {
  const idx = items.findIndex(s => s.id === story.id);
  if (idx !== -1) items[idx] = story;
  else items.unshift(story);
};

const storySlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    clearCurrentStory(state) {
      state.currentStory = null;
      state.detailStatus = 'idle';
    },
  },
  extraReducers: builder => {
    builder
      // list
      .addCase(fetchStories.pending, state => { state.status = 'loading'; state.error = null; })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const payload = action.payload as { items: Story[]; meta: PaginationMeta };
        state.items = payload.items;
        state.meta = payload.meta;
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // detail
      .addCase(fetchStoryDetail.pending, state => { state.detailStatus = 'loading'; })
      .addCase(fetchStoryDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.currentStory = action.payload as Story;
      })
      .addCase(fetchStoryDetail.rejected, state => { state.detailStatus = 'failed'; })
      // create
      .addCase(createStory.fulfilled, (state, action) => {
        state.items.unshift(action.payload as Story);
      })
      // update / status change
      .addCase(updateStory.fulfilled, (state, action) => {
        upsertInList(state.items, action.payload as Story);
        if (state.currentStory?.id === (action.payload as Story).id) {
          state.currentStory = action.payload as Story;
        }
      })
      .addCase(changeStoryStatus.fulfilled, (state, action) => {
        upsertInList(state.items, action.payload as Story);
        if (state.currentStory?.id === (action.payload as Story).id) {
          state.currentStory = action.payload as Story;
        }
      })
      // delete
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.items = state.items.filter(s => s.id !== action.payload);
        if (state.currentStory?.id === action.payload) {
          state.currentStory = null;
        }
      });
  },
});

export const { clearCurrentStory } = storySlice.actions;

export const selectStories = (state: { stories: StoryState }) => state.stories.items;
export const selectStoryMeta = (state: { stories: StoryState }) => state.stories.meta;
export const selectStoryStatus = (state: { stories: StoryState }) => state.stories.status;
export const selectCurrentStory = (state: { stories: StoryState }) => state.stories.currentStory;
export const selectStoryDetailStatus = (state: { stories: StoryState }) => state.stories.detailStatus;

export default storySlice.reducer;
