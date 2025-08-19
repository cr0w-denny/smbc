import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TransactionProvider, useTransactionContext } from "../transaction/TransactionContext";
import { TransactionRegistry } from "../transaction/TransactionRegistry";
import type { TransactionManager } from "../transaction/types";

// Mock the TransactionRegistry
vi.mock("../transaction/TransactionRegistry", () => {
  const mockRegistry = {
    getCombinedSummary: vi.fn(),
    addListener: vi.fn(),
    register: vi.fn(),
    unregister: vi.fn(),
    getAllManagers: vi.fn(),
    commitAll: vi.fn(),
    cancelAll: vi.fn(),
  };
  
  return {
    TransactionRegistry: mockRegistry,
  };
});

const mockTransactionRegistry = vi.mocked(TransactionRegistry);

// Test component that uses the context
function TestConsumer() {
  const context = useTransactionContext();
  
  return (
    <div>
      <div data-testid="total">{context.combinedSummary.total}</div>
      <div data-testid="create-count">{context.combinedSummary.byType.create}</div>
      <div data-testid="update-count">{context.combinedSummary.byType.update}</div>
      <div data-testid="delete-count">{context.combinedSummary.byType.delete}</div>
      <div data-testid="user-edit-count">{context.combinedSummary.byTrigger["user-edit"]}</div>
      <div data-testid="bulk-action-count">{context.combinedSummary.byTrigger["bulk-action"]}</div>
      <div data-testid="row-action-count">{context.combinedSummary.byTrigger["row-action"]}</div>
      <div data-testid="entities">{context.combinedSummary.entities.join(", ")}</div>
      <button 
        data-testid="register-button"
        onClick={() => context.registerManager("test-id", {} as TransactionManager<any>)}
      >
        Register Manager
      </button>
      <button 
        data-testid="unregister-button"
        onClick={() => context.unregisterManager("test-id")}
      >
        Unregister Manager
      </button>
      <button 
        data-testid="get-managers-button"
        onClick={() => {
          const managers = context.getAllManagers();
          console.log(`Found ${managers.length} managers`);
        }}
      >
        Get Managers
      </button>
    </div>
  );
}

// Test component that tries to use context outside provider
function TestConsumerOutsideProvider() {
  useTransactionContext();
  return <div>Should not render</div>;
}

