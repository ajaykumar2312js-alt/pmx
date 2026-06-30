import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService, Task, TaskPayload, TaskListParams } from '../../services/taskService';
import { PaginationMeta } from '../../common/types';

interface TaskState {
  items: Task[];
  meta: PaginationMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  
  // Specific Task detail view
  currentTask: Task | null;
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: TaskState = {
  items: [],
  meta: null,
  status: 'idle',
  error: null,
  
  currentTask: null,
  detailStatus: 'idle',
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ projectId, params }: { projectId: string; params: TaskListParams }, { rejectWithValue }) => {
    try {
      const response = await taskService.list(projectId, params);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskDetail = createAsyncThunk(
  'tasks/fetchTaskDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await taskService.getById(id);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to fetch task details');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ projectId, payload }: { projectId: string; payload: TaskPayload }, { rejectWithValue }) => {
    try {
      const response = await taskService.create(projectId, payload);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, payload }: { id: string; payload: Partial<TaskPayload> }, { rejectWithValue }) => {
    try {
      const response = await taskService.update(id, payload);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to update task');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateStatus(id, status);
      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to update task status');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await taskService.delete(id);
      return id;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'Failed to delete task');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearCurrentTask(state) {
      state.currentTask = null;
      state.detailStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Fetch Detail
      .addCase(fetchTaskDetail.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchTaskDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskDetail.rejected, (state) => {
        state.detailStatus = 'failed';
      })
      // Create
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      // Update Status
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      // Delete
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t.id !== action.payload);
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      });
  },
});

export const { clearCurrentTask } = taskSlice.actions;

export const selectTasks = (state: { tasks: TaskState }) => state.tasks.items;
export const selectTaskMeta = (state: { tasks: TaskState }) => state.tasks.meta;
export const selectTaskStatus = (state: { tasks: TaskState }) => state.tasks.status;
export const selectCurrentTask = (state: { tasks: TaskState }) => state.tasks.currentTask;
export const selectTaskDetailStatus = (state: { tasks: TaskState }) => state.tasks.detailStatus;

export default taskSlice.reducer;
