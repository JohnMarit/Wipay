import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// App-specific storage namespace to avoid conflicts with extensions
const WIPAY_STORAGE_PREFIX = 'wipay_';

// Safe localStorage utilities to prevent parsing errors
export const storage = {
  // Safely get and parse JSON from localStorage with app namespace
  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      if (typeof window === 'undefined') return defaultValue || null;

      const namespacedKey = WIPAY_STORAGE_PREFIX + key;
      const item = localStorage.getItem(namespacedKey);
      if (!item) return defaultValue || null;

      return JSON.parse(item);
    } catch (error) {
      console.warn(
        `[Wipay] Failed to parse localStorage item "${key}":`,
        error
      );
      // Clean up invalid data
      try {
        localStorage.removeItem(WIPAY_STORAGE_PREFIX + key);
      } catch (removeError) {
        console.warn(
          `[Wipay] Failed to remove invalid localStorage item "${key}":`,
          removeError
        );
      }
      return defaultValue || null;
    }
  },

  // Safely set JSON to localStorage with app namespace
  setItem<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const namespacedKey = WIPAY_STORAGE_PREFIX + key;
      localStorage.setItem(namespacedKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`[Wipay] Failed to set localStorage item "${key}":`, error);
      return false;
    }
  },

  // Safely remove from localStorage with app namespace
  removeItem(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const namespacedKey = WIPAY_STORAGE_PREFIX + key;
      localStorage.removeItem(namespacedKey);
      return true;
    } catch (error) {
      console.warn(
        `[Wipay] Failed to remove localStorage item "${key}":`,
        error
      );
      return false;
    }
  },

  // Check if localStorage is available and safe to use
  isAvailable(): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const testKey = WIPAY_STORAGE_PREFIX + '__test__';
      localStorage.setItem(testKey, 'test');
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return retrieved === 'test';
    } catch {
      return false;
    }
  },

  // Clear all Wipay-specific localStorage items
  clearAll(): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(WIPAY_STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.warn('[Wipay] Failed to clear localStorage:', error);
      return false;
    }
  },
};

// Safe sessionStorage utilities with app namespace
export const sessionStorage_ = {
  // Safely get and parse JSON from sessionStorage with app namespace
  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      if (typeof window === 'undefined') return defaultValue || null;

      const namespacedKey = WIPAY_STORAGE_PREFIX + key;
      const item = sessionStorage.getItem(namespacedKey);
      if (!item) return defaultValue || null;

      return JSON.parse(item);
    } catch (error) {
      console.warn(
        `[Wipay] Failed to parse sessionStorage item "${key}":`,
        error
      );
      // Clean up invalid data
      try {
        sessionStorage.removeItem(WIPAY_STORAGE_PREFIX + key);
      } catch (removeError) {
        console.warn(
          `[Wipay] Failed to remove invalid sessionStorage item "${key}":`,
          removeError
        );
      }
      return defaultValue || null;
    }
  },

  // Safely set JSON to sessionStorage with app namespace
  setItem<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const namespacedKey = WIPAY_STORAGE_PREFIX + key;
      sessionStorage.setItem(namespacedKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(
        `[Wipay] Failed to set sessionStorage item "${key}":`,
        error
      );
      return false;
    }
  },

  // Safely remove from sessionStorage with app namespace
  removeItem(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const namespacedKey = WIPAY_STORAGE_PREFIX + key;
      sessionStorage.removeItem(namespacedKey);
      return true;
    } catch (error) {
      console.warn(
        `[Wipay] Failed to remove sessionStorage item "${key}":`,
        error
      );
      return false;
    }
  },
};

// Global error handler for uncaught localStorage errors from extensions
export const initializeStorageErrorHandler = () => {
  if (typeof window === 'undefined') return;

  // More aggressive console override to suppress external localStorage errors
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = (...args) => {
    const message = args.join(' ');
    // Suppress external localStorage errors
    if (
      message.includes('Failed to parse item from local storage') ||
      (message.includes('localStorage') && message.includes('content.js'))
    ) {
      return; // Completely suppress these errors
    }
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    // Suppress external localStorage warnings
    if (
      message.includes('Failed to parse item from local storage') ||
      (message.includes('localStorage') && message.includes('content.js'))
    ) {
      return; // Completely suppress these warnings
    }
    originalConsoleWarn.apply(console, args);
  };

  // Catch any global storage errors and prevent them from affecting the app
  window.addEventListener(
    'error',
    event => {
      if (
        event.message &&
        (event.message.includes('localStorage') ||
          event.message.includes('Failed to parse item from local storage') ||
          event.filename?.includes('content.js'))
      ) {
        console.log(
          '[Wipay] ✅ Blocked external localStorage error from browser extension'
        );
        event.preventDefault(); // Prevent the error from bubbling up
        event.stopPropagation();
        return false;
      }
    },
    true
  );

  // Additional protection for unhandled promise rejections related to storage
  window.addEventListener('unhandledrejection', event => {
    if (
      event.reason &&
      event.reason.message &&
      event.reason.message.includes('localStorage')
    ) {
      console.log('[Wipay] ✅ Blocked external localStorage promise rejection');
      event.preventDefault();
    }
  });

  // Override localStorage and sessionStorage access to catch external errors
  const originalLocalStorageGetItem = localStorage.getItem;
  const originalSessionStorageGetItem = sessionStorage.getItem;

  // Intercept external localStorage access
  localStorage.getItem = function (key: string) {
    try {
      return originalLocalStorageGetItem.call(this, key);
    } catch (error) {
      // If it's not a Wipay key and it fails, suppress the error
      if (!key.startsWith('wipay_')) {
        console.log(
          `[Wipay] ✅ Blocked external localStorage error for key: ${key}`
        );
        return null;
      }
      throw error;
    }
  };

  // Intercept external sessionStorage access
  sessionStorage.getItem = function (key: string) {
    try {
      return originalSessionStorageGetItem.call(this, key);
    } catch (error) {
      // If it's not a Wipay key and it fails, suppress the error
      if (!key.startsWith('wipay_')) {
        console.log(
          `[Wipay] ✅ Blocked external sessionStorage error for key: ${key}`
        );
        return null;
      }
      throw error;
    }
  };

  // Additional protection for quota exceeded errors
  window.addEventListener('storage', event => {
    // Only log Wipay-specific storage events
    if (event.key && event.key.startsWith(WIPAY_STORAGE_PREFIX)) {
      console.debug('[Wipay] Storage event:', event);
    }
  });
};
