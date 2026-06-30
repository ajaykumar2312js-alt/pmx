import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auditLogService, AuditLog, AuditLogMeta, AuditLogListParams } from '../../services/auditLogService';

interface AuditLogState {
  list: AuditLog[];
  meta: AuditLogMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuditLogState = {
  list: [],
  meta: null,
  status: 'idle',
  error: null,
};

export const fetchAuditLogs = createAsyncThunk(
  'auditLogs/fetchAuditLogs',
  async (params: AuditLogListParams, { rejectWithValue }) => {
    try {
      return await auditLogService.list(params);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Failed to fetch audit logs';
      return rejectWithValue(msg);
    }
  }
);

export const auditLogSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const selectAuditLogs = (state: { auditLogs: AuditLogState }) => state.auditLogs.list;
export const selectAuditLogsMeta = (state: { auditLogs: AuditLogState }) => state.auditLogs.meta;
export const selectAuditLogsStatus = (state: { auditLogs: AuditLogState }) => state.auditLogs.status;

export default auditLogSlice.reducer;
