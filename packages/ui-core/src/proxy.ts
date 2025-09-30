/**
 * Token Proxy System for Development
 * Wraps tokens to enable real-time modification in development
 */

// Store for token overrides
const tokenOverrides = new Map<string, any>();

// Event emitter for token changes
const listeners = new Set<() => void>();

// Flag to prevent loops during theme creation
let isCreatingTheme = false;

// Debouncing for token notifications
let notificationTimeout: number | null = null;
let pendingNotification = false;

export const addTokenChangeListener = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  // Don't notify during theme creation to prevent loops
  if (isCreatingTheme) {
    pendingNotification = true; // Remember we need to notify later
    return;
  }

  listeners.forEach(listener => listener());
  pendingNotification = false;
};

const debouncedNotifyListeners = () => {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  notificationTimeout = window.setTimeout(() => {
    notifyListeners();
    notificationTimeout = null;
  }, 50);
};

// Create a deep proxy for nested token objects
const createTokenProxy = <T extends object>(obj: T, path: string = ''): T => {
  return new Proxy(obj, {
    get(target, prop: string | symbol) {
      // Convert symbol to string for path
      const propKey = String(prop);
      const fullPath = path ? `${path}.${propKey}` : propKey;

      // Check for override first
      if (tokenOverrides.has(fullPath)) {
        return tokenOverrides.get(fullPath);
      }

      const value = (target as any)[prop];

      // Recursively proxy nested objects (but not functions or null)
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return createTokenProxy(value, fullPath);
      }

      return value;
    }
  }) as T;
};

// Token modification functions
export const updateToken = (path: string, value: any) => {
  tokenOverrides.set(path, value);
};

export const clearToken = (path: string) => {
  tokenOverrides.delete(path);
};

export const clearAllTokens = () => {
  tokenOverrides.clear();
};

export const exportTokenOverrides = () => {
  const overrides = Object.fromEntries(tokenOverrides);
  return JSON.stringify(overrides, null, 2);
};

export const importTokenOverrides = (json: string) => {
  try {
    const overrides = JSON.parse(json);
    tokenOverrides.clear();
    Object.entries(overrides).forEach(([path, value]) => {
      tokenOverrides.set(path, value);
    });
    notifyListeners();
    return true;
  } catch (error) {
    console.error('Failed to import token overrides:', error);
    return false;
  }
};

export const getTokenOverrides = () => {
  return Object.fromEntries(tokenOverrides);
};

// Theme creation control
export const setThemeCreating = (creating: boolean) => {
  isCreatingTheme = creating;

  // If finishing theme creation and there was a pending notification, send it now
  if (!creating && pendingNotification) {
    debouncedNotifyListeners();
  }
};

// Proxy wrapper function
export const withTokenProxy = <T extends object>(obj: T, name: string): T => {
  // Only proxy in development
  if (process.env.NODE_ENV !== 'development') {
    return obj;
  }

  return createTokenProxy(obj, name);
};

// Make proxy functions available globally for DevTools
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__tokenProxy = {
    updateToken,
    clearToken,
    clearAllTokens,
    exportTokenOverrides,
    importTokenOverrides,
    getTokenOverrides,
    addTokenChangeListener,
  };
}