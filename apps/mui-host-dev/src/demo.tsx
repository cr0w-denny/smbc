import {
  Task as TaskIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  MuiDataViewApplet,
  type MuiDataViewAppletConfig,
} from "@smbc/mui-applet-core";
import { faker } from "@faker-js/faker";
import {
  createBulkUpdateAction,
  createBulkDeleteAction,
} from "@smbc/react-query-dataview";

// =============================================================================
// DATAVIEW REFERENCE IMPLEMENTATION
// =============================================================================
//
// This file serves as a reference implementation for the DataView system
// demonstrating all key features and patterns:
//
// FEATURES DEMONSTRATED:
// - Complete CRUD operations with forms and validation
// - Bulk actions with transaction support and visual feedback
// - Advanced filtering and pagination with URL synchronization
// - Optimistic updates with rollback on error
// - Clean separation between data state and transaction state
// - Custom action helpers for consistent behavior
// - Permission-based action visibility
// - Activity tracking integration
//
// TRANSACTION SYSTEM:
// The transaction system provides:
// - Batch operations that can be committed or rolled back as a group
// - Visual feedback showing pending changes without mixing data
// - Accumulation of multiple operations on the same entities
// - Individual operation undo before commit
// - Clean separation: data remains pure, transactions tracked separately
//
// USAGE PATTERNS:
// This implementation shows the recommended patterns for:
// - Setting up mock API clients for development/testing
// - Creating reusable bulk actions with helper functions
// - Implementing appliesTo logic for conditional action visibility
// - Handling complex data transformations
// - Integrating with external libraries (React Query)
//
// =============================================================================

// =============================================================================
// DATA MODEL DEFINITION
// =============================================================================

/**
 * Task interface representing a work item in our demo application.
 * This serves as the primary data model for demonstrating DataView capabilities.
 *
 * Key design decisions:
 * - Uses numeric ID for simplicity (string IDs also supported)
 * - Includes common business fields: status, priority, assignee, dates
 * - Status field demonstrates enum-like values for dropdowns
 * - All fields are required to show validation patterns
 */
interface Task {
  id: number;
  title: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  assignee: string;
  dueDate: string;
  description: string;
  createdAt: string;
}

// =============================================================================
// MOCK DATA GENERATION
// =============================================================================

/**
 * Generates realistic mock task data using faker.js for development and testing.
 *
 * @param count - Number of tasks to generate (default: 50)
 * @returns Array of mock Task objects
 */
const generateMockTasks = (count: number = 50): Task[] => {
  const statuses: Task["status"][] = ["pending", "in-progress", "completed"];
  const priorities: Task["priority"][] = ["low", "medium", "high"];

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: faker.hacker.phrase(),
    status: faker.helpers.arrayElement(statuses),
    priority: faker.helpers.arrayElement(priorities),
    assignee: faker.person.fullName(),
    dueDate: faker.date.future({ years: 0.5 }).toISOString().split("T")[0],
    description: faker.lorem.sentence(),
    createdAt: faker.date.past({ years: 0.25 }).toISOString(),
  }));
};

// Set a consistent seed for faker to make demo predictable
// This ensures the same data appears every time for consistent testing
faker.seed(12345);

/**
 * Global mock data store simulating a backend database.
 *
 * IMPORTANT: In a real application, this would be your actual API/database.
 * This mutable array simulates server-side data persistence.
 *
 * Mutations directly modify this array to simulate API calls
 */
let mockTasks = generateMockTasks(75);

// =============================================================================
// MOCK API CLIENT IMPLEMENTATION
// =============================================================================

/**
 * Creates a mock API client that simulates real backend interactions.
 */
