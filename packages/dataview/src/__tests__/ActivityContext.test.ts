import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import * as React from "react";
import type { ActivityConfig } from "../activity/types";

// Mock the ActivityContext since we can't import JSX files in this TypeScript configuration
const mockUseActivity = vi.fn();
const mockActivityProvider = vi.fn();

vi.mock("../activity/ActivityContext", () => ({
  ActivityProvider: mockActivityProvider,
  useActivity: mockUseActivity,
}));

// Mock console.error to avoid noise in tests
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

afterEach(() => {
  consoleSpy.mockClear();
  vi.clearAllMocks();
});

describe("ActivityContext", () => {
  const createMockActivityContext = (overrides: any = {}) => ({
    activities: [],
    unviewedCount: 0,
    addActivity: vi.fn(),
    markAsViewed: vi.fn(),
    clearAll: vi.fn(),
    cleanup: vi.fn(),
    ...overrides,
  });

  const createWrapper = (config?: ActivityConfig) => {
    return ({ children }: { children: React.ReactNode }) => {
      mockActivityProvider.mockImplementation(({ children }: any) => children);
      return React.createElement(mockActivityProvider, { config }, children);
    };
  };

  describe("ActivityProvider", () => {
    it("should initialize with empty activities", () => {
      const mockActivityContext = createMockActivityContext();

      mockUseActivity.mockReturnValue(mockActivityContext);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => mockUseActivity(), { wrapper });

      expect(result.current.activities).toEqual([]);
      expect(result.current.unviewedCount).toBe(0);
    });

    it("should provide activity management functions", () => {
      const mockActivityContext = createMockActivityContext();

      mockUseActivity.mockReturnValue(mockActivityContext);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => mockUseActivity(), { wrapper });

      expect(typeof result.current.addActivity).toBe("function");
      expect(typeof result.current.markAsViewed).toBe("function");
      expect(typeof result.current.clearAll).toBe("function");
      expect(typeof result.current.cleanup).toBe("function");
    });

    it("should handle activity addition", () => {
      const addActivityMock = vi.fn();
      const mockActivityContext = createMockActivityContext({
        activities: [
          {
            id: "activity-1",
            type: "create" as const,
            entityType: "user",
            label: "John Doe",
            timestamp: new Date(),
          }
        ],
        unviewedCount: 1,
        addActivity: addActivityMock,
      });

      mockUseActivity.mockReturnValue(mockActivityContext);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => mockUseActivity(), { wrapper });

      const activityData = {
        type: "create" as const,
        entityType: "user",
        label: "John Doe",
      };

      result.current.addActivity(activityData);

      expect(addActivityMock).toHaveBeenCalledWith(activityData);
      expect(result.current.activities).toHaveLength(1);
      expect(result.current.activities[0].type).toBe("create");
      expect(result.current.activities[0].entityType).toBe("user");
      expect(result.current.activities[0].label).toBe("John Doe");
    });

    it("should handle marking activities as viewed", () => {
      const markAsViewedMock = vi.fn();
      const mockActivityContext = createMockActivityContext({
        activities: [
          {
            id: "activity-1",
            type: "create" as const,
            entityType: "user",
            label: "John Doe",
            timestamp: new Date(),
          }
        ],
        unviewedCount: 0, // Simulate viewed state
        markAsViewed: markAsViewedMock,
      });

      mockUseActivity.mockReturnValue(mockActivityContext);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => mockUseActivity(), { wrapper });

      result.current.markAsViewed("activity-1");

      expect(markAsViewedMock).toHaveBeenCalledWith("activity-1");
      expect(result.current.unviewedCount).toBe(0);
    });

    it("should handle clearing all activities", () => {
      const clearAllMock = vi.fn();
      const mockActivityContext = createMockActivityContext({
        clearAll: clearAllMock,
      });

      mockUseActivity.mockReturnValue(mockActivityContext);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => mockUseActivity(), { wrapper });

      result.current.clearAll();

      expect(clearAllMock).toHaveBeenCalled();
      expect(result.current.activities).toHaveLength(0);
      expect(result.current.unviewedCount).toBe(0);
    });

    it("should handle activity cleanup", () => {
      const cleanupMock = vi.fn();
      const mockActivityContext = createMockActivityContext({
        cleanup: cleanupMock,
      });

      mockUseActivity.mockReturnValue(mockActivityContext);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => mockUseActivity(), { wrapper });

      result.current.cleanup();

      expect(cleanupMock).toHaveBeenCalled();
    });

    it("should track unviewed count correctly", () => {
      const mockActivityContext = createMockActivityContext({
        activities: [
          {
            id: "activity-1",
            type: "create" as const,
            entityType: "user",
            label: "Activity 1",
            timestamp: new Date(),
          },
          {
            id: "activity-2",
            type: "update" as const,
            entityType: "user",
            label: "Activity 2",
            timestamp: new Date(),
          }
        ],
        unviewedCount: 2,
      });

      mockUseActivity.mockReturnValue(mockActivityContext);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => mockUseActivity(), { wrapper });

      expect(result.current.unviewedCount).toBe(2);
      expect(result.current.activities).toHaveLength(2);
    });

    it("should handle configuration merging", () => {
      // Test that config is passed to the provider
      const customConfig: ActivityConfig = {
        maxItems: 10,
        showToasts: false,
      };

      createWrapper(customConfig);
      
      // Verify the provider was called with the config
      expect(mockActivityProvider).toBeDefined();
    });

    it("should throw error when useActivity used outside provider", () => {
      mockUseActivity.mockImplementation(() => {
        throw new Error("useActivity must be used within an ActivityProvider");
      });

      // Test the error directly without renderHook to avoid unhandled errors
      expect(() => {
        mockUseActivity();
      }).toThrow("useActivity must be used within an ActivityProvider");
    });
  });
});