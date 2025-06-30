import React from "react";
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

// =============================================================================
// BASIC DATAVIEW EXAMPLE - Configuration Only, No Custom Components
// =============================================================================

// Generate realistic mock data using faker
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

// Generate a larger dataset to demonstrate pagination
let mockTasks = generateMockTasks(75);

// In-memory state management for demo purposes
let taskIdCounter = mockTasks.length + 1;

// Mock API client with working filters and CRUD operations  
const createTasksApiClient = () => {
  const applyFilters = (tasks: any[], filters: any = {}) => {
    let filtered = [...tasks];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.assignee.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower),
      );
    }

    // Status filter
    if (filters.status && filters.status !== "") {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority && filters.priority !== "") {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    return filtered;
  };

  const useQuery = (_method: string, _endpoint: string, params: any) => {
    const filters = params?.params?.query || {};
    const page = (filters.page || 1) - 1; // Convert to 0-based
    const pageSize = filters.pageSize || 10;

    // Apply filters
    const filteredTasks = applyFilters(mockTasks, filters);

    // Apply pagination
    const startIndex = page * pageSize;
    const paginatedTasks = filteredTasks.slice(
      startIndex,
      startIndex + pageSize,
    );

    // Simulate API response structure
    const response = {
      data: paginatedTasks,
      total: filteredTasks.length,
      page: page + 1,
      pageSize,
    };

    return {
      data: response,
      isLoading: false,
      error: null,
    };
  };

  const useMutation = (
    method: string,
    _endpoint: string,
    options: any = {},
  ) => {
    const mutate = (variables: any) => {
      try {
        if (method === "post") {
          // Create new task
          const newTask = {
            id: taskIdCounter++,
            ...variables.body,
            createdAt: new Date().toISOString(),
          };
          mockTasks.unshift(newTask);
          options.onSuccess?.(newTask);
        } else if (method === "patch") {
          // Update existing task
          const taskId = variables.params?.path?.id;
          const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
          if (taskIndex !== -1) {
            mockTasks[taskIndex] = {
              ...mockTasks[taskIndex],
              ...variables.body,
            };
            options.onSuccess?.(mockTasks[taskIndex]);
          }
        } else if (method === "delete") {
          // Delete task
          const taskId = variables.params?.path?.id;
          const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
          if (taskIndex !== -1) {
            const deletedTask = mockTasks.splice(taskIndex, 1)[0];
            options.onSuccess?.(deletedTask);
          }
        }
      } catch (error) {
        options.onError?.(error);
      }
    };

    return {
      mutate,
      isPending: false,
    };
  };

  return { useQuery, useMutation };
};

// Hook to manage the API client with state
const useTasksApiClient = () => {
  // Add state to trigger re-renders when data changes
  const [dataVersion, setDataVersion] = React.useState(0);

  // Listen for data changes
  React.useEffect(() => {
    const handleDataChange = () => {
      setDataVersion((prev) => prev + 1);
    };

    window.addEventListener("mockDataChanged", handleDataChange);
    return () =>
      window.removeEventListener("mockDataChanged", handleDataChange);
  }, []);

  return React.useMemo(() => createTasksApiClient(), [dataVersion]);
};

