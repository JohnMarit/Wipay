import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe localStorage utilities to prevent parsing errors
export const storage = {
  // Safely get and parse JSON from localStorage
  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      if (typeof window === 'undefined') return defaultValue || null;
      
      const item = localStorage.getItem(key);
      if (!item) return defaultValue || null;
      
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Failed to parse localStorage item "${key}":`, error);
      // Clean up invalid data
      try {
        localStorage.removeItem(key);
      } catch (removeError) {
        console.warn(`Failed to remove invalid localStorage item "${key}":`, removeError);
      }
      return defaultValue || null;
    }
  },

  // Safely set JSON to localStorage
  setItem<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to set localStorage item "${key}":`, error);
      return false;
    }
  },

  // Safely remove from localStorage
  removeItem(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove localStorage item "${key}":`, error);
      return false;
    }
  },

  // Check if localStorage is available
  isAvailable(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
};

// Safe sessionStorage utilities
export const sessionStorage_ = {
  // Safely get and parse JSON from sessionStorage
  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      if (typeof window === 'undefined') return defaultValue || null;
      
      const item = sessionStorage.getItem(key);
      if (!item) return defaultValue || null;
      
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Failed to parse sessionStorage item "${key}":`, error);
      // Clean up invalid data
      try {
        sessionStorage.removeItem(key);
      } catch (removeError) {
        console.warn(`Failed to remove invalid sessionStorage item "${key}":`, removeError);
      }
      return defaultValue || null;
    }
  },

  // Safely set JSON to sessionStorage
  setItem<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to set sessionStorage item "${key}":`, error);
      return false;
    }
  },

  // Safely remove from sessionStorage
  removeItem(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove sessionStorage item "${key}":`, error);
      return false;
    }
  }
};
