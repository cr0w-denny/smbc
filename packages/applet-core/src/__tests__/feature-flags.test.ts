import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import {
  FeatureFlagProvider,
  useFeatureFlags,
  useFeatureFlag,
  useFeatureFlagEnabled,
  useFeatureFlagToggle,
} from "../FeatureFlagProvider";

describe("FeatureFlagProvider", () => {
  const mockConfigs = [
    {
      key: "darkMode",
      defaultValue: false,
      description: "Enable dark mode",
      persist: true,
    },
    {
      key: "debugLevel",
      defaultValue: "info",
      description: "Debug logging level",
      persist: true,
      validate: (value: any) => ["debug", "info", "warn", "error"].includes(value),
    },
    {
      key: "maxItems",
      defaultValue: 10,
      description: "Maximum items to display",
      persist: false,
    },
  ];

  // Mock localStorage
  const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    // Reset localStorage mock
    mockLocalStorage.clear();
    vi.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
  });

  const createFeatureFlagWrapper = (configs: any = mockConfigs, onFlagChange?: any) => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(FeatureFlagProvider, {
        configs,
        onFlagChange,
        children,
      });
  };

  describe("useFeatureFlags", () => {
    it("should initialize with default values", () => {
      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      expect(result.current.getFlag("darkMode")).toBe(false);
      expect(result.current.getFlag("debugLevel")).toBe("info");
      expect(result.current.getFlag("maxItems")).toBe(10);
    });

    it("should load persisted values from localStorage", () => {
      // Pre-populate localStorage
      mockLocalStorage.setItem("featureFlag-darkMode", "true");
      mockLocalStorage.setItem("featureFlag-debugLevel", '"debug"');

      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      expect(result.current.getFlag("darkMode")).toBe(true);
      expect(result.current.getFlag("debugLevel")).toBe("debug");
      expect(result.current.getFlag("maxItems")).toBe(10); // Not persisted
    });

    it("should validate loaded values and fallback to default", () => {
      // Set invalid value in localStorage
      mockLocalStorage.setItem("featureFlag-debugLevel", '"invalid"');

      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      // Should fallback to default because validation failed
      expect(result.current.getFlag("debugLevel")).toBe("info");
    });

    it("should handle localStorage errors gracefully", () => {
      // Mock localStorage to throw an error
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      // Should use default values when localStorage fails
      expect(result.current.getFlag("darkMode")).toBe(false);
      expect(result.current.getFlag("debugLevel")).toBe("info");
    });

    it("should set flag values and persist them", () => {
      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      act(() => {
        result.current.setFlag("darkMode", true);
      });

      expect(result.current.getFlag("darkMode")).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "featureFlag-darkMode",
        "true"
      );
    });

    it("should not set flag if validation fails", () => {
      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      act(() => {
        result.current.setFlag("debugLevel", "invalid");
      });

      // Should remain at default value
      expect(result.current.getFlag("debugLevel")).toBe("info");
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
        "featureFlag-debugLevel",
        '"invalid"'
      );
    });

    it("should toggle boolean flags", () => {
      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      expect(result.current.getFlag("darkMode")).toBe(false);

      act(() => {
        result.current.toggleFlag("darkMode");
      });

      expect(result.current.getFlag("darkMode")).toBe(true);

      act(() => {
        result.current.toggleFlag("darkMode");
      });

      expect(result.current.getFlag("darkMode")).toBe(false);
    });

    it("should not toggle non-boolean flags", () => {
      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      const originalValue = result.current.getFlag("debugLevel");

      act(() => {
        result.current.toggleFlag("debugLevel");
      });

      // Should remain unchanged
      expect(result.current.getFlag("debugLevel")).toBe(originalValue);
    });

    it("should reset individual flags to default", () => {
      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      // Change value
      act(() => {
        result.current.setFlag("darkMode", true);
      });
      expect(result.current.getFlag("darkMode")).toBe(true);

      // Reset to default
      act(() => {
        result.current.resetFlag("darkMode");
      });
      expect(result.current.getFlag("darkMode")).toBe(false);
    });

    it("should reset all flags to defaults", () => {
      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      // Change multiple values
      act(() => {
        result.current.setFlag("darkMode", true);
        result.current.setFlag("debugLevel", "debug");
        result.current.setFlag("maxItems", 20);
      });

      // Reset all
      act(() => {
        result.current.resetAllFlags();
      });

      expect(result.current.getFlag("darkMode")).toBe(false);
      expect(result.current.getFlag("debugLevel")).toBe("info");
      expect(result.current.getFlag("maxItems")).toBe(10);
    });

    it("should check if boolean flags are enabled", () => {
      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      expect(result.current.isEnabled("darkMode")).toBe(false);

      act(() => {
        result.current.setFlag("darkMode", true);
      });

      expect(result.current.isEnabled("darkMode")).toBe(true);

      // Non-boolean flags should return false
      expect(result.current.isEnabled("debugLevel")).toBe(false);
    });

    it("should call onFlagChange callback", () => {
      const onFlagChange = vi.fn();
      const wrapper = createFeatureFlagWrapper(mockConfigs, onFlagChange);
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      act(() => {
        result.current.setFlag("darkMode", true);
      });

      expect(onFlagChange).toHaveBeenCalledWith("darkMode", true, false);
    });

    it("should return configs", () => {
      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      const configs = result.current.getConfigs();
      expect(configs).toEqual(mockConfigs);
    });
  });

  describe("useFeatureFlag", () => {
    it("should return typed flag value", () => {
      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlag<boolean>("darkMode"), {
        wrapper,
      });

      expect(result.current).toBe(false);
    });

    it("should return undefined for non-existent flag", () => {
      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlag("nonExistent"), {
        wrapper,
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe("useFeatureFlagEnabled", () => {
    it("should return boolean enabled state", () => {
      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => useFeatureFlagEnabled("darkMode"), {
        wrapper,
      });

      expect(result.current).toBe(false);
    });
  });

  describe("useFeatureFlagToggle", () => {
    it("should return toggle function", () => {
      const wrapper = createFeatureFlagWrapper();
      const { result } = renderHook(() => {
        const flags = useFeatureFlags();
        const toggle = useFeatureFlagToggle("darkMode");
        return { flags, toggle };
      }, { wrapper });

      expect(typeof result.current.toggle).toBe("function");
      expect(result.current.flags.getFlag("darkMode")).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.flags.getFlag("darkMode")).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("should throw error when useFeatureFlags used outside provider", () => {
      // Suppress expected React error boundary console output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useFeatureFlags());
      }).toThrow("useFeatureFlags must be used within a FeatureFlagProvider");
      
      consoleSpy.mockRestore();
    });

    it("should handle transform function", () => {
      // Reset the store and set up the mock before creating the config
      const mockStore: Record<string, string> = {};
      mockLocalStorage.getItem.mockImplementation((key: string) => mockStore[key] || null);
      mockLocalStorage.setItem.mockImplementation((key: string, value: string) => {
        mockStore[key] = value;
      });
      
      // Set a value in localStorage that needs transformation
      mockStore["featureFlag-testFlag"] = '"original"';

      const configsWithTransform = [
        {
          key: "testFlag",
          defaultValue: "default",
          description: "Test flag with transform",
          persist: true,
          transform: (value: any) => `transformed-${value}`,
        },
      ];

      const wrapper = createFeatureFlagWrapper(configsWithTransform);
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      expect(result.current.getFlag("testFlag")).toBe("transformed-original");
    });
  });
});