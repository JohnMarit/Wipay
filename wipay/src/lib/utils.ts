import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
      console.warn(`[Wipay] Failed to parse localStorage item "${key}":`, error);
      // Clean up invalid data
      try {
        localStorage.removeItem(WIPAY_STORAGE_PREFIX + key);
      } catch (removeError) {
        console.warn(`[Wipay] Failed to remove invalid localStorage item "${key}":`, removeError);
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
      console.warn(`[Wipay] Failed to remove localStorage item "${key}":`, error);
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
  }
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
      console.warn(`[Wipay] Failed to parse sessionStorage item "${key}":`, error);
      // Clean up invalid data
      try {
        sessionStorage.removeItem(WIPAY_STORAGE_PREFIX + key);
      } catch (removeError) {
        console.warn(`[Wipay] Failed to remove invalid sessionStorage item "${key}":`, removeError);
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
      console.warn(`[Wipay] Failed to set sessionStorage item "${key}":`, error);
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
      console.warn(`[Wipay] Failed to remove sessionStorage item "${key}":`, error);
      return false;
    }
  }
};

// Global error handler for uncaught localStorage errors from extensions
export const initializeStorageErrorHandler = () => {
  if (typeof window === 'undefined') return;
  
  // Catch any global storage errors and prevent them from affecting the app
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('localStorage')) {
      console.warn('[Wipay] Caught external localStorage error (likely from browser extension):', event.message);
      event.preventDefault(); // Prevent the error from bubbling up
    }
  });

  // Additional protection for quota exceeded errors
  window.addEventListener('storage', (event) => {
    // Only log Wipay-specific storage events
    if (event.key && event.key.startsWith(WIPAY_STORAGE_PREFIX)) {
      console.debug('[Wipay] Storage event:', event);
    }
  });
};
