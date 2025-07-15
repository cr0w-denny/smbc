import { definePermissions } from "@smbc/applet-core";

/**
 * Usage Stats Applet Permissions
 *
 * Defines all permissions required for usage statistics operations.
 * These permissions integrate with the SMBC permission system to
 * control access to various usage analytics features.
 */
export default definePermissions('usage-stats', {
  /** Permission to view usage statistics */
  VIEW_USAGE_STATS: "Can view usage statistics and analytics",
  
  /** Permission to view user usage data */
  VIEW_USER_USAGE: "Can view individual user usage statistics",
  
  /** Permission to view component usage data */
  VIEW_COMPONENT_USAGE: "Can view component usage statistics",
  
  /** Permission to view exception reports */
  VIEW_EXCEPTIONS: "Can view system exception reports",
  
  /** Permission to export usage data */
  EXPORT_USAGE_DATA: "Can export usage statistics data",
});