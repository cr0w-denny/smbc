import React from "react";
import { useDataView, type DataViewConfig } from "@smbc/react-dataview";
import {
  useHashQueryParams,
  usePermissions,
  type PermissionDefinition,
} from "@smbc/applet-core";
import { MuiDataView, ActionBar } from "@smbc/mui-components";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

// MUI-specific configuration that uses PermissionDefinition objects directly
export interface MuiDataViewAppletConfig<T>
  extends Omit<DataViewConfig<T>, "permissions" | "renderer"> {
  permissions?: {
    view?: PermissionDefinition;
    create?: PermissionDefinition;
    edit?: PermissionDefinition;
    delete?: PermissionDefinition;
  };
}

export interface MuiDataViewAppletProps<T extends Record<string, any>> {
  config: MuiDataViewAppletConfig<T>;
  className?: string;
  style?: React.CSSProperties;
  permissionContext?: string;
  /** Optional notification callbacks for user feedback */
  onSuccess?: (action: "create" | "edit" | "delete", item?: any) => void;
  onError?: (
    action: "create" | "edit" | "delete",
    error: any,
    item?: any,
  ) => void;
}

/**
 * MuiDataViewApplet - A layered architecture for data management with permissions and UI
 *
 * ARCHITECTURE OVERVIEW:
 * This component implements a 3-layer architecture that separates concerns:
 *
 * Layer 1 (react-dataview): Framework-agnostic data management
 * - Handles API calls, caching, optimistic updates
 * - Manages filters, pagination, selections, CRUD operations
 * - Takes simple string permissions and any actions you provide
 * - No knowledge of SMBC business logic or MUI components
 * - Reusable across different UI frameworks (React Native, etc.)
 *
 * Layer 2 (mui-applet-core): SMBC business logic
 * - Converts PermissionDefinitions to simple strings
 * - Filters and processes actions based on user permissions
 * - Handles URL-based state
 * - Connects generic data operations to specific business handlers
 * - No knowledge of specific UI components, but MUI-aware
 *
 * Layer 3 (MUI components): UI rendering
 * - Renders tables, forms, dialogs, action bars using MUI
 * - Handles user interactions and visual feedback
 * - No knowledge of data fetching or business logic
 *
 * FLOW EXAMPLE:
 * 1. User clicks "Edit" button (Layer 3: MUI ActionBar)
 * 2. Layer 2 checks permissions and processes the action
 * 3. Layer 1 handles the actual edit dialog state and API call
 * 4. Layer 3 renders the edit form dialog
 */
