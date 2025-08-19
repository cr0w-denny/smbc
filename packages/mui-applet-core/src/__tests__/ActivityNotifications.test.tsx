import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock the dataview hooks and components
vi.mock("@smbc/dataview", () => {
  return {
    useActivity: vi.fn(),
    useTransactionContext: vi.fn(),
    TransactionRegistry: {
      getAllManagers: vi.fn(),
      commitAll: vi.fn(),
      cancelAll: vi.fn(),
    },
  };
});

// Mock MUI icons
vi.mock("@mui/icons-material", () => ({
  Notifications: () => <div data-testid="notifications-icon">Notifications</div>,
  Add: () => <div data-testid="add-icon">Add</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Delete: () => <div data-testid="delete-icon">Delete</div>,
  Visibility: () => <div data-testid="view-icon">View</div>,
  Clear: () => <div data-testid="clear-icon">Clear</div>,
  Check: () => <div data-testid="commit-icon">Commit</div>,
  Close: () => <div data-testid="cancel-icon">Cancel</div>,
}));

import { ActivityNotifications } from "../ActivityNotifications/ActivityNotifications";
import type { ActivityNotificationsProps } from "../ActivityNotifications/ActivityNotifications";
import { useActivity, useTransactionContext, TransactionRegistry } from "@smbc/dataview";

// Get references to the mocked functions
const mockUseActivity = vi.mocked(useActivity);
const mockUseTransactionContext = vi.mocked(useTransactionContext);
const mockTransactionRegistry = TransactionRegistry as any;

// Test wrapper with theme
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