// Simple DataViewApplet configuration - no custom components needed
const createTaskConfig = (apiClient: any): MuiDataViewAppletConfig<any> => ({
  api: {
    endpoint: "/api/tasks",
    client: apiClient,
    responseRow: (response: any) => response?.data || [],
    responseRowCount: (response: any) => response?.total || 0,
    optimisticResponse: (originalResponse: any, newRows: any[]) => ({
      ...originalResponse,
      data: newRows,
      total: newRows.length,
    }),
  },
  schema: {
    fields: [
      { name: "title", type: "string", label: "Title", required: true },
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
          console.log('🔥 Mark Complete bulk action called:', { tasks: tasks.length, context: !!context });
          console.log('📋 Context has addTransactionOperation:', !!context?.addTransactionOperation);
          
          // Optimistically update the data immediately (visible to user)
          for (const task of tasks) {
            const taskIndex = mockTasks.findIndex((t) => t.id === task.id);
            if (taskIndex !== -1) {
              mockTasks[taskIndex] = {
                ...mockTasks[taskIndex],
                status: "completed",
              };
            }
          }
          console.log(`✅ Marked ${tasks.length} tasks as completed (optimistic)`);
          window.dispatchEvent(new CustomEvent("mockDataChanged"));
          
          // Queue transaction operations for rollback capability
          if (context?.addTransactionOperation) {
            console.log('📝 Adding transaction operations...');
            for (const task of tasks) {
              context.addTransactionOperation(
                'update',
                task,
                () => context.updateMutation.mutate({
                  params: { path: { id: task.id } },
                  body: { status: "completed" }
                }),
                'bulk-action',
                ['status']
              );
            }
            console.log('✅ Added transaction operations');
          } else {
            console.log('❌ No addTransactionOperation function available');
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
          // Optimistically update the data immediately (visible to user)
          for (const task of tasks) {
            const taskIndex = mockTasks.findIndex((t) => t.id === task.id);
            if (taskIndex !== -1) {
              mockTasks[taskIndex] = {
                ...mockTasks[taskIndex],
                priority: "high",
              };
            }
          }
          console.log(`🔥 Set ${tasks.length} tasks to high priority (optimistic)`);
          window.dispatchEvent(new CustomEvent("mockDataChanged"));
          
          // Queue transaction operations for rollback capability
          if (context?.addTransactionOperation) {
            for (const task of tasks) {
              context.addTransactionOperation(
                'update',
                task,
                () => context.updateMutation.mutate({
                  params: { path: { id: task.id } },
                  body: { priority: "high" }
                }),
                'bulk-action',
                ['priority']
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
        onClick: async (tasks, context) => {

          // Optimistically delete the data immediately (visible to user)
          const idsToDelete = tasks.map((t) => t.id);
          const originalLength = mockTasks.length;
          mockTasks.splice(
            0,
            mockTasks.length,
            ...mockTasks.filter((task) => !idsToDelete.includes(task.id)),
          );
          console.log(`🗑️ Deleted ${originalLength - mockTasks.length} tasks (optimistic)`);
          window.dispatchEvent(new CustomEvent("mockDataChanged"));
          
          // Queue transaction operations for rollback capability
          if (context?.addTransactionOperation) {
            for (const task of tasks) {
              context.addTransactionOperation(
                'delete',
                task,
                () => context.deleteMutation.mutate({
                  params: { path: { id: task.id } }
                }),
                'bulk-action'
              );
            }
          }
        },
      },
    ],
    global: [
      { type: "global", key: "create", label: "Add Task", color: "primary" },
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
  const apiClient = useTasksApiClient();
  const config = createTaskConfig(apiClient);
  
  return (
    <MuiDataViewApplet 
      config={config} 
      permissionContext="tasks-demo"
      options={{
        transaction: {
          enabled: true,
          mode: 'user-controlled',
          autoCommit: false,
          requireConfirmation: true,
          showPendingIndicator: true,
          showReviewUI: true,
        }
      }}
    />
  );
};

const apiSpec = {
  name: "Tasks Demo API",
  spec: {
    openapi: "3.0.0",
    info: {
      title: "Tasks Demo API",
      version: "1.0.0",
      description: "Dummy API for basic DataViewApplet example",
    },
    paths: {
      "/api/tasks": {
        get: {
          summary: "Get tasks",
          responses: {
            "200": {
              description: "List of tasks",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        title: { type: "string" },
                        status: { type: "string" },
                        priority: { type: "string" },
                        assignee: { type: "string" },
                        dueDate: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default {
  id: "tasks-demo",
  label: "Tasks (Basic Example)",
  apiSpec,
  routes: [
    {
      path: "/tasks",
      label: "Tasks",
      component: TasksDemo,
      icon: TaskIcon,
      requiredPermissions: [], // No permissions required for demo
    },
  ],
};
