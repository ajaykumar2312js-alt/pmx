/**
 * Safe local storage wrapper.
 * Will explicitly refuse to store credential-like keys (token, jwt, auth,
 * bearer, secret, password, session) per security requirements.
 */
const CREDENTIAL_KEY_PATTERN = /token|jwt|auth|bearer|secret|password|session/i;

export const storageUtils = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (CREDENTIAL_KEY_PATTERN.test(key)) {
      console.warn('Attempted to store a credential-like value in localStorage. This is prohibited.');
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('localStorage is not available', e);
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },
};
