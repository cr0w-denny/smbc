import React from 'react';
import type { NavigationItem, TreeNavigationItem } from '@smbc/mui-components';
import type { AppletMount } from '@smbc/applet-core';

// Simple declarative menu structure for app developers
export interface AppletMenuItem {
  label: string;
  applet: string; // applet id
  routes?: string[]; // specific routes to include, if not specified uses all
}

export interface TopLevelMenu {
  label: string;
  children: AppletMenuItem[];
}

// Complete declarative structure for app developers
export interface AppShellMenuStructure {
  menus: TopLevelMenu[];
  staticItems?: Omit<NavigationItem, 'treeItems'>[]; // buttons, single links, etc.
}

// Utility function options
export interface BuildNavigationOptions {
  menuStructure: AppShellMenuStructure;
  applets: AppletMount[];
  hasAnyPermission: (appletId: string, permissions: string[]) => boolean;
  onNavigate: (path: string) => void;
  permissionMapping?: Record<string, string>;
}

/**
 * Transforms a declarative menu structure + applet definitions into AppShell navigation items.
 * This utility bridges the gap between the applet system and the framework-agnostic AppShell component.
 */
export function buildAppShellNavigation({
  menuStructure,
  applets,
  hasAnyPermission,
  onNavigate,
  permissionMapping = {},
}: BuildNavigationOptions): NavigationItem[] {
  const navigation: NavigationItem[] = [];

  // Build tree-dropdown menus from applet structure
  for (const topMenu of menuStructure.menus) {
    const treeItems: TreeNavigationItem[] = [];

    for (const menuItem of topMenu.children) {
      const applet = applets.find(a => a.id === menuItem.applet);
      if (!applet) continue;

      const appletId = permissionMapping[applet.id] || applet.id;

      // Get applet's navigation structure if it has one
      if (applet.getHostNavigation) {
        const mountPath = `/${applet.id}`;
        const hostNav = applet.getHostNavigation(mountPath, hasAnyPermission, appletId);

        // Check if applet has multiple routes (groups or multiple routes)
        const hasMultipleRoutes = (hostNav.groups && hostNav.groups.length > 0 && 
          hostNav.groups.some(group => group.routes.length > 0)) || 
          (hostNav.homeRoute && hostNav.groups && hostNav.groups.length > 0);

        if (hasMultipleRoutes) {
          // Multi-route applet - create collapsible tree item
          const children: TreeNavigationItem[] = [];

          // Add home route if exists
          if (hostNav.homeRoute) {
            children.push({
              id: `${topMenu.label}-${applet.id}-home`,
              label: hostNav.homeRoute.label,
              path: hostNav.homeRoute.path,
              onClick: () => onNavigate(hostNav.homeRoute!.path),
            });
          }

          // Add grouped routes
          hostNav.groups?.forEach(group => {
            group.routes.forEach(route => {
              // Check permissions
              if (route.requiredPermissions && route.requiredPermissions.length > 0) {
                if (!hasAnyPermission(appletId, route.requiredPermissions)) {
                  return;
                }
              }

              children.push({
                id: `${topMenu.label}-${applet.id}-${route.path}`,
                label: route.label,
                path: route.path,
                icon: route.icon ? (typeof route.icon === 'string' ? route.icon : React.createElement(route.icon as React.ComponentType)) : undefined,
                onClick: () => onNavigate(route.path),
              });
            });
          });

          if (children.length > 0) {
            treeItems.push({
              id: `${topMenu.label}-${applet.id}-collapsible`,
              label: menuItem.label,
              children,
              isCollapsible: true,
            });
          }
        } else {
          // Single route applet - create direct clickable item
          const route = hostNav.homeRoute || hostNav.groups?.[0]?.routes[0];
          if (route) {
            // Check permissions
            if (route.requiredPermissions && route.requiredPermissions.length > 0) {
              if (!hasAnyPermission(appletId, route.requiredPermissions)) {
                continue;
              }
            }

            treeItems.push({
              id: `${topMenu.label}-${applet.id}-single`,
              label: menuItem.label,
              path: route.path,
              icon: route.icon ? (typeof route.icon === 'string' ? route.icon : React.createElement(route.icon as React.ComponentType)) : undefined,
              onClick: () => onNavigate(route.path),
            });
          }
        }
      } else {
        // No host navigation - use direct route
        const route = applet.routes?.[0];
        if (route) {
          // Check permissions
          if (route.requiredPermissions && route.requiredPermissions.length > 0) {
            if (!hasAnyPermission(appletId, route.requiredPermissions)) {
              continue;
            }
          }

          treeItems.push({
            id: `${topMenu.label}-${applet.id}-direct`,
            label: menuItem.label,
            path: route.path,
            icon: route.icon ? (typeof route.icon === 'string' ? route.icon : React.createElement(route.icon as React.ComponentType)) : undefined,
            onClick: () => onNavigate(route.path),
          });
        }
      }
    }

    // Only add the top-level menu if it has accessible items
    if (treeItems.length > 0) {
      navigation.push({
        label: topMenu.label,
        type: 'tree-dropdown',
        treeItems,
      });
    }
  }

  // Add static items (buttons, single links, etc.)
  if (menuStructure.staticItems) {
    navigation.push(...menuStructure.staticItems);
  }

  return navigation;
}