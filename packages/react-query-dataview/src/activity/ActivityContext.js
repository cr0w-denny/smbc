import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useEffect, } from "react";
const ActivityContext = createContext(undefined);
const defaultConfig = {
    maxItems: 50,
    retentionTime: 24 * 60 * 60 * 1000, // 24 hours
    showToasts: true,
    urlGenerator: (entityType, entityId) => `/${entityType}/${entityId}`,
};
export function ActivityProvider({ children, config = {}, }) {
    const mergedConfig = { ...defaultConfig, ...config };
    const [activities, setActivities] = useState([]);
    const [viewedActivityIds, setViewedActivityIds] = useState(new Set());
    const addActivity = useCallback((activity) => {
        const newActivity = {
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
    }, [mergedConfig.maxItems]);
    const markAsViewed = useCallback((activityId) => {
        setViewedActivityIds((prev) => new Set(prev).add(activityId));
    }, []);
    const clearAll = useCallback(() => {
        setActivities([]);
        setViewedActivityIds(new Set());
    }, []);
    const cleanup = useCallback(() => {
        const cutoffTime = new Date(Date.now() - mergedConfig.retentionTime);
        setActivities((prev) => prev.filter((activity) => activity.timestamp > cutoffTime));
    }, [mergedConfig.retentionTime]);
    const unviewedCount = activities.filter((activity) => !viewedActivityIds.has(activity.id)).length;
    // Auto-cleanup every hour
    useEffect(() => {
        const interval = setInterval(cleanup, 60 * 60 * 1000); // 1 hour
        return () => clearInterval(interval);
    }, [cleanup]);
    const value = {
        activities,
        addActivity,
        markAsViewed,
        clearAll,
        cleanup,
        unviewedCount,
    };
    return (_jsx(ActivityContext.Provider, { value: value, children: children }));
}
export function useActivity() {
    const context = useContext(ActivityContext);
    if (context === undefined) {
        throw new Error("useActivity must be used within an ActivityProvider");
    }
    return context;
}
