import React from "react";
import { type UseDataViewOptions } from "@smbc/dataview";
import { usePermissions, type PermissionDefinition, useHashNavigation } from "@smbc/applet-core";
import { 
  MuiDataViewManager,
  type MuiDataViewManagerConfig,
} from "@smbc/dataview-mui";
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
  /** Optional custom action bar component */
  ActionBarComponent?: React.ComponentType<{
    globalActions: any[];
    bulkActions: any[];
    selectedItems: T[];
    totalItems: number;
    onClearSelection: () => void;
    transactionState?: any;
    primaryKey?: keyof T;
  }>;
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
 * MuiDataViewManager (dataview-mui)
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
  ActionBarComponent,
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

  // URL should only be used for initial state, then reflect changes
  const defaultFilters = React.useMemo(() => 
    config.filters?.initialValues || {}, 
    [config.filters?.initialValues]
  );
  
  const defaultPagination = React.useMemo(() => 
    ({ page: 0, pageSize: config.pagination?.defaultPageSize || 10 }), 
    [config.pagination?.defaultPageSize]
  );

  // Stabilize default params to prevent hash navigation from recreating callbacks
  const stableDefaultParams = React.useMemo(() => {
    if (!enableUrlSync) return {};
    return { 
      ...defaultFilters,
      page: defaultPagination.page,
      pageSize: defaultPagination.pageSize
    };
  }, [enableUrlSync, defaultFilters, defaultPagination]);

  // Get initial state from URL on mount only
  const urlState = useHashNavigation({ autoParams: stableDefaultParams });

  // Initialize local state from URL params or defaults (mount only)
  const [localFilters, setLocalFilters] = React.useState(() => {
    if (!enableUrlSync) return defaultFilters;
    const { page, pageSize, ...urlFilters } = urlState.autoParams as any;
    return { ...defaultFilters, ...urlFilters };
  });

  const [localPagination, setLocalPagination] = React.useState(() => {
    if (!enableUrlSync) return defaultPagination;
    return {
      page: (urlState.autoParams as any).page || defaultPagination.page,
      pageSize: (urlState.autoParams as any).pageSize || defaultPagination.pageSize
    };
  });

  // Wrap setters to sync state changes TO url (not FROM url)
  const setFiltersWithUrlSync = React.useCallback((filters: any) => {
    setLocalFilters(filters);
    if (enableUrlSync && urlState.setAutoParams) {
      urlState.setAutoParams((prev) => ({ ...prev, ...filters }));
    }
  }, [enableUrlSync, urlState.setAutoParams]);

  const setPaginationWithUrlSync = React.useCallback((paginationUpdateOrUpdater: any) => {
    let newPagination: any;

    if (typeof paginationUpdateOrUpdater === 'function') {
      setLocalPagination((prev) => {
        newPagination = paginationUpdateOrUpdater(prev);
        return newPagination;
      });
    } else {
      newPagination = paginationUpdateOrUpdater;
      setLocalPagination(newPagination);
    }

    if (enableUrlSync && urlState.setAutoParams) {
      urlState.setAutoParams((prev) => ({ ...prev, ...newPagination }));
    }
  }, [enableUrlSync, urlState.setAutoParams]);

  // State management: local state is source of truth
  const filterState = React.useMemo(() => ({
    filters: localFilters,
    setFilters: setFiltersWithUrlSync,
  }), [localFilters, setFiltersWithUrlSync]);

  const paginationState = React.useMemo(() => ({
    pagination: localPagination,
    setPagination: setPaginationWithUrlSync,
  }), [localPagination, setPaginationWithUrlSync]);

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
      filterState={enableUrlSync ? filterState : undefined}
      paginationState={enableUrlSync ? paginationState : undefined}
      ActionBarComponent={ActionBarComponent || AppletActionBar}
    />
  );
}