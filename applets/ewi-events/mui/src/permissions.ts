import { definePermissions } from "@smbc/applet-core";

/**
 * EWI Events Applet Permissions
 *
 * Defines all permissions required for EWI events operations.
 */
export default definePermissions("ewi-events", {
  /** Permission to view EWI events and data */
  VIEW_EVENTS: "Can view EWI events and data",

  /** Permission to apply filters and customize event views */
  MANAGE_FILTERS: "Can apply filters and customize event views",

  /** Permission to access detailed event information */
  VIEW_EVENT_DETAILS: "Can access detailed event information",
});