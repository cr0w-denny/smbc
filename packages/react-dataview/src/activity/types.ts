/**
 * Activity tracking types for the notification system
 */

export type ActivityType = 'create' | 'update' | 'delete';

export interface ActivityItem {
  /** Unique identifier for this activity */
  id: string;
  /** Type of operation performed */
  type: ActivityType;
  /** Type of entity that was operated on (e.g., 'user', 'task', 'product') */
  entityType: string;
  /** Human-readable label for the item (e.g., "John Doe", "Fix bug #123") */
  label: string;
  /** Optional URL to view/edit the item */
  url?: string;
  /** When this activity occurred */
  timestamp: Date;
  /** Optional additional context about the operation */
  context?: {
    /** Previous values for updates */
    previousValues?: Record<string, any>;
    /** Any additional metadata */
    metadata?: Record<string, any>;
  };
}

export interface ActivityConfig {
  /** Maximum number of activities to keep in memory */
  maxItems?: number;
  /** How long activities should be retained (in milliseconds) */
  retentionTime?: number;
  /** Whether to show toast notifications for activities */
  showToasts?: boolean;
  /** Function to generate URLs for entities */
  urlGenerator?: (entityType: string, entityId: string) => string;
}

export interface ActivityContextValue {
  /** Current list of activities, newest first */
  activities: ActivityItem[];
  /** Add a new activity */
  addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
  /** Mark an activity as viewed */
  markAsViewed: (activityId: string) => void;
  /** Clear all activities */
  clearAll: () => void;
  /** Clear activities older than retention time */
  cleanup: () => void;
  /** Get count of unviewed activities */
  unviewedCount: number;
}