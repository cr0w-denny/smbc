import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { useRoleManagement } from "../hooks/useRoleManagement";
import { useAppletMenus } from "../hooks/useAppletMenus";
import type { AppletMount } from "@smbc/applet-core";

// Mock the applet-core hooks
const mockUseAppletCore = vi.fn();
vi.mock("@smbc/applet-core", () => ({
  useAppletCore: () => mockUseAppletCore(),
}));

describe("Applet Lifecycle Management", () => {
  const mockComponent = () => React.createElement("div", {}, "Mock Component");

  describe("useRoleManagement", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should extract user roles from state and provide permission functions", () => {
      const mockPermissionCheck = vi.fn();
      mockPermissionCheck
        .mockReturnValueOnce(true)  // hasPermission call
        .mockReturnValueOnce(false) // hasAnyPermission call  
        .mockReturnValueOnce(true); // hasAllPermissions call

      const mockState = {
        user: { id: "1", name: "Test User", roles: ["Admin", "User"] },
        isAuthenticated: true,
      };

      mockUseAppletCore.mockReturnValue({
        state: mockState,
        actions: { setUserRoles: vi.fn() },
        roleUtils: {
          roles: ["Guest", "User", "Admin"],
          hasPermission: mockPermissionCheck,
          hasAnyPermission: mockPermissionCheck,
          hasAllPermissions: mockPermissionCheck,
        },
      });

      const { result } = renderHook(() => useRoleManagement());

      // Test that user roles are correctly extracted from state
      expect(result.current.userRoles).toEqual(["Admin", "User"]);
      
      // Test that permission functions are correctly bound with current user roles
      const hasReadPerm = result.current.hasPermission("test-app", "read");
      const hasAnyPerm = result.current.hasAnyPermission("test-app", ["read", "write"]);  
      const hasAllPerms = result.current.hasAllPermissions("test-app", ["read", "write"]);

      expect(hasReadPerm).toBe(true);
      expect(hasAnyPerm).toBe(false);
      expect(hasAllPerms).toBe(true);

      // Verify the permission functions were called with the correct user roles
      expect(mockPermissionCheck).toHaveBeenNthCalledWith(1, ["Admin", "User"], "test-app", "read");
      expect(mockPermissionCheck).toHaveBeenNthCalledWith(2, ["Admin", "User"], "test-app", ["read", "write"]);
      expect(mockPermissionCheck).toHaveBeenNthCalledWith(3, ["Admin", "User"], "test-app", ["read", "write"]);
    });

    it("should default to first available role when user is null", () => {
      // Test the actual defaulting logic: state.user?.roles ?? [roleUtils.roles[0]]
      const mockRoleUtils = {
        roles: ["Guest", "User", "Admin"],
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
      };

      mockUseAppletCore.mockReturnValue({
        state: { user: null, isAuthenticated: false },
        actions: { setUserRoles: vi.fn() },
        roleUtils: mockRoleUtils,
      });

      const { result } = renderHook(() => useRoleManagement());

      // Test that the actual defaulting logic works: should get first role from roleUtils.roles
      expect(result.current.userRoles).toEqual(["Guest"]);
      expect(result.current.isAuthenticated).toBe(false);

      // Test edge case: what if user exists but has no roles?
      mockUseAppletCore.mockReturnValue({
        state: { user: { id: "1", roles: undefined }, isAuthenticated: true },
        actions: { setUserRoles: vi.fn() },
        roleUtils: mockRoleUtils,
      });

      const { result: result2 } = renderHook(() => useRoleManagement());
      expect(result2.current.userRoles).toEqual(["Guest"]); // Should still default
    });

    it("should correctly bind current user roles to permission functions", () => {
      // Test that the hook correctly creates permission functions that use current userRoles
      const mockPermissionCheck = vi.fn();
      
      mockUseAppletCore.mockReturnValue({
        state: { 
          user: { roles: ["Moderator"] },
          isAuthenticated: true,
        },
        actions: { setUserRoles: vi.fn() },
        roleUtils: {
          roles: ["Guest", "User", "Moderator", "Admin"],
          hasPermission: mockPermissionCheck.mockReturnValue(true),
          hasAnyPermission: mockPermissionCheck.mockReturnValue(false),
          hasAllPermissions: mockPermissionCheck.mockReturnValue(true),
        },
      });

      const { result } = renderHook(() => useRoleManagement());

      // Test that the returned functions correctly pass the current user's roles
      result.current.hasPermission("blog", "edit");
      result.current.hasAnyPermission("forum", ["moderate", "delete"]);
      result.current.hasAllPermissions("users", ["view", "edit", "create"]);

      // Verify that the actual user roles from state are passed to permission functions
      expect(mockPermissionCheck).toHaveBeenNthCalledWith(1, ["Moderator"], "blog", "edit");
      expect(mockPermissionCheck).toHaveBeenNthCalledWith(2, ["Moderator"], "forum", ["moderate", "delete"]);
      expect(mockPermissionCheck).toHaveBeenNthCalledWith(3, ["Moderator"], "users", ["view", "edit", "create"]);
    });

    it("should handle role updates", () => {
      const setUserRoles = vi.fn();
      const mockState = {
        user: { roles: ["User"] },
        isAuthenticated: true,
      };

      mockUseAppletCore.mockReturnValue({
        state: mockState,
        actions: { setUserRoles },
        roleUtils: {
          roles: ["Guest", "User", "Admin"],
          hasPermission: vi.fn(),
          hasAnyPermission: vi.fn(),
          hasAllPermissions: vi.fn(),
        },
      });

      const { result } = renderHook(() => useRoleManagement());

      act(() => {
        result.current.setUserRoles(["Admin"]);
      });

      expect(setUserRoles).toHaveBeenCalledWith(["Admin"]);
    });

    it("should support role hierarchies", () => {
      const hierarchicalRoles = ["Guest", "User", "Moderator", "Admin", "SuperAdmin"];
      
      mockUseAppletCore.mockReturnValue({
        state: { 
          user: { roles: ["Moderator"] },
          isAuthenticated: true,
        },
        actions: { setUserRoles: vi.fn() },
        roleUtils: {
          roles: hierarchicalRoles,
          hasPermission: vi.fn(),
          hasAnyPermission: vi.fn(),
          hasAllPermissions: vi.fn(),
        },
      });

      const { result } = renderHook(() => useRoleManagement());

      expect(result.current.availableRoles).toEqual(hierarchicalRoles);
      expect(result.current.userRoles).toEqual(["Moderator"]);
    });
  });

  describe("useAppletMenus", () => {
    const testApplets: AppletMount[] = [
      {
        id: "simple-applet",
        label: "Simple Applet",
        packageName: "@test/simple",
        filterable: true,
        routes: [
          {
            path: "/simple",
            label: "Simple Home",
            component: mockComponent,
            requiredPermissions: [],
          },
        ],
      },
      {
        id: "protected-applet",
        label: "Protected Applet",
        packageName: "@test/protected",
        filterable: true,
        routes: [
          {
            path: "/protected",
            label: "Protected Home",
            component: mockComponent,
            requiredPermissions: ["protected:access"],
          },
        ],
      },
      {
        id: "internal-nav-applet",
        label: "Internal Nav Applet",
        packageName: "@test/internal",
        filterable: true,
        getHostNavigation: vi.fn().mockReturnValue({
          homeRoute: {
            path: "/internal",
            label: "Internal Home",
            component: mockComponent,
          },
          groups: [
            {
              groupId: "main",
              groupLabel: "Main Features",
              routes: [
                {
                  path: "/internal/feature1",
                  label: "Feature 1",
                  component: mockComponent,
                },
              ],
            },
          ],
        }),
        routes: [
          {
            path: "/internal",
            label: "Internal Nav Home",
            component: mockComponent,
            requiredPermissions: [],
          },
        ],
      },
    ];

    it("should initialize applet menus", () => {
      const hasAnyPermission = vi.fn().mockReturnValue(true);

      const { result } = renderHook(() =>
        useAppletMenus({
          applets: testApplets,
          hasAnyPermission,
        })
      );

      expect(result.current.menuSections).toHaveLength(3);
      expect(result.current.menuSections[0].sectionId).toBe("simple-applet");
      expect(result.current.menuSections[1].sectionId).toBe("protected-applet");
      expect(result.current.menuSections[2].sectionId).toBe("internal-nav-applet");
    });

    it("should filter applets based on permissions", () => {
      const hasAnyPermission = vi.fn().mockImplementation((appletId, permissions) => {
        return !permissions.includes("protected:access");
      });

      const { result } = renderHook(() =>
        useAppletMenus({
          applets: testApplets,
          hasAnyPermission,
        })
      );

      const menuSections = result.current.menuSections;
      expect(menuSections).toHaveLength(2);
      expect(menuSections.find(s => s.sectionId === "simple-applet")).toBeDefined();
      expect(menuSections.find(s => s.sectionId === "internal-nav-applet")).toBeDefined();
      expect(menuSections.find(s => s.sectionId === "protected-applet")).toBeUndefined();
    });

    it("should include root route when requested", () => {
      const hasAnyPermission = vi.fn().mockReturnValue(true);

      const { result } = renderHook(() =>
        useAppletMenus({
          applets: testApplets,
          hasAnyPermission,
          includeRootRoute: true,
          rootRoute: { path: "/", label: "Dashboard" },
        })
      );

      expect(result.current.rootRoute).toBeDefined();
      expect(result.current.rootRoute?.path).toBe("/");
      expect(result.current.rootRoute?.label).toBe("Dashboard");
    });

    it("should handle internal navigation routes", () => {
      const hasAnyPermission = vi.fn().mockReturnValue(true);

      const { result } = renderHook(() =>
        useAppletMenus({
          applets: testApplets,
          hasAnyPermission,
          includeInternalRoutes: true,
        })
      );

      const internalNavSection = result.current.menuSections.find(
        s => s.sectionId === "internal-nav-applet"
      );

      expect(internalNavSection?.hasInternalNavigation).toBe(true);
      expect(internalNavSection?.homeRoute).toBeDefined();
      expect(internalNavSection?.groups).toHaveLength(1);
    });

    it("should handle permission mapping", () => {
      const hasAnyPermission = vi.fn().mockReturnValue(true);
      const permissionMapping = {
        "simple-applet": "mapped-simple",
      };

      renderHook(() =>
        useAppletMenus({
          applets: testApplets,
          hasAnyPermission,
          permissionMapping,
        })
      );

      // Should call getHostNavigation - verify it was called
      const internalNavApplet = testApplets.find(a => a.id === "internal-nav-applet");
      expect(internalNavApplet).toBeDefined();
      expect(internalNavApplet!.getHostNavigation).toHaveBeenCalled();
      
      // Check the call arguments more specifically
      const callArgs = vi.mocked(internalNavApplet!.getHostNavigation!).mock.calls[0];
      expect(callArgs[0]).toBe("/internal");
      expect(callArgs[2]).toBe("internal-nav-applet"); // Unmapped applet ID
    });

    it("should handle applets without routes gracefully", () => {
      const routelessApplets: AppletMount[] = [
        {
          id: "no-routes",
          label: "No Routes",
          packageName: "@test/no-routes",
          routes: [],
        },
      ];

      const hasAnyPermission = vi.fn().mockReturnValue(true);

      const { result } = renderHook(() =>
        useAppletMenus({
          applets: routelessApplets,
          hasAnyPermission,
        })
      );

      expect(result.current.menuSections).toHaveLength(1);
      expect(result.current.menuSections[0].directRoute?.path).toBe("/no-routes");
    });

    it("should cache menu structure based on dependencies", () => {
      const hasAnyPermission = vi.fn().mockReturnValue(true);

      const { result, rerender } = renderHook(
        ({ applets }) =>
          useAppletMenus({
            applets,
            hasAnyPermission,
          }),
        { initialProps: { applets: testApplets } }
      );

      const firstResult = result.current;

      // Rerender with same applets - should return equivalent structure
      rerender({ applets: testApplets });
      expect(result.current.menuSections).toStrictEqual(firstResult.menuSections);

      // Rerender with different applets - should recalculate
      rerender({ applets: testApplets.slice(0, 1) });
      expect(result.current.menuSections).not.toStrictEqual(firstResult.menuSections);
      expect(result.current.menuSections.length).toBeLessThan(firstResult.menuSections.length);
    });

    it("should handle filterable applet configuration", () => {
      const nonFilterableApplets: AppletMount[] = [
        {
          id: "hidden-applet",
          label: "Hidden Applet",
          packageName: "@test/hidden",
          filterable: false,
          routes: [
            {
              path: "/hidden",
              label: "Hidden Route",
              component: mockComponent,
              requiredPermissions: [],
            },
          ],
        },
      ];

      const hasAnyPermission = vi.fn().mockReturnValue(true);

      const { result } = renderHook(() =>
        useAppletMenus({
          applets: nonFilterableApplets,
          hasAnyPermission,
        })
      );

      expect(result.current.menuSections[0].filterable).toBe(false);
    });

    it("should handle applet version information", () => {
      const versionedApplets: AppletMount[] = [
        {
          id: "versioned-applet",
          label: "Versioned Applet",
          packageName: "@test/versioned",
          version: "1.2.3",
          routes: [
            {
              path: "/versioned",
              label: "Versioned Route",
              component: mockComponent,
              requiredPermissions: [],
            },
          ],
        },
      ];

      const hasAnyPermission = vi.fn().mockReturnValue(true);

      const { result } = renderHook(() =>
        useAppletMenus({
          applets: versionedApplets,
          hasAnyPermission,
        })
      );

      expect(result.current.menuSections[0].sectionVersion).toBe("1.2.3");
    });

    it("should fallback to direct route when internal navigation is empty", () => {
      const emptyInternalNavApplet: AppletMount = {
        id: "empty-internal",
        label: "Empty Internal Nav",
        packageName: "@test/empty",
        getHostNavigation: vi.fn().mockReturnValue({
          groups: [],
          homeRoute: undefined,
        }),
        routes: [
          {
            path: "/empty",
            label: "Empty Route",
            component: mockComponent,
            requiredPermissions: [],
          },
        ],
      };

      const hasAnyPermission = vi.fn().mockReturnValue(true);

      const { result } = renderHook(() =>
        useAppletMenus({
          applets: [emptyInternalNavApplet],
          hasAnyPermission,
          includeInternalRoutes: true,
        })
      );

      const section = result.current.menuSections[0];
      expect(section.hasInternalNavigation).toBe(false);
      expect(section.directRoute).toBeDefined();
      expect(section.directRoute?.path).toBe("/empty");
    });
  });
});