const createTasksApiClient = () => {
  // Return openapi-fetch compatible interface
  return {
    GET: async (_endpoint: string, options: any) => {
      const params = options?.params?.query || {};
      console.log("Demo mock GET called:", { endpoint: _endpoint, params });

      // Apply filtering
      let filteredTasks = mockTasks;
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredTasks = mockTasks.filter(
          (task) =>
            task.title.toLowerCase().includes(searchLower) ||
            task.assignee.toLowerCase().includes(searchLower),
        );
      }
      if (params.status) {
        filteredTasks = filteredTasks.filter(
          (task) => task.status === params.status,
        );
      }
      if (params.priority) {
        filteredTasks = filteredTasks.filter(
          (task) => task.priority === params.priority,
        );
      }

      // Apply pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const paginatedTasks = filteredTasks.slice(
        startIndex,
        startIndex + pageSize,
      );

      return {
        data: {
          data: paginatedTasks,
          total: filteredTasks.length,
          page,
          pageSize,
        },
        error: null,
      };
    },

    POST: async (_endpoint: string, options: any) => {
      const newTask = {
        id: mockTasks.length + 1,
        ...options.body,
        createdAt: new Date().toISOString(),
      };
      mockTasks.unshift(newTask);

      return {
        data: newTask,
        error: null,
      };
    },

    PATCH: async (_endpoint: string, options: any) => {
      const id = options.params?.path?.id;
      const updates = options.body;
      const taskIndex = mockTasks.findIndex((t) => t.id === id);

      if (taskIndex !== -1) {
        mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...updates };
        return {
          data: mockTasks[taskIndex],
          error: null,
        };
      }

      return {
        data: null,
        error: { message: `Task with id ${id} not found` },
      };
    },

    DELETE: async (_endpoint: string, options: any) => {
      const id = options.params?.path?.id;
      const originalLength = mockTasks.length;
      mockTasks = mockTasks.filter((t) => t.id !== id);

      if (mockTasks.length === originalLength) {
        return {
          data: null,
          error: { message: `Task with id ${id} not found` },
        };
      }

      return {
        data: {},
        error: null,
      };
    },
  };
};

// =============================================================================
// MUTATION HELPER FUNCTIONS
// =============================================================================
//
// NOTE: We're now shifting into frontend territory and away from backend mocking.
// The functions below are pure frontend utilities that work with the DataView
// transaction system and action helpers. They bridge the gap between the
// mock API layer above and the UI components below.

/**
 * Creates a task update function for use with bulk action helpers.
 *
 * This pattern demonstrates:
 * - Partial update support (only modified fields sent)
 * - Comprehensive logging for debugging transaction flows
 * - Proper error handling with meaningful messages
 * - Integration with the transaction system
 *
 * The function is designed to work with createBulkUpdateAction helper
 * and supports the transaction system's accumulation patterns.
 */
const createTaskUpdateFunction = () => {
  return async (id: string | number, updates: Partial<Task>) => {
    console.log("🔧 Demo mutation executing:", {
      id,
      updates,
      currentTask: mockTasks.find((t) => t.id === id),
      allMockTasks: mockTasks.map((t) => ({
        id: t.id,
        status: t.status,
        priority: t.priority,
      })),
    });

    const taskIndex = mockTasks.findIndex((t) => t.id === id);
    if (taskIndex !== -1) {
      const oldTask = { ...mockTasks[taskIndex] };
      mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...updates };

      console.log("🔧 Demo mutation completed:", {
        id,
        oldTask: { status: oldTask.status, priority: oldTask.priority },
        newTask: {
          status: mockTasks[taskIndex].status,
          priority: mockTasks[taskIndex].priority,
        },
        updates,
      });

      return mockTasks[taskIndex];
    }
    throw new Error(`Task with id ${id} not found`);
  };
};

/**
 * Creates a task deletion function for use with bulk action helpers.
 *
 * Features:
 * - Proper error handling for non-existent items
 * - Detailed logging for debugging
 * - Integration with transaction system
 */
