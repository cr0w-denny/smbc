import { definePermissions } from "@smbc/applet-core";

/**
 * EWI Obligor Applet Permissions
 *
 * Defines all permissions required for obligor dashboard operations.
 */
export default definePermissions("ewi-obligor", {
  /** Permission to view obligor data and portfolio */
  VIEW_OBLIGORS: "Can view obligor data and portfolio",

  /** Permission to apply filters and search obligors */
  MANAGE_FILTERS: "Can apply filters and search obligors",

  /** Permission to access detailed obligor information */
  VIEW_OBLIGOR_DETAILS: "Can access detailed obligor information",
});