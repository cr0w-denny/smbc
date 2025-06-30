import {
  Task as TaskIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  MuiDataViewApplet,
  type MuiDataViewAppletConfig,
} from "@smbc/mui-applet-core";
import { useQuery, useMutation } from "@tanstack/react-query";
import { faker } from "@faker-js/faker";

// =============================================================================
// BASIC DATAVIEW EXAMPLE - Configuration Only, No Custom Components
// =============================================================================

// Generate mock data for the demo
const generateMockTasks = (count: number = 50) => {
  const statuses = ["pending", "in-progress", "completed"];
  const priorities = ["low", "medium", "high"];

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

// Generate static mock data that will be used as the "source of truth"
// Make it mutable so mutations can update it
let mockTasks = generateMockTasks(75);

// Create a simple React Query client for the demo
const createTasksApiClient = () => {
  // Real useQuery that uses React Query cache with a mock query function
  const mockUseQuery = (method: string, endpoint: string, params: any) => {
    const queryKey = [method, endpoint, params];

    // Calculate initial data for this specific query
    const filters = params?.params?.query || {};
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;

    // Apply simple filtering to get initial data
    let filteredTasks = mockTasks;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTasks = mockTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.assignee.toLowerCase().includes(searchLower),
      );
    }
    if (filters.status) {
      filteredTasks = filteredTasks.filter(
        (task) => task.status === filters.status,
      );
    }
    if (filters.priority) {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === filters.priority,
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedTasks = filteredTasks.slice(
      startIndex,
      startIndex + pageSize,
    );

    const initialData = {
      data: paginatedTasks,
      total: filteredTasks.length,
      page,
      pageSize,
    };

    return useQuery({
      queryKey,
      queryFn: async () => {
        console.log(
          "🔄 Query function called, recalculating data from mockTasks",
        );
        // Apply filtering to current mockTasks state
        let filteredTasks = mockTasks;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredTasks = mockTasks.filter(
            (task) =>
              task.title.toLowerCase().includes(searchLower) ||
              task.assignee.toLowerCase().includes(searchLower),
          );
        }
        if (filters.status) {
          filteredTasks = filteredTasks.filter(
            (task) => task.status === filters.status,
          );
        }
        if (filters.priority) {
          filteredTasks = filteredTasks.filter(
            (task) => task.priority === filters.priority,
          );
        }

        // Apply pagination
        const startIndex = (page - 1) * pageSize;
        const paginatedTasks = filteredTasks.slice(
          startIndex,
          startIndex + pageSize,
        );

        const result = {
          data: paginatedTasks,
          total: filteredTasks.length,
          page,
          pageSize,
        };

        console.log("📊 Query function result:", {
          totalMockTasks: mockTasks.length,
          filteredTasks: filteredTasks.length,
          paginatedTasks: paginatedTasks.length,
        });
        return result;
      },
      initialData, // Pre-populate the cache with mock data
      staleTime: 0, // Allow refetching to get updated data
    });
  };

  // Real useMutation that uses React Query
  const mockUseMutation = (
    method: string,
    endpoint: string,
    options: any = {},
  ) => {
    return useMutation({
      mutationFn: async (variables: any) => {
        console.log("🚀 Mock mutation called:", method, endpoint, variables);

        // Handle different mutation types
        if (method === "patch" && endpoint.includes("{id}")) {
          // Update mutation
          const id = variables.params?.path?.id;
          const updates = variables.body;
          const taskIndex = mockTasks.findIndex((t) => t.id === id);
          if (taskIndex !== -1) {
            mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...updates };
            console.log("✅ Updated mock task:", id, updates);
          }
        } else if (method === "delete" && endpoint.includes("{id}")) {
          // Delete mutation
          const id = variables.params?.path?.id;
          mockTasks = mockTasks.filter((t) => t.id !== id);
          console.log("🗑️ Deleted mock task:", id);
        } else if (method === "post") {
          // Create mutation
          const newTask = {
            id: mockTasks.length + 1,
            ...variables.body,
            createdAt: new Date().toISOString(),
          };
          mockTasks.unshift(newTask);
          console.log("➕ Created mock task:", newTask);
          return Promise.resolve(newTask);
        }

        return Promise.resolve(variables);
      },
      ...options,
    });
  };

  return {
    useQuery: mockUseQuery,
    useMutation: mockUseMutation,
  };
};