describe("ActivityNotifications", () => {
  const mockActivities = [
    {
      id: "activity-1",
      type: "create" as const,
      entityType: "user",
      label: "John Doe",
      timestamp: new Date("2024-01-01T10:00:00Z"),
      url: "/users/1",
    },
    {
      id: "activity-2", 
      type: "update" as const,
      entityType: "product",
      label: "Product ABC",
      timestamp: new Date("2024-01-01T09:30:00Z"),
    },
    {
      id: "activity-3",
      type: "delete" as const,
      entityType: "order",
      label: "Order #123",
      timestamp: new Date("2024-01-01T09:00:00Z"),
      url: "/orders/123",
    },
  ];

  const createMockActivityContext = (overrides: any = {}) => ({
    activities: [],
    unviewedCount: 0,
    markAsViewed: vi.fn(),
    clearAll: vi.fn(),
    addActivity: vi.fn(),
    cleanup: vi.fn(),
    ...overrides,
  });

  const createMockTransactionContext = (overrides: any = {}) => ({
    managers: new Map(),
    combinedSummary: {
      total: 0,
      byType: { create: 0, update: 0, delete: 0 },
      byTrigger: { "user-edit": 0, "bulk-action": 0, "row-action": 0 },
      entities: [],
    },
    registerManager: vi.fn(),
    unregisterManager: vi.fn(),
    getAllManagers: vi.fn(() => []),
    ...overrides,
  });

  const defaultProps: ActivityNotificationsProps = {
    onNavigate: vi.fn(),
    enableTransactions: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseActivity.mockReturnValue(createMockActivityContext());
    mockUseTransactionContext.mockImplementation(() => {
      throw new Error("useTransactionContext must be used within a TransactionProvider");
    });
    mockTransactionRegistry.getAllManagers.mockReturnValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render notification button with no badge when no activities", () => {
      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole("button", { name: /activity notifications/i })).toBeInTheDocument();
      expect(screen.getByTestId("notifications-icon")).toBeInTheDocument();
    });

    it("should show badge count for unviewed activities", () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: mockActivities,
          unviewedCount: 2,
        })
      );

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should show combined badge count with pending transactions", () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: mockActivities,
          unviewedCount: 2,
        })
      );

      mockUseTransactionContext.mockReturnValue(
        createMockTransactionContext({
          combinedSummary: {
            total: 3,
            byType: { create: 1, update: 1, delete: 1 },
            byTrigger: { "user-edit": 3, "bulk-action": 0, "row-action": 0 },
            entities: ["user"],
          },
        })
      );

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} enableTransactions />
        </TestWrapper>
      );

      expect(screen.getByText("5")).toBeInTheDocument(); // 2 + 3
    });
  });

  describe("Popover Interactions", () => {
    it("should open popover when button is clicked", async () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: mockActivities,
          unviewedCount: 1,
        })
      );

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        expect(screen.getByText("Recent Activity")).toBeInTheDocument();
      });
    });

    it("should show transaction tab when transactions enabled", async () => {
      mockUseActivity.mockReturnValue(createMockActivityContext());
      mockUseTransactionContext.mockReturnValue(
        createMockTransactionContext({
          combinedSummary: { total: 1, byType: {}, byTrigger: {}, entities: [] },
        })
      );

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} enableTransactions />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        expect(screen.getByText("Recent Activity")).toBeInTheDocument();
        expect(screen.getByText("Pending Changes")).toBeInTheDocument();
      });
    });

    it("should auto-focus pending changes tab when there are pending operations", async () => {
      mockUseActivity.mockReturnValue(createMockActivityContext());
      mockUseTransactionContext.mockReturnValue(
        createMockTransactionContext({
          combinedSummary: { total: 2, byType: {}, byTrigger: {}, entities: [] },
        })
      );

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} enableTransactions />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        // Should focus on pending changes tab due to pending operations
        expect(screen.getByText("2 pending operations")).toBeInTheDocument();
      });
    });
  });

  describe("Recent Activity Tab", () => {
    it("should display activities list", async () => {
      const markAsViewedMock = vi.fn();
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: mockActivities,
          unviewedCount: 1,
          markAsViewed: markAsViewedMock,
        })
      );

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Product ABC")).toBeInTheDocument();
        expect(screen.getByText("Order #123")).toBeInTheDocument();
      });

      // Should mark activities as viewed
      expect(markAsViewedMock).toHaveBeenCalledWith("activity-1");
      expect(markAsViewedMock).toHaveBeenCalledWith("activity-2");
      expect(markAsViewedMock).toHaveBeenCalledWith("activity-3");
    });

    it("should show activity type chips with correct colors", async () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: mockActivities,
        })
      );

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        expect(screen.getByText("Created")).toBeInTheDocument();
        expect(screen.getByText("Updated")).toBeInTheDocument();
        expect(screen.getByText("Deleted")).toBeInTheDocument();
      });
    });

    it("should handle activity navigation", async () => {
      const mockNavigate = vi.fn();
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0]], // Only the one with URL
        })
      );

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} onNavigate={mockNavigate} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        const viewButton = screen.getByRole("button", { name: /view item/i });
        fireEvent.click(viewButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith("/users/1");
    });

    it("should handle clear all activities", async () => {
      const clearAllMock = vi.fn();
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: mockActivities,
          clearAll: clearAllMock,
        })
      );

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        const clearButton = screen.getByRole("button", { name: /clear all/i });
        fireEvent.click(clearButton);
      });

      expect(clearAllMock).toHaveBeenCalled();
    });

    it("should show empty state when no activities", async () => {
      mockUseActivity.mockReturnValue(createMockActivityContext());

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        expect(screen.getByText("No recent activity")).toBeInTheDocument();
      });
    });
  });

  describe("Pending Changes Tab", () => {
    it("should show pending operations", async () => {
      const mockManager = {
        getOperations: () => [
          {
            id: "op-1",
            type: "create",
            label: "Create User",
            trigger: "user-edit",
            timestamp: new Date(),
          },
          {
            id: "op-2", 
            type: "update",
            label: "Update Product",
            trigger: "row-action",
            timestamp: new Date(),
          },
        ],
        removeOperation: vi.fn(),
      };

      mockUseActivity.mockReturnValue(createMockActivityContext());
      mockUseTransactionContext.mockReturnValue(
        createMockTransactionContext({
          combinedSummary: { total: 2, byType: {}, byTrigger: {}, entities: [] },
          getAllManagers: () => [mockManager],
        })
      );

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} enableTransactions />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        expect(screen.getByText("Create User")).toBeInTheDocument();
        expect(screen.getByText("Update Product")).toBeInTheDocument();
        expect(screen.getByText("2 pending operations")).toBeInTheDocument();
      });
    });

    it("should handle commit all operations", async () => {
      const mockManager = {
        getTransaction: () => ({ config: { requireConfirmation: false } }),
        getOperations: () => [],
      };

      mockUseActivity.mockReturnValue(createMockActivityContext());
      mockUseTransactionContext.mockReturnValue(
        createMockTransactionContext({
          combinedSummary: { total: 1, byType: {}, byTrigger: {}, entities: [] },
        })
      );
      mockTransactionRegistry.getAllManagers.mockReturnValue([mockManager]);

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} enableTransactions />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        const commitButton = screen.getByTitle("Commit all changes");
        fireEvent.click(commitButton);
      });

      expect(mockTransactionRegistry.commitAll).toHaveBeenCalled();
    });

    it("should show confirmation dialog when commit requires confirmation", async () => {
      const mockManager = {
        getTransaction: () => ({ config: { requireConfirmation: true } }),
        getOperations: () => [],
      };

      mockUseActivity.mockReturnValue(createMockActivityContext());
      mockUseTransactionContext.mockReturnValue(
        createMockTransactionContext({
          combinedSummary: { total: 1, byType: {}, byTrigger: {}, entities: [] },
        })
      );
      mockTransactionRegistry.getAllManagers.mockReturnValue([mockManager]);

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} enableTransactions />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        const commitButton = screen.getByTitle("Commit all changes");
        fireEvent.click(commitButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Confirm Commit")).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to commit all .* pending changes/)).toBeInTheDocument();
      });
    });

    it("should handle cancel all operations", async () => {
      mockUseActivity.mockReturnValue(createMockActivityContext());
      mockUseTransactionContext.mockReturnValue(
        createMockTransactionContext({
          combinedSummary: { total: 1, byType: {}, byTrigger: {}, entities: [] },
        })
      );

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} enableTransactions />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        const cancelButton = screen.getByTitle("Cancel all changes");
        fireEvent.click(cancelButton);
      });

      expect(mockTransactionRegistry.cancelAll).toHaveBeenCalled();
    });

    it("should handle individual operation removal", async () => {
      const removeOperationMock = vi.fn();
      const mockManager = {
        getOperations: () => [
          {
            id: "op-1",
            type: "create",
            label: "Create User",
            trigger: "user-edit",
            timestamp: new Date(),
          },
        ],
        removeOperation: removeOperationMock,
      };

      mockUseActivity.mockReturnValue(createMockActivityContext());
      mockUseTransactionContext.mockReturnValue(
        createMockTransactionContext({
          combinedSummary: { total: 1, byType: {}, byTrigger: {}, entities: [] },
          getAllManagers: () => [mockManager],
        })
      );

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} enableTransactions />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        const removeButton = screen.getByRole("button", { name: /remove operation/i });
        fireEvent.click(removeButton);
      });

      expect(removeOperationMock).toHaveBeenCalledWith("op-1");
    });

    it("should show empty state when no pending operations", async () => {
      mockUseActivity.mockReturnValue(createMockActivityContext());
      mockUseTransactionContext.mockReturnValue(createMockTransactionContext());

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} enableTransactions />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      // Switch to pending changes tab
      await waitFor(() => {
        const pendingTab = screen.getByText("Pending Changes");
        fireEvent.click(pendingTab);
      });

      await waitFor(() => {
        expect(screen.getByText("No pending changes")).toBeInTheDocument();
      });
    });
  });

  describe("Tab Navigation", () => {
    it("should mark activities as viewed when switching to recent activity tab", async () => {
      const markAsViewedMock = vi.fn();
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: mockActivities,
          markAsViewed: markAsViewedMock,
        })
      );
      mockUseTransactionContext.mockReturnValue(createMockTransactionContext());

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} enableTransactions />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        const pendingTab = screen.getByText("Pending Changes");
        fireEvent.click(pendingTab);
      });

      // Clear the mock calls from initial render
      markAsViewedMock.mockClear();

      await waitFor(() => {
        const activityTab = screen.getByText("Recent Activity");
        fireEvent.click(activityTab);
      });

      expect(markAsViewedMock).toHaveBeenCalledWith("activity-1");
      expect(markAsViewedMock).toHaveBeenCalledWith("activity-2");
      expect(markAsViewedMock).toHaveBeenCalledWith("activity-3");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing transaction context gracefully", () => {
      mockUseActivity.mockReturnValue(createMockActivityContext());
      
      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} enableTransactions />
        </TestWrapper>
      );

      // Should render without throwing error even though transaction context throws
      expect(screen.getByRole("button", { name: /activity notifications/i })).toBeInTheDocument();
    });

    it("should handle operations without managers", async () => {
      mockUseActivity.mockReturnValue(createMockActivityContext());
      mockUseTransactionContext.mockReturnValue(
        createMockTransactionContext({
          combinedSummary: { total: 1, byType: {}, byTrigger: {}, entities: [] },
          getAllManagers: () => [], // No managers
        })
      );

      render(
        <TestWrapper>
          <ActivityNotifications {...defaultProps} enableTransactions />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: /activity notifications/i }));

      await waitFor(() => {
        expect(screen.getByText("1 pending operations")).toBeInTheDocument();
      });
    });
  });
});