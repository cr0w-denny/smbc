import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock the dependencies
vi.mock("@smbc/applet-core", () => ({
  usePermissions: vi.fn(),
  useHashNavigation: vi.fn(),
}));

vi.mock("@smbc/dataview-mui", () => ({
  MuiDataViewManager: vi.fn(),
}));

vi.mock("../ActionBar", () => ({
  ActionBar: vi.fn(),
}));

vi.mock("@mui/icons-material", () => ({
  Add: () => <div data-testid="add-icon">Add</div>,
}));

import { MuiDataViewApplet } from "../DataView/DataViewApplet";
import type { MuiDataViewAppletProps, MuiDataViewAppletConfig } from "../DataView/DataViewApplet";
import { usePermissions, useHashNavigation } from "@smbc/applet-core";
import { MuiDataViewManager } from "@smbc/dataview-mui";
import { ActionBar } from "../ActionBar";

// Get references to the mocked functions
const mockUsePermissions = vi.mocked(usePermissions);
const mockUseHashNavigation = vi.mocked(useHashNavigation);
const mockMuiDataViewManager = vi.mocked(MuiDataViewManager);
const mockActionBar = vi.mocked(ActionBar);

// Test data interface
interface TestUser {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
}

// Test wrapper with theme
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

describe("MuiDataViewApplet", () => {
  const createMockConfig = (overrides: any = {}): MuiDataViewAppletConfig<TestUser> => ({
    api: {
      endpoint: "/api/users",
      client: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    schema: {
      fields: [
        { name: "id", type: "number", label: "ID" },
        { name: "name", type: "string", label: "Name", required: true },
        { name: "email", type: "email", label: "Email", required: true },
        { name: "status", type: "select", label: "Status", options: ["active", "inactive"] },
      ],
      primaryKey: "id",
      displayName: (item: TestUser) => item.name,
    },
    permissions: {
      view: { action: "read", resource: "users" },
      create: { action: "create", resource: "users" },
      edit: { action: "update", resource: "users" },
      delete: { action: "delete", resource: "users" },
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
    ],
    actions: {
      global: [],
      row: [],
      bulk: [],
    },
    filters: {
      initialValues: { status: "active" },
    },
    pagination: {
      defaultPageSize: 20,
    },
    ...overrides,
  });

  const defaultProps: MuiDataViewAppletProps<TestUser> = {
    config: createMockConfig(),
    permissionContext: "test-context",
    enableUrlSync: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock usePermissions to return true for all permissions
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(true),
    });

    // Mock useHashNavigation with default behavior
    mockUseHashNavigation.mockReturnValue({
      params: {},
      setParams: vi.fn(),
    });

    // Mock MuiDataViewManager to render a placeholder
    mockMuiDataViewManager.mockImplementation((props: any) => {
      const { config, ActionBarComponent } = props;
      // Render the ActionBarComponent to test integration
      return React.createElement(
        'div',
        { 'data-testid': 'mui-data-view-manager' },
        ActionBarComponent && React.createElement(ActionBarComponent, {
          globalActions: config.actions?.global || [],
          bulkActions: config.actions?.bulk || [],
          selectedItems: [],
          totalItems: 0,
          onClearSelection: vi.fn()
        }),
        'Data View Manager'
      );
    });

    // Mock ActionBar
    mockActionBar.mockImplementation(() => <div data-testid="action-bar">Action Bar</div>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render MuiDataViewManager with processed config", () => {
      render(
        <TestWrapper>
          <MuiDataViewApplet {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId("mui-data-view-manager")).toBeInTheDocument();
      expect(mockMuiDataViewManager).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            api: expect.objectContaining({
              endpoint: "/api/users",
              client: expect.any(Function),
            }),
            columns: expect.arrayContaining([
              expect.objectContaining({ key: "id", label: "ID" }),
            ]),
          }),
        }),
        expect.anything()
      );
    });

    it("should render with custom className and style", () => {
      const customProps = {
        ...defaultProps,
        className: "custom-class",
        style: { backgroundColor: "red" },
      };

      render(
        <TestWrapper>
          <MuiDataViewApplet {...customProps} />
        </TestWrapper>
      );

      expect(mockMuiDataViewManager).toHaveBeenCalledWith(
        expect.objectContaining({
          className: "custom-class",
          style: { backgroundColor: "red" },
        }),
        expect.anything()
      );
    });
  });

  describe("Permission Integration", () => {
    it("should check permissions with correct context", () => {
      const mockHasPermission = vi.fn().mockReturnValue(true);
      mockUsePermissions.mockReturnValue({
        hasPermission: mockHasPermission,
      });

      render(
        <TestWrapper>
          <MuiDataViewApplet {...defaultProps} />
        </TestWrapper>
      );

      expect(mockHasPermission).toHaveBeenCalledWith(
        "test-context",
        { action: "create", resource: "users" }
      );
    });

    it("should add default create action when user has create permission", () => {
      const mockHasPermission = vi.fn().mockReturnValue(true);
      mockUsePermissions.mockReturnValue({
        hasPermission: mockHasPermission,
      });

      render(
        <TestWrapper>
          <MuiDataViewApplet {...defaultProps} />
        </TestWrapper>
      );

      expect(mockMuiDataViewManager).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            actions: expect.objectContaining({
              global: expect.arrayContaining([
                expect.objectContaining({
                  key: "create",
                  label: "Create New",
                  color: "primary",
                }),
              ]),
            }),
          }),
        }),
        expect.anything()
      );
    });

    it("should not add create action when user lacks create permission", () => {
      const mockHasPermission = vi.fn().mockReturnValue(false);
      mockUsePermissions.mockReturnValue({
        hasPermission: mockHasPermission,
      });

      render(
        <TestWrapper>
          <MuiDataViewApplet {...defaultProps} />
        </TestWrapper>
      );

      expect(mockMuiDataViewManager).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            actions: expect.objectContaining({
              global: [],
            }),
          }),
        }),
        expect.anything()
      );
    });

    it("should not add create action when one already exists", () => {
      const configWithCreateAction = createMockConfig({
        actions: {
          global: [
            {
              type: "global",
              key: "create",
              label: "Custom Create",
              onClick: vi.fn(),
            },
          ],
          row: [],
          bulk: [],
        },
      });

      const props = {
        ...defaultProps,
        config: configWithCreateAction,
      };

      render(
        <TestWrapper>
          <MuiDataViewApplet {...props} />
        </TestWrapper>
      );

      const call = mockMuiDataViewManager.mock.calls[0][0];
      const globalActions = call.config.actions.global;
      
      // Should only have the existing create action, not a duplicate
      const createActions = globalActions.filter((action: any) => action.key === "create");
      expect(createActions).toHaveLength(1);
      expect(createActions[0].label).toBe("Custom Create");
    });

    it("should strip permissions from config before passing to manager", () => {
      render(
        <TestWrapper>
          <MuiDataViewApplet {...defaultProps} />
        </TestWrapper>
      );

      expect(mockMuiDataViewManager).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.not.objectContaining({
            permissions: expect.anything(),
          }),
        }),
        expect.anything()
      );
    });
  });

  describe("URL Synchronization", () => {
    it("should use hash navigation when enableUrlSync is true", () => {
      const mockSetParams = vi.fn();
      mockUseHashNavigation.mockReturnValue({
        params: { status: "inactive", page: 1 },
        setParams: mockSetParams,
      });

      render(
        <TestWrapper>
          <MuiDataViewApplet {...defaultProps} enableUrlSync={true} />
        </TestWrapper>
      );

      expect(mockUseHashNavigation).toHaveBeenCalledWith({
        defaultParams: expect.objectContaining({
          status: "active", // from config.filters.initialValues
          page: 0,
          pageSize: 20,
        }),
      });

      expect(mockMuiDataViewManager).toHaveBeenCalledWith(
        expect.objectContaining({
          filterState: expect.objectContaining({
            filters: expect.objectContaining({
              status: "inactive", // from URL params
            }),
          }),
          paginationState: expect.objectContaining({
            pagination: expect.objectContaining({
              page: 1, // from URL params
              pageSize: 20,
            }),
          }),
        }),
        expect.anything()
      );
    });

    it("should not use URL sync when enableUrlSync is false", () => {
      render(
        <TestWrapper>
          <MuiDataViewApplet {...defaultProps} enableUrlSync={false} />
        </TestWrapper>
      );

      expect(mockUseHashNavigation).toHaveBeenCalledWith({
        defaultParams: {},
      });

      expect(mockMuiDataViewManager).toHaveBeenCalledWith(
        expect.objectContaining({
          filterState: undefined,
          paginationState: undefined,
        }),
        expect.anything()
      );
    });

    it("should handle URL parameter changes", async () => {
      const mockSetParams = vi.fn();
      mockUseHashNavigation.mockReturnValue({
        params: {},
        setParams: mockSetParams,
      });

      render(
        <TestWrapper>
          <MuiDataViewApplet {...defaultProps} />
        </TestWrapper>
      );

      // Get the filter state setter from the call to MuiDataViewManager
      const call = mockMuiDataViewManager.mock.calls[0][0];
      const setFilters = call.filterState.setFilters;

      // Simulate filter change
      act(() => {
        setFilters({ status: "inactive", search: "test" });
      });

      expect(mockSetParams).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should handle pagination changes", async () => {
      const mockSetParams = vi.fn();
      mockUseHashNavigation.mockReturnValue({
        params: {},
        setParams: mockSetParams,
      });

      render(
        <TestWrapper>
          <MuiDataViewApplet {...defaultProps} />
        </TestWrapper>
      );

      // Get the pagination state setter from the call to MuiDataViewManager
      const call = mockMuiDataViewManager.mock.calls[0][0];
      const setPagination = call.paginationState.setPagination;

      // Simulate pagination change
      act(() => {
        setPagination({ page: 2, pageSize: 50 });
      });

      expect(mockSetParams).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("ActionBar Integration", () => {
    it("should render ActionBar component by default", () => {
      render(
        <TestWrapper>
          <MuiDataViewApplet {...defaultProps} />
        </TestWrapper>
      );

      // Check that ActionBar was rendered inside the mock
      expect(screen.getByTestId("action-bar")).toBeInTheDocument();
    });

    it("should use custom ActionBarComponent when provided", () => {
      const CustomActionBar = vi.fn().mockImplementation(() => 
        <div data-testid="custom-action-bar">Custom Action Bar</div>
      );

      const propsWithCustomActionBar = {
        ...defaultProps,
        ActionBarComponent: CustomActionBar,
      };

      render(
        <TestWrapper>
          <MuiDataViewApplet {...propsWithCustomActionBar} />
        </TestWrapper>
      );

      expect(screen.getByTestId("custom-action-bar")).toBeInTheDocument();
      expect(screen.queryByTestId("action-bar")).not.toBeInTheDocument();
    });

    it("should pass correct props to ActionBar", () => {
      render(
        <TestWrapper>
          <MuiDataViewApplet {...defaultProps} />
        </TestWrapper>
      );

      // The ActionBar is created as a React component and passed to MuiDataViewManager
      // We need to check that the ActionBarComponent prop was passed
      expect(mockMuiDataViewManager).toHaveBeenCalledWith(
        expect.objectContaining({
          ActionBarComponent: expect.any(Function),
        }),
        expect.anything()
      );
    });
  });

  describe("State Management", () => {
    it("should initialize state from URL parameters", () => {
      mockUseHashNavigation.mockReturnValue({
        params: {
          status: "inactive",
          search: "john",
          page: 2,
          pageSize: 50,
        },
        setParams: vi.fn(),
      });

      render(
        <TestWrapper>
          <MuiDataViewApplet {...defaultProps} />
        </TestWrapper>
      );

      const call = mockMuiDataViewManager.mock.calls[0][0];
      
      // Should merge URL params with default filters
      expect(call.filterState.filters).toEqual({
        status: "inactive", // from URL (overrides default "active")
        search: "john", // from URL
      });

      expect(call.paginationState.pagination).toEqual({
        page: 2, // from URL
        pageSize: 50, // from URL
      });
    });

    it("should use default values when no URL parameters", () => {
      mockUseHashNavigation.mockReturnValue({
        params: {},
        setParams: vi.fn(),
      });

      render(
        <TestWrapper>
          <MuiDataViewApplet {...defaultProps} />
        </TestWrapper>
      );

      const call = mockMuiDataViewManager.mock.calls[0][0];
      
      expect(call.filterState.filters).toEqual({
        status: "active", // from config default
      });

      expect(call.paginationState.pagination).toEqual({
        page: 0, // default
        pageSize: 20, // from config
      });
    });
  });

  describe("Callback Props", () => {
    it("should pass callback props to MuiDataViewManager", () => {
      const mockOnSuccess = vi.fn();
      const mockOnError = vi.fn();
      const mockOnStateChange = vi.fn();
      const mockOptions = { 
        onSuccess: vi.fn(),
        onError: vi.fn(),
      };

      const propsWithCallbacks = {
        ...defaultProps,
        onSuccess: mockOnSuccess,
        onError: mockOnError,
        onStateChange: mockOnStateChange,
        options: mockOptions,
        initialState: {
          filters: { custom: "value" },
          pagination: { page: 1, pageSize: 25 },
        },
      };

      render(
        <TestWrapper>
          <MuiDataViewApplet {...propsWithCallbacks} />
        </TestWrapper>
      );

      expect(mockMuiDataViewManager).toHaveBeenCalledWith(
        expect.objectContaining({
          onSuccess: mockOnSuccess,
          onError: mockOnError,
          onStateChange: mockOnStateChange,
          options: mockOptions,
          initialState: {
            filters: { custom: "value" },
            pagination: { page: 1, pageSize: 25 },
          },
        }),
        expect.anything()
      );
    });
  });

  describe("Configuration Processing", () => {
    it("should handle empty config gracefully", () => {
      const minimalConfig: MuiDataViewAppletConfig<TestUser> = {
        api: { endpoint: "/api/users", client: vi.fn() },
        schema: {
          fields: [],
          primaryKey: "id",
          displayName: (item: TestUser) => item.name,
        },
        columns: [],
      };

      const propsWithMinimalConfig = {
        ...defaultProps,
        config: minimalConfig,
      };

      render(
        <TestWrapper>
          <MuiDataViewApplet {...propsWithMinimalConfig} />
        </TestWrapper>
      );

      // Check that the manager was called with the minimal config
      const callArgs = mockMuiDataViewManager.mock.calls[0][0];
      expect(callArgs.config.api.endpoint).toBe("/api/users");
      expect(callArgs.config.columns).toEqual([]);
      // Actions should be empty or not have create action
      expect(callArgs.config.actions?.global || []).toEqual([]);
    });

    it("should preserve existing actions while adding create action", () => {
      const configWithActions = createMockConfig({
        actions: {
          global: [
            {
              type: "global",
              key: "export",
              label: "Export",
              onClick: vi.fn(),
            },
          ],
          row: [
            {
              type: "row",
              key: "edit",
              label: "Edit",
              onClick: vi.fn(),
            },
          ],
          bulk: [],
        },
      });

      const props = {
        ...defaultProps,
        config: configWithActions,
      };

      render(
        <TestWrapper>
          <MuiDataViewApplet {...props} />
        </TestWrapper>
      );

      const call = mockMuiDataViewManager.mock.calls[0][0];
      
      expect(call.config.actions.global).toHaveLength(2); // export + create
      expect(call.config.actions.global[0].key).toBe("export");
      expect(call.config.actions.global[1].key).toBe("create");
      expect(call.config.actions.row).toHaveLength(1);
    });
  });

  describe("Console Logging", () => {
    it("should log render information", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      render(
        <TestWrapper>
          <MuiDataViewApplet {...defaultProps} />
        </TestWrapper>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "🎯 MuiDataViewApplet render",
        expect.objectContaining({
          enableUrlSync: true,
          permissionContext: "test-context",
          configFiltersInitial: { status: "active" },
          configPaginationDefault: 20,
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Default Props", () => {
    it("should use default permissionContext", () => {
      const propsWithoutContext = {
        config: createMockConfig(),
      };

      render(
        <TestWrapper>
          <MuiDataViewApplet {...propsWithoutContext} />
        </TestWrapper>
      );

      expect(mockUsePermissions().hasPermission).toHaveBeenCalledWith(
        "default",
        expect.any(Object)
      );
    });

    it("should use default enableUrlSync", () => {
      const propsWithoutUrlSync = {
        config: createMockConfig(),
      };

      render(
        <TestWrapper>
          <MuiDataViewApplet {...propsWithoutUrlSync} />
        </TestWrapper>
      );

      // Should still set up hash navigation (default is true)
      expect(mockUseHashNavigation).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultParams: expect.any(Object),
        })
      );
    });
  });
});