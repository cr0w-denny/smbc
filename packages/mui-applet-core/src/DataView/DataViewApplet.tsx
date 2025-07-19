import React from "react";
import { type UseDataViewOptions } from "@smbc/react-query-dataview";
import { usePermissions, type PermissionDefinition, useHashParams } from "@smbc/applet-core";
import { 
  MuiDataViewManager,
  type MuiDataViewManagerConfig,
} from "@smbc/react-query-dataview-mui";
import { ActionBar } from "../ActionBar";
import { Add as AddIcon } from "@mui/icons-material";

// Applet-specific configuration that adds permissions to the base manager config
export interface MuiDataViewAppletConfig<T>
  extends Omit<MuiDataViewManagerConfig<T>, 'permissions'> {
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
  /** Enable URL hash parameter synchronization (default: true) */
  enableUrlSync?: boolean;
  /** Optional initial state from URL or external source */
  initialState?: {
    filters?: Record<string, any>;
    pagination?: { page: number; pageSize: number };
  };
  /** Optional callback for state changes (for URL sync) */
  onStateChange?: (state: {
    filters: Record<string, any>;
    pagination: { page: number; pageSize: number };
  }) => void;
  /** Optional useDataView options */
  options?: UseDataViewOptions;
}

/**
 * MuiDataViewApplet - Applet-specific data view with permissions and URL synchronization
 *
 * ARCHITECTURE OVERVIEW:
 * This component focuses on applet-specific concerns and delegates generic functionality
 * to MuiDataViewOrchestrator:
 *
 * MuiDataViewApplet (mui-applet-core) - This component
 * - Converts PermissionDefinitions to boolean permissions
 * - Handles URL hash parameter synchronization  
 * - Integrates ActionBar component
 * - Provides applet-specific callbacks and configuration
 *
 * MuiDataViewManager (react-query-dataview-mui)
 * - Generic data view management
 * - API calls, caching, optimistic updates
 * - Form dialogs and delete confirmations
 * - Transaction state management
 * - MUI component integration
 *
 * FLOW EXAMPLE:
 * 1. User clicks "Edit" button (ActionBar)
 * 2. MuiDataViewApplet checks permissions
 * 3. MuiDataViewManager handles the actual edit dialog and API call
 * 4. MUI components render the edit form dialog
 */
export function MuiDataViewApplet<T extends Record<string, any>>({
  config,
  className,
  style,
  permissionContext = "default",
  onSuccess,
  onError,
  enableUrlSync = true,
  initialState,
  onStateChange,
  options,
}: MuiDataViewAppletProps<T>) {
  console.log('🎯 MuiDataViewApplet render', { 
    enableUrlSync, 
    permissionContext,
    configFiltersInitial: config.filters?.initialValues,
    configPaginationDefault: config.pagination?.defaultPageSize,
    hasOptions: !!options
  });
  
  const { hasPermission } = usePermissions();

  // Applet-specific: Convert PermissionDefinitions to boolean permissions
  const canCreate = config.permissions?.create
    ? hasPermission(permissionContext, config.permissions.create)
    : false;

  // Applet-specific: URL hash parameter synchronization
  const defaultFilters = React.useMemo(() => 
    config.filters?.initialValues || {}, 
    [config.filters?.initialValues]
  );
  
  const defaultPagination = React.useMemo(() => 
    ({ page: 0, pageSize: config.pagination?.defaultPageSize || 10 }), 
    [config.pagination?.defaultPageSize]
  );

  // URL sync functionality - combine filters and pagination into single state
  const defaultState = React.useMemo(() => ({
    ...defaultFilters,
    page: defaultPagination.page,
    pageSize: defaultPagination.pageSize
  }), [defaultFilters, defaultPagination]);
  
  const urlState = useHashParams(defaultState, {
    enabled: enableUrlSync
  });

  // Stabilize URL state setters to prevent focus loss
  const setUrlFilters = React.useCallback(
    (filters: any) => {
      console.log('🎯 setUrlFilters called', { filters, enableUrlSync });
      if (enableUrlSync) {
        // Use direct update, not function wrapper
        urlState.setState((prev) => ({ ...prev, ...filters }));
      }
    },
    [enableUrlSync, urlState.setState]
  );
  
  const setUrlPagination = React.useCallback(
    (paginationUpdateOrUpdater: any) => {
      if (enableUrlSync) {
        if (typeof paginationUpdateOrUpdater === 'function') {
          // It's an updater function - extract pagination and apply
          urlState.setState((prev) => {
            const currentPagination = { page: prev.page, pageSize: prev.pageSize };
            const newPagination = paginationUpdateOrUpdater(currentPagination);
            return { ...prev, ...newPagination };
          });
        } else {
          // It's an object - merge with previous state
          urlState.setState((prev) => ({ ...prev, ...paginationUpdateOrUpdater }));
        }
      }
    },
    [enableUrlSync, urlState.setState]
  );

  // Extract filters and pagination from URL state
  const urlFilters = React.useMemo(() => {
    if (!enableUrlSync) return {};
    const { page, pageSize, ...filters } = urlState.state;
    return filters;
  }, [enableUrlSync, urlState.state]);
  
  const urlPagination = React.useMemo(() => {
    if (!enableUrlSync) return defaultPagination;
    return { page: urlState.state.page || 0, pageSize: urlState.state.pageSize || 10 };
  }, [enableUrlSync, urlState.state, defaultPagination]);

  // Prepare state for the orchestrator
  const filterState = enableUrlSync ? {
    filters: urlFilters,
    setFilters: setUrlFilters,
  } : undefined;

  const paginationState = enableUrlSync ? {
    pagination: urlPagination,
    setPagination: setUrlPagination,
  } : undefined;

  // Process actions with permission filtering and add default create action
  const processedConfig = React.useMemo(() => {
    const processedActions = { ...config.actions };
    
    // Add default create action based on permissions if none configured
    if (canCreate && !processedActions.global?.some((action) => action.key === "create")) {
      processedActions.global = [
        ...(processedActions.global || []),
        {
          type: "global" as const,
          key: "create",
          label: "Create New",
          icon: AddIcon,
          color: "primary" as const,
          onClick: () => {}, // Will be handled by orchestrator
        },
      ];
    }

    // Strip applet-specific permissions before passing to manager
    const { permissions, ...managerConfig } = config;

    return {
      ...managerConfig,
      actions: processedActions,
    };
  }, [config, canCreate]);

  // Applet-specific ActionBar component that integrates with the manager
  const AppletActionBar = React.useCallback((props: {
    globalActions: any[];
    bulkActions: any[];
    selectedItems: T[];
    totalItems: number;
    onClearSelection: () => void;
    transactionState?: any;
    primaryKey?: keyof T;
  }) => (
    <ActionBar
      globalActions={props.globalActions}
      bulkActions={props.bulkActions}
      selectedItems={props.selectedItems}
      totalItems={props.totalItems}
      onClearSelection={props.onClearSelection}
      transactionState={props.transactionState}
      primaryKey={props.primaryKey}
    />
  ), []);

  return (
    <MuiDataViewManager
      config={processedConfig}
      className={className}
      style={style}
      onSuccess={onSuccess}
      onError={onError}
      initialState={initialState}
      onStateChange={onStateChange}
      options={options}
      filterState={filterState}
      paginationState={paginationState}
      ActionBarComponent={AppletActionBar}
    />
  );
}