const createTaskDeleteFunction = () => {
  return async (id: string | number) => {
    console.log("🗑️ Demo delete mutation executing:", {
      id,
      currentTask: mockTasks.find((t) => t.id === id),
      totalTasks: mockTasks.length,
    });

    const originalLength = mockTasks.length;
    mockTasks = mockTasks.filter((t) => t.id !== id);

    console.log("🗑️ Demo delete mutation completed:", {
      id,
      tasksRemoved: originalLength - mockTasks.length,
      newTotalTasks: mockTasks.length,
    });

    if (mockTasks.length === originalLength) {
      throw new Error(`Task with id ${id} not found`);
    }
    return {};
  };
};

// =============================================================================
// DATAVIEW CONFIGURATION
// =============================================================================

/**
 * Complete DataView configuration demonstrating all major features.
 *
 * This configuration serves as a comprehensive reference showing:
 * - API client integration
 * - Schema definition with validation
 * - Column configuration with sorting and filtering
 * - Form definitions for create/edit operations
 * - Action definitions (row, bulk, global)
 * - Pagination and filtering setup
 * - Activity tracking integration
 *
 * Each section is thoroughly documented to serve as a reference.
 *
 * @param apiClient - The mock API client instance
 * @returns Complete MuiDataViewAppletConfig for the Task entity
 */
