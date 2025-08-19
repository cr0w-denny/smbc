import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePermissionFilteredRoutes } from "../hooks/usePermissionFilteredRoutes";
import type { RouteConfig, AppletConfig } from "../hooks/usePermissionFilteredRoutes";
import React from "react";

describe("Permission Filtering", () => {
  const mockComponent1 = () => React.createElement("div", {}, "Component 1");
  const mockComponent2 = () => React.createElement("div", {}, "Component 2");
  const mockComponent3 = () => React.createElement("div", {}, "Component 3");

  const testRoutes: RouteConfig[] = [
    {
      path: "/public",
      component: mockComponent1,
      label: "Public Route",
    },
    {
      path: "/admin",
      component: mockComponent2,
      label: "Admin Route",
      requiredPermissions: ["admin:manage"],
    },
    {
      path: "/user",
      component: mockComponent3,
      label: "User Route",
      requiredPermissions: ["user:view"],
    },
    {
      path: "/multi-perm",
      component: mockComponent1,
      label: "Multi Permission Route",
      requiredPermissions: ["admin:manage", "user:edit"],
    },
    {
      path: "/empty-perms",
      component: mockComponent2,
      label: "Empty Permissions Route",
      requiredPermissions: [],
    },
  ];

  const testApplets: AppletConfig[] = [
    {
      id: "public-app",
      routes: [{ path: "/public" }],
    },
    {
      id: "admin-app", 
      routes: [{ path: "/admin" }, { path: "/multi-perm" }],
    },
    {
      id: "user-app",
      routes: [{ path: "/user" }, { path: "/empty-perms" }],
    },
  ];

  describe("usePermissionFilteredRoutes", () => {
    it("should filter routes based on user permissions", () => {
      const hasAnyPermission = vi.fn()
        .mockReturnValueOnce(true)  // admin:manage
        .mockReturnValueOnce(false) // user:view
        .mockReturnValueOnce(true); // admin:manage, user:edit

      const { result } = renderHook(() =>
        usePermissionFilteredRoutes({
          routes: testRoutes,
          applets: testApplets,
          hasAnyPermission,
          userRoles: ["admin"],
        })
      );

      const filteredRoutes = result.current;
      
      // Should include public routes (no permissions required)
      expect(filteredRoutes.find(r => r.path === "/public")).toBeDefined();
      expect(filteredRoutes.find(r => r.path === "/empty-perms")).toBeDefined();
      
      // Should include routes where user has permissions
      expect(filteredRoutes.find(r => r.path === "/admin")).toBeDefined();
      expect(filteredRoutes.find(r => r.path === "/multi-perm")).toBeDefined();
      
      // Should exclude routes where user lacks permissions
      expect(filteredRoutes.find(r => r.path === "/user")).toBeUndefined();
    });

    it("should include routes with no required permissions", () => {
      const hasAnyPermission = vi.fn().mockReturnValue(false);

      const { result } = renderHook(() =>
        usePermissionFilteredRoutes({
          routes: testRoutes,
          applets: testApplets,
          hasAnyPermission,
          userRoles: ["guest"],
        })
      );

      const filteredRoutes = result.current;
      
      // Should include routes with no permissions required
      expect(filteredRoutes.find(r => r.path === "/public")).toBeDefined();
      expect(filteredRoutes.find(r => r.path === "/empty-perms")).toBeDefined();
      
      // Should exclude routes with permissions required
      expect(filteredRoutes.find(r => r.path === "/admin")).toBeUndefined();
      expect(filteredRoutes.find(r => r.path === "/user")).toBeUndefined();
      expect(filteredRoutes.find(r => r.path === "/multi-perm")).toBeUndefined();
    });

    it("should exclude routes from unknown applets", () => {
      const unknownRoutes: RouteConfig[] = [
        {
          path: "/unknown",
          component: mockComponent1,
          label: "Unknown Route",
          requiredPermissions: ["unknown:access"],
        },
      ];

      const hasAnyPermission = vi.fn().mockReturnValue(true);

      const { result } = renderHook(() =>
        usePermissionFilteredRoutes({
          routes: unknownRoutes,
          applets: testApplets,
          hasAnyPermission,
          userRoles: ["admin"],
        })
      );

      const filteredRoutes = result.current;
      expect(filteredRoutes).toHaveLength(0);
    });

    it("should handle permission mapping for applet ID transformations", () => {
      const hasAnyPermission = vi.fn().mockReturnValue(true);
      const permissionMapping = {
        "admin-app": "transformed-admin-app",
      };

      const { result } = renderHook(() =>
        usePermissionFilteredRoutes({
          routes: testRoutes,
          applets: testApplets,
          hasAnyPermission,
          userRoles: ["admin"],
          permissionMapping,
        })
      );

      // The hook should call hasAnyPermission with the transformed applet ID
      expect(hasAnyPermission).toHaveBeenCalledWith(
        "transformed-admin-app",
        ["admin:manage"]
      );
    });

    it("should use original applet ID when no mapping provided", () => {
      const hasAnyPermission = vi.fn().mockReturnValue(true);

      renderHook(() =>
        usePermissionFilteredRoutes({
          routes: testRoutes,
          applets: testApplets,
          hasAnyPermission,
          userRoles: ["admin"],
        })
      );

      // Should use original applet ID
      expect(hasAnyPermission).toHaveBeenCalledWith("admin-app", ["admin:manage"]);
    });

    it("should handle empty routes array", () => {
      const hasAnyPermission = vi.fn();

      const { result } = renderHook(() =>
        usePermissionFilteredRoutes({
          routes: [],
          applets: testApplets,
          hasAnyPermission,
          userRoles: ["admin"],
        })
      );

      expect(result.current).toEqual([]);
      expect(hasAnyPermission).not.toHaveBeenCalled();
    });

    it("should handle empty applets array", () => {
      const hasAnyPermission = vi.fn();

      const { result } = renderHook(() =>
        usePermissionFilteredRoutes({
          routes: testRoutes,
          applets: [],
          hasAnyPermission,
          userRoles: ["admin"],
        })
      );

      // Should only include routes with no required permissions
      const filteredRoutes = result.current;
      expect(filteredRoutes.find(r => r.path === "/public")).toBeDefined();
      expect(filteredRoutes.find(r => r.path === "/empty-perms")).toBeDefined();
      expect(filteredRoutes.filter(r => r.requiredPermissions?.length)).toHaveLength(0);
    });

    it("should memoize results based on dependencies", () => {
      let currentUserRoles = ["admin"];
      const hasAnyPermission = vi.fn().mockImplementation((appletId, permissions) => {
        // Admin can access admin routes, user cannot
        if (permissions.includes("admin:manage")) {
          return currentUserRoles.includes("admin");
        }
        return true; // Other permissions always pass
      });

      const { result, rerender } = renderHook(
        ({ userRoles }) => {
          currentUserRoles = userRoles; // Update the closure variable
          return usePermissionFilteredRoutes({
            routes: testRoutes,
            applets: testApplets,
            hasAnyPermission,
            userRoles,
          });
        },
        { initialProps: { userRoles: ["admin"] } }
      );

      const firstResult = result.current;

      // Rerender with same props - should return equivalent results
      rerender({ userRoles: ["admin"] });
      expect(result.current).toStrictEqual(firstResult);

      // Rerender with different userRoles - should recalculate and get different results
      rerender({ userRoles: ["user"] });
      expect(result.current).not.toStrictEqual(firstResult);
      expect(result.current.length).toBeLessThan(firstResult.length); // User has fewer permissions
    });

    it("should handle multiple permissions correctly", () => {
      const hasAnyPermission = vi.fn()
        .mockImplementation((appletId, permissions) => {
          // Return true if user has ANY of the required permissions
          return permissions.includes("admin:manage");
        });

      const { result } = renderHook(() =>
        usePermissionFilteredRoutes({
          routes: testRoutes,
          applets: testApplets,
          hasAnyPermission,
          userRoles: ["admin"],
        })
      );

      const filteredRoutes = result.current;
      
      // Should include multi-permission route if user has ANY required permission
      expect(filteredRoutes.find(r => r.path === "/multi-perm")).toBeDefined();
      
      // Verify hasAnyPermission was called with multiple permissions
      expect(hasAnyPermission).toHaveBeenCalledWith(
        "admin-app",
        ["admin:manage", "user:edit"]
      );
    });

    it("should dynamically update when permissions change", () => {
      let hasPermission = false;
      const hasAnyPermission = vi.fn().mockImplementation(() => hasPermission);

      const { result, rerender } = renderHook(() =>
        usePermissionFilteredRoutes({
          routes: testRoutes,
          applets: testApplets,
          hasAnyPermission,
          userRoles: ["user"],
        })
      );

      // Initially no permissions
      let filteredRoutes = result.current;
      expect(filteredRoutes.find(r => r.path === "/admin")).toBeUndefined();

      // Grant permissions and rerender
      hasPermission = true;
      rerender();
      
      filteredRoutes = result.current;
      expect(filteredRoutes.find(r => r.path === "/admin")).toBeDefined();
    });

    it("should handle routes with undefined or null required permissions", () => {
      const routesWithNullPerms: RouteConfig[] = [
        {
          path: "/null-perms",
          component: mockComponent1,
          label: "Null Permissions",
          requiredPermissions: undefined,
        },
      ];

      const hasAnyPermission = vi.fn();

      const { result } = renderHook(() =>
        usePermissionFilteredRoutes({
          routes: routesWithNullPerms,
          applets: [{ id: "test", routes: [{ path: "/null-perms" }] }],
          hasAnyPermission,
          userRoles: ["user"],
        })
      );

      // Should include routes with undefined permissions
      expect(result.current).toHaveLength(1);
      expect(result.current[0].path).toBe("/null-perms");
      expect(hasAnyPermission).not.toHaveBeenCalled();
    });
  });

  describe("Route Permission Validation", () => {
    it("should validate permissions before mounting", () => {
      const hasAnyPermission = vi.fn().mockReturnValue(false);

      const { result } = renderHook(() =>
        usePermissionFilteredRoutes({
          routes: testRoutes,
          applets: testApplets,
          hasAnyPermission,
          userRoles: ["guest"],
        })
      );

      const filteredRoutes = result.current;
      
      // Should only include routes that passed permission validation
      expect(filteredRoutes.every(route => 
        !route.requiredPermissions?.length || hasAnyPermission()
      )).toBe(true);
    });

    it("should handle permission inheritance through applet mapping", () => {
      const parentApplet = {
        id: "parent-app",
        routes: [{ path: "/child" }],
      };

      const childRoutes: RouteConfig[] = [
        {
          path: "/child",
          component: mockComponent1,
          label: "Child Route",
          requiredPermissions: ["child:access"],
        },
      ];

      const hasAnyPermission = vi.fn().mockReturnValue(true);
      const permissionMapping = {
        "parent-app": "parent-permissions",
      };

      renderHook(() =>
        usePermissionFilteredRoutes({
          routes: childRoutes,
          applets: [parentApplet],
          hasAnyPermission,
          userRoles: ["user"],
          permissionMapping,
        })
      );

      // Should check permissions against mapped applet ID
      expect(hasAnyPermission).toHaveBeenCalledWith(
        "parent-permissions",
        ["child:access"]
      );
    });
  });
});