export function MuiDataViewApplet<T extends Record<string, any>>({
  config,
  className,
  style,
  permissionContext = "default",
  onSuccess,
  onError,
}: MuiDataViewAppletProps<T>) {
  const { hasPermission } = usePermissions();

  // Layer 2: SMBC business logic - convert PermissionDefinition to boolean
  const canCreate = config.permissions?.create
    ? hasPermission(permissionContext, config.permissions.create)
    : false;

  // Layer 2: SMBC business logic - URL-based state management for filters + pagination
  const defaultUrlState = {
    // Filters
    ...config.filters?.initialValues,
    // Pagination
    page: 0,
    pageSize: config.pagination?.defaultPageSize || 10,
  };

  const [urlState, setUrlState] = useHashQueryParams(defaultUrlState);

  // Layer 2: Unified state object that bridges SMBC URL state to Layer 1 hooks
  const dataViewState = {
    filters: Object.fromEntries(
      Object.entries(urlState).filter(
        ([key]) => !["page", "pageSize"].includes(key),
      ),
    ),
    pagination: {
      page: urlState.page ?? 0,
      pageSize: urlState.pageSize ?? (config.pagination?.defaultPageSize || 10),
    },
    updateFilters: (newFilters: any) => {
      setUrlState({ ...urlState, ...newFilters });
    },
    updatePagination: (newPagination: any) => {
      setUrlState({ ...urlState, ...newPagination });
    },
  };

  // Layer 1: Prepare config for framework-agnostic data management
  // Strip out Layer 2 concepts (SMBC permissions, actions) before passing to Layer 1
  const baseConfigWithoutActions: DataViewConfig<T> = {
    ...config,
    renderer: MuiDataView,
    permissions: undefined, // Layer 1 uses simple strings, Layer 2 handles PermissionDefinition objects
    actions: {}, // Layer 2 will process and filter actions based on permissions
  };

  // Layer 1: Framework-agnostic data management (API calls, state, mutations)
  const dataView = useDataView(baseConfigWithoutActions, {
    useFilterState: () => [dataViewState.filters, dataViewState.updateFilters],
    usePaginationState: () => [
      dataViewState.pagination,
      dataViewState.updatePagination,
    ],
    transformFilters: config.options?.transformFilters,
    getActiveColumns: config.options?.getActiveColumns,
    onSuccess,
    onError,
  });

  // Layer 2: Override pagination component to use our state management
  const PaginationComponentWithState = React.useMemo(() => {
    if (!config.pagination?.enabled) return () => null;

    return () =>
      React.createElement(MuiDataView.PaginationComponent, {
        page: dataViewState.pagination.page,
        pageSize: dataViewState.pagination.pageSize,
        total: dataView.total,
        onPageChange: (page: number) =>
          dataViewState.updatePagination({ ...dataViewState.pagination, page }),
        onPageSizeChange: (pageSize: number) =>
          dataViewState.updatePagination({
            ...dataViewState.pagination,
            pageSize,
            page: 0,
          }),
        pageSizeOptions: config.pagination?.pageSizeOptions,
      });
  }, [
    dataViewState.pagination.page,
    dataViewState.pagination.pageSize,
    dataView.total,
    dataViewState.updatePagination,
    config.pagination,
  ]);

  // Layer 2: SMBC business logic - process row actions with permission filtering and connect to Layer 1 handlers
  const processedRowActions =
    config.actions?.row?.map((action) => ({
      ...action,
      onClick: (item: T) => {
        if (action.key === "edit") {
          dataView.handleEdit(item);
        } else if (action.key === "delete") {
          dataView.handleDelete(item);
        } else {
          // Call the original onClick if it exists
          action.onClick?.(item);
        }
      },
    })) || [];

  // Layer 2: SMBC business logic - process bulk actions with permission filtering
  const processedBulkActions =
    config.actions?.bulk?.map((action) => ({
      ...action,
      onClick: (items: T[]) => {
        // Handle bulk operations
        if (action.key === "bulk-delete") {
          // TODO: Implement bulk delete
          console.log("Bulk delete:", items);
        } else {
          // Call the original onClick if it exists
          action.onClick?.(items);
        }
      },
    })) || [];

  // Layer 2: SMBC business logic - process global actions with permission filtering
  const processedGlobalActions =
    config.actions?.global?.map((action) => ({
      ...action,
      onClick: () => {
        if (action.key === "create") {
          dataView.handleCreate();
        } else {
          // Call the original onClick if it exists
          action.onClick?.();
        }
      },
    })) || [];

  // Layer 2: Add default create action based on SMBC permissions if none configured
  if (
    canCreate &&
    !processedGlobalActions.some((action) => action.key === "create")
  ) {
    processedGlobalActions.push({
      type: "global",
      key: "create",
      label: "Create New",
      icon: AddIcon,
      color: "primary" as const,
      onClick: dataView.handleCreate,
    });
  }

  // Layer 2: Bridge Layer 1 data to Layer 3 components with processed actions
  const TableComponentWithActions = React.useMemo(() => {
    // Get the active columns from the dataView's internal logic
    const activeColumns = config.options?.getActiveColumns
      ? config.options.getActiveColumns(config.columns, dataView.filters)
      : config.columns;

    return () =>
      React.createElement(MuiDataView.TableComponent, {
        data: dataView.data,
        columns: activeColumns,
        actions: processedRowActions,
        isLoading: dataView.isLoading,
        error: dataView.error,
        selection: {
          enabled: true,
          selectedIds: dataView.selection.selectedIds,
          onSelectionChange: dataView.selection.setSelectedIds,
        },
      });
  }, [
    dataView.data,
    dataView.filters,
    config.columns,
    config.options?.getActiveColumns,
    processedRowActions,
    dataView.isLoading,
    dataView.error,
    dataView.selection,
  ]);

  return (
    <div className={className} style={style}>
      {/* Layer 3: MUI filter rendering */}
      <dataView.FilterComponent />

      {/* Layer 3: MUI action bar rendering with Layer 2 processed actions */}
      <ActionBar
        globalActions={processedGlobalActions}
        bulkActions={processedBulkActions}
        selectedItems={dataView.selection.selectedItems}
        totalItems={dataView.data.length}
        onClearSelection={() => dataView.selection.setSelectedIds([])}
      />

      {/* Layer 3: MUI table rendering with Layer 2 processed row actions */}
      <TableComponentWithActions />

      {/* Layer 3: MUI pagination rendering with state */}
      <PaginationComponentWithState />

      {/* Layer 3: MUI form dialog rendering */}
      {dataView.createDialogOpen && <dataView.CreateFormComponent />}
      {dataView.editDialogOpen && dataView.editingItem && (
        <dataView.EditFormComponent item={dataView.editingItem} />
      )}
      {dataView.deleteDialogOpen && dataView.deletingItem && (
        <Dialog
          open={dataView.deleteDialogOpen}
          onClose={() => dataView.setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => dataView.setDeleteDialogOpen(false)}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              onClick={() => dataView.handleDeleteConfirm()}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
