import { describe, it, expect, vi } from 'vitest';
import { toUtcDate, serializeUtc, formatDateOnly } from './dateUtils';
import { normalizeError } from './errorHandler';
import { validators } from './validators';
import { storageUtils } from './storageUtils';

describe('Utils', () => {
  describe('dateUtils', () => {
    it('rejects offset strings', () => {
      expect(() => toUtcDate('2024-01-15T09:30:00+05:30')).toThrow();
    });

    it('accepts UTC strings and date-only strings', () => {
      const d1 = toUtcDate('2024-01-15T09:30:00Z');
      expect(d1.toISOString()).toBe('2024-01-15T09:30:00.000Z');

      const d2 = toUtcDate('2024-01-15');
      expect(d2.toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });

    it('serializeUtc formats to UTC Z', () => {
      const d = new Date('2024-01-15T09:30:00Z');
      expect(serializeUtc(d)).toBe('2024-01-15T09:30:00.000Z');
    });

    it('formatDateOnly strips time', () => {
      const d = new Date('2024-01-15T09:30:00Z');
      expect(formatDateOnly(d)).toBe('2024-01-15');
    });
  });

  describe('errorHandler', () => {
    it('normalizes API error mapping fields to fieldErrors', () => {
      const rawError = {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: [{ field: 'email', message: 'Invalid email format' }],
      };

      const normalized = normalizeError(rawError);
      expect(normalized.message).toBe('Validation failed');
      expect(normalized.fieldErrors['email']).toBe('Invalid email format');
    });
  });

  describe('validators', () => {
    it('validates required', () => {
      expect(validators.required('')).toBe('This field is required');
      expect(validators.required('text')).toBeNull();
    });

    it('validates email', () => {
      expect(validators.email('not-an-email')).toBe('Invalid email format');
      expect(validators.email('test@example.com')).toBeNull();
    });
  });

  describe('storageUtils', () => {
    it('refuses to persist tokens', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      storageUtils.setItem('accessToken', 'my-token');
      expect(setItemSpy).not.toHaveBeenCalled();
      setItemSpy.mockRestore();
    });
  });
});
