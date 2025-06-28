import React from "react";
import { useDataView, type DataViewConfig } from "@smbc/react-dataview";
import { useHashQueryParams, usePermissions, type PermissionDefinition } from "@smbc/applet-core";
import { MuiDataView } from "@smbc/mui-components";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

// MUI-specific configuration that uses PermissionDefinition objects directly
export interface MuiDataViewAppletConfig<T> extends Omit<DataViewConfig<T>, "permissions" | "renderer"> {
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
  onSuccess?: (action: 'create' | 'edit' | 'delete', item?: any) => void;
  onError?: (action: 'create' | 'edit' | 'delete', error: any, item?: any) => void;
}

/**
 * MuiDataViewApplet - Layer 3 component that combines:
 * - Layer 1: useDataView for data management
 * - Layer 2: usePermissions for SMBC business logic  
 * - Layer 3: MUI components for rendering
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

  // Layer 2: SMBC permission checking
  const canCreate = config.permissions?.create 
    ? hasPermission(permissionContext, config.permissions.create)
    : false;

  // Layer 2: SMBC URL state management
  const useUrlSyncedFilters = (defaultFilters: any) => {
    return useHashQueryParams(defaultFilters);
  };

  // Layer 1: Pure data management (no permissions, no UI) - First pass without actions
  const baseConfigWithoutActions: DataViewConfig<T> = {
    ...config,
    renderer: MuiDataView,
    permissions: undefined, // react-dataview doesn't handle permissions
    actions: [], // Empty actions initially
  };

  // Layer 1: Data management
  const dataView = useDataView(baseConfigWithoutActions, {
    useFilterState: useUrlSyncedFilters,
    onSuccess,
    onError,
  });

  // Layer 2: Process actions to connect them to dataView handlers
  const processedActions = config.actions?.map(action => ({
    ...action,
    onClick: (item: T) => {
      if (action.key === 'edit') {
        dataView.handleEdit(item);
      } else if (action.key === 'delete') {
        dataView.handleDelete(item);
      } else {
        // Call the original onClick if it exists
        action.onClick?.(item);
      }
    }
  }));

  // Custom TableComponent that uses the processed actions
  const TableComponentWithActions = React.useMemo(() => {
    return () => React.createElement(MuiDataView.TableComponent, {
      data: dataView.data,
      columns: config.columns,
      actions: processedActions || [],
      isLoading: dataView.isLoading,
      error: dataView.error,
      selection: {
        enabled: true,
        selectedIds: dataView.selection.selectedIds,
        onSelectionChange: dataView.selection.setSelectedIds,
      },
    });
  }, [dataView.data, config.columns, processedActions, dataView.isLoading, dataView.error, dataView.selection]);

  return (
    <div className={className} style={style}>
      {/* Layer 3: MUI rendering */}
      <dataView.FilterComponent />
      
      {/* Layer 2 + 3: Permission-aware action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div />
        {canCreate && (
          <MuiDataView.CreateButtonComponent 
            onClick={dataView.handleCreate}
            label="Create New"
          />
        )}
      </div>

      {/* Layer 3: MUI table rendering with processed actions */}
      <TableComponentWithActions />

      {/* Layer 3: MUI form dialogs */}
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
              Are you sure you want to delete this item? This action cannot be undone.
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