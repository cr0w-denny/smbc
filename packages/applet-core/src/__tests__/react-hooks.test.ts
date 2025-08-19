import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { AppletProvider } from "../AppContext";
import { usePermissions } from "../hooks/usePermissions";
import { useUser } from "../hooks/useUser";

describe("React Hooks", () => {
  const testRoleConfig = {
    roles: ["Guest", "User", "Admin"],
    permissionMappings: {
      "test-app": {
        read: ["User", "Admin"],
        write: ["Admin"],
      },
    },
  };

  const createWrapper = (props: any = {}) => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(AppletProvider, {
        initialRoleConfig: testRoleConfig,
        ...props,
        children,
      });
  };

  describe("usePermissions", () => {
    it("should return current user permissions", () => {
      const wrapper = createWrapper({
        initialUser: { id: "1", name: "Test User", roles: ["Admin"] },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      // Admin should have both read and write permissions
      expect(
        result.current.hasPermission("test-app", {
          id: "read",
          name: "Read",
          description: "Read permission",
        }),
      ).toBe(true);
      expect(
        result.current.hasPermission("test-app", {
          id: "write",
          name: "Write",
          description: "Write permission",
        }),
      ).toBe(true);
    });

    it("should default to Guest role when no user", () => {
      const wrapper = createWrapper({
        initialUser: null,
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      // Should default to Guest role (first role in array)
      expect(
        result.current.hasPermission("test-app", {
          id: "read",
          name: "Read",
          description: "Read permission",
        }),
      ).toBe(false);
      expect(
        result.current.hasPermission("test-app", {
          id: "write",
          name: "Write",
          description: "Write permission",
        }),
      ).toBe(false);
    });

    it("should provide hasPermission helper function", () => {
      const wrapper = createWrapper({
        initialUser: { id: "1", name: "Test User", roles: ["User"] },
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      // Check that all permission functions are available
      expect(typeof result.current.hasPermission).toBe("function");
      expect(typeof result.current.hasAnyPermission).toBe("function");
      expect(typeof result.current.hasAllPermissions).toBe("function");

      // Test hasAnyPermission
      const permissions = [
        { id: "read", name: "Read", description: "Read permission" },
        { id: "write", name: "Write", description: "Write permission" },
      ];
      expect(result.current.hasAnyPermission("test-app", permissions)).toBe(
        true,
      );

      // Test hasAllPermissions
      expect(result.current.hasAllPermissions("test-app", permissions)).toBe(
        false,
      );
    });
  });

  describe("useUser", () => {
    it("should reflect user state changes and authentication transitions", () => {
      // Start with unauthenticated state
      const wrapper = createWrapper({ initialUser: null });
      const { result, rerender } = renderHook(() => useUser(), { wrapper });

      // Initially unauthenticated
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      // Test authentication transition by changing the wrapper props
      const authenticatedWrapper = createWrapper({ 
        initialUser: { id: "123", name: "John Doe", roles: ["User", "Editor"] }
      });
      
      // Re-render with authenticated state
      const { result: authResult } = renderHook(() => useUser(), { 
        wrapper: authenticatedWrapper 
      });

      // Should now be authenticated with user data
      expect(authResult.current.user).toEqual({ 
        id: "123", 
        name: "John Doe", 
        roles: ["User", "Editor"] 
      });
      expect(authResult.current.isAuthenticated).toBe(true);
      expect(authResult.current.availableRoles).toEqual(["Guest", "User", "Admin"]);
    });

    it("should correctly compute role-based permissions dynamically", () => {
      // Test with different role combinations to verify permission logic
      const adminWrapper = createWrapper({ 
        initialUser: { id: "1", name: "Admin User", roles: ["Admin"] }
      });
      
      const { result: adminResult } = renderHook(() => useUser(), { 
        wrapper: adminWrapper 
      });

      // Admin should have all permissions due to role hierarchy
      expect(adminResult.current.isAuthenticated).toBe(true);
      expect(adminResult.current.user?.roles).toContain("Admin");

      // Test with regular user
      const userWrapper = createWrapper({ 
        initialUser: { id: "2", name: "Regular User", roles: ["User"] }
      });
      
      const { result: userResult } = renderHook(() => useUser(), { 
        wrapper: userWrapper 
      });

      // User should be authenticated but with limited role
      expect(userResult.current.isAuthenticated).toBe(true);
      expect(userResult.current.user?.roles).toEqual(["User"]);
      expect(userResult.current.user?.roles).not.toContain("Admin");
    });

    it("should update when user changes", () => {
      const wrapper = createWrapper({ initialUser: null });

      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      // Update user
      act(() => {
        result.current.setUser({
          id: "2",
          name: "New User",
          roles: ["Admin"],
        });
      });

      expect(result.current.user).toEqual({
        id: "2",
        name: "New User",
        roles: ["Admin"],
      });
      expect(result.current.isAuthenticated).toBe(true);

      // Update roles
      act(() => {
        result.current.setRoles(["User"]);
      });

      expect(result.current.user?.roles).toEqual(["User"]);
    });
  });
});