const createTaskConfig = (
  apiClient: ReturnType<typeof createTasksApiClient>,
): MuiDataViewAppletConfig<any> => ({
  api: {
    client: apiClient,
    endpoint: "/api/tasks",
    responseRow: (response: any) => response?.data || [],
    responseRowCount: (response: any) => response?.total || 0,
    optimisticResponse: (originalResponse: any, newRows: any[]) => ({
      ...originalResponse,
      data: newRows,
      // Keep the original total - visual pending states don't change the actual count
      total: originalResponse.total,
    }),
  },
  schema: {
    fields: [
      { name: "title", type: "string", label: "Title", required: true },
      { name: "description", type: "string", label: "Description" },
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
    primaryKey: "id",
    displayName: (task) => task.title,
  },
  columns: [
    { key: "title", label: "Task Title", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sx: { whiteSpace: "nowrap" },
    },
    { key: "priority", label: "Priority", sortable: true },
    { key: "assignee", label: "Assignee", sortable: true },
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      sx: { whiteSpace: "nowrap" },
    },
    { key: "description", label: "Description", sortable: false },
  ],
  filters: {
    fields: [
      {
        name: "search",
        label: "Search tasks",
        type: "search",
        placeholder: "Search by title...",
        fullWidth: true,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "All", value: "" },
          { label: "Pending", value: "pending" },
          { label: "In Progress", value: "in-progress" },
          { label: "Completed", value: "completed" },
        ],
      },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        options: [
          { label: "All", value: "" },
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" },
        ],
      },
    ],
    initialValues: { search: "", status: "", priority: "" },
  },
  actions: {
    row: [
      {
        type: "row",
        key: "edit",
        label: "Edit",
        color: "primary",
        icon: EditIcon,
      },
      {
        type: "row",
        key: "delete",
        label: "Delete",
        color: "error",
        icon: DeleteIcon,
      },
    ],
    bulk: [
      {
        type: "bulk",
        key: "mark-complete",
        label: "Mark Complete",
        color: "success",
        appliesTo: (task) => task.status !== "completed",
        onClick: async (tasks, context) => {
          console.log("🔥 Mark Complete bulk action called:", {
            tasks: tasks.length,
            context: !!context,
          });

          // Queue transaction operations
          if (context?.addTransactionOperation) {
            console.log("📝 Adding transaction operations...");
            for (const task of tasks) {
              const updatedTask = { ...task, status: "completed" };
              // Need to access mutation from context or pass it in somehow
              // For now, keeping the custom approach but ensuring it properly updates mockTasks
              context.addTransactionOperation(
                "update",
                updatedTask,
                async () => {
                  console.log(
                    "🔥 Executing update mutation for task:",
                    task.id,
                  );
                  // Directly update mockTasks and return the result
                  const taskIndex = mockTasks.findIndex(
                    (t) => t.id === task.id,
                  );
                  if (taskIndex !== -1) {
                    // Remove pending state metadata before saving
                    const {
                      __pendingState,
                      __pendingOperationId,
                      ...cleanTask
                    } = updatedTask as any;
                    console.log("📝 Updating mock task with:", cleanTask);
                    mockTasks[taskIndex] = cleanTask;
                    console.log(
                      "✅ Updated mockTasks, task now:",
                      mockTasks[taskIndex],
                    );
                  }
                  return updatedTask;
                },
                "bulk-action",
                ["status"],
              );
            }
            console.log("✅ Added transaction operations");
          } else {
            console.log("❌ No addTransactionOperation function available");
          }
        },
      },
      {
        type: "bulk",
        key: "assign-priority",
        label: "Set High Priority",
        color: "warning",
        appliesTo: (task) => task.priority !== "high",
        onClick: async (tasks, context) => {
          // Queue transaction operations
          if (context?.addTransactionOperation) {
            for (const task of tasks) {
              const updatedTask = { ...task, priority: "high" };
              context.addTransactionOperation(
                "update",
                updatedTask,
                async () => {
                  console.log(
                    "🔥 Executing priority update mutation for task:",
                    task.id,
                  );
                  // Directly update mockTasks and return the result
                  const taskIndex = mockTasks.findIndex(
                    (t) => t.id === task.id,
                  );
                  if (taskIndex !== -1) {
                    // Remove pending state metadata before saving
                    const {
                      __pendingState,
                      __pendingOperationId,
                      ...cleanTask
                    } = updatedTask as any;
                    console.log(
                      "📝 Updating mock task priority with:",
                      cleanTask,
                    );
                    mockTasks[taskIndex] = cleanTask;
                    console.log(
                      "✅ Updated mockTasks priority, task now:",
                      mockTasks[taskIndex],
                    );
                  }
                  return updatedTask;
                },
                "bulk-action",
                ["priority"],
              );
            }
          }
        },
      },
      {
        type: "bulk",
        key: "delete-selected",
        label: "Delete Selected",
        color: "error",
        appliesTo: (task) => task.__pendingState !== 'deleted',
        onClick: async (tasks, context) => {
          // Queue transaction operations
          if (context?.addTransactionOperation) {
            for (const task of tasks) {
              context.addTransactionOperation(
                "delete",
                task,
                async () => {
                  console.log(
                    "🔥 Executing delete mutation for task:",
                    task.id,
                  );
                  // Actually remove from mock data
                  const originalLength = mockTasks.length;
                  mockTasks = mockTasks.filter((t) => t.id !== task.id);
                  console.log(
                    `✅ Deleted task ${task.id}, mockTasks length: ${originalLength} → ${mockTasks.length}`,
                  );
                  return {};
                },
                "bulk-action",
              );
            }
          }
        },
      },
    ],
    global: [
      {
        type: "global",
        key: "create",
        label: "Create Task",
        color: "secondary",
        icon: TaskIcon,
      },
    ],
  },
  forms: {
    create: {
      fields: [
        { name: "title", type: "string", label: "Title", required: true },
        { name: "description", type: "string", label: "Description" },
        {
          name: "status",
          type: "select",
          label: "Status",
          options: [
            { label: "Pending", value: "pending" },
            { label: "In Progress", value: "in-progress" },
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
    edit: {
      fields: [
        { name: "title", type: "string", label: "Title", required: true },
        { name: "description", type: "string", label: "Description" },
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
  pagination: {
    enabled: true,
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20],
  },
  options: {
    transformFilters: (filters: any) => {
      // Pass filters directly to our API client
      return filters;
    },
  },
  activity: {
    enabled: true,
    entityType: "task",
    labelGenerator: (item: any) => item.title,
    // No URL generator for demo tasks since there's no detail view
  },
});

// Component that uses the hook to create the API client and config
const TasksDemo = () => {
  const apiClient = createTasksApiClient();
  const config = createTaskConfig(apiClient);

  return (
    <MuiDataViewApplet
      config={config}
      permissionContext="tasks-demo"
      options={{
        transaction: {
          enabled: true,
          mode: "user-controlled",
          autoCommit: false,
          requireConfirmation: true,
          showPendingIndicator: true,
          showReviewUI: true,
        },
        // Hash params are enabled by default
      }}
    />
  );
};

const apiSpec = {
  name: "Tasks Demo API",
  baseUrl: "",
  spec: {},
};

export default {
  id: "demo-tasks",
  label: "Demo Tasks",
  apiSpec,
  routes: [
    {
      path: "/demo",
      label: "Demo Tasks",
      component: TasksDemo,
      icon: TaskIcon,
      requiredPermissions: [],
    },
  ],
};
