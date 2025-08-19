import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildAppShellNavigation } from "../AppShellMenuBuilder";
import type { 
  BuildNavigationOptions,
  AppShellMenuStructure,
} from "../AppShellMenuBuilder";
import type { AppletMount } from "@smbc/applet-core";

// Mock React.createElement for icon handling
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    default: {
      ...actual,
      createElement: vi.fn((component) => `<${component.name || component} />`),
    },
    createElement: vi.fn((component) => `<${component.name || component} />`),
  };
});

describe("AppShellMenuBuilder", () => {
  const createMockApplet = (id: string, options: any = {}): AppletMount => ({
    id,
    name: `${id} Applet`,
    version: "1.0.0",
    routes: options.routes || [
      {
        path: `/${id}`,
        label: `${id} Home`,
        requiredPermissions: options.permissions || [],
        icon: options.icon,
      },
    ],
    getHostNavigation: options.getHostNavigation,
    mount: vi.fn(),
    unmount: vi.fn(),
    ...options,
  });

  const mockOnNavigate = vi.fn();
  const mockHasAnyPermission = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockHasAnyPermission.mockReturnValue(true); // Default to having permissions
  });

  describe("Basic Menu Building", () => {
    it("should build simple menu structure", () => {
      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "User Management",
            children: [
              { label: "Users", applet: "users" },
              { label: "Roles", applet: "roles" },
            ],
          },
        ],
      };

      const applets = [
        createMockApplet("users"),
        createMockApplet("roles"),
      ];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe("User Management");
      expect(result[0].type).toBe("tree-dropdown");
      expect(result[0].treeItems).toHaveLength(2);
      expect(result[0].treeItems![0].label).toBe("Users");
      expect(result[0].treeItems![1].label).toBe("Roles");
    });

    it("should handle multiple top-level menus", () => {
      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "User Management",
            children: [{ label: "Users", applet: "users" }],
          },
          {
            label: "Content",
            children: [{ label: "Posts", applet: "posts" }],
          },
        ],
      };

      const applets = [
        createMockApplet("users"),
        createMockApplet("posts"),
      ];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      expect(result).toHaveLength(2);
      expect(result[0].label).toBe("User Management");
      expect(result[1].label).toBe("Content");
    });

    it("should handle static items", () => {
      const menuStructure: AppShellMenuStructure = {
        menus: [],
        staticItems: [
          {
            label: "Settings",
            type: "button",
            onClick: mockOnNavigate,
          },
          {
            label: "Help",
            type: "button",
            onClick: mockOnNavigate,
          },
        ],
      };

      const options: BuildNavigationOptions = {
        menuStructure,
        applets: [],
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      expect(result).toHaveLength(2);
      expect(result[0].label).toBe("Settings");
      expect(result[1].label).toBe("Help");
    });
  });

  describe("Applet Navigation Integration", () => {
    it("should handle applets with getHostNavigation - single route", () => {
      const mockGetHostNavigation = vi.fn().mockReturnValue({
        homeRoute: {
          path: "/dashboard",
          label: "Dashboard Home",
          requiredPermissions: [],
        },
        groups: [],
      });

      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "Main",
            children: [{ label: "Dashboard", applet: "dashboard" }],
          },
        ],
      };

      const applets = [
        createMockApplet("dashboard", { getHostNavigation: mockGetHostNavigation }),
      ];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      expect(mockGetHostNavigation).toHaveBeenCalledWith(
        "/dashboard",
        mockHasAnyPermission,
        "dashboard"
      );
      expect(result[0].treeItems![0].label).toBe("Dashboard");
      expect(result[0].treeItems![0].path).toBe("/dashboard");
      expect(result[0].treeItems![0].isCollapsible).toBeUndefined();
    });

    it("should handle applets with getHostNavigation - multiple routes", () => {
      const mockGetHostNavigation = vi.fn().mockReturnValue({
        homeRoute: {
          path: "/admin",
          label: "Admin Home",
          requiredPermissions: [],
        },
        groups: [
          {
            label: "User Management",
            routes: [
              {
                path: "/admin/users",
                label: "Manage Users",
                requiredPermissions: ["admin.users.read"],
              },
              {
                path: "/admin/roles",
                label: "Manage Roles",
                requiredPermissions: ["admin.roles.read"],
              },
            ],
          },
        ],
      });

      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "Administration",
            children: [{ label: "Admin Panel", applet: "admin" }],
          },
        ],
      };

      const applets = [
        createMockApplet("admin", { getHostNavigation: mockGetHostNavigation }),
      ];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      expect(result[0].treeItems![0].label).toBe("Admin Panel");
      expect(result[0].treeItems![0].isCollapsible).toBe(true);
      expect(result[0].treeItems![0].children).toHaveLength(3); // home + 2 group routes
      expect(result[0].treeItems![0].children![0].label).toBe("Admin Home");
      expect(result[0].treeItems![0].children![1].label).toBe("Manage Users");
      expect(result[0].treeItems![0].children![2].label).toBe("Manage Roles");
    });

    it("should handle applets without getHostNavigation", () => {
      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "Simple",
            children: [{ label: "Basic App", applet: "basic" }],
          },
        ],
      };

      const applets = [
        createMockApplet("basic"),
      ];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      expect(result[0].treeItems![0].label).toBe("Basic App");
      expect(result[0].treeItems![0].path).toBe("/basic");
    });
  });

  describe("Permission Filtering", () => {
    it("should filter routes based on permissions", () => {
      mockHasAnyPermission.mockImplementation((_appletId: string, permissions: string[]) => {
        return !permissions.includes("admin.secret");
      });

      const mockGetHostNavigation = vi.fn().mockReturnValue({
        homeRoute: {
          path: "/admin",
          label: "Admin Home",
          requiredPermissions: [],
        },
        groups: [
          {
            label: "Management",
            routes: [
              {
                path: "/admin/users",
                label: "Manage Users",
                requiredPermissions: ["admin.users"],
              },
              {
                path: "/admin/secret",
                label: "Secret Area",
                requiredPermissions: ["admin.secret"],
              },
            ],
          },
        ],
      });

      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "Admin",
            children: [{ label: "Admin Panel", applet: "admin" }],
          },
        ],
      };

      const applets = [
        createMockApplet("admin", { getHostNavigation: mockGetHostNavigation }),
      ];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      expect(result[0].treeItems![0].children).toHaveLength(2); // home + users (secret filtered out)
      expect(result[0].treeItems![0].children![1].label).toBe("Manage Users");
      expect(result[0].treeItems![0].children!.some(item => item.label === "Secret Area")).toBe(false);
    });

    it("should filter entire applets based on permissions", () => {
      mockHasAnyPermission.mockImplementation((appletId: string) => {
        return appletId !== "restricted";
      });

      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "Apps",
            children: [
              { label: "Public App", applet: "public" },
              { label: "Restricted App", applet: "restricted" },
            ],
          },
        ],
      };

      const applets = [
        createMockApplet("public"),
        createMockApplet("restricted", { 
          routes: [{
            path: "/restricted",
            label: "Restricted",
            requiredPermissions: ["restricted.access"],
          }]
        }),
      ];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      expect(result[0].treeItems).toHaveLength(1);
      expect(result[0].treeItems![0].label).toBe("Public App");
    });

    it("should use permission mapping when provided", () => {
      const mockGetHostNavigation = vi.fn().mockReturnValue({
        homeRoute: {
          path: "/mapped",
          label: "Mapped Home",
          requiredPermissions: ["mapped.read"],
        },
        groups: [],
      });

      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "Mapped",
            children: [{ label: "Mapped App", applet: "original-id" }],
          },
        ],
      };

      const applets = [
        createMockApplet("original-id", { getHostNavigation: mockGetHostNavigation }),
      ];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
        permissionMapping: { "original-id": "mapped-id" },
      };

      buildAppShellNavigation(options);

      expect(mockGetHostNavigation).toHaveBeenCalledWith(
        "/original-id",
        mockHasAnyPermission,
        "mapped-id" // Should use mapped ID for permissions
      );
    });
  });

  describe("Navigation Callbacks", () => {
    it("should set up onClick callbacks for navigation items", () => {
      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "Apps",
            children: [{ label: "Test App", applet: "test" }],
          },
        ],
      };

      const applets = [createMockApplet("test")];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      // Click the navigation item
      result[0].treeItems![0].onClick!();

      expect(mockOnNavigate).toHaveBeenCalledWith("/test");
    });

    it("should set up onClick callbacks for nested navigation items", () => {
      const mockGetHostNavigation = vi.fn().mockReturnValue({
        homeRoute: {
          path: "/admin",
          label: "Admin Home",
          requiredPermissions: [],
        },
        groups: [
          {
            label: "Management",
            routes: [
              {
                path: "/admin/users",
                label: "Manage Users",
                requiredPermissions: [],
              },
            ],
          },
        ],
      });

      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "Admin",
            children: [{ label: "Admin Panel", applet: "admin" }],
          },
        ],
      };

      const applets = [
        createMockApplet("admin", { getHostNavigation: mockGetHostNavigation }),
      ];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      // Click the nested navigation item
      result[0].treeItems![0].children![1].onClick!();

      expect(mockOnNavigate).toHaveBeenCalledWith("/admin/users");
    });
  });

  describe("Icon Handling", () => {
    it("should handle string icons", () => {
      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "Apps",
            children: [{ label: "Icon App", applet: "icon-app" }],
          },
        ],
      };

      const applets = [
        createMockApplet("icon-app", {
          routes: [{
            path: "/icon-app",
            label: "Icon App",
            icon: "home",
            requiredPermissions: [],
          }]
        }),
      ];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      expect(result[0].treeItems![0].icon).toBe("home");
    });

    it("should handle React component icons", () => {
      const IconComponent = () => "icon";
      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "Apps",
            children: [{ label: "Component Icon App", applet: "component-icon-app" }],
          },
        ],
      };

      const applets = [
        createMockApplet("component-icon-app", {
          routes: [{
            path: "/component-icon-app",
            label: "Component Icon App",
            icon: IconComponent,
            requiredPermissions: [],
          }]
        }),
      ];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      expect(result[0].treeItems![0].icon).toBe("<IconComponent />");
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing applets gracefully", () => {
      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "Apps",
            children: [
              { label: "Existing App", applet: "existing" },
              { label: "Missing App", applet: "missing" },
            ],
          },
        ],
      };

      const applets = [createMockApplet("existing")];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      expect(result[0].treeItems).toHaveLength(1);
      expect(result[0].treeItems![0].label).toBe("Existing App");
    });

    it("should handle empty menu structures", () => {
      const menuStructure: AppShellMenuStructure = {
        menus: [],
      };

      const options: BuildNavigationOptions = {
        menuStructure,
        applets: [],
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      expect(result).toHaveLength(0);
    });

    it("should handle menus with no accessible items", () => {
      mockHasAnyPermission.mockReturnValue(false);

      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "Restricted",
            children: [{ label: "Restricted App", applet: "restricted" }],
          },
        ],
      };

      const applets = [
        createMockApplet("restricted", {
          routes: [{
            path: "/restricted",
            label: "Restricted",
            requiredPermissions: ["admin"],
          }]
        }),
      ];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      expect(result).toHaveLength(0);
    });

    it("should handle applets with empty groups", () => {
      const mockGetHostNavigation = vi.fn().mockReturnValue({
        homeRoute: {
          path: "/empty",
          label: "Empty Home",
          requiredPermissions: [],
        },
        groups: [
          {
            label: "Empty Group",
            routes: [], // Empty routes
          },
        ],
      });

      const menuStructure: AppShellMenuStructure = {
        menus: [
          {
            label: "Empty",
            children: [{ label: "Empty App", applet: "empty" }],
          },
        ],
      };

      const applets = [
        createMockApplet("empty", { getHostNavigation: mockGetHostNavigation }),
      ];

      const options: BuildNavigationOptions = {
        menuStructure,
        applets,
        hasAnyPermission: mockHasAnyPermission,
        onNavigate: mockOnNavigate,
      };

      const result = buildAppShellNavigation(options);

      // With a home route and empty groups, it's still considered multi-route
      // but will only have the home route as a child
      expect(result[0].treeItems![0].label).toBe("Empty App");
      expect(result[0].treeItems![0].isCollapsible).toBe(true);
      expect(result[0].treeItems![0].children).toHaveLength(1);
      expect(result[0].treeItems![0].children![0].path).toBe("/empty");
    });
  });
});