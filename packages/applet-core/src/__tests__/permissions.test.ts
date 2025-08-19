import { describe, it, expect } from "vitest";
import { createRoleUtilities } from "../types";
import {
  definePermissions,
  generatePermissionMappings,
  calculatePermissionsFromRoles,
} from "../permissions";

describe("Permissions", () => {
  const roles = ["Guest", "User", "Admin", "SuperAdmin"];
  const permissionMappings = {
    app1: {
      read: ["User", "Admin", "SuperAdmin"],
      write: ["Admin", "SuperAdmin"],
      delete: ["SuperAdmin"],
    },
    app2: {
      view: ["Guest", "User", "Admin", "SuperAdmin"],
      edit: ["Admin", "SuperAdmin"],
    },
  };

  const roleUtils = createRoleUtilities(roles, permissionMappings);

  it("should check if user has required permission", () => {
    // User with 'Admin' role should have 'write' permission in app1
    expect(roleUtils.hasPermission(["Admin"], "app1", "write")).toBe(true);

    // User with 'User' role should NOT have 'write' permission in app1
    expect(roleUtils.hasPermission(["User"], "app1", "write")).toBe(false);

    // User with 'User' role should have 'read' permission in app1
    expect(roleUtils.hasPermission(["User"], "app1", "read")).toBe(true);
  });

  it("should handle multiple permission checks with AND logic", () => {
    // hasAllPermissions - user needs ALL listed permissions
    expect(
      roleUtils.hasAllPermissions(["Admin"], "app1", ["read", "write"]),
    ).toBe(true);
    expect(
      roleUtils.hasAllPermissions(["User"], "app1", ["read", "write"]),
    ).toBe(false);
    expect(
      roleUtils.hasAllPermissions(["SuperAdmin"], "app1", [
        "read",
        "write",
        "delete",
      ]),
    ).toBe(true);
  });

  it("should handle multiple permission checks with OR logic", () => {
    // hasAnyPermission - user needs at least ONE of the listed permissions
    expect(
      roleUtils.hasAnyPermission(["User"], "app1", ["read", "write"]),
    ).toBe(true);
    expect(
      roleUtils.hasAnyPermission(["Guest"], "app1", ["read", "write"]),
    ).toBe(false);
    expect(
      roleUtils.hasAnyPermission(["Admin"], "app1", ["delete", "write"]),
    ).toBe(true);
  });

  it("should return false when user has no permissions", () => {
    // Empty user roles should have no permissions
    expect(roleUtils.hasPermission([], "app1", "read")).toBe(false);
    expect(roleUtils.hasAnyPermission([], "app1", ["read", "write"])).toBe(
      false,
    );
    expect(roleUtils.hasAllPermissions([], "app1", ["read"])).toBe(false);

    // Non-existent applet should return false
    expect(roleUtils.hasPermission(["Admin"], "nonexistent", "read")).toBe(
      false,
    );

    // Guest role should not have permissions except where explicitly granted
    expect(roleUtils.hasPermission(["Guest"], "app1", "read")).toBe(false);
    expect(roleUtils.hasPermission(["Guest"], "app2", "view")).toBe(true);
  });

  it("should accumulate permissions from multiple roles", () => {
    // User with multiple roles should have combined permissions
    expect(roleUtils.hasPermission(["User", "Admin"], "app1", "read")).toBe(
      true,
    );
    expect(roleUtils.hasPermission(["User", "Admin"], "app1", "write")).toBe(
      true,
    );

    // Even if one role doesn't have permission, another role might grant it
    expect(roleUtils.hasPermission(["Guest", "User"], "app1", "read")).toBe(
      true,
    );
    expect(roleUtils.hasPermission(["Guest", "User"], "app1", "write")).toBe(
      false,
    );

    // Multiple roles should work with hasAllPermissions
    expect(
      roleUtils.hasAllPermissions(["User", "SuperAdmin"], "app1", [
        "read",
        "write",
        "delete",
      ]),
    ).toBe(true);
  });
});

describe("Permission Helper Functions", () => {
  it("should define permissions with proper structure", () => {
    const permissions = definePermissions("test-app", {
      VIEW_USERS: "View user list",
      CREATE_USERS: "Create new users",
      DELETE_USERS: "Delete users",
    });

    expect(permissions.VIEW_USERS).toEqual({
      id: "test-app:view_users",
      name: "VIEW_USERS",
      description: "View user list",
    });

    expect(permissions.CREATE_USERS.id).toBe("test-app:create_users");
    expect(permissions.DELETE_USERS.description).toBe("Delete users");
  });

  it("should generate permission mappings from role hierarchy", () => {
    const roles = ["Guest", "User", "Admin", "SuperAdmin"];
    const requirements = {
      "user-mgmt": [
        { permissionId: "user-mgmt:view", minRole: "User" },
        { permissionId: "user-mgmt:create", minRole: "Admin" },
        { permissionId: "user-mgmt:delete", minRole: "SuperAdmin" },
      ],
    };

    const mappings = generatePermissionMappings(roles, requirements);

    expect(mappings["user-mgmt"]["user-mgmt:view"]).toEqual([
      "User",
      "Admin",
      "SuperAdmin",
    ]);
    expect(mappings["user-mgmt"]["user-mgmt:create"]).toEqual([
      "Admin",
      "SuperAdmin",
    ]);
    expect(mappings["user-mgmt"]["user-mgmt:delete"]).toEqual(["SuperAdmin"]);
  });

  it("should throw error for invalid role in requirements", () => {
    const roles = ["Guest", "User"];
    const requirements = {
      app: [{ permissionId: "app:action", minRole: "InvalidRole" }],
    };

    expect(() => generatePermissionMappings(roles, requirements)).toThrow(
      'Role "InvalidRole" not found in role hierarchy',
    );
  });

  it("should calculate permissions from user roles", () => {
    const roleConfig = {
      roles: ["Guest", "User", "Admin"],
      permissionMappings: {
        app1: {
          read: ["User", "Admin"],
          write: ["Admin"],
        },
      },
    };

    const permissions = calculatePermissionsFromRoles(["User"], roleConfig);
    expect(permissions).toContain("app1:read");
    expect(permissions).not.toContain("app1:write");

    const adminPermissions = calculatePermissionsFromRoles(
      ["Admin"],
      roleConfig,
    );
    expect(adminPermissions).toContain("app1:read");
    expect(adminPermissions).toContain("app1:write");
  });
});