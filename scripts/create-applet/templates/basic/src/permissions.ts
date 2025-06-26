// {{APPLET_DISPLAY_NAME}} Applet Permissions
import { definePermissions } from '@smbc/mui-applet-core';

export const {{APPLET_UPPER_CASE}}_PERMISSIONS = definePermissions('{{APPLET_NAME}}', {
  VIEW: 'Can view {{APPLET_NAME}} data',
  CREATE: 'Can create new {{APPLET_NAME}} items',
  EDIT: 'Can modify existing {{APPLET_NAME}} items',
  DELETE: 'Can remove {{APPLET_NAME}} items',
});