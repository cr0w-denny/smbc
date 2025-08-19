import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { getAllRoutes, getCurrentApplet } from "../utils/applet-utils";
import { AppletRouter } from "../AppletRouter";
import type { AppletMount } from "@smbc/applet-core";

// Mock the applet-core hooks
const mockUseHashNavigation = vi.fn();
const mockUseApplets = vi.fn();
vi.mock("@smbc/applet-core", () => ({
  useHashNavigation: () => mockUseHashNavigation(),
  useApplets: () => mockUseApplets(),
}));

describe("Applet Routing", () => {
  const mockComponent1 = () => React.createElement("div", {}, "Component 1");
  const mockComponent2 = () => React.createElement("div", {}, "Component 2");
  const mockComponent3 = () => React.createElement("div", {}, "Component 3");

  const testApplets: AppletMount[] = [
    {
      id: "applet-1",
      label: "Applet 1",
      packageName: "@test/applet1",
      routes: [
        {
          path: "/app1",
          label: "App 1 Home",
          component: mockComponent1,
          requiredPermissions: [],
        },
        {
          path: "/app1/settings",
          label: "App 1 Settings",
          component: mockComponent2,
          requiredPermissions: ["app1:admin"],
        },
      ],
    },
    {
      id: "applet-2",
      label: "Applet 2",
      packageName: "@test/applet2",
      routes: [
        {
          path: "/app2",
          label: "App 2 Home",
          component: mockComponent3,
          requiredPermissions: [],
        },
        {
          path: "/app2/dashboard",
          label: "App 2 Dashboard",
          component: mockComponent1,
          requiredPermissions: ["app2:view"],
        },
      ],
    },
  ];

  describe("getAllRoutes", () => {
    it("should return all routes from all applets", () => {
      const routes = getAllRoutes(testApplets);

      expect(routes).toHaveLength(4);
      expect(routes.map(r => r.path)).toEqual([
        "/app1",
        "/app1/settings",
        "/app2",
        "/app2/dashboard",
      ]);
    });

    it("should handle empty applets array", () => {
      const routes = getAllRoutes([]);
      expect(routes).toEqual([]);
    });

    it("should handle applets with no routes", () => {
      const appletsWithNoRoutes: AppletMount[] = [
        {
          id: "empty-applet",
          label: "Empty",
          packageName: "@test/empty",
          routes: [],
        },
      ];

      const routes = getAllRoutes(appletsWithNoRoutes);
      expect(routes).toEqual([]);
    });

    it("should flatten routes from multiple applets", () => {
      const multiRouteApplets: AppletMount[] = [
        {
          id: "app-a",
          label: "App A",
          packageName: "@test/a",
          routes: [
            {
              path: "/a/route1",
              label: "A Route 1",
              component: mockComponent1,
              requiredPermissions: [],
            },
            {
              path: "/a/route2",
              label: "A Route 2",
              component: mockComponent2,
              requiredPermissions: [],
            },
          ],
        },
        {
          id: "app-b",
          label: "App B",
          packageName: "@test/b",
          routes: [
            {
              path: "/b/route1",
              label: "B Route 1",
              component: mockComponent3,
              requiredPermissions: [],
            },
          ],
        },
      ];

      const routes = getAllRoutes(multiRouteApplets);
      expect(routes).toHaveLength(3);
      expect(routes.map(r => r.path)).toEqual([
        "/a/route1",
        "/a/route2",
        "/b/route1",
      ]);
    });
  });

  describe("getCurrentApplet", () => {
    it("should find applet by exact path match", () => {
      const applet = getCurrentApplet("/app1", testApplets);
      expect(applet?.id).toBe("applet-1");
    });

    it("should find applet by path prefix match", () => {
      const applet = getCurrentApplet("/app1/some/nested/path", testApplets);
      expect(applet?.id).toBe("applet-1");
    });

    it("should return null for non-matching path", () => {
      const applet = getCurrentApplet("/nonexistent", testApplets);
      expect(applet).toBeNull();
    });

    it("should handle nested route paths", () => {
      const applet = getCurrentApplet("/app1/settings", testApplets);
      expect(applet?.id).toBe("applet-1");
    });

    it("should return first matching applet for overlapping paths", () => {
      const overlappingApplets: AppletMount[] = [
        {
          id: "first-match",
          label: "First",
          packageName: "@test/first",
          routes: [
            {
              path: "/shared",
              label: "Shared Route",
              component: mockComponent1,
              requiredPermissions: [],
            },
          ],
        },
        {
          id: "second-match",
          label: "Second",
          packageName: "@test/second",
          routes: [
            {
              path: "/shared",
              label: "Also Shared Route",
              component: mockComponent2,
              requiredPermissions: [],
            },
          ],
        },
      ];

      const applet = getCurrentApplet("/shared", overlappingApplets);
      expect(applet?.id).toBe("first-match");
    });

    it("should handle empty applets array", () => {
      const applet = getCurrentApplet("/any/path", []);
      expect(applet).toBeNull();
    });

    it("should handle root path", () => {
      const rootApplets: AppletMount[] = [
        {
          id: "root-applet",
          label: "Root",
          packageName: "@test/root",
          routes: [
            {
              path: "/",
              label: "Home",
              component: mockComponent1,
              requiredPermissions: [],
            },
          ],
        },
      ];

      const applet = getCurrentApplet("/", rootApplets);
      expect(applet?.id).toBe("root-applet");
    });
  });

  describe("AppletRouter", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should render matching route component", () => {
      mockUseHashNavigation.mockReturnValue({ path: "/app1" });
      mockUseApplets.mockReturnValue(testApplets);

      const { container } = render(React.createElement(AppletRouter));
      expect(container.textContent).toBe("Component 1");
    });

    it("should render nested route component", () => {
      mockUseHashNavigation.mockReturnValue({ path: "/app1/settings" });
      mockUseApplets.mockReturnValue(testApplets);

      const { container } = render(React.createElement(AppletRouter));
      expect(container.textContent).toBe("Component 1"); // First matching route
    });

    it("should render component for different applet", () => {
      mockUseHashNavigation.mockReturnValue({ path: "/app2" });
      mockUseApplets.mockReturnValue(testApplets);

      const { container } = render(React.createElement(AppletRouter));
      expect(container.textContent).toBe("Component 3");
    });

    it("should render default component when no routes match", () => {
      const DefaultComponent = () => React.createElement("div", {}, "Default");
      
      mockUseHashNavigation.mockReturnValue({ path: "/nonexistent" });
      mockUseApplets.mockReturnValue(testApplets);

      const { container } = render(
        React.createElement(AppletRouter, { defaultComponent: DefaultComponent })
      );
      expect(container.textContent).toBe("Default");
    });

    it("should render null when no routes match and no default component", () => {
      mockUseHashNavigation.mockReturnValue({ path: "/nonexistent" });
      mockUseApplets.mockReturnValue(testApplets);

      const { container } = render(React.createElement(AppletRouter));
      expect(container.textContent).toBe("");
    });

    it("should handle empty applets array", () => {
      const DefaultComponent = () => React.createElement("div", {}, "Default");
      
      mockUseHashNavigation.mockReturnValue({ path: "/any" });
      mockUseApplets.mockReturnValue([]);

      const { container } = render(
        React.createElement(AppletRouter, { defaultComponent: DefaultComponent })
      );
      expect(container.textContent).toBe("Default");
    });

    it("should prioritize first matching route", () => {
      const overlappingRoutes: AppletMount[] = [
        {
          id: "priority-1",
          label: "Priority 1",
          packageName: "@test/priority1",
          routes: [
            {
              path: "/shared",
              label: "First Match",
              component: () => React.createElement("div", {}, "First"),
              requiredPermissions: [],
            },
          ],
        },
        {
          id: "priority-2",
          label: "Priority 2",
          packageName: "@test/priority2",
          routes: [
            {
              path: "/shared",
              label: "Second Match",
              component: () => React.createElement("div", {}, "Second"),
              requiredPermissions: [],
            },
          ],
        },
      ];

      mockUseHashNavigation.mockReturnValue({ path: "/shared" });
      mockUseApplets.mockReturnValue(overlappingRoutes);

      const { container } = render(React.createElement(AppletRouter));
      expect(container.textContent).toBe("First");
    });

    it("should handle route parameters and nested paths", () => {
      const paramRoutes: AppletMount[] = [
        {
          id: "param-applet",
          label: "Param Applet",
          packageName: "@test/param",
          routes: [
            {
              path: "/users",
              label: "Users",
              component: () => React.createElement("div", {}, "Users List"),
              requiredPermissions: [],
            },
          ],
        },
      ];

      mockUseHashNavigation.mockReturnValue({ path: "/users/123/profile" });
      mockUseApplets.mockReturnValue(paramRoutes);

      const { container } = render(React.createElement(AppletRouter));
      expect(container.textContent).toBe("Users List");
    });

    it("should provide unique key for each applet component", () => {
      mockUseHashNavigation.mockReturnValue({ path: "/app1" });
      mockUseApplets.mockReturnValue(testApplets);

      const { container } = render(React.createElement(AppletRouter));
      
      // Verify the component rendered correctly (indirect test of key usage)
      expect(container.textContent).toBe("Component 1");
      
      // Test with a different route to ensure proper component switching
      mockUseHashNavigation.mockReturnValue({ path: "/app2" });
      const { container: container2 } = render(React.createElement(AppletRouter));
      expect(container2.textContent).toBe("Component 3");
    });
  });
});