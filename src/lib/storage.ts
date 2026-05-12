/**
 * Utility to safely access localStorage and sessionStorage in iframe environments.
 * Prevents "SecurityError" crashes if third-party storage is blocked by the browser.
 */

export const safeStorage = {
  get: (key: string, type: 'local' | 'session' = 'local'): string | null => {
    try {
      const storage = type === 'local' ? window.localStorage : window.sessionStorage;
      return storage.getItem(key);
    } catch (e) {
      console.warn(`Storage access blocked for ${key} in ${type}Storage:`, e);
      return null;
    }
  },

  set: (key: string, value: string, type: 'local' | 'session' = 'local'): boolean => {
    try {
      const storage = type === 'local' ? window.localStorage : window.sessionStorage;
      storage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn(`Failed to set ${key} in ${type}Storage:`, e);
      return false;
    }
  },

  remove: (key: string, type: 'local' | 'session' = 'local'): boolean => {
    try {
      const storage = type === 'local' ? window.localStorage : window.sessionStorage;
      storage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`Failed to remove ${key} from ${type}Storage:`, e);
      return false;
    }
  }
};
