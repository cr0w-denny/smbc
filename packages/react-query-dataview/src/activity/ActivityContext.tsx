import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type {
  ActivityItem,
  ActivityConfig,
  ActivityContextValue,
} from "./types";

const ActivityContext = createContext<ActivityContextValue | undefined>(
  undefined,
);

export interface ActivityProviderProps {
  children: React.ReactNode;
  config?: ActivityConfig;
}

const defaultConfig: Required<ActivityConfig> = {
  maxItems: 50,
  retentionTime: 24 * 60 * 60 * 1000, // 24 hours
  showToasts: true,
  urlGenerator: (entityType: string, entityId: string) =>
    `/${entityType}/${entityId}`,
};

export function ActivityProvider({
  children,
  config = {},
}: ActivityProviderProps) {
  const mergedConfig = { ...defaultConfig, ...config };
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [viewedActivityIds, setViewedActivityIds] = useState<Set<string>>(
    new Set(),
  );

  const addActivity = useCallback(
    (activity: Omit<ActivityItem, "id" | "timestamp">) => {
      const newActivity: ActivityItem = {
        ...activity,
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      setActivities((prev) => {
        // Add new activity at the beginning
        const updated = [newActivity, ...prev];

        // Trim to max items
        if (updated.length > mergedConfig.maxItems) {
          return updated.slice(0, mergedConfig.maxItems);
        }

        return updated;
      });
    },
    [mergedConfig.maxItems],
  );

  const markAsViewed = useCallback((activityId: string) => {
    setViewedActivityIds((prev) => new Set(prev).add(activityId));
  }, []);

  const clearAll = useCallback(() => {
    setActivities([]);
    setViewedActivityIds(new Set());
  }, []);

  const cleanup = useCallback(() => {
    const cutoffTime = new Date(Date.now() - mergedConfig.retentionTime);
    setActivities((prev) =>
      prev.filter((activity) => activity.timestamp > cutoffTime),
    );
  }, [mergedConfig.retentionTime]);

  const unviewedCount = activities.filter(
    (activity) => !viewedActivityIds.has(activity.id),
  ).length;

  // Auto-cleanup every hour
  useEffect(() => {
    const interval = setInterval(cleanup, 60 * 60 * 1000); // 1 hour
    return () => clearInterval(interval);
  }, [cleanup]);

  const value: ActivityContextValue = {
    activities,
    addActivity,
    markAsViewed,
    clearAll,
    cleanup,
    unviewedCount,
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity(): ActivityContextValue {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
}
