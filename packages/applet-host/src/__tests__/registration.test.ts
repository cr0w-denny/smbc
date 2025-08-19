import { describe, it, expect, beforeEach } from "vitest";
import {
  configureApplets,
  getAppletConfig,
  getAllApplets,
} from "../utils/applet-registry";
import { mountApplet, mountApplets } from "../utils/mounting";
import type { AppletMount } from "@smbc/applet-core";
import React from "react";

describe("Applet Registration", () => {
  beforeEach(() => {
    // Clear registry before each test
    configureApplets([]);
  });

  describe("configureApplets", () => {
    it("should register applet with valid configuration", () => {
      const testApplets: AppletMount[] = [
        {
          id: "test-applet",
          label: "Test Applet",
          routes: [
            {
              path: "/test",
              label: "Test Route",
              component: () => React.createElement("div", {}, "Test"),
              requiredPermissions: [],
            },
          ],
          packageName: "@test/applet",
        },
      ];

      configureApplets(testApplets);

      const retrieved = getAppletConfig("test-applet");
      expect(retrieved).toEqual(testApplets[0]);
    });

    it("should handle multiple applet registrations", () => {
      const testApplets: AppletMount[] = [
        {
          id: "applet-1",
          label: "Applet 1",
          routes: [],
          packageName: "@test/applet1",
        },
        {
          id: "applet-2",
          label: "Applet 2",
          routes: [],
          packageName: "@test/applet2",
        },
      ];

      configureApplets(testApplets);

      expect(getAppletConfig("applet-1")).toBeDefined();
      expect(getAppletConfig("applet-2")).toBeDefined();
      expect(getAllApplets()).toHaveLength(2);
    });

    it("should clear previous registrations when called again", () => {
      const firstBatch: AppletMount[] = [
        {
          id: "first-applet",
          label: "First",
          routes: [],
          packageName: "@test/first",
        },
      ];

      const secondBatch: AppletMount[] = [
        {
          id: "second-applet",
          label: "Second",
          routes: [],
          packageName: "@test/second",
        },
      ];

      configureApplets(firstBatch);
      expect(getAppletConfig("first-applet")).toBeDefined();

      configureApplets(secondBatch);
      expect(getAppletConfig("first-applet")).toBeUndefined();
      expect(getAppletConfig("second-applet")).toBeDefined();
    });

    it("should maintain registry of all applets", () => {
      const testApplets: AppletMount[] = [
        {
          id: "applet-1",
          label: "Applet 1",
          routes: [],
          packageName: "@test/applet1",
        },
        {
          id: "applet-2",
          label: "Applet 2",
          routes: [],
          packageName: "@test/applet2",
        },
        {
          id: "applet-3",
          label: "Applet 3",
          routes: [],
          packageName: "@test/applet3",
        },
      ];

      configureApplets(testApplets);

      const allApplets = getAllApplets();
      expect(allApplets).toHaveLength(3);
      expect(allApplets.map((a) => a.id)).toEqual([
        "applet-1",
        "applet-2",
        "applet-3",
      ]);
    });

    it("should provide applet discovery mechanism", () => {
      const testApplets: AppletMount[] = [
        {
          id: "discoverable-applet",
          label: "Discoverable",
          routes: [],
          packageName: "@test/discoverable",
          filterable: true,
        },
        {
          id: "hidden-applet",
          label: "Hidden",
          routes: [],
          packageName: "@test/hidden",
          filterable: false,
        },
      ];

      configureApplets(testApplets);

      const allApplets = getAllApplets();
      const discoverableApplets = allApplets.filter(
        (a) => a.filterable !== false,
      );
      const hiddenApplets = allApplets.filter((a) => a.filterable === false);

      expect(discoverableApplets).toHaveLength(1);
      expect(hiddenApplets).toHaveLength(1);
      expect(discoverableApplets[0].id).toBe("discoverable-applet");
      expect(hiddenApplets[0].id).toBe("hidden-applet");
    });
  });

  describe("getAppletConfig", () => {
    it("should return undefined for non-existent applet", () => {
      const result = getAppletConfig("non-existent");
      expect(result).toBeUndefined();
    });

    it("should return correct config for existing applet", () => {
      const testApplet: AppletMount = {
        id: "existing-applet",
        label: "Existing",
        routes: [],
        packageName: "@test/existing",
        apiBaseUrl: "https://api.test.com",
      };

      configureApplets([testApplet]);

      const result = getAppletConfig("existing-applet");
      expect(result).toEqual(testApplet);
    });
  });

  describe("getAllApplets", () => {
    it("should return empty array when no applets configured", () => {
      const result = getAllApplets();
      expect(result).toEqual([]);
    });

    it("should return all configured applets", () => {
      const testApplets: AppletMount[] = [
        {
          id: "applet-1",
          label: "Applet 1",
          routes: [],
          packageName: "@test/applet1",
        },
        {
          id: "applet-2",
          label: "Applet 2",
          routes: [],
          packageName: "@test/applet2",
        },
      ];

      configureApplets(testApplets);

      const result = getAllApplets();
      expect(result).toEqual(testApplets);
    });
  });
});

