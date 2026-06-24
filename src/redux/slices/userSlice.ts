import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService, UserListParams, CreateUserPayload } from '../../services/userService';
import { UserProfile } from './authSlice';
import { PaginationMeta } from '../../common/types';
import { Role } from '../../common/enums';

interface UserState {
  list: UserProfile[];
  meta: PaginationMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  list: [],
  meta: null,
  status: 'idle',
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: UserListParams, { rejectWithValue }) => {
    try {
      const data = await userService.list(params);
      return data;
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (payload: CreateUserPayload, { rejectWithValue }) => {
    try {
      const user = await userService.create(payload);
      return user;
    } catch (err: unknown) {
      // Return the full error object for 409 handling in the component
      return rejectWithValue(err);
    }
  }
);

export const updateUserRoles = createAsyncThunk(
  'users/updateUserRoles',
  async ({ id, roles }: { id: string; roles: Role[] }, { rejectWithValue }) => {
    try {
      const user = await userService.updateRoles(id, roles);
      return user;
    } catch (err: unknown) {
      return rejectWithValue(err);
    }
  }
);

export const deactivateUser = createAsyncThunk(
  'users/deactivateUser',
  async (id: string, { rejectWithValue }) => {
    try {
      const user = await userService.deactivate(id);
      return user;
    } catch (err: unknown) {
      return rejectWithValue(err);
    }
  }
);

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Optimistic or list-refetch updates:
      // Typically we just refetch the list after create/update,
      // but we can also inject the updated user to save a request.
      .addCase(updateUserRoles.fulfilled, (state, action) => {
        const index = state.list.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        const index = state.list.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export const selectUsers = (state: { users: UserState }) => state.users.list;
export const selectUsersMeta = (state: { users: UserState }) => state.users.meta;
export const selectUsersStatus = (state: { users: UserState }) => state.users.status;

export default userSlice.reducer;
