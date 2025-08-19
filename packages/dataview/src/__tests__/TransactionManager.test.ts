import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import { SimpleTransactionManager } from "../transaction/TransactionManager";
import { TransactionRegistry } from "../transaction/TransactionRegistry";
import type { TransactionConfig, TransactionOperation } from "../transaction/types";

vi.mock("../transaction/TransactionRegistry");

describe("TransactionManager", () => {
  let transactionManager: SimpleTransactionManager;
  let mockConfig: TransactionConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockConfig = {
      enabled: true,
      requireConfirmation: false,
      allowPartialSuccess: false,
      emitActivities: false,
      maxPendingOperations: 10,
      timeoutMs: 5000,
    };

    transactionManager = new SimpleTransactionManager(mockConfig);
  });

  describe("Transaction Lifecycle", () => {
    it("should create a new transaction with unique ID", () => {
      const transactionId = transactionManager.begin();
      
      expect(typeof transactionId).toBe("string");
      expect(transactionId).toMatch(/^txn_/);
      expect(transactionManager.getTransaction()).toBeTruthy();
      expect(transactionManager.getTransaction()?.id).toBe(transactionId);
    });

    it("should initialize transaction with proper state", () => {
      const transactionId = transactionManager.begin();
      const transaction = transactionManager.getTransaction();

      expect(transaction).toBeTruthy();
      expect(transaction?.status).toBe("pending");
      expect(transaction?.operations).toEqual([]);
      expect(transaction?.results).toEqual([]);
      expect(transaction?.totalOperations).toBe(0);
      expect(transaction?.createdAt).toBeInstanceOf(Date);
    });

    it("should merge custom config with defaults", () => {
      const customConfig: Partial<TransactionConfig> = { 
        allowPartialSuccess: true,
        maxPendingOperations: 5 
      };
      
      const transactionId = transactionManager.begin(customConfig);
      const transaction = transactionManager.getTransaction();

      expect(transaction?.config.allowPartialSuccess).toBe(true);
      expect(transaction?.config.maxPendingOperations).toBe(5);
      expect(transaction?.config.timeoutMs).toBe(5000); // Should keep default
    });

    it("should allow creating multiple transactions", () => {
      const firstId = transactionManager.begin();
      const secondId = transactionManager.begin();
      
      expect(firstId).toBeTruthy();
      expect(secondId).toBeTruthy();
      expect(secondId).not.toBe(firstId);
    });
  });

  describe("Operation Management", () => {
    let transactionId: string;

    beforeEach(() => {
      transactionId = transactionManager.begin();
    });

    it("should add operations to current transaction", () => {
      const operation: Omit<TransactionOperation, "id" | "timestamp"> = {
        type: "create",
        trigger: "user-edit",
        entity: { name: "Test User" },
        entityId: "temp-1",
        label: "Create Test User",
        mutation: vi.fn().mockResolvedValue({}),
      };

      transactionManager.addOperation(operation);
      const transaction = transactionManager.getTransaction();

      expect(transaction?.operations).toHaveLength(1);
      expect(transaction?.operations[0]).toMatchObject({
        type: "create",
        trigger: "user-edit",
        entity: { name: "Test User" },
        entityId: "temp-1",
        label: "Create Test User",
      });
      expect(transaction?.totalOperations).toBe(1);
    });

    it("should add operations when no active transaction", () => {
      transactionManager.clear(); // Clear current transaction
      
      const operation: Omit<TransactionOperation, "id" | "timestamp"> = {
        type: "create",
        trigger: "user-edit",
        entity: { name: "Test User" },
        entityId: "temp-1",
        label: "Create Test User",
        mutation: vi.fn().mockResolvedValue({}),
      };

      // Should auto-start transaction
      transactionManager.addOperation(operation);
      expect(transactionManager.getTransaction()).toBeTruthy();
    });

    it("should track multiple operations", () => {
      const operations: Omit<TransactionOperation, "id" | "timestamp">[] = [
        { type: "create", trigger: "user-edit", entity: { name: "User 1" }, entityId: "temp-1", label: "Create User 1", mutation: vi.fn().mockResolvedValue({}) },
        { type: "update", trigger: "user-edit", entity: { id: 1, name: "Updated User" }, entityId: 1, label: "Update User", mutation: vi.fn().mockResolvedValue({}) },
        { type: "delete", trigger: "user-edit", entity: { id: 2 }, entityId: 2, label: "Delete User", mutation: vi.fn().mockResolvedValue({}) },
      ];

      operations.forEach(op => transactionManager.addOperation(op));
      const transaction = transactionManager.getTransaction();

      expect(transaction?.operations).toHaveLength(3);
      expect(transaction?.totalOperations).toBe(3);
    });

    it("should assign unique IDs to operations", () => {
      const operation: Omit<TransactionOperation, "id" | "timestamp"> = {
        type: "create",
        trigger: "user-edit",
        entity: { name: "Test User" },
        entityId: "temp-1",
        label: "Create Test User",
        mutation: vi.fn().mockResolvedValue({}),
      };

      transactionManager.addOperation(operation);
      const transaction = transactionManager.getTransaction();

      expect(transaction?.operations[0].id).toBeDefined();
      expect(typeof transaction?.operations[0].id).toBe("string");
    });

    it("should handle operation removal", () => {
      const operation: Omit<TransactionOperation, "id" | "timestamp"> = {
        type: "create",
        trigger: "user-edit",
        entity: { name: "Test User" },
        entityId: "temp-1",
        label: "Create Test User",
        mutation: vi.fn().mockResolvedValue({}),
      };
      
      const operationId = transactionManager.addOperation(operation);
      const removed = transactionManager.removeOperation(operationId);

      expect(removed).toBe(true);
      expect(transactionManager.getOperations()).toHaveLength(0);
    });
  });

  describe("Transaction Commit", () => {
    let transactionId: string;

    beforeEach(() => {
      transactionId = transactionManager.begin();
    });

    it("should commit empty transaction successfully", async () => {
      const results = await transactionManager.commit();

      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(0);
    });

    it("should execute operations during commit", async () => {
      const mockMutation = vi.fn().mockResolvedValue({ id: 1 });
      
      const operation: Omit<TransactionOperation, "id" | "timestamp"> = {
        type: "create",
        trigger: "user-edit",
        entity: { name: "Test User" },
        entityId: "temp-1",
        label: "Create Test User",
        mutation: mockMutation,
      };

      transactionManager.addOperation(operation);
      const results = await transactionManager.commit();

      expect(mockMutation).toHaveBeenCalled();
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
    });

    it("should handle operation failures gracefully", async () => {
      const mockMutation1 = vi.fn().mockResolvedValue({ id: 1 });
      const mockMutation2 = vi.fn().mockRejectedValue(new Error("Network error"));

      const operations: Omit<TransactionOperation, "id" | "timestamp">[] = [
        { type: "create", trigger: "user-edit", entity: { name: "User 1" }, entityId: "temp-1", label: "Create User 1", mutation: mockMutation1 },
        { type: "create", trigger: "user-edit", entity: { name: "User 2" }, entityId: "temp-2", label: "Create User 2", mutation: mockMutation2 },
      ];

      operations.forEach(op => transactionManager.addOperation(op));
      
      try {
        await transactionManager.commit();
        // Should not reach here in all-or-nothing mode
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("Transaction failed");
      }
    });

    it("should process operations in parallel", async () => {
      const mockMutations = Array.from({ length: 5 }, () => vi.fn().mockResolvedValue({}));
      
      transactionManager.begin();

      const operations: Omit<TransactionOperation, "id" | "timestamp">[] = Array.from({ length: 5 }, (_, i) => ({
        type: "create",
        trigger: "user-edit",
        entity: { name: `User ${i + 1}` },
        entityId: `temp-${i + 1}`,
        label: `Create User ${i + 1}`,
        mutation: mockMutations[i],
      }));

      operations.forEach(op => transactionManager.addOperation(op));
      const results = await transactionManager.commit();

      expect(results).toHaveLength(5);
      mockMutations.forEach(mockMutation => {
        expect(mockMutation).toHaveBeenCalledTimes(1);
      });
    });

    it("should call operation complete callback during execution", async () => {
      const mockMutations = Array.from({ length: 3 }, () => vi.fn().mockResolvedValue({}));
      const mockOnOperationComplete = vi.fn();
      
      transactionManager.on("onOperationComplete", mockOnOperationComplete);

      const operations: Omit<TransactionOperation, "id" | "timestamp">[] = Array.from({ length: 3 }, (_, i) => ({
        type: "create",
        trigger: "user-edit",
        entity: { name: `User ${i + 1}` },
        entityId: `temp-${i + 1}`,
        label: `Create User ${i + 1}`,
        mutation: mockMutations[i],
      }));

      operations.forEach(op => transactionManager.addOperation(op));
      await transactionManager.commit();

      expect(mockOnOperationComplete).toHaveBeenCalledTimes(3);
    });

    it("should clear current transaction after commit", async () => {
      await transactionManager.commit();
      expect(transactionManager.getTransaction()).toBeNull();
    });
  });

  describe("Transaction Cancellation", () => {
    let transactionId: string;

    beforeEach(() => {
      transactionId = transactionManager.begin();
    });

    it("should cancel pending transaction", () => {
      const operation: Omit<TransactionOperation, "id" | "timestamp"> = {
        type: "create",
        trigger: "user-edit",
        entity: { name: "Test User" },
        entityId: "temp-1",
        label: "Create Test User",
        mutation: vi.fn().mockResolvedValue({}),
      };

      transactionManager.addOperation(operation);
      transactionManager.cancel();

      expect(transactionManager.getTransaction()).toBeNull();
    });

    it("should emit events during transaction lifecycle", async () => {
      const mockMutation = vi.fn().mockResolvedValue({ id: 1 });
      const mockOnTransactionComplete = vi.fn();
      
      transactionManager.on("onTransactionComplete", mockOnTransactionComplete);

      const operation: Omit<TransactionOperation, "id" | "timestamp"> = {
        type: "create",
        trigger: "user-edit",
        entity: { name: "Test User" },
        entityId: "temp-1",
        label: "Create Test User",
        mutation: mockMutation,
      };

      transactionManager.addOperation(operation);
      await transactionManager.commit();
      
      expect(mockOnTransactionComplete).toHaveBeenCalled();
    });

    it("should emit cancellation events", () => {
      const mockCancelHandler = vi.fn();
      transactionManager.on("onTransactionCancelled", mockCancelHandler);

      transactionManager.cancel();

      expect(mockCancelHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          id: transactionId,
          status: "cancelled",
        })
      );
    });
  });

  describe("Operation Tracking", () => {
    beforeEach(() => {
      transactionManager.begin();
    });

    it("should track operations when added", () => {
      const operation: Omit<TransactionOperation, "id" | "timestamp"> = {
        type: "create",
        trigger: "user-edit",
        entity: { name: "Test User" },
        entityId: "temp-1",
        label: "Create Test User",
        mutation: vi.fn().mockResolvedValue({}),
      };

      const mockOperationAdded = vi.fn();
      transactionManager.on("onOperationAdded", mockOperationAdded);
      
      transactionManager.addOperation(operation);

      expect(mockOperationAdded).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "create",
          entity: { name: "Test User" },
          entityId: "temp-1",
        })
      );
    });
  });

  describe("Event System", () => {
    it("should register and emit events", () => {
      const mockHandler = vi.fn();
      transactionManager.on("onTransactionStart", mockHandler);

      transactionManager.begin();

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          status: "pending",
        })
      );
    });

    it("should support multiple handlers for same event", () => {
      const mockHandler1 = vi.fn();
      const mockHandler2 = vi.fn();
      
      transactionManager.on("onTransactionStart", mockHandler1);
      transactionManager.on("onTransactionStart", mockHandler2);

      transactionManager.begin();

      expect(mockHandler1).toHaveBeenCalled();
      expect(mockHandler2).toHaveBeenCalled();
    });

    it("should remove event handlers", () => {
      const mockHandler = vi.fn();
      transactionManager.on("onTransactionStart", mockHandler);
      transactionManager.off("onTransactionStart", mockHandler);

      transactionManager.begin();

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("Conflict Resolution", () => {
    beforeEach(() => {
      transactionManager.begin();
    });

    it("should handle conflicting operations", () => {
      const operation1: Omit<TransactionOperation, "id" | "timestamp"> = {
        type: "update",
        trigger: "user-edit",
        entity: { id: 1, name: "User A" },
        entityId: 1,
        label: "Update User A",
        mutation: vi.fn().mockResolvedValue({}),
      };

      const operation2: Omit<TransactionOperation, "id" | "timestamp"> = {
        type: "update",
        trigger: "user-edit",
        entity: { id: 1, name: "User B" },
        entityId: 1,
        label: "Update User B",
        mutation: vi.fn().mockResolvedValue({}),
      };

      transactionManager.addOperation(operation1);
      transactionManager.addOperation(operation2);

      // Last operation should win - should only have one operation
      expect(transactionManager.getOperations()).toHaveLength(1);
      expect(transactionManager.getOperations()[0].entity).toEqual({ id: 1, name: "User B" });
    });

    it("should handle create-then-delete operations", () => {
      const createOp: Omit<TransactionOperation, "id" | "timestamp"> = {
        type: "create",
        trigger: "user-edit",
        entity: { name: "User A" },
        entityId: "temp-1",
        label: "Create User A",
        mutation: vi.fn().mockResolvedValue({}),
      };

      const deleteOp: Omit<TransactionOperation, "id" | "timestamp"> = {
        type: "delete",
        trigger: "user-edit",
        entity: { name: "User A" },
        entityId: "temp-1",
        label: "Delete User A",
        mutation: vi.fn().mockResolvedValue({}),
      };

      transactionManager.addOperation(createOp);
      transactionManager.addOperation(deleteOp);

      // Should have one delete operation marked as wasCreated
      expect(transactionManager.getOperations()).toHaveLength(1);
      expect(transactionManager.getOperations()[0].type).toBe("delete");
      expect(transactionManager.getOperations()[0].wasCreated).toBe(true);
    });
  });

  describe("Transaction Summary and Reporting", () => {
    it("should provide transaction summary", () => {
      transactionManager.begin();
      
      const operations: Omit<TransactionOperation, "id" | "timestamp">[] = [
        { type: "create", trigger: "user-edit", entity: {}, entityId: "temp-1", label: "Create User", mutation: vi.fn().mockResolvedValue({}) },
        { type: "update", trigger: "user-edit", entity: {}, entityId: 1, label: "Update User", mutation: vi.fn().mockResolvedValue({}) },
      ];

      operations.forEach(op => transactionManager.addOperation(op));
      
      const summary = transactionManager.getSummary();
      expect(summary.total).toBe(2);
      expect(summary.byType.create).toBe(1);
      expect(summary.byType.update).toBe(1);
      expect(summary.byTrigger["user-edit"]).toBe(2);
    });

    it("should have utility methods", () => {
      transactionManager.begin();

      const operation: Omit<TransactionOperation, "id" | "timestamp"> = {
        type: "create",
        trigger: "user-edit",
        entity: {},
        entityId: "temp-1",
        label: "Create User",
        mutation: vi.fn().mockResolvedValue({}),
      };

      expect(transactionManager.hasOperations()).toBe(false);
      expect(transactionManager.canCommit()).toBe(false);
      
      transactionManager.addOperation(operation);
      
      expect(transactionManager.hasOperations()).toBe(true);
      expect(transactionManager.canCommit()).toBe(true);
      expect(transactionManager.estimateDuration()).toBeGreaterThan(0);
    });
  });
});