describe("Applet Mounting", () => {
  const mockComponent = () => React.createElement("div", {}, "Mock Component");

  describe("mountApplet", () => {
    it("should mount applet with basic configuration", () => {
      const applet = {
        component: mockComponent,
        permissions: {
          VIEW: {
            id: "test:view",
            name: "VIEW",
            description: "View permission",
          },
        },
      };

      const config = {
        id: "test-applet",
        label: "Test Applet",
        path: "/test",
      };

      const mounted = mountApplet(applet, config);

      expect(mounted.id).toBe("test-applet");
      expect(mounted.label).toBe("Test Applet");
      expect(mounted.routes).toHaveLength(1);
      expect(mounted.routes[0].path).toBe("/test");
      expect(mounted.packageName).toBe("@smbc/test-applet-mui");
    });

    it("should handle custom package name", () => {
      const applet = {
        component: mockComponent,
      };

      const config = {
        id: "custom-applet",
        label: "Custom",
        path: "/custom",
        packageName: "@custom/package" as string | false,
      };

      const mounted = mountApplet(applet, config);
      expect(mounted.packageName).toBe("@custom/package");
    });

    it("should handle false package name", () => {
      const applet = {
        component: mockComponent,
      };

      const config = {
        id: "local-applet",
        label: "Local",
        path: "/local",
        packageName: false as string | false,
      };

      const mounted = mountApplet(applet, config);
      expect(mounted.packageName).toBe(false);
    });

    it("should throw error when component is missing", () => {
      const applet = {} as any;

      const config = {
        id: "broken-applet",
        label: "Broken",
        path: "/broken",
      };

      expect(() => mountApplet(applet, config)).toThrow(
        "Applet broken-applet must export a component",
      );
    });

    it("should handle API spec configuration", () => {
      const applet = {
        component: mockComponent,
        apiSpec: {
          name: "TestAPI",
          spec: {
            servers: [
              { url: "https://dev.api.com", description: "development" },
              { url: "https://prod.api.com", description: "production" },
            ],
          },
        },
      };

      const config = {
        id: "api-applet",
        label: "API Applet",
        path: "/api",
      };

      const mounted = mountApplet(applet, config);
      expect(mounted.apiSpec).toEqual(applet.apiSpec);
    });

    it("should override servers when provided", () => {
      const applet = {
        component: mockComponent,
        apiSpec: {
          name: "TestAPI",
          spec: {
            servers: [
              { url: "https://original.com", description: "development" },
              { url: "https://orig-prod.com", description: "production" },
            ],
          },
        },
      };

      const config = {
        id: "override-applet",
        label: "Override",
        path: "/override",
      };

      const serverOverrides = [
        { url: "https://new-dev.com", description: "development" },
        { url: "https://new-prod.com", description: "production" },
      ];

      const mounted = mountApplet(applet, config, serverOverrides);

      expect(mounted.apiSpec?.spec.servers).toEqual([
        {
          url: "https://new-dev.com",
          description: "development",
          variables: {},
        },
        {
          url: "https://new-prod.com",
          description: "production",
          variables: {},
        },
      ]);
    });

    it("should handle permissions in route configuration", () => {
      const applet = {
        component: mockComponent,
        permissions: {
          VIEW: {
            id: "test:view",
            name: "VIEW",
            description: "View permission",
          },
          EDIT: {
            id: "test:edit",
            name: "EDIT",
            description: "Edit permission",
          },
        },
      };

      const config = {
        id: "perm-applet",
        label: "Permission Applet",
        path: "/perm",
        permissions: [applet.permissions.VIEW, applet.permissions.EDIT],
      };

      const mounted = mountApplet(applet, config);
      expect(mounted.routes[0].requiredPermissions).toEqual([
        "test:view",
        "test:edit",
      ]);
    });

    it("should handle filterable configuration", () => {
      const applet = {
        component: mockComponent,
      };

      const config = {
        id: "filterable-applet",
        label: "Filterable",
        path: "/filterable",
        filterable: false,
      };

      const mounted = mountApplet(applet, config);
      expect(mounted.filterable).toBe(false);
    });
  });

  describe("mountApplets", () => {
    it("should mount multiple applets and generate requirements", () => {
      const applet1 = {
        component: mockComponent,
        permissions: {
          VIEW: { id: "app1:view", name: "VIEW", description: "View" },
        },
      };

      const applet2 = {
        component: mockComponent,
        permissions: {
          EDIT: { id: "app2:edit", name: "EDIT", description: "Edit" },
        },
      };

      const configs = {
        app1: {
          applet: applet1,
          label: "App 1",
          path: "/app1",
          permissions: {
            VIEW: "User",
          },
        },
        app2: {
          applet: applet2,
          label: "App 2",
          path: "/app2",
          permissions: {
            EDIT: "Admin",
          },
        },
      };

      const result = mountApplets(configs);

      // Check permission requirements
      expect(result.permissionRequirements).toHaveProperty("app1");
      expect(result.permissionRequirements).toHaveProperty("app2");
      expect(result.permissionRequirements.app1.permissions).toEqual({
        VIEW: "User",
      });
      expect(result.permissionRequirements.app2.permissions).toEqual({
        EDIT: "Admin",
      });

      // Check mounted applets
      expect(result.mountedApplets).toHaveProperty("app1");
      expect(result.mountedApplets).toHaveProperty("app2");
      expect(result.mountedApplets.app1.id).toBe("app1");
      expect(result.mountedApplets.app2.id).toBe("app2");
    });

    it("should handle empty configuration", () => {
      const result = mountApplets({});

      expect(result.permissionRequirements).toEqual({});
      expect(result.mountedApplets).toEqual({});
    });
  });
});
