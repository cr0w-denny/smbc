import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock the dataview hooks
vi.mock("@smbc/dataview", () => ({
  useActivity: vi.fn(),
}));

// Mock MUI icons
vi.mock("@mui/icons-material", () => ({
  Add: () => <div data-testid="add-icon">Add</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Delete: () => <div data-testid="delete-icon">Delete</div>,
  Visibility: () => <div data-testid="visibility-icon">View</div>,
}));

import { ActivitySnackbar } from "../ActivitySnackbar/ActivitySnackbar";
import type { ActivitySnackbarProps } from "../ActivitySnackbar/ActivitySnackbar";
import { useActivity } from "@smbc/dataview";

// Get reference to the mocked function
const mockUseActivity = vi.mocked(useActivity);

// Test wrapper with theme
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

describe("ActivitySnackbar", () => {
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
      url: "/products/abc",
    },
    {
      id: "activity-3",
      type: "delete" as const,
      entityType: "order",
      label: "Order #123",
      timestamp: new Date("2024-01-01T09:00:00Z"),
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

  const defaultProps: ActivitySnackbarProps = {
    autoHideDuration: 4000,
    onNavigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseActivity.mockReturnValue(createMockActivityContext());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render nothing when no activities", () => {
      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      // Should not render anything
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should show snackbar when activities exist", async () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0]],
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("user")).toBeInTheDocument();
        expect(screen.getByText("Created")).toBeInTheDocument();
      });
    });

    it("should show activity type chips with correct labels", async () => {
      const testCases = [
        { activity: mockActivities[0], expectedLabel: "Created" },
        { activity: mockActivities[1], expectedLabel: "Updated" },
        { activity: mockActivities[2], expectedLabel: "Deleted" },
      ];

      for (const testCase of testCases) {
        mockUseActivity.mockReturnValue(
          createMockActivityContext({
            activities: [testCase.activity],
          }),
        );

        const { unmount } = render(
          <TestWrapper>
            <ActivitySnackbar {...defaultProps} />
          </TestWrapper>,
        );

        await waitFor(() => {
          expect(screen.getByText(testCase.expectedLabel)).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe("Activity Updates", () => {
    it("should show new activity when activities list changes", async () => {
      const { rerender } = render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      // Initially no activities
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();

      // Add first activity
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0]],
        }),
      );

      rerender(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });
    });

    it("should update to show most recent activity", async () => {
      // Start with older activity
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[1]],
        }),
      );

      const { rerender } = render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Product ABC")).toBeInTheDocument();
      });

      // Add newer activity (activities[0] is newer)
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0], mockActivities[1]],
        }),
      );

      rerender(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.queryByText("Product ABC")).not.toBeInTheDocument();
      });
    });

    it("should not show snackbar again for same activity", async () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0]],
        }),
      );

      const { rerender } = render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      // Close the snackbar
      fireEvent.keyDown(screen.getByRole("presentation"), { key: "Escape" });

      await waitFor(() => {
        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      });

      // Re-render with same activity - should not show again
      rerender(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      // Should not show the snackbar again
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });
  });

  describe("Navigation Functionality", () => {
    it("should show view button when activity has URL", async () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0]], // Has URL
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /view/i }),
        ).toBeInTheDocument();
        expect(screen.getByTestId("visibility-icon")).toBeInTheDocument();
      });
    });

    it("should not show view button when activity has no URL", async () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[2]], // No URL
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Order #123")).toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: /view/i }),
        ).not.toBeInTheDocument();
      });
    });

    it("should not show view button when no onNavigate provided", async () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0]], // Has URL
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} onNavigate={undefined} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: /view/i }),
        ).not.toBeInTheDocument();
      });
    });

    it("should call onNavigate when view button is clicked", async () => {
      const mockNavigate = vi.fn();
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0]],
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} onNavigate={mockNavigate} />
        </TestWrapper>,
      );

      await waitFor(() => {
        const viewButton = screen.getByRole("button", { name: /view/i });
        fireEvent.click(viewButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith("/users/1");
    });

    it("should close snackbar when view button is clicked", async () => {
      const mockNavigate = vi.fn();
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0]],
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} onNavigate={mockNavigate} />
        </TestWrapper>,
      );

      await waitFor(() => {
        const viewButton = screen.getByRole("button", { name: /view/i });
        fireEvent.click(viewButton);
      });

      await waitFor(() => {
        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      });
    });
  });

  describe("Auto-hide Behavior", () => {
    it("should render with autoHideDuration prop", () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0]],
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} autoHideDuration={2000} />
        </TestWrapper>,
      );

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      // Verify the component renders the activity content
      expect(screen.getByText("Created")).toBeInTheDocument();
    });

    it("should render with default auto-hide duration", () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0]],
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar onNavigate={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      // Verify the component renders the activity content
      expect(screen.getByText("Created")).toBeInTheDocument();
    });
  });

  describe("Close Behavior", () => {
    it("should not close on clickaway", async () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0]],
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      // Simulate clickaway event
      fireEvent.click(document.body);

      // Should still be visible (clickaway is prevented)
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should close on escape key", async () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0]],
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      // Press escape key
      fireEvent.keyDown(screen.getByRole("presentation"), { key: "Escape" });

      await waitFor(() => {
        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      });
    });
  });

  describe("Activity Type Styling", () => {
    it("should apply correct styling for create activities", async () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0]], // create type
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Created")).toBeInTheDocument();
        expect(screen.getByTestId("add-icon")).toBeInTheDocument();
      });
    });

    it("should apply correct styling for update activities", async () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[1]], // update type
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Updated")).toBeInTheDocument();
        expect(screen.getByTestId("edit-icon")).toBeInTheDocument();
      });
    });

    it("should apply correct styling for delete activities", async () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[2]], // delete type
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Deleted")).toBeInTheDocument();
        expect(screen.getByTestId("delete-icon")).toBeInTheDocument();
      });
    });
  });

  describe("Content Display", () => {
    it("should display activity label and entity type", async () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [mockActivities[0]],
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("user")).toBeInTheDocument();
      });
    });

    it("should handle long labels gracefully", async () => {
      const longLabelActivity = {
        ...mockActivities[0],
        label:
          "This is a very long activity label that should be handled gracefully by the component",
      };

      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [longLabelActivity],
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText(longLabelActivity.label)).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined activity gracefully", async () => {
      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [],
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      // Should render nothing without throwing
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should handle activity with missing fields", async () => {
      const incompleteActivity = {
        id: "incomplete-1",
        type: "create" as const,
        entityType: "test",
        label: "Test Activity",
        timestamp: new Date(),
        // Missing URL
      };

      mockUseActivity.mockReturnValue(
        createMockActivityContext({
          activities: [incompleteActivity],
        }),
      );

      render(
        <TestWrapper>
          <ActivitySnackbar {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Activity")).toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: /view/i }),
        ).not.toBeInTheDocument();
      });
    });
  });
});
