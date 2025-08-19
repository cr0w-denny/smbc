import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import {
  createBulkDeleteAction,
  createBulkUpdateAction,
  createRowUpdateAction,
  createRowDeleteAction,
  createToggleStatusAction,
  createOptimisticBulkUpdateAction,
  createOptimisticBulkDeleteAction,
} from "../helpers/actionHelpers";

// Test data interface
interface TestUser {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  role: "admin" | "user";
}

const mockUsers: TestUser[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    role: "admin",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    status: "inactive",
    role: "user",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    status: "active",
    role: "user",
  },
];

describe("Action Helpers", () => {
  let mockDeleteAPI: MockedFunction<(id: string | number) => Promise<any>>;
  let mockUpdateAPI: MockedFunction<
    (id: string | number, data: any) => Promise<any>
  >;
  let mockContext: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockDeleteAPI = vi.fn().mockResolvedValue({});
    mockUpdateAPI = vi.fn().mockResolvedValue({});

    mockContext = {
      addTransactionOperation: vi.fn().mockReturnValue("op-123"),
      getPendingData: vi.fn(),
      deleteMutation: {
        mutateAsync: vi.fn().mockResolvedValue({}),
      },
      updateMutation: {
        mutateAsync: vi.fn().mockResolvedValue({}),
      },
      createMutation: {
        mutateAsync: vi.fn().mockResolvedValue({}),
      },
      queryClient: {
        getQueryData: vi.fn(),
        setQueryData: vi.fn(),
        getQueryCache: vi.fn(() => ({
          getAll: vi.fn(() => []),
        })),
      },
      dataViewQueryKey: ["dataview", "users"],
      optimisticMode: false,
    };
  });

  describe("createBulkDeleteAction", () => {
    it("should create a bulk delete action with default options", () => {
      const action = createBulkDeleteAction(mockDeleteAPI);

      expect(action.type).toBe("bulk");
      expect(action.key).toBe("delete-selected");
      expect(action.label).toBe("Delete Selected");
      expect(action.color).toBe("error");
    });

    it("should create a bulk delete action with custom options", () => {
      const MockIcon = () => null;
      const action = createBulkDeleteAction(mockDeleteAPI, {
        key: "custom-delete",
        label: "Remove Items",
        icon: MockIcon,
      });

      expect(action.key).toBe("custom-delete");
      expect(action.label).toBe("Remove Items");
      expect(action.icon).toBe(MockIcon);
    });

    it("should handle bulk delete with transaction support", async () => {
      const action = createBulkDeleteAction(mockDeleteAPI);

      await action.onClick?.(mockUsers, mockContext);

      expect(mockContext.addTransactionOperation).toHaveBeenCalledTimes(3);
      expect(mockContext.addTransactionOperation).toHaveBeenCalledWith(
        "delete",
        mockUsers[0],
        expect.any(Function),
        "bulk-action",
      );
    });

    it("should handle bulk delete without transaction support", async () => {
      const action = createBulkDeleteAction(mockDeleteAPI);

      await action.onClick?.(mockUsers, undefined);

      expect(mockDeleteAPI).toHaveBeenCalledTimes(3);
      expect(mockDeleteAPI).toHaveBeenCalledWith(1);
      expect(mockDeleteAPI).toHaveBeenCalledWith(2);
      expect(mockDeleteAPI).toHaveBeenCalledWith(3);
    });

    it("should use deleteMutation when available in transaction mode", async () => {
      const action = createBulkDeleteAction(mockDeleteAPI);

      await action.onClick?.(mockUsers, mockContext);

      // Execute the mutation function for the first user
      const calls = mockContext.addTransactionOperation.mock.calls;
      const mutationFn = calls[0][2];
      await mutationFn();

      expect(mockContext.deleteMutation.mutateAsync).toHaveBeenCalledWith({
        params: { path: { id: 1 } },
      });
    });

    it("should fallback to direct API when deleteMutation not available", async () => {
      const contextWithoutMutation = {
        ...mockContext,
        deleteMutation: undefined,
      };

      const action = createBulkDeleteAction(mockDeleteAPI);
      await action.onClick?.(mockUsers, contextWithoutMutation);

      // Execute the mutation function for the first user
      const calls = contextWithoutMutation.addTransactionOperation.mock.calls;
      const mutationFn = calls[0][2];
      await mutationFn();

      expect(mockDeleteAPI).toHaveBeenCalledWith(1);
    });
  });

  describe("createBulkUpdateAction", () => {
    it("should create a bulk update action with default options", () => {
      const updateData: Partial<TestUser> = { status: "inactive" as const };
      const action = createBulkUpdateAction(mockUpdateAPI, updateData);

      expect(action.type).toBe("bulk");
      expect(action.key).toBe("update-status");
      expect(action.label).toBe("Update Selected");
      expect(action.color).toBe("primary");
    });

    it("should create a bulk update action with custom options", () => {
      const updateData: Partial<TestUser> = { role: "admin" as const };
      const MockIcon = () => null;
      const action = createBulkUpdateAction(mockUpdateAPI, updateData, {
        key: "promote-users",
        label: "Promote to Admin",
        icon: MockIcon,
        color: "success",
      });

      expect(action.key).toBe("promote-users");
      expect(action.label).toBe("Promote to Admin");
      expect(action.icon).toBe(MockIcon);
      expect(action.color).toBe("success");
    });

    it("should handle bulk update with transaction support", async () => {
      const updateData: Partial<TestUser> = { status: "inactive" as const };
      const action = createBulkUpdateAction(mockUpdateAPI, updateData);

      await action.onClick?.(mockUsers, mockContext);

      expect(mockContext.addTransactionOperation).toHaveBeenCalledTimes(3);

      const firstCall = mockContext.addTransactionOperation.mock.calls[0];
      expect(firstCall[0]).toBe("update");
      expect(firstCall[1]).toEqual({ ...mockUsers[0], status: "inactive" });
      expect(firstCall[3]).toBe("bulk-action");
      expect(firstCall[4]).toEqual(["status"]);
    });

    it("should merge update data with existing item data", async () => {
      const updateData: Partial<TestUser> = { status: "inactive" as const };
      const action = createBulkUpdateAction(mockUpdateAPI, updateData);

      await action.onClick?.(mockUsers, mockContext);

      const calls = mockContext.addTransactionOperation.mock.calls;
      expect(calls[0][1]).toEqual({
        ...mockUsers[0],
        status: "inactive",
      });
    });

    it("should handle pending data accumulation", async () => {
      const updateData: Partial<TestUser> = { status: "inactive" as const };
      const action = createBulkUpdateAction(mockUpdateAPI, updateData);

      mockContext.getPendingData.mockReturnValue({
        status: "inactive",
        role: "admin",
      });

      await action.onClick?.(mockUsers, mockContext);

      // Execute the mutation function for the first user
      const calls = mockContext.addTransactionOperation.mock.calls;
      const mutationFn = calls[0][2];
      await mutationFn();

      expect(mockContext.getPendingData).toHaveBeenCalledWith(1);
      expect(mockUpdateAPI).toHaveBeenCalledWith(1, {
        status: "inactive",
        role: "admin",
      });
    });
  });

  describe("createRowUpdateAction", () => {
    it("should create a row update action", () => {
      const getUpdateData = (_: TestUser) => ({ status: "inactive" as const });
      const action = createRowUpdateAction(mockUpdateAPI, getUpdateData, {
        key: "deactivate",
        label: "Deactivate User",
        color: "warning",
      });

      expect(action.type).toBe("row");
      expect(action.key).toBe("deactivate");
      expect(action.label).toBe("Deactivate User");
      expect(action.color).toBe("warning");
    });

    it("should handle row update with transaction support", async () => {
      const getUpdateData = (_: TestUser) => ({ status: "inactive" as const });
      const action = createRowUpdateAction(mockUpdateAPI, getUpdateData, {
        key: "deactivate",
        label: "Deactivate User",
      });

      // Cast to the actual implementation type which accepts context
      await (action.onClick as any)?.(mockUsers[0], mockContext);

      expect(mockContext.addTransactionOperation).toHaveBeenCalledWith(
        "update",
        { ...mockUsers[0], status: "inactive" },
        expect.any(Function),
        "row-action",
        ["status"],
      );
    });

    it("should respect disabled condition", () => {
      const getUpdateData = (_: TestUser) => ({ status: "inactive" as const });
      const action = createRowUpdateAction(mockUpdateAPI, getUpdateData, {
        key: "deactivate",
        label: "Deactivate User",
        disabled: (user) => user.status === "inactive",
      });

      expect(action.disabled?.(mockUsers[1])).toBe(true); // Jane is already inactive
      expect(action.disabled?.(mockUsers[0])).toBe(false); // John is active
    });

    it("should respect hidden condition", () => {
      const getUpdateData = (_: TestUser) => ({ status: "inactive" as const });
      const action = createRowUpdateAction(mockUpdateAPI, getUpdateData, {
        key: "deactivate",
        label: "Deactivate User",
        hidden: (user) => user.role === "admin",
      });

      expect(action.hidden?.(mockUsers[0])).toBe(true); // John is admin
      expect(action.hidden?.(mockUsers[1])).toBe(false); // Jane is user
    });
  });

  describe("createRowDeleteAction", () => {
    it("should create a row delete action with default options", () => {
      const action = createRowDeleteAction(mockDeleteAPI);

      expect(action.type).toBe("row");
      expect(action.key).toBe("delete");
      expect(action.label).toBe("Delete");
      expect(action.color).toBe("error");
    });

    it("should create a row delete action with custom options", () => {
      const MockIcon = () => null;
      const action = createRowDeleteAction(mockDeleteAPI, {
        key: "remove",
        label: "Remove User",
        icon: MockIcon,
        disabled: (user: TestUser) => user.role === "admin",
      });

      expect(action.key).toBe("remove");
      expect(action.label).toBe("Remove User");
      expect(action.icon).toBe(MockIcon);
      expect(action.disabled?.(mockUsers[0])).toBe(true); // John is admin
    });

    it("should handle row delete with transaction support", async () => {
      const action = createRowDeleteAction(mockDeleteAPI);

      // Cast to the actual implementation type which accepts context
      await (action.onClick as any)?.(mockUsers[0], mockContext);

      expect(mockContext.addTransactionOperation).toHaveBeenCalledWith(
        "delete",
        mockUsers[0],
        expect.any(Function),
        "row-action",
      );
    });
  });

  describe("createToggleStatusAction", () => {
    it("should create a toggle status action", () => {
      const action = createToggleStatusAction<TestUser>(
        mockUpdateAPI,
        "status",
        ["active", "inactive"],
        {
          key: "toggle-status",
          label: "Toggle Status",
        },
      );

      expect(action.type).toBe("row");
      expect(action.key).toBe("toggle-status");
      expect(action.label).toBe("Toggle Status");
      expect(action.color).toBe("primary");
    });

    it("should toggle status from active to inactive", async () => {
      const action = createToggleStatusAction<TestUser>(
        mockUpdateAPI,
        "status",
        ["active", "inactive"],
        {
          key: "toggle-status",
          label: "Toggle Status",
        },
      );

      // Cast to the actual implementation type which accepts context
      await (action.onClick as any)?.(mockUsers[0], mockContext); // John is active

      expect(mockContext.addTransactionOperation).toHaveBeenCalledWith(
        "update",
        { ...mockUsers[0], status: "inactive" },
        expect.any(Function),
        "row-action",
        ["status"],
      );
    });

    it("should toggle status from inactive to active", async () => {
      const action = createToggleStatusAction<TestUser>(
        mockUpdateAPI,
        "status",
        ["active", "inactive"],
        {
          key: "toggle-status",
          label: "Toggle Status",
        },
      );

      // Cast to the actual implementation type which accepts context
      await (action.onClick as any)?.(mockUsers[1], mockContext); // Jane is inactive

      expect(mockContext.addTransactionOperation).toHaveBeenCalledWith(
        "update",
        { ...mockUsers[1], status: "active" },
        expect.any(Function),
        "row-action",
        ["status"],
      );
    });
  });

  describe("createOptimisticBulkUpdateAction", () => {
    it("should create an optimistic bulk update action", () => {
      const optimisticUpdate = (_: TestUser) => ({
        status: "inactive" as const,
      });
      const mockApiCall = vi.fn().mockResolvedValue({});
      const action = createOptimisticBulkUpdateAction(
        mockApiCall,
        optimisticUpdate,
        {
          key: "deactivate-all",
          label: "Deactivate All",
          color: "warning",
        },
      );

      expect(action.type).toBe("bulk");
      expect(action.key).toBe("deactivate-all");
      expect(action.label).toBe("Deactivate All");
      expect(action.color).toBe("warning");
    });

    it("should handle optimistic updates when enabled", async () => {
      const optimisticUpdate = (_: TestUser) => ({
        status: "inactive" as const,
      });
      const mockApiCall = vi.fn().mockResolvedValue({});
      const action = createOptimisticBulkUpdateAction(
        mockApiCall,
        optimisticUpdate,
        {
          key: "deactivate-all",
          label: "Deactivate All",
        },
      );

      const optimisticContext = {
        ...mockContext,
        optimisticMode: true,
      };

      const mockData = { products: mockUsers, total: 3 };
      optimisticContext.queryClient.getQueryData.mockReturnValue(mockData);
      optimisticContext.queryClient.setQueryData.mockImplementation(
        (_key: any, updater: any) => {
          if (typeof updater === "function") {
            return updater(mockData);
          }
          return updater;
        },
      );

      await action.onClick?.(mockUsers, optimisticContext);

      expect(optimisticContext.queryClient.setQueryData).toHaveBeenCalled();
      expect(mockApiCall).toHaveBeenCalledTimes(3);
    });

    it("should fallback to transaction mode when optimistic mode disabled", async () => {
      const optimisticUpdate = (_: TestUser) => ({
        status: "inactive" as const,
      });
      const mockApiCall = vi.fn().mockResolvedValue({});
      const action = createOptimisticBulkUpdateAction(
        mockApiCall,
        optimisticUpdate,
        {
          key: "deactivate-all",
          label: "Deactivate All",
        },
      );

      await action.onClick?.(mockUsers, mockContext);

      expect(mockContext.addTransactionOperation).toHaveBeenCalledTimes(3);
    });

    it("should handle API failures and rollback", async () => {
      const optimisticUpdate = (_: TestUser) => ({
        status: "inactive" as const,
      });
      const mockApiCall = vi
        .fn()
        .mockResolvedValueOnce({}) // First user succeeds
        .mockRejectedValueOnce(new Error("API Error")) // Second user fails
        .mockResolvedValueOnce({}); // Third user succeeds

      const action = createOptimisticBulkUpdateAction(
        mockApiCall,
        optimisticUpdate,
        {
          key: "deactivate-all",
          label: "Deactivate All",
        },
      );

      const optimisticContext = {
        ...mockContext,
        optimisticMode: true,
      };

      const mockData = { products: mockUsers, total: 3 };
      optimisticContext.queryClient.getQueryData.mockReturnValue(mockData);
      optimisticContext.queryClient.setQueryData.mockImplementation(
        (_key: any, updater: any) => {
          if (typeof updater === "function") {
            return updater(mockData);
          }
          return updater;
        },
      );

      await action.onClick?.(mockUsers, optimisticContext);

      // Should have been called twice: once for optimistic update, once for rollback
      expect(optimisticContext.queryClient.setQueryData).toHaveBeenCalledTimes(
        2,
      );
    });
  });

  describe("createOptimisticBulkDeleteAction", () => {
    it("should create an optimistic bulk delete action", () => {
      const action = createOptimisticBulkDeleteAction(mockDeleteAPI);

      expect(action.type).toBe("bulk");
      expect(action.key).toBe("delete-selected");
      expect(action.label).toBe("Delete Selected");
      expect(action.color).toBe("error");
    });

    it("should handle optimistic deletes when enabled", async () => {
      const action = createOptimisticBulkDeleteAction(mockDeleteAPI);

      const optimisticContext = {
        ...mockContext,
        optimisticMode: true,
      };

      const mockData = { products: mockUsers, total: 3 };
      optimisticContext.queryClient.getQueryData.mockReturnValue(mockData);
      optimisticContext.queryClient.setQueryData.mockImplementation(
        (_key: any, updater: any) => {
          if (typeof updater === "function") {
            return updater(mockData);
          }
          return updater;
        },
      );

      await action.onClick?.(mockUsers.slice(0, 1), optimisticContext);

      expect(optimisticContext.queryClient.setQueryData).toHaveBeenCalled();
      expect(mockDeleteAPI).toHaveBeenCalledWith(1);
    });

    it("should handle array data structure", async () => {
      const action = createOptimisticBulkDeleteAction(mockDeleteAPI);

      const optimisticContext = {
        ...mockContext,
        optimisticMode: true,
      };

      optimisticContext.queryClient.getQueryData.mockReturnValue(mockUsers);
      optimisticContext.queryClient.setQueryData.mockImplementation(
        (_key: any, updater: any) => {
          if (typeof updater === "function") {
            return updater(mockUsers);
          }
          return updater;
        },
      );

      await action.onClick?.(mockUsers.slice(0, 1), optimisticContext);

      expect(optimisticContext.queryClient.setQueryData).toHaveBeenCalled();
    });

    it("should restore failed deletions", async () => {
      const action = createOptimisticBulkDeleteAction(mockDeleteAPI);

      const optimisticContext = {
        ...mockContext,
        optimisticMode: true,
      };

      // Mock API to fail for first user
      mockDeleteAPI.mockRejectedValueOnce(new Error("Delete failed"));

      const mockData = { products: mockUsers, total: 3 };
      optimisticContext.queryClient.getQueryData.mockReturnValue(mockData);
      optimisticContext.queryClient.setQueryData.mockImplementation(
        (_key: any, updater: any) => {
          if (typeof updater === "function") {
            return updater(mockData);
          }
          return updater;
        },
      );

      await action.onClick?.(mockUsers.slice(0, 1), optimisticContext);

      // Should have been called twice: once for optimistic delete, once for restoration
      expect(optimisticContext.queryClient.setQueryData).toHaveBeenCalledTimes(
        2,
      );
    });

    it("should fallback to regular bulk delete when optimistic mode disabled", async () => {
      const action = createOptimisticBulkDeleteAction(mockDeleteAPI);

      await action.onClick?.(mockUsers, mockContext);

      expect(mockContext.addTransactionOperation).toHaveBeenCalledTimes(3);
    });
  });
});
