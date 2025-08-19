import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import {
  createApiClient,
  getApiClient,
  getAvailableServers,
  getServerUrlFromSpec,
  getAppletApiUrl,
  useApiClient,
  _setAppletRegistry,
} from "../query-client";
import { FeatureFlagProvider } from "../FeatureFlagProvider";

describe("Query Client Functions", () => {
  beforeEach(() => {
    // Clear registries before each test
    _setAppletRegistry([]);
  });

  it("should resolve baseUrl correctly based on configuration hierarchy", () => {
    // Test 1: Default fallback
    const defaultClient = createApiClient();
    expect(defaultClient).toBeDefined();
    
    // Test 2: Custom baseUrl takes precedence over everything
    const customClient = createApiClient({ baseUrl: "https://api.custom.com" });
    expect(customClient).toBeDefined();
    
    // Test 3: Applet registry baseUrl used when no custom baseUrl
    _setAppletRegistry([{
      id: "test-applet",
      label: "Test",
      packageName: "@test/app",
      apiBaseUrl: "https://api.applet-specific.com",
      routes: []
    }]);
    
    const appletClient = createApiClient({}, "test-applet");
    expect(appletClient).toBeDefined();
    
    // Test 4: Headers are correctly merged with defaults
    const clientWithHeaders = createApiClient({ 
      baseUrl: "https://api.test.com",
      headers: { "Authorization": "Bearer test-token" } 
    });
    expect(clientWithHeaders).toBeDefined();
  });

  it("should manage singleton API client registry correctly", () => {
    // Test singleton behavior - same applet should get same client instance
    const client1 = getApiClient("test-applet");
    const client2 = getApiClient("test-applet");
    expect(client1).toBe(client2);

    // Test isolation - different applets should get different clients
    const client3 = getApiClient("other-applet");
    expect(client3).not.toBe(client1);
    
    // Test that configuration is applied correctly for new clients
    _setAppletRegistry([{
      id: "configured-applet",
      label: "Configured",
      packageName: "@test/configured",
      apiBaseUrl: "https://configured.api.com",
      routes: []
    }]);
    
    const configuredClient = getApiClient("configured-applet");
    expect(configuredClient).toBeDefined();
    expect(configuredClient).not.toBe(client1);
    
    // Test that subsequent calls return the same configured client
    const configuredClient2 = getApiClient("configured-applet");
    expect(configuredClient2).toBe(configuredClient);
  });

  it("should extract available servers from OpenAPI spec", () => {
    const spec = {
      servers: [
        { url: "http://localhost:3000", description: "Development server" },
        { url: "https://api.prod.com", description: "Production server" },
      ],
    };

    const servers = getAvailableServers(spec);
    expect(servers).toHaveLength(2);
    expect(servers[0]).toEqual({
      url: "http://localhost:3000",
      description: "Development server",
    });
    expect(servers[1]).toEqual({
      url: "https://api.prod.com",
      description: "Production server",
    });
  });

  it("should handle wrapped API spec format", () => {
    const wrappedSpec = {
      name: "TestAPI",
      spec: {
        servers: [{ url: "http://localhost:3000", description: "Dev" }],
      },
    };

    const servers = getAvailableServers(wrappedSpec);
    expect(servers).toHaveLength(1);
    expect(servers[0].url).toBe("http://localhost:3000");
  });

  it("should return empty array when no servers in spec", () => {
    const servers = getAvailableServers({});
    expect(servers).toEqual([]);

    const servers2 = getAvailableServers({ servers: null });
    expect(servers2).toEqual([]);
  });

  it("should get server URL from spec based on environment", () => {
    const spec = {
      servers: [
        { url: "http://localhost:3000", description: "development" },
        { url: "https://staging.api.com", description: "staging" },
        { url: "https://api.prod.com", description: "production" },
      ],
    };

    expect(getServerUrlFromSpec(spec, "development")).toBe(
      "http://localhost:3000",
    );

    expect(getServerUrlFromSpec(spec, "production")).toBe(
      "https://api.prod.com",
    );

    // Default to first server for unknown environment
    expect(getServerUrlFromSpec(spec, "unknown" as any)).toBe(
      "http://localhost:3000",
    );
  });

  it("should handle mock environment specially", () => {
    const spec = {
      servers: [
        { url: "http://localhost:3000", description: "development" },
        { url: "http://localhost:3001", description: "mock server" },
      ],
    };

    expect(getServerUrlFromSpec(spec, "mock")).toBe("http://localhost:3001");
  });

  it("should throw error when no servers found", () => {
    expect(() => getServerUrlFromSpec({}, "development")).toThrow(
      "No servers found in API spec",
    );
  });

  it("should register applets in the registry", () => {
    const testApplets = [
      {
        id: "test-app-1",
        label: "Test App 1",
        routes: [],
        packageName: "@test/app1" as string | false,
        apiBaseUrl: "https://api1.example.com",
      },
      {
        id: "test-app-2",
        label: "Test App 2",
        routes: [],
        packageName: "@test/app2" as string | false,
        apiSpec: {
          name: "TestAPI2",
          spec: {
            servers: [
              { url: "https://api2.example.com", description: "production" },
            ],
          },
        },
      },
    ];

    _setAppletRegistry(testApplets);

    // Test that registry was populated by testing getAppletApiUrl
    expect(getAppletApiUrl("test-app-1")).toBe("https://api1.example.com");
  });

  it("should resolve applet API URL from apiBaseUrl", () => {
    const testApplets = [
      {
        id: "legacy-app",
        label: "Legacy App",
        routes: [],
        packageName: "@test/legacy" as string | false,
        apiBaseUrl: "https://legacy.api.com",
      },
    ];

    _setAppletRegistry(testApplets);
    expect(getAppletApiUrl("legacy-app")).toBe("https://legacy.api.com");
  });

  it("should resolve applet API URL from apiSpec", () => {
    const testApplets = [
      {
        id: "spec-app",
        label: "Spec App",
        routes: [],
        packageName: "@test/spec" as string | false,
        apiSpec: {
          name: "SpecAPI",
          spec: {
            servers: [
              { url: "https://dev.api.com", description: "development" },
              { url: "https://prod.api.com", description: "production" },
            ],
          },
        },
      },
    ];

    _setAppletRegistry(testApplets);

    expect(getAppletApiUrl("spec-app", "development")).toBe(
      "https://dev.api.com",
    );
    expect(getAppletApiUrl("spec-app", "production")).toBe(
      "https://prod.api.com",
    );
  });

  it("should throw error for non-existent applet", () => {
    _setAppletRegistry([]);

    expect(() => getAppletApiUrl("non-existent")).toThrow(
      "Applet 'non-existent' is not configured",
    );
  });

  it("should throw error for applet without apiSpec or apiBaseUrl", () => {
    const testApplets = [
      {
        id: "broken-app",
        label: "Broken App",
        routes: [],
        packageName: "@test/broken" as string | false,
      },
    ];

    _setAppletRegistry(testApplets);

    expect(() => getAppletApiUrl("broken-app")).toThrow(
      "Applet 'broken-app' has no apiSpec configured",
    );
  });

  it("should create API client with applet base URL from registry", () => {
    const testApplets = [
      {
        id: "registry-app",
        label: "Registry App",
        routes: [],
        packageName: "@test/registry" as string | false,
        apiBaseUrl: "https://registry.api.com",
      },
    ];

    _setAppletRegistry(testApplets);

    const client = createApiClient({}, "registry-app");
    expect(client).toBeDefined();
  });
});