describe("TransactionContext", () => {
  let mockListener: () => void;
  let mockUnsubscribe: () => void;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock default combined summary
    mockTransactionRegistry.getCombinedSummary.mockReturnValue({
      total: 0,
      byType: { create: 0, update: 0, delete: 0 },
      byTrigger: { "user-edit": 0, "bulk-action": 0, "row-action": 0 },
      entities: [],
    });

    // Mock listener setup
    mockUnsubscribe = vi.fn();
    mockTransactionRegistry.addListener.mockImplementation((listener) => {
      mockListener = listener;
      return mockUnsubscribe;
    });

    // Mock other registry methods
    mockTransactionRegistry.getAllManagers.mockReturnValue([]);
    mockTransactionRegistry.register.mockImplementation(() => {});
    mockTransactionRegistry.unregister.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Provider Setup", () => {
    it("should render children correctly", () => {
      render(
        <TransactionProvider>
          <div data-testid="child">Test Child</div>
        </TransactionProvider>
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
      expect(screen.getByText("Test Child")).toBeInTheDocument();
    });

    it("should initialize with summary from registry", () => {
      const initialSummary = {
        total: 5,
        byType: { create: 2, update: 2, delete: 1 },
        byTrigger: { "user-edit": 3, "bulk-action": 1, "row-action": 1 },
        entities: ["user-1", "user-2", "product-1"],
      };
      
      mockTransactionRegistry.getCombinedSummary.mockReturnValue(initialSummary);

      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      expect(screen.getByTestId("total")).toHaveTextContent("5");
      expect(screen.getByTestId("create-count")).toHaveTextContent("2");
      expect(screen.getByTestId("update-count")).toHaveTextContent("2");
      expect(screen.getByTestId("delete-count")).toHaveTextContent("1");
      expect(screen.getByTestId("user-edit-count")).toHaveTextContent("3");
      expect(screen.getByTestId("bulk-action-count")).toHaveTextContent("1");
      expect(screen.getByTestId("row-action-count")).toHaveTextContent("1");
      expect(screen.getByTestId("entities")).toHaveTextContent("user-1, user-2, product-1");
    });

    it("should set up listener for registry changes", () => {
      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      expect(mockTransactionRegistry.addListener).toHaveBeenCalled();
      expect(typeof mockListener).toBe("function");
    });

    it("should clean up listener on unmount", () => {
      const { unmount } = render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe("Registry Integration", () => {
    it("should update summary when registry changes", async () => {
      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      // Initial state
      expect(screen.getByTestId("total")).toHaveTextContent("0");

      // Simulate registry change
      const newSummary = {
        total: 3,
        byType: { create: 1, update: 1, delete: 1 },
        byTrigger: { "user-edit": 2, "bulk-action": 1, "row-action": 0 },
        entities: ["user-1", "product-1", "order-1"],
      };
      
      mockTransactionRegistry.getCombinedSummary.mockReturnValue(newSummary);
      
      act(() => {
        mockListener();
      });

      await waitFor(() => {
        expect(screen.getByTestId("total")).toHaveTextContent("3");
        expect(screen.getByTestId("create-count")).toHaveTextContent("1");
        expect(screen.getByTestId("update-count")).toHaveTextContent("1");
        expect(screen.getByTestId("delete-count")).toHaveTextContent("1");
        expect(screen.getByTestId("entities")).toHaveTextContent("user-1, product-1, order-1");
      });
    });

    it("should delegate register calls to registry", () => {
      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      const button = screen.getByTestId("register-button");
      act(() => {
        button.click();
      });

      expect(mockTransactionRegistry.register).toHaveBeenCalledWith("test-id", {});
    });

    it("should delegate unregister calls to registry", () => {
      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      const button = screen.getByTestId("unregister-button");
      act(() => {
        button.click();
      });

      expect(mockTransactionRegistry.unregister).toHaveBeenCalledWith("test-id");
    });

    it("should delegate getAllManagers calls to registry", () => {
      const mockManagers = [
        { id: "manager-1" } as TransactionManager<any>,
        { id: "manager-2" } as TransactionManager<any>,
      ];
      
      mockTransactionRegistry.getAllManagers.mockReturnValue(mockManagers);
      
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      const button = screen.getByTestId("get-managers-button");
      act(() => {
        button.click();
      });

      expect(mockTransactionRegistry.getAllManagers).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Found 2 managers");
      
      consoleSpy.mockRestore();
    });
  });

  describe("Browser Event Handling", () => {
    let mockHasOperations: boolean;

    beforeEach(() => {
      mockHasOperations = false;
      
      // Mock managers with operations
      mockTransactionRegistry.getAllManagers.mockImplementation(() => {
        if (mockHasOperations) {
          return [
            {
              getOperations: () => [{ id: "op-1", type: "create" }],
            } as TransactionManager<any>,
          ];
        }
        return [];
      });
    });

    it("should set up beforeunload event listener", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");
      
      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      
      addEventListenerSpy.mockRestore();
    });

    it("should set up hashchange event listener", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");
      
      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "hashchange",
        expect.any(Function)
      );
      
      addEventListenerSpy.mockRestore();
    });

    it("should clean up event listeners on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
      
      const { unmount } = render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "hashchange",
        expect.any(Function)
      );
      
      removeEventListenerSpy.mockRestore();
    });

    it("should handle beforeunload with active transactions", () => {
      mockHasOperations = true;
      
      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      // Simulate beforeunload event
      const beforeUnloadEvent = new Event("beforeunload");
      window.dispatchEvent(beforeUnloadEvent);

      expect(mockTransactionRegistry.cancelAll).toHaveBeenCalled();
    });

    it("should handle beforeunload without active transactions", () => {
      mockHasOperations = false;
      
      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      // Simulate beforeunload event
      const beforeUnloadEvent = new Event("beforeunload");
      window.dispatchEvent(beforeUnloadEvent);

      expect(mockTransactionRegistry.cancelAll).not.toHaveBeenCalled();
    });

    it("should handle hashchange with active transactions", () => {
      mockHasOperations = true;
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      
      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      // Simulate hashchange event
      window.dispatchEvent(new HashChangeEvent("hashchange"));

      expect(mockTransactionRegistry.cancelAll).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Cancelled all transactions due to navigation"
      );
      
      consoleSpy.mockRestore();
    });

    it("should handle hashchange without active transactions", () => {
      mockHasOperations = false;
      
      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      // Simulate hashchange event
      window.dispatchEvent(new HashChangeEvent("hashchange"));

      expect(mockTransactionRegistry.cancelAll).not.toHaveBeenCalled();
    });
  });

  describe("Context Value", () => {
    it("should provide correct context value structure", () => {
      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      // Verify all required properties are accessible
      expect(screen.getByTestId("total")).toBeInTheDocument();
      expect(screen.getByTestId("create-count")).toBeInTheDocument();
      expect(screen.getByTestId("register-button")).toBeInTheDocument();
      expect(screen.getByTestId("unregister-button")).toBeInTheDocument();
      expect(screen.getByTestId("get-managers-button")).toBeInTheDocument();
    });

    it("should have empty Map for managers property", () => {
      const TestMapConsumer = () => {
        const context = useTransactionContext();
        return (
          <div data-testid="managers-size">
            {context.managers.size}
          </div>
        );
      };

      render(
        <TransactionProvider>
          <TestMapConsumer />
        </TransactionProvider>
      );

      expect(screen.getByTestId("managers-size")).toHaveTextContent("0");
    });
  });

  describe("Error Handling", () => {
    it("should throw error when useTransactionContext used outside provider", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      expect(() => {
        render(<TestConsumerOutsideProvider />);
      }).toThrow("useTransactionContext must be used within a TransactionProvider");
      
      consoleSpy.mockRestore();
    });

    it("should handle registry errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      mockTransactionRegistry.getCombinedSummary.mockImplementation(() => {
        throw new Error("Registry error");
      });

      expect(() => {
        render(
          <TransactionProvider>
            <TestConsumer />
          </TransactionProvider>
        );
      }).toThrow("Registry error");
      
      consoleSpy.mockRestore();
    });

    it("should handle listener errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      // Simulate listener error
      mockTransactionRegistry.getCombinedSummary.mockImplementation(() => {
        throw new Error("Listener error");
      });

      expect(() => {
        act(() => {
          mockListener();
        });
      }).toThrow("Listener error");
      
      consoleSpy.mockRestore();
    });
  });

  describe("Multiple Provider Instances", () => {
    it("should handle multiple provider instances independently", () => {
      const TestMultipleProviders = () => (
        <div>
          <TransactionProvider>
            <div data-testid="provider-1">
              <TestConsumer />
            </div>
          </TransactionProvider>
          <TransactionProvider>
            <div data-testid="provider-2">
              <TestConsumer />
            </div>
          </TransactionProvider>
        </div>
      );

      render(<TestMultipleProviders />);

      // Both providers should render correctly
      expect(screen.getByTestId("provider-1")).toBeInTheDocument();
      expect(screen.getByTestId("provider-2")).toBeInTheDocument();
      
      // Each should have set up listeners
      expect(mockTransactionRegistry.addListener).toHaveBeenCalledTimes(2);
    });
  });

  describe("Real Event Simulation", () => {
    it("should properly handle real browser events", () => {
      mockTransactionRegistry.getAllManagers.mockReturnValue([
        {
          getOperations: () => [{ id: "op-1", type: "create" }],
        } as TransactionManager<any>,
      ]);

      const { unmount } = render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      // Create and dispatch real events
      const hashChangeEvent = new HashChangeEvent("hashchange", {
        oldURL: "http://example.com#old",
        newURL: "http://example.com#new",
      });

      const beforeUnloadEvent = new Event("beforeunload");

      // Test hashchange
      window.dispatchEvent(hashChangeEvent);
      expect(mockTransactionRegistry.cancelAll).toHaveBeenCalled();

      // Reset mock
      mockTransactionRegistry.cancelAll.mockClear();

      // Test beforeunload
      window.dispatchEvent(beforeUnloadEvent);
      expect(mockTransactionRegistry.cancelAll).toHaveBeenCalled();

      unmount();
    });
  });

  describe("State Updates", () => {
    it("should handle rapid state updates", async () => {
      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      // Simulate rapid state changes
      for (let i = 1; i <= 5; i++) {
        mockTransactionRegistry.getCombinedSummary.mockReturnValue({
          total: i,
          byType: { create: i, update: 0, delete: 0 },
          byTrigger: { "user-edit": i, "bulk-action": 0, "row-action": 0 },
          entities: [`entity-${i}`],
        });

        act(() => {
          mockListener();
        });

        await waitFor(() => {
          expect(screen.getByTestId("total")).toHaveTextContent(i.toString());
        });
      }
    });

    it("should debounce state updates correctly", async () => {
      render(
        <TransactionProvider>
          <TestConsumer />
        </TransactionProvider>
      );

      // Multiple rapid calls
      mockTransactionRegistry.getCombinedSummary.mockReturnValue({
        total: 10,
        byType: { create: 10, update: 0, delete: 0 },
        byTrigger: { "user-edit": 10, "bulk-action": 0, "row-action": 0 },
        entities: ["final-entity"],
      });

      act(() => {
        mockListener();
        mockListener();
        mockListener();
      });

      await waitFor(() => {
        expect(screen.getByTestId("total")).toHaveTextContent("10");
      });
    });
  });
});