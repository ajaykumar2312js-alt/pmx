import { describe, it, expect } from 'vitest';
import uiReducer, {
  setGlobalLoading,
  enqueueToast,
  dismissToast,
  setActiveProject,
} from './uiSlice';

describe('uiSlice', () => {
  const initialState = {
    globalLoading: false,
    toasts: [],
    activeProjectId: null,
  };

  it('should return the initial state', () => {
    expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setGlobalLoading', () => {
    const state = uiReducer(initialState, setGlobalLoading(true));
    expect(state.globalLoading).toBe(true);
  });

  it('should handle enqueueToast and dismissToast', () => {
    let state = uiReducer(initialState, enqueueToast({ message: 'Hello', severity: 'success' }));
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].message).toBe('Hello');
    expect(state.toasts[0].id).toBeDefined();

    const toastId = state.toasts[0].id;
    state = uiReducer(state, dismissToast(toastId));
    expect(state.toasts).toHaveLength(0);
  });

  it('should handle setActiveProject', () => {
    const state = uiReducer(initialState, setActiveProject('proj-1'));
    expect(state.activeProjectId).toBe('proj-1');
  });
});
