import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectService, Project, ProjectListParams, ProjectPayload } from '../../services/projectService';
import { PaginationMeta } from '../../common/types';

interface ProjectState {
  list: Project[];
  meta: PaginationMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentProject: Project | null;
  currentProjectStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ProjectState = {
  list: [],
  meta: null,
  status: 'idle',
  error: null,
  currentProject: null,
  currentProjectStatus: 'idle',
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params: ProjectListParams, { rejectWithValue }) => {
    try {
      const data = await projectService.list(params);
      return data;
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Failed to fetch projects');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id: string, { rejectWithValue }) => {
    try {
      const project = await projectService.getById(id);
      return project;
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Failed to fetch project');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (payload: ProjectPayload, { rejectWithValue }) => {
    try {
      const project = await projectService.create(payload);
      return project;
    } catch (err: unknown) {
      return rejectWithValue(err); // Return full error for 409 mapping in component
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, payload }: { id: string; payload: Partial<ProjectPayload> }, { rejectWithValue }) => {
    try {
      const project = await projectService.update(id, payload);
      return project;
    } catch (err: unknown) {
      return rejectWithValue(err);
    }
  }
);

export const archiveProject = createAsyncThunk(
  'projects/archiveProject',
  async (id: string, { rejectWithValue }) => {
    try {
      const project = await projectService.archive(id);
      return project;
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Failed to archive project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id: string, { rejectWithValue }) => {
    try {
      await projectService.delete(id);
      return id;
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Failed to delete project');
    }
  }
);

export const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Fetch Single Project
      .addCase(fetchProjectById.pending, (state) => {
        state.currentProjectStatus = 'loading';
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.currentProjectStatus = 'succeeded';
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state) => {
        state.currentProjectStatus = 'failed';
      })
      // Optimistic updates for mutations
      .addCase(createProject.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.list.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(archiveProject.fulfilled, (state, action) => {
        const index = state.list.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
      });
  },
});

export const selectProjects = (state: { projects: ProjectState }) => state.projects.list;
export const selectProjectsMeta = (state: { projects: ProjectState }) => state.projects.meta;
export const selectProjectsStatus = (state: { projects: ProjectState }) => state.projects.status;
export const selectCurrentProject = (state: { projects: ProjectState }) => state.projects.currentProject;

// Selector to get the globally active project using uiSlice's activeProjectId
export const selectActiveProject = (state: { projects: ProjectState; ui: { activeProjectId: string | null } }) => 
  state.projects.list.find(p => p.id === state.ui.activeProjectId) || null;

export default projectSlice.reducer;
