import { useMemo } from "react";
import { Chip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { usePermissions } from "@smbc/applet-core";
import { MuiDataViewApplet, type MuiDataViewAppletConfig } from "@smbc/mui-applet-core";
import { apiClient, type components } from "@smbc/user-management-client";
import { USER_MANAGEMENT_PERMISSIONS } from "../permissions";

type User = components["schemas"]["User"];

export interface UserTableProps {
  /** Type of users to display */
  userType?: "all" | "admins" | "non-admins";
  /** Permission context for role-based access control */
  permissionContext?: string;
}

export function UserTable({
  userType = "all",
  permissionContext = "user-management",
}: UserTableProps) {
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission(
    permissionContext,
    USER_MANAGEMENT_PERMISSIONS.CREATE_USERS,
  );
  const canEdit = hasPermission(
    permissionContext,
    USER_MANAGEMENT_PERMISSIONS.EDIT_USERS,
  );
  const canDelete = hasPermission(
    permissionContext,
    USER_MANAGEMENT_PERMISSIONS.DELETE_USERS,
  );

  const config: MuiDataViewAppletConfig<User> = useMemo(() => ({
    // API configuration
    api: {
      endpoint: "/users",
      client: apiClient,
      responseRow: (response) => response?.users || [],
      responseRowCount: (response) => response?.total || 0,
      optimisticResponse: (originalResponse, newRows) => ({
        ...originalResponse,
        users: newRows,
        total: newRows.length
      }),
    },

    // Data schema
    schema: {
      fields: [
        {
          name: "firstName",
          type: "string",
          label: "First Name",
          required: true,
        },
        {
          name: "lastName",
          type: "string",
          label: "Last Name",
          required: true,
        },
        { name: "email", type: "email", label: "Email", required: true },
        { name: "isActive", type: "boolean", label: "Active" },
      ],
      primaryKey: "id",
      displayName: (user) => `${user.firstName} ${user.lastName}`,
    },

    // Table columns - all available columns
    columns: [
      {
        key: "name",
        label: "Name",
        sortable: true,
        render: (user) => `${user.firstName} ${user.lastName}`,
      },
      {
        key: "email",
        label: "Email",
        sortable: true,
      },
      {
        key: "isActive",
        label: "Status",
        render: (user) => (
          <Chip
            label={user.isActive ? "Active" : "Inactive"}
            color={user.isActive ? "success" : "default"}
            size="small"
          />
        ),
      },
      {
        key: "createdAt",
        label: "Created",
        render: (user) => new Date(user.createdAt).toLocaleDateString(),
      },
      {
        key: "isAdmin",
        label: "Is Admin",
        render: (user) => (
          <Chip
            label={user.isAdmin ? "Yes" : "No"}
            color={user.isAdmin ? "primary" : "default"}
            size="small"
          />
        ),
      },
      // Additional columns for detailed view
      {
        key: "updatedAt",
        label: "Last Updated",
        render: (user) => new Date(user.updatedAt).toLocaleDateString(),
      },
      {
        key: "fullName",
        label: "Full Name",
        render: (user) => (user as any).fullName || `${user.firstName} ${user.lastName}`,
      },
      {
        key: "memberSince",
        label: "Member Since",
        render: (user) => (user as any).memberSince || new Date(user.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }),
      },
    ],

    // Filters
    filters: {
      fields: [
        {
          name: "search",
          type: "search",
          label: "Search users...",
          placeholder: "Search users...",
          fullWidth: true,
        },
        {
          name: "email",
          type: "text",
          label: "Email Filter",
          placeholder: "Filter by email...",
        },
        {
          name: "status",
          type: "select",
          label: "Status",
          options: [
            { label: "All Statuses", value: "" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ],
        },
        {
          name: "sortBy",
          type: "select",
          label: "Sort By",
          options: [
            { label: "First Name", value: "firstName" },
            { label: "Last Name", value: "lastName" },
            { label: "Email", value: "email" },
            { label: "Created Date", value: "createdAt" },
          ],
          defaultValue: "firstName",
          excludeFromCount: true,
        },
        {
          name: "sortOrder",
          type: "select",
          label: "Sort Order",
          options: [
            { label: "Ascending", value: "asc" },
            { label: "Descending", value: "desc" },
          ],
          defaultValue: "asc",
          excludeFromCount: true,
        },
        {
          name: "format",
          type: "checkbox",
          label: "Show Details",
          defaultValue: false,
        },
      ],
      initialValues: {
        search: "",
        email: undefined,
        status: undefined,
        sortBy: "firstName",
        sortOrder: "asc",
        format: false,
      },
      title: "User Filters",
      collapsible: true,
      defaultCollapsed: false,
      showClearButton: true,
      showFilterCount: true,
      debounceMs: 300,
    },

    // Actions
    actions: [
      ...(canEdit
        ? [
            {
              key: "edit",
              label: "Edit",
              icon: EditIcon,
              color: "primary" as const,
              onClick: () => {
                // Will be handled by the table component
              },
            },
          ]
        : []),
      ...(canDelete
        ? [
            {
              key: "delete",
              label: "Delete",
              icon: DeleteIcon,
              color: "error" as const,
              onClick: () => {
                // Will be handled by the table component
              },
            },
          ]
        : []),
    ],

    // Forms
    forms: {
      create: canCreate
        ? {
            fields: [
              {
                name: "firstName",
                type: "string",
                label: "First Name",
                required: true,
              },
              {
                name: "lastName",
                type: "string",
                label: "Last Name",
                required: true,
              },
              { name: "email", type: "email", label: "Email", required: true },
            ],
            title: "Create New User",
            submitLabel: "Create",
            cancelLabel: "Cancel",
          }
        : undefined,
      edit: canEdit
        ? {
            fields: [
              {
                name: "firstName",
                type: "string",
                label: "First Name",
                required: true,
              },
              {
                name: "lastName",
                type: "string",
                label: "Last Name",
                required: true,
              },
              { name: "isActive", type: "boolean", label: "Active" },
            ],
            title: "Edit User",
            submitLabel: "Update",
            cancelLabel: "Cancel",
          }
        : undefined,
    },

    // Permissions
    permissions: {
      create: USER_MANAGEMENT_PERMISSIONS.CREATE_USERS,
      edit: USER_MANAGEMENT_PERMISSIONS.EDIT_USERS,
      delete: USER_MANAGEMENT_PERMISSIONS.DELETE_USERS,
    },


    // Pagination
    pagination: {
      enabled: true,
      defaultPageSize: 10,
      pageSizeOptions: [5, 10, 25, 50],
    },

    // Additional options for the renderer
    options: {
      // Note: We'll need to enhance useDataView to support these custom query params
      apiParams: {
        ...(userType === "admins" && { isAdmin: "true" }),
        ...(userType === "non-admins" && { isAdmin: "false" }),
      },
      // Transform filter values for the API
      transformFilters: (filters: any) => {
        const transformed = { ...filters };
        
        // Transform checkbox format to API format parameter
        if (transformed.format === true) {
          transformed.format = "detailed";
        } else if (transformed.format === false) {
          delete transformed.format; // Don't send format=false
        }
        
        return transformed;
      },
      // Function to determine which columns to show based on filters
      getActiveColumns: (columns: any[], filters: any) => {
        // Default columns (summary view)
        const defaultColumns = ["name", "email", "isActive", "createdAt", "isAdmin"];
        
        // Additional columns for detailed view
        const detailedColumns = ["name", "email", "isActive", "createdAt", "isAdmin", "updatedAt", "fullName", "memberSince"];
        
        // Show detailed columns when format filter is true (which gets transformed to "detailed")
        const showDetailed = filters.format === true;
        const activeColumnKeys = showDetailed ? detailedColumns : defaultColumns;
        
        return columns.filter(col => activeColumnKeys.includes(col.key));
      },
    },
  }), [canCreate, canEdit, canDelete, userType]);

  const handleSuccess = (action: 'create' | 'edit' | 'delete', item?: any) => {
    console.log(`Success: ${action}`, item);
    // TODO: Add toast notification or snackbar
  };

  const handleError = (action: 'create' | 'edit' | 'delete', error: any, item?: any) => {
    console.error(`Error: ${action}`, error, item);
    // TODO: Add error notification
  };

  return (
    <MuiDataViewApplet 
      config={config} 
      permissionContext={permissionContext}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
