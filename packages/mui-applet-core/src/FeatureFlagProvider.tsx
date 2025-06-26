import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Supported feature flag value types
 */
export type FeatureFlagValue = boolean | string | number;

/**
 * Feature flag configuration interface
 */
export interface FeatureFlagConfig<T extends FeatureFlagValue = FeatureFlagValue> {
  /** Unique identifier for the feature flag */
  key: string;
  /** Default value for the feature flag */
  defaultValue: T;
  /** Human-readable description of the feature flag */
  description?: string;
  /** Whether to persist the value to localStorage */
  persist?: boolean;
  /** Optional validation function for the value */
  validate?: (value: T) => boolean;
  /** Optional transformation function when loading from storage */
  transform?: (value: any) => T;
}

/**
 * Feature flag state interface
 */
export interface FeatureFlagState {
  /** Current values of all feature flags */
  flags: Record<string, FeatureFlagValue>;
  /** Set a feature flag value */
  setFlag: <T extends FeatureFlagValue>(key: string, value: T) => void;
  /** Get a feature flag value with type safety */
  getFlag: <T extends FeatureFlagValue>(key: string) => T | undefined;
  /** Toggle a boolean feature flag */
  toggleFlag: (key: string) => void;
  /** Reset a feature flag to its default value */
  resetFlag: (key: string) => void;
  /** Reset all feature flags to their default values */
  resetAllFlags: () => void;
  /** Check if a feature flag is enabled (for boolean flags) */
  isEnabled: (key: string) => boolean;
  /** Get all configured feature flags */
  getConfigs: () => FeatureFlagConfig[];
}

const FeatureFlagContext = createContext<FeatureFlagState | undefined>(undefined);

/**
 * Props for the FeatureFlagProvider component
 */
export interface FeatureFlagProviderProps {
  /** Child components */
  children: React.ReactNode;
  /** Feature flag configurations */
  configs: FeatureFlagConfig[];
  /** Optional prefix for localStorage keys */
  storagePrefix?: string;
  /** Optional callback when a flag value changes */
  onFlagChange?: (key: string, value: FeatureFlagValue, previousValue?: FeatureFlagValue) => void;
}

/**
 * A flexible feature flag provider that supports different value types,
 * localStorage persistence, and type-safe access to feature flags.
 * 
 * @example
 * ```tsx
 * const featureFlags = [
 *   {
 *     key: 'darkMode',
 *     defaultValue: false,
 *     description: 'Enable dark mode theme',
 *     persist: true,
 *   },
 *   {
 *     key: 'mockData',
 *     defaultValue: true,
 *     description: 'Use mock data instead of real API',
 *     persist: true,
 *   },
 *   {
 *     key: 'debugLevel',
 *     defaultValue: 'info',
 *     description: 'Debug logging level',
 *     persist: true,
 *   },
 * ];
 * 
 * <FeatureFlagProvider configs={featureFlags}>
 *   <App />
 * </FeatureFlagProvider>
 * ```
 */