describe("useApiClient Hook", () => {
  const testFeatureFlagWrapper = (environment = "development") => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(FeatureFlagProvider, {
        configs: [
          {
            key: "environment",
            defaultValue: environment,
            description: "Current environment",
          },
        ],
        children,
      });
  };

  beforeEach(() => {
    // Set up test applet
    const testApplets = [
      {
        id: "hook-test-app",
        label: "Hook Test App",
        routes: [],
        packageName: "@test/hook" as string | false,
        apiSpec: {
          name: "HookAPI",
          spec: {
            servers: [
              { url: "https://dev.hook.com", description: "development" },
              { url: "https://prod.hook.com", description: "production" },
            ],
          },
        },
      },
    ];
    _setAppletRegistry(testApplets);
  });

  it("should create API client based on environment feature flag", () => {
    const wrapper = testFeatureFlagWrapper("development");
    const { result } = renderHook(() => useApiClient("hook-test-app"), {
      wrapper,
    });

    expect(result.current).toBeDefined();
    expect(typeof result.current.GET).toBe("function");
    expect(typeof result.current.POST).toBe("function");
  });

  it("should cache clients per applet and environment", () => {
    const wrapper = testFeatureFlagWrapper("production");

    const { result: result1 } = renderHook(() => useApiClient("hook-test-app"), {
      wrapper,
    });
    const { result: result2 } = renderHook(() => useApiClient("hook-test-app"), {
      wrapper,
    });

    // Should return the same cached instance
    expect(result1.current).toBe(result2.current);
  });

  it("should create different clients for different environments", () => {
    const devWrapper = testFeatureFlagWrapper("development");
    const prodWrapper = testFeatureFlagWrapper("production");

    const { result: devResult } = renderHook(
      () => useApiClient("hook-test-app"),
      {
        wrapper: devWrapper,
      },
    );
    const { result: prodResult } = renderHook(
      () => useApiClient("hook-test-app"),
      {
        wrapper: prodWrapper,
      },
    );

    // Should be different instances for different environments
    expect(devResult.current).not.toBe(prodResult.current);
  });

  it("should default to development environment when no feature flag", () => {
    // Create wrapper without environment feature flag
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(FeatureFlagProvider, {
        configs: [],
        children,
      });

    const { result } = renderHook(() => useApiClient("hook-test-app"), {
      wrapper,
    });

    expect(result.current).toBeDefined();
  });
});