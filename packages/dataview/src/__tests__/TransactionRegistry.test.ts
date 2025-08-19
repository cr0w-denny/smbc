import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TransactionRegistry } from "../transaction/TransactionRegistry";
import type { TransactionManager } from "../transaction/types";

describe("TransactionRegistry", () => {
  let mockManager1: TransactionManager<any>;
  let mockManager2: TransactionManager<any>;
  let mockManager3: TransactionManager<any>;

  beforeEach(() => {
    // Clear all managers before each test by accessing the private property
    // @ts-ignore - accessing private property for testing
    TransactionRegistry.managers.clear();
    // @ts-ignore - accessing private property for testing
    TransactionRegistry.listeners.clear();

    // Create mock managers
    mockManager1 = {
      getOperations: vi.fn().mockReturnValue([
        { id: "op-1", type: "create", trigger: "user-edit" },
        { id: "op-2", type: "update", trigger: "bulk-action" },
      ]),
      getSummary: vi.fn().mockReturnValue({
        total: 2,
        byType: { create: 1, update: 1, delete: 0 },
        byTrigger: { "user-edit": 1, "bulk-action": 1, "row-action": 0 },
        entities: ["user-1", "user-2"],
      }),
      canCommit: vi.fn().mockReturnValue(true),
      commit: vi.fn().mockResolvedValue(undefined),
      hasOperations: vi.fn().mockReturnValue(true),
      cancel: vi.fn(),
      getTransaction: vi.fn().mockReturnValue({ id: "tx-1" }),
    } as unknown as TransactionManager<any>;

    mockManager2 = {
      getOperations: vi.fn().mockReturnValue([
        { id: "op-3", type: "delete", trigger: "row-action" },
      ]),
      getSummary: vi.fn().mockReturnValue({
        total: 1,
        byType: { create: 0, update: 0, delete: 1 },
        byTrigger: { "user-edit": 0, "bulk-action": 0, "row-action": 1 },
        entities: ["product-1"],
      }),
      canCommit: vi.fn().mockReturnValue(false),
      commit: vi.fn().mockResolvedValue(undefined),
      hasOperations: vi.fn().mockReturnValue(true),
      cancel: vi.fn(),
      getTransaction: vi.fn().mockReturnValue({ id: "tx-2" }),
    } as unknown as TransactionManager<any>;

    mockManager3 = {
      getOperations: vi.fn().mockReturnValue([]),
      getSummary: vi.fn().mockReturnValue({
        total: 0,
        byType: { create: 0, update: 0, delete: 0 },
        byTrigger: { "user-edit": 0, "bulk-action": 0, "row-action": 0 },
        entities: [],
      }),
      canCommit: vi.fn().mockReturnValue(false),
      commit: vi.fn().mockResolvedValue(undefined),
      hasOperations: vi.fn().mockReturnValue(false),
      cancel: vi.fn(),
      getTransaction: vi.fn().mockReturnValue({ id: "tx-3" }),
    } as unknown as TransactionManager<any>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Manager Registration", () => {
    it("should register a new manager", () => {
      const initialCount = TransactionRegistry.getAllManagers().length;
      
      TransactionRegistry.register("test-manager-1", mockManager1);
      
      const managers = TransactionRegistry.getAllManagers();
      expect(managers).toHaveLength(initialCount + 1);
      expect(managers).toContain(mockManager1);
    });

    it("should not register the same manager twice", () => {
      const initialCount = TransactionRegistry.getAllManagers().length;
      
      TransactionRegistry.register("test-manager-1", mockManager1);
      TransactionRegistry.register("test-manager-1", mockManager1);
      
      const managers = TransactionRegistry.getAllManagers();
      expect(managers).toHaveLength(initialCount + 1);
    });

    it("should register multiple different managers", () => {
      const initialCount = TransactionRegistry.getAllManagers().length;
      
      TransactionRegistry.register("test-manager-1", mockManager1);
      TransactionRegistry.register("test-manager-2", mockManager2);
      TransactionRegistry.register("test-manager-3", mockManager3);
      
      const managers = TransactionRegistry.getAllManagers();
      expect(managers).toHaveLength(initialCount + 3);
      expect(managers).toContain(mockManager1);
      expect(managers).toContain(mockManager2);
      expect(managers).toContain(mockManager3);
    });

    it("should notify listeners when registering a manager", () => {
      const listener = vi.fn();
      const unsubscribe = TransactionRegistry.addListener(listener);
      
      TransactionRegistry.register("test-manager-1", mockManager1);
      
      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });
  });

  describe("Manager Unregistration", () => {
    it("should unregister an existing manager", () => {
      TransactionRegistry.register("test-manager-1", mockManager1);
      const countAfterRegister = TransactionRegistry.getAllManagers().length;
      
      TransactionRegistry.unregister("test-manager-1");
      
      const managers = TransactionRegistry.getAllManagers();
      expect(managers).toHaveLength(countAfterRegister - 1);
      expect(managers).not.toContain(mockManager1);
    });

    it("should handle unregistering non-existent manager gracefully", () => {
      const initialCount = TransactionRegistry.getAllManagers().length;
      
      TransactionRegistry.unregister("non-existent-manager");
      
      const managers = TransactionRegistry.getAllManagers();
      expect(managers).toHaveLength(initialCount);
    });

    it("should notify listeners when unregistering a manager", () => {
      TransactionRegistry.register("test-manager-1", mockManager1);
      
      const listener = vi.fn();
      const unsubscribe = TransactionRegistry.addListener(listener);
      
      TransactionRegistry.unregister("test-manager-1");
      
      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });
  });

  describe("Combined Summary", () => {
    it("should return empty summary when no managers", () => {
      const summary = TransactionRegistry.getCombinedSummary();
      
      expect(summary).toEqual({
        total: 0,
        byType: { create: 0, update: 0, delete: 0 },
        byTrigger: { "user-edit": 0, "bulk-action": 0, "row-action": 0 },
        entities: [],
      });
    });

    it("should combine summaries from multiple managers", () => {
      TransactionRegistry.register("test-manager-1", mockManager1);
      TransactionRegistry.register("test-manager-2", mockManager2);
      
      const summary = TransactionRegistry.getCombinedSummary();
      
      expect(summary.total).toBe(3); // 2 from manager1 + 1 from manager2
      expect(summary.byType.create).toBe(1);
      expect(summary.byType.update).toBe(1);
      expect(summary.byType.delete).toBe(1);
      expect(summary.byTrigger["user-edit"]).toBe(1);
      expect(summary.byTrigger["bulk-action"]).toBe(1);
      expect(summary.byTrigger["row-action"]).toBe(1);
      expect(summary.entities).toEqual(["user-1", "user-2", "product-1"]);
    });

    it("should handle managers with empty summaries", () => {
      TransactionRegistry.register("test-manager-1", mockManager1);
      TransactionRegistry.register("test-manager-3", mockManager3);
      
      const summary = TransactionRegistry.getCombinedSummary();
      
      expect(summary.total).toBe(2); // Only from manager1
      expect(summary.byType.create).toBe(1);
      expect(summary.byType.update).toBe(1);
      expect(summary.byType.delete).toBe(0);
      expect(summary.entities).toEqual(["user-1", "user-2"]);
    });

    it("should handle missing fields in manager summaries", () => {
      const managerWithPartialSummary = {
        ...mockManager1,
        getSummary: vi.fn().mockReturnValue({
          total: 1,
          byType: { create: 1 }, // Missing update and delete
          byTrigger: { "user-edit": 1 }, // Missing other triggers
          entities: ["user-1"],
        }),
      };
      
      TransactionRegistry.register("partial-manager", managerWithPartialSummary);
      
      const summary = TransactionRegistry.getCombinedSummary();
      
      expect(summary.byType.update).toBe(0);
      expect(summary.byType.delete).toBe(0);
      expect(summary.byTrigger["bulk-action"]).toBe(0);
      expect(summary.byTrigger["row-action"]).toBe(0);
    });
  });

  describe("Listener Management", () => {
    it("should add and call listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      const unsubscribe1 = TransactionRegistry.addListener(listener1);
      const unsubscribe2 = TransactionRegistry.addListener(listener2);
      
      TransactionRegistry.register("test-manager-1", mockManager1);
      
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      
      unsubscribe1();
      unsubscribe2();
    });

    it("should remove listeners when unsubscribing", () => {
      const listener = vi.fn();
      
      const unsubscribe = TransactionRegistry.addListener(listener);
      unsubscribe();
      
      TransactionRegistry.register("test-manager-1", mockManager1);
      
      expect(listener).not.toHaveBeenCalled();
    });

    it("should handle multiple unsubscribe calls gracefully", () => {
      const listener = vi.fn();
      
      const unsubscribe = TransactionRegistry.addListener(listener);
      unsubscribe();
      unsubscribe(); // Second call should not throw
      
      TransactionRegistry.register("test-manager-1", mockManager1);
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("Commit All", () => {
    it("should commit all managers that can commit", async () => {
      TransactionRegistry.register("test-manager-1", mockManager1);
      TransactionRegistry.register("test-manager-2", mockManager2);
      TransactionRegistry.register("test-manager-3", mockManager3);
      
      await TransactionRegistry.commitAll();
      
      expect(mockManager1.commit).toHaveBeenCalledWith(true);
      expect(mockManager2.commit).not.toHaveBeenCalled(); // canCommit returns false
      expect(mockManager3.commit).not.toHaveBeenCalled(); // canCommit returns false
    });

    it("should handle commit errors gracefully", async () => {
      const errorManager = {
        ...mockManager1,
        commit: vi.fn().mockRejectedValue(new Error("Commit failed")),
      };
      
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      TransactionRegistry.register("error-manager", errorManager);
      
      await TransactionRegistry.commitAll();
      
      expect(errorManager.commit).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        "❌ Failed to commit transaction:",
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it("should notify listeners after commit", async () => {
      const listener = vi.fn();
      const unsubscribe = TransactionRegistry.addListener(listener);
      
      TransactionRegistry.register("test-manager-1", mockManager1);
      listener.mockClear(); // Clear registration call
      
      await TransactionRegistry.commitAll();
      
      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it("should handle empty manager list", async () => {
      // Should not throw when no managers are registered
      await expect(TransactionRegistry.commitAll()).resolves.toBeUndefined();
    });
  });

  describe("Cancel All", () => {
    it("should cancel all managers that have operations", () => {
      TransactionRegistry.register("test-manager-1", mockManager1);
      TransactionRegistry.register("test-manager-2", mockManager2);
      TransactionRegistry.register("test-manager-3", mockManager3);
      
      TransactionRegistry.cancelAll();
      
      expect(mockManager1.cancel).toHaveBeenCalled(); // hasOperations returns true
      expect(mockManager2.cancel).toHaveBeenCalled(); // hasOperations returns true
      expect(mockManager3.cancel).not.toHaveBeenCalled(); // hasOperations returns false
    });

    it("should notify listeners after cancel", () => {
      const listener = vi.fn();
      const unsubscribe = TransactionRegistry.addListener(listener);
      
      TransactionRegistry.register("test-manager-1", mockManager1);
      listener.mockClear(); // Clear registration call
      
      TransactionRegistry.cancelAll();
      
      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it("should handle empty manager list", () => {
      // Should not throw when no managers are registered
      expect(() => TransactionRegistry.cancelAll()).not.toThrow();
    });

    it("should handle manager cancel errors by propagating them", () => {
      const errorManager = {
        ...mockManager1,
        cancel: vi.fn().mockImplementation(() => {
          throw new Error("Cancel failed");
        }),
      };
      
      TransactionRegistry.register("error-manager", errorManager);
      
      // Should throw when manager.cancel throws
      expect(() => TransactionRegistry.cancelAll()).toThrow("Cancel failed");
      expect(errorManager.cancel).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle managers with null/undefined getSummary", () => {
      const managerWithNullSummary = {
        ...mockManager1,
        getSummary: vi.fn().mockReturnValue(null),
      };
      
      TransactionRegistry.register("null-summary-manager", managerWithNullSummary);
      
      expect(() => TransactionRegistry.getCombinedSummary()).toThrow();
    });

    it("should handle managers without required methods", async () => {
      const incompleteManager = {
        getSummary: vi.fn().mockReturnValue({
          total: 1,
          byType: { create: 1, update: 0, delete: 0 },
          byTrigger: { "user-edit": 1, "bulk-action": 0, "row-action": 0 },
          entities: ["test"],
        }),
        // Missing other methods
      } as unknown as TransactionManager<any>;
      
      TransactionRegistry.register("incomplete-manager", incompleteManager);
      
      expect(() => TransactionRegistry.getCombinedSummary()).not.toThrow();
      await expect(TransactionRegistry.commitAll()).rejects.toThrow();
      expect(() => TransactionRegistry.cancelAll()).toThrow();
    });

    it("should maintain manager order", () => {
      TransactionRegistry.register("manager-a", mockManager1);
      TransactionRegistry.register("manager-b", mockManager2);
      TransactionRegistry.register("manager-c", mockManager3);
      
      const managers = TransactionRegistry.getAllManagers();
      
      // Should maintain insertion order
      expect(managers.indexOf(mockManager1)).toBeLessThan(managers.indexOf(mockManager2));
      expect(managers.indexOf(mockManager2)).toBeLessThan(managers.indexOf(mockManager3));
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle concurrent registrations", () => {
      const managers = [mockManager1, mockManager2, mockManager3];
      
      // Simulate concurrent registrations
      managers.forEach((manager, index) => {
        TransactionRegistry.register(`concurrent-manager-${index}`, manager);
      });
      
      const allManagers = TransactionRegistry.getAllManagers();
      managers.forEach(manager => {
        expect(allManagers).toContain(manager);
      });
    });

    it("should handle listener notifications during operations", () => {
      const listenerCalls: string[] = [];
      
      const listener = vi.fn().mockImplementation(() => {
        listenerCalls.push("listener-called");
      });
      
      const unsubscribe = TransactionRegistry.addListener(listener);
      
      TransactionRegistry.register("test-manager", mockManager1);
      TransactionRegistry.cancelAll();
      TransactionRegistry.unregister("test-manager");
      
      expect(listenerCalls).toHaveLength(3); // register, cancel, unregister
      unsubscribe();
    });
  });
});