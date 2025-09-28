import { definePermissions } from "@smbc/applet-core";

export default definePermissions("ewi-events", {
  VIEW_EVENTS: "Can view EWI events list and basic data",
  EDIT_ALL_EVENTS: "Can edit all events",
  EDIT_OWN_EVENTS: "Can edit only events created by the user",
});
