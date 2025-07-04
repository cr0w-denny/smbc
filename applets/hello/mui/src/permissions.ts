import { definePermissions } from '@smbc/applet-core';

export default definePermissions('hello', {
  VIEW_ROUTE_ONE: 'Access to the first hello world route',
  VIEW_ROUTE_TWO: 'Access to the second hello world route',
  VIEW_ROUTE_THREE: 'Access to the third hello world route',
});