export function FeatureFlagProvider({
  children,
  configs,
  storagePrefix = 'featureFlag',
  onFlagChange,
}: FeatureFlagProviderProps) {
  // Initialize flags with default values or stored values
  const [flags, setFlags] = useState<Record<string, FeatureFlagValue>>(() => {
    const initialFlags: Record<string, FeatureFlagValue> = {};
    
    configs.forEach(config => {
      let value = config.defaultValue;
      
      // Try to load from localStorage if persistence is enabled
      if (config.persist) {
        try {
          const stored = localStorage.getItem(`${storagePrefix}-${config.key}`);
          if (stored !== null) {
            let parsedValue = JSON.parse(stored);
            
            // Apply transformation if provided
            if (config.transform) {
              parsedValue = config.transform(parsedValue);
            }
            
            // Validate the loaded value
            if (!config.validate || config.validate(parsedValue)) {
              value = parsedValue;
            }
          }
        } catch (error) {
          console.warn(`Failed to load feature flag '${config.key}' from localStorage:`, error);
        }
      }
      
      initialFlags[config.key] = value;
    });
    
    return initialFlags;
  });

  // Helper to get config for a key
  const getConfig = useCallback((key: string) => {
    return configs.find(config => config.key === key);
  }, [configs]);

  // Persist flag to localStorage if enabled
  const persistFlag = useCallback((key: string, value: FeatureFlagValue) => {
    const config = getConfig(key);
    if (config?.persist) {
      try {
        localStorage.setItem(`${storagePrefix}-${key}`, JSON.stringify(value));
      } catch (error) {
        console.warn(`Failed to persist feature flag '${key}' to localStorage:`, error);
      }
    }
  }, [getConfig, storagePrefix]);

  const setFlag = useCallback(<T extends FeatureFlagValue>(key: string, value: T) => {
    const config = getConfig(key);
    if (!config) {
      console.warn(`Feature flag '${key}' is not configured`);
      return;
    }

    // Validate the value if validator is provided
    if (config.validate && !config.validate(value)) {
      console.warn(`Invalid value for feature flag '${key}':`, value);
      return;
    }

    setFlags(prev => {
      const previousValue = prev[key];
      const newFlags = { ...prev, [key]: value };
      
      // Persist the value
      persistFlag(key, value);
      
      // Call onChange callback
      if (onFlagChange) {
        onFlagChange(key, value, previousValue);
      }
      
      return newFlags;
    });
  }, [getConfig, persistFlag, onFlagChange]);

  const getFlag = useCallback(<T extends FeatureFlagValue>(key: string): T | undefined => {
    return flags[key] as T | undefined;
  }, [flags]);

  const toggleFlag = useCallback((key: string) => {
    const currentValue = flags[key];
    if (typeof currentValue === 'boolean') {
      setFlag(key, !currentValue);
    } else {
      console.warn(`Cannot toggle non-boolean feature flag '${key}'`);
    }
  }, [flags, setFlag]);

  const resetFlag = useCallback((key: string) => {
    const config = getConfig(key);
    if (config) {
      setFlag(key, config.defaultValue);
    }
  }, [getConfig, setFlag]);

  const resetAllFlags = useCallback(() => {
    configs.forEach(config => {
      setFlag(config.key, config.defaultValue);
    });
  }, [configs, setFlag]);

  const isEnabled = useCallback((key: string): boolean => {
    const value = flags[key];
    return typeof value === 'boolean' ? value : false;
  }, [flags]);

  const getConfigs = useCallback(() => configs, [configs]);

  const contextValue: FeatureFlagState = {
    flags,
    setFlag,
    getFlag,
    toggleFlag,
    resetFlag,
    resetAllFlags,
    isEnabled,
    getConfigs,
  };

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Hook to access feature flag state
 * Must be used within a FeatureFlagProvider
 */
export function useFeatureFlags(): FeatureFlagState {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}

/**
 * Hook to access a specific feature flag value with type safety
 * 
 * @example
 * ```tsx
 * const isDarkMode = useFeatureFlag<boolean>('darkMode');
 * const debugLevel = useFeatureFlag<string>('debugLevel');
 * ```
 */
export function useFeatureFlag<T extends FeatureFlagValue>(key: string): T | undefined {
  const { getFlag } = useFeatureFlags();
  return getFlag<T>(key);
}

/**
 * Hook to check if a boolean feature flag is enabled
 * 
 * @example
 * ```tsx
 * const isDarkModeEnabled = useFeatureFlagEnabled('darkMode');
 * ```
 */
export function useFeatureFlagEnabled(key: string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(key);
}

/**
 * Hook to get a feature flag toggle function for boolean flags
 * 
 * @example
 * ```tsx
 * const toggleDarkMode = useFeatureFlagToggle('darkMode');
 * ```
 */
export function useFeatureFlagToggle(key: string): () => void {
  const { toggleFlag } = useFeatureFlags();
  return useCallback(() => toggleFlag(key), [toggleFlag, key]);
}