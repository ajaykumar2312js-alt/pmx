import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import apiClient, { setApiAuthHandlers, get, buildPaginationParams } from './apiClient';
import MockAdapter from 'axios-mock-adapter';

describe('apiClient', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    setApiAuthHandlers(
      () => null,
      async () => {},
    );
  });

  afterEach(() => {
    mock.reset();
  });

  it('unwraps data and meta on success', async () => {
    mock.onGet('/test').reply(200, {
      success: true,
      statusCode: 200,
      message: 'OK',
      data: { id: 1 },
      meta: { total: 1 },
    });

    const response = await get<{ id: number }>('/test');
    expect(response.data).toEqual({ id: 1 });
    expect(response.meta).toEqual({ total: 1 });
  });

  it('normalizes error response', async () => {
    mock.onGet('/test').reply(400, {
      success: false,
      statusCode: 400,
      message: 'Bad Request',
      errors: [{ field: 'name', code: 'INVALID', message: 'Invalid' }],
    });

    try {
      await get('/test');
      expect.fail('Should have thrown');
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Bad Request');
      expect(err.errors).toHaveLength(1);
      expect(err.code).toBe('INVALID');
    }
  });

  it('retries once on 401', async () => {
    let refreshCalled = false;
    let token: string | null = null;
    setApiAuthHandlers(
      () => token,
      async () => {
        refreshCalled = true;
        token = 'new-token';
      }
    );

    mock.onGet('/test').reply((config) => {
      if (config.headers?.Authorization === 'Bearer new-token') {
        return [200, { success: true, statusCode: 200, message: 'OK', data: { ok: true }, meta: null }];
      }
      return [401, { success: false, statusCode: 401, message: 'Unauthorized' }];
    });

    const response = await get<{ ok: boolean }>('/test');
    expect(refreshCalled).toBe(true);
    expect(response.data.ok).toBe(true);
  });

  it('buildPaginationParams formats correctly', () => {
    const params = buildPaginationParams({ limit: 50, cursor: 'abc', direction: 'prev' });
    expect(params.limit).toBe(50);
    expect(params.cursor).toBe('abc');
    expect(params.direction).toBe('prev');
  });
});