const createTaskConfig = (
  apiClient: ReturnType<typeof createTasksApiClient>,
): MuiDataViewAppletConfig<Task> => ({
  // =============================================================================
  // API CONFIGURATION
  // =============================================================================
  api: {
    client: apiClient,
    endpoint: "/api/tasks",

    // Extract data rows from API response (handles different response formats)
    responseRow: (response: any) => response?.data || [],

    // Extract total count from API response (for pagination)
    responseRowCount: (response: any) => response?.total || 0,

    // Generate optimistic response for immediate UI updates
    // This is called when mutations succeed to update the cache
    optimisticResponse: (originalResponse: any, newRows: any[]) => ({
      ...originalResponse,
      data: newRows,
      // Keep the original total - visual pending states don't change the actual count
      total: originalResponse.total,
    }),
  },

  // =============================================================================
  // DATA SCHEMA DEFINITION
  // =============================================================================
  schema: {
    // Field definitions for forms, validation, and metadata
    fields: [
      // Required string field with validation
      { name: "title", type: "string", label: "Title", required: true },

      // Optional text field for longer content
      { name: "description", type: "string", label: "Description" },

      // Dropdown field with predefined options
      {
        name: "status",
        type: "select",
        label: "Status",
        options: [
          { label: "Pending", value: "pending" },
          { label: "In Progress", value: "in-progress" },
          { label: "Completed", value: "completed" },
        ],
      },

      // Another dropdown demonstrating different option values
      {
        name: "priority",
        type: "select",
        label: "Priority",
        options: [
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" },
        ],
      },

      // Simple string field for user assignment
      { name: "assignee", type: "string", label: "Assignee" },

      // Date field with proper input type
      { name: "dueDate", type: "date", label: "Due Date" },
    ],

    // Primary key field name (must match your data structure)
    primaryKey: "id",

    // Function to generate human-readable names for items
    displayName: (task) => task.title,
  },

  // =============================================================================
  // TABLE COLUMN CONFIGURATION
  // =============================================================================
  columns: [
    // Primary content column - always visible and sortable
    { key: "title", label: "Task Title", sortable: true },

    // Status column with custom styling to prevent wrapping
    {
      key: "status",
      label: "Status",
      sortable: true,
      sx: { whiteSpace: "nowrap" }, // Prevent text wrapping for clean display
    },

    // Priority column for quick scanning
    { key: "priority", label: "Priority", sortable: true },

    // User-related information
    { key: "assignee", label: "Assignee", sortable: true },

    // Date column with formatting considerations
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      sx: { whiteSpace: "nowrap" }, // Keep dates consistent
    },

    // Description column - typically not sortable due to length
    { key: "description", label: "Description", sortable: false },
  ],

  // =============================================================================
  // FILTER CONFIGURATION
  // =============================================================================
  filters: {
    fields: [
      // Global search field - searches across multiple columns
      {
        name: "search",
        label: "Search tasks",
        type: "search", // Special search input with appropriate styling
        placeholder: "Search by title...",
        fullWidth: true, // Take full width for better UX
      },

      // Status filter dropdown
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "All", value: "" }, // Empty value shows all items
          { label: "Pending", value: "pending" },
          { label: "In Progress", value: "in-progress" },
          { label: "Completed", value: "completed" },
        ],
      },

      // Priority filter dropdown
      {
        name: "priority",
        label: "Priority",
        type: "select",
        options: [
          { label: "All", value: "" }, // Empty value shows all items
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" },
        ],
      },
    ],

    // Default filter values (empty = show all)
    initialValues: { search: "", status: "", priority: "" },
  },

  // =============================================================================
  // ACTION CONFIGURATION
  // =============================================================================
  actions: {
    // ROW ACTIONS: Appear in each table row for individual items
    row: [
      // Standard edit action - opens the edit form
      {
        type: "row",
        key: "edit", // Must match the key expected by the framework
        label: "Edit",
        color: "primary",
        icon: EditIcon,
      },

      // Standard delete action - opens confirmation dialog
      {
        type: "row",
        key: "delete", // Must match the key expected by the framework
        label: "Delete",
        color: "error",
        icon: DeleteIcon,
      },
    ],

    // BULK ACTIONS: Appear when multiple rows are selected
    bulk: [
      // BULK UPDATE EXAMPLE 1: Mark multiple tasks as completed
      {
        // Use helper function for consistent behavior and transaction support
        ...createBulkUpdateAction<Task>(
          createTaskUpdateFunction(), // Mutation function
          { status: "completed" }, // Data to apply
          {
            key: "mark-complete",
            label: "Mark Complete",
            color: "success",
          },
        ),
        // Only show action for tasks that aren't already completed
        appliesTo: (task: Task) => task.status !== "completed",
      },

      // BULK UPDATE EXAMPLE 2: Set priority to high
      {
        ...createBulkUpdateAction<Task>(
          createTaskUpdateFunction(),
          { priority: "high" },
          {
            key: "assign-priority",
            label: "Set High Priority",
            color: "warning",
          },
        ),
        // Only show action for tasks that don't already have high priority
        appliesTo: (task: Task) => task.priority !== "high",
      },

      // BULK DELETE EXAMPLE: Delete multiple selected tasks
      {
        ...createBulkDeleteAction<Task>(createTaskDeleteFunction(), {
          key: "delete-selected",
          label: "Delete Selected",
        }),
        appliesTo: (task: Task) => {
          // Only show delete action for items that aren't already pending deletion
          //
          // IMPORTANT: __pendingDelete is temporarily added by ActionBar's
          // getEffectiveItem function for UI visibility calculations only.
          // It does NOT mix with the clean data - it's only used for determining
          // which action buttons should be visible.
          //
          // - Original data: Always remains unchanged
          // - Transaction state: Tracked separately in pendingStates Map
          // - UI calculations: Temporary mixing only for button visibility
          return !(task as any).__pendingDelete;
        },
      },
    ],

    // GLOBAL ACTIONS: Always visible, not tied to specific rows
    global: [
      // Standard create action - opens the create form
      {
        type: "global",
        key: "create", // Must match the key expected by the framework
        label: "Create Task",
        color: "secondary",
        icon: TaskIcon,
      },
    ],
  },

  // =============================================================================
  // FORM CONFIGURATION
  // =============================================================================
  forms: {
    // CREATE FORM: For adding new items
    create: {
      fields: [
        // Required field with validation
        { name: "title", type: "string", label: "Title", required: true },

        // Optional text field
        { name: "description", type: "string", label: "Description" },

        // Status dropdown - limited options for new items
        {
          name: "status",
          type: "select",
          label: "Status",
          options: [
            { label: "Pending", value: "pending" },
            { label: "In Progress", value: "in-progress" },
            // Note: "Completed" not available for new tasks
          ],
        },

        // Priority selection with all options
        {
          name: "priority",
          type: "select",
          label: "Priority",
          options: [
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "High", value: "high" },
          ],
        },

        // User assignment field
        { name: "assignee", type: "string", label: "Assignee" },

        // Due date selection
        { name: "dueDate", type: "date", label: "Due Date" },
      ],
    },

    // EDIT FORM: For modifying existing items
    edit: {
      fields: [
        // Same fields as create, but with all status options available
        { name: "title", type: "string", label: "Title", required: true },
        { name: "description", type: "string", label: "Description" },

        // Full status options for existing tasks
        {
          name: "status",
          type: "select",
          label: "Status",
          options: [
            { label: "Pending", value: "pending" },
            { label: "In Progress", value: "in-progress" },
            { label: "Completed", value: "completed" }, // Available in edit mode
          ],
        },

        {
          name: "priority",
          type: "select",
          label: "Priority",
          options: [
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "High", value: "high" },
          ],
        },

        { name: "assignee", type: "string", label: "Assignee" },
        { name: "dueDate", type: "date", label: "Due Date" },
      ],
    },
  },

  // =============================================================================
  // PAGINATION CONFIGURATION
  // =============================================================================
  pagination: {
    enabled: true, // Enable pagination controls
    defaultPageSize: 10, // Items per page on initial load
    pageSizeOptions: [5, 10, 20], // Available page size options
  },

  // =============================================================================
  // ADVANCED OPTIONS
  // =============================================================================
  options: {
    // Transform filters before sending to API
    // This allows for complex filter processing, renaming, or formatting
    transformFilters: (filters: any) => {
      // In this demo, pass filters directly to our API client
      // In production, you might transform field names, format dates, etc.
      return filters;
    },
  },

  // =============================================================================
  // ACTIVITY TRACKING CONFIGURATION
  // =============================================================================
  activity: {
    enabled: true, // Enable activity/audit logging
    entityType: "task", // Entity type for activity records
    labelGenerator: (item: Task) => item.title, // Human-readable item labels
    // No URL generator for demo tasks since there's no detail view
    // In production: urlGenerator: (item) => `/tasks/${item.id}`
  },
});

// =============================================================================
// MAIN DEMO COMPONENT
// =============================================================================

/**
 * TasksDemo - The main demo component showcasing DataView capabilities.
 *
 * This component demonstrates:
 * - API client instantiation
 * - Configuration setup
 * - Transaction system integration
 * - Permission context usage
 *
 * Key features enabled:
 * - Transaction support with batch operations
 * - URL hash parameter synchronization
 * - Activity tracking
 * - Comprehensive error handling
 */
const TasksDemo = () => {
  const apiClient = createTasksApiClient();
  const config = createTaskConfig(apiClient);

  return (
    <MuiDataViewApplet
      config={config}
      permissionContext="tasks-demo"
      enableUrlSync={true}
      options={{
        // =============================================================================
        // TRANSACTION SYSTEM CONFIGURATION
        // =============================================================================
        transaction: {
          enabled: true, // Enable batch transaction support
          requireConfirmation: false, // Show confirmation dialog before commit
          emitActivities: true, // Emit activities when transactions are committed
        },
      }}
    />
  );
};

// =============================================================================
// APPLET REGISTRATION
// =============================================================================

/**
 * Applet configuration for registration with the host application.
 * This defines how the applet appears in navigation and routing.
 */
export default {
  id: "demo-tasks", // Unique identifier for this applet
  label: "Demo Tasks", // Display name in navigation
  // apiSpec, // optional API specification reference
  component: TasksDemo, // React component to render
};
