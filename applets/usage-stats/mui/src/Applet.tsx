import React, { useMemo, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridOptions } from "ag-grid-community";
import "ag-grid-enterprise";
import { Filter } from "@smbc/mui-components";
import type { FilterSpec } from "@smbc/mui-components";
import {
  useHashNavigation,
  useApiClient,
  useFeatureFlag,
  type Environment,
} from "@smbc/applet-core";
import type { paths } from "@smbc/usage-stats-api";

interface UsageFilters {
  start_date: string;
  end_date: string;
  group: "UI" | "USER" | "EXCEPTION";
  show_sub: boolean;
  email?: string;
  ui_name?: string;
}

interface UsageStatsResponse {
  component_map: Record<string, string>;
  records: any[];
  total?: number;
}

export interface AppletProps {
  mountPath: string;
}

export const Applet: React.FC<AppletProps> = ({ mountPath: _mountPath }) => {
  const hashState = useHashNavigation({
    defaultParams: {
      start_date: "2025-01-01",
      end_date: "2025-01-01",
      group: "UI" as "UI" | "USER" | "EXCEPTION",
      show_sub: false,
    }
  });
  
  const filters = hashState.params as UsageFilters;
  const setFilters = (updates: Partial<UsageFilters> | ((prev: UsageFilters) => UsageFilters)) => {
    if (typeof updates === 'function') {
      hashState.setParams((prev) => updates(prev as UsageFilters));
    } else {
      hashState.setParams(updates);
    }
  };

  // Get current environment to force remount when it changes
  const environment = useFeatureFlag<Environment>("environment") || "mock";
  const gridRef = useRef<AgGridReact>(null);
  const gridApiRef = useRef<any>(null);

  // Get dark mode state from feature flag
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const agGridThemeClass = isDarkMode
    ? "ag-theme-quartz-dark"
    : "ag-theme-quartz";

  const filterSpec: FilterSpec = {
    fields: [
      {
        name: "start_date",
        label: "Start Date",
        type: "date",
        required: true,
      },
      {
        name: "end_date",
        label: "End Date",
        type: "date",
        required: true,
      },
      {
        name: "group",
        label: "Group",
        type: "select",
        required: true,
        options: [
          { label: "UI", value: "UI" },
          { label: "USER", value: "USER" },
          { label: "EXCEPTION", value: "EXCEPTION" },
        ],
      },
      {
        name: "show_sub",
        label: "Show Subcomponents",
        type: "checkbox",
        hidden: filters.group === "USER",
      },
    ],
  };

  const columnDefs = useMemo((): ColDef[] => {
    switch (filters.group) {
      case "UI":
        return [
          {
            field: "component",
            headerName: "Component",
            cellRenderer: "agGroupCellRenderer",
          },
          {
            field: "count",
            headerName: "Count",
            sort: "desc",
            type: "numericColumn",
          },
        ];
      case "USER":
        return [
          {
            field: "name",
            headerName: "name",
            cellRenderer: "agGroupCellRenderer",
          },
          {
            field: "email",
            headerName: "Email",
          },
          {
            field: "count",
            headerName: "Count",
            sort: "desc",
            type: "numericColumn",
          },
        ];
      case "EXCEPTION":
        return [
          {
            field: "component",
            headerName: "Component",
            sort: "asc",
          },
          {
            field: "name",
            headerName: "name",
          },
          {
            field: "email",
            headerName: "Email",
          },
          {
            field: "resp_cd",
            headerName: "Exception Code",
          },
          {
            field: "resp_msg",
            headerName: "Exception Message",
          },
        ];
      default:
        return [];
    }
  }, [filters.group]);

  // Get API client
  const apiClient = useApiClient<typeof paths>("usage-stats");

  // API endpoint based on group
  const endpoint = useMemo(() => {
    switch (filters.group) {
      case "UI":
        return "/usage-stats/ui-usage/";
      case "USER":
        return "/usage-stats/users-usage/";
      case "EXCEPTION":
        return "/usage-stats/exceptions/";
      default:
        return "/usage-stats/ui-usage/";
    }
  }, [filters.group]);

  // Query parameters (exclude group as it determines the endpoint)
  const queryParams = useMemo(() => {
    const { group, ...apiFilters } = filters;
    return apiFilters;
  }, [filters]);

  // Fetch data with useQuery
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["usage-stats", endpoint, queryParams, environment],
    queryFn: async () => {
      console.log("🔍 React Query fetching:", { environment, endpoint, queryParams });
      const result = await apiClient.GET(endpoint as any, {
        params: { query: queryParams },
      });
      console.log("✅ React Query success:", { environment, recordCount: result.data?.records?.length || 0 });
      return result.data as UsageStatsResponse;
    },
    enabled: !!endpoint,
  });

  // Extract records from response - clear data when environment changes
  const data = useMemo(() => {
    console.log("🔍 Data computation:", {
      environment,
      hasResponse: !!response,
      recordCount: (response as UsageStatsResponse | undefined)?.records?.length || 0,
      queryKey: ["usage-stats", endpoint, queryParams]
    });
    return (response as UsageStatsResponse | undefined)?.records || [];
  }, [response, environment]);

  // Update detail grid themes when dark mode changes
  useEffect(() => {
    const updateDetailGridThemes = () => {
      // Only query within the current grid container to avoid scanning entire DOM
      const mainGrid = document.querySelector(
        ".ag-theme-quartz, .ag-theme-quartz-dark",
      );
      if (!mainGrid) return;

      const detailGrids = mainGrid.querySelectorAll(
        ".ag-details-row .ag-root-wrapper",
      );
      detailGrids.forEach((grid) => {
        const parent = grid.parentElement;
        if (parent) {
          parent.className = agGridThemeClass;
        }
      });
    };

    // Use requestAnimationFrame for better performance
    const rafId = requestAnimationFrame(updateDetailGridThemes);
    return () => cancelAnimationFrame(rafId);
  }, [agGridThemeClass]);

  // Handle grid ready
  const handleGridReady = (params: any) => {
    console.log("🔧 AG Grid ready");
    gridApiRef.current = params.api;
  };

  // AG-Grid options
  const gridOptions = useMemo(
    (): GridOptions => ({
      columnDefs,
      rowData: data,
      onGridReady: handleGridReady,
      // Master-detail configuration for UI and USER groups
      masterDetail: ["UI", "USER"].includes(filters.group),
      detailCellRenderer: ["UI", "USER"].includes(filters.group)
        ? "agDetailCellRenderer"
        : undefined,
      detailCellRendererParams:
        filters.group !== "EXCEPTION"
          ? {
              getDetailRowData: (params: any) => {
                // Build filter based on master row data
                const filterValue = params.data
                  ? params.data[filters.group === "UI" ? "component" : "email"]
                  : null;

                if (!filterValue) {
                  params.successCallback([]);
                  return;
                }

                // Create query params with filter
                const detailQueryParams = {
                  ...queryParams,
                  filter: {
                    [filters.group === "UI" ? "component" : "email"]:
                      filterValue,
                  },
                };

                // Fetch detail data from API using the same endpoint
                apiClient
                  .GET(endpoint as any, {
                    params: {
                      query: detailQueryParams,
                    },
                  })
                  .then((result) => {
                    if (result.data) {
                      params.successCallback(result.data.records || []);
                    } else {
                      params.successCallback([]);
                    }
                  })
                  .catch((error) => {
                    console.error("Failed to fetch detail data:", error);
                    params.successCallback([]);
                  });
              },
              detailGridOptions: {
                columnDefs: [
                  {
                    field: filters.group === "UI" ? "name" : "component",
                    headerName: filters.group === "UI" ? "name" : "Component",
                  },
                  { field: "count" },
                ],
                onCellClicked: (event: any) => {
                  // Get the master row data from the parent context
                  const masterRowNode = event.node.parent;
                  const masterRowData = masterRowNode?.data;

                  // Update filters when detail row is clicked
                  setFilters((prev) => ({
                    ...prev,
                    email: masterRowData?.email || event.data?.email,
                    ui_name: masterRowData?.component || event.data?.component,
                  }));
                },
                onGridReady: (params: any) => {
                  // Apply theme class to detail grid container
                  const detailContainer = params.eGridDiv;
                  if (detailContainer) {
                    detailContainer.className = agGridThemeClass;
                  }
                },
              },
            }
          : undefined,
      // External filtering for sub-components
      isExternalFilterPresent: () =>
        filters.group !== "USER" && filters.show_sub,
      doesExternalFilterPass: (node: any) => {
        if (!node.data?.component) return false;
        return true;
      },
    }),
    [
      columnDefs,
      data,
      filters.group,
      filters.show_sub,
      queryParams,
      endpoint,
      apiClient,
      setFilters,
    ],
  );

  return (
    <Box sx={{ height: "100vh" }}>
      <Filter
        spec={filterSpec}
        values={filters}
        onFiltersChange={setFilters}
        sx={{
          mb: 2,
          // mb: '-4px',
          // borderBottomLeftRadius: 0,
          // borderBottomRightRadius: 0,
        }}
      />
      {/* Main Grid */}
      <Box sx={{ flex: 1, height: "100%", display: "flex" }}>
        {/* Main Table */}
        <Box sx={{ flex: 1, height: "100%" }}>
          {error ? (
            <Box sx={{ p: 2, color: "error.main" }}>
              Error loading data: {error.message}
            </Box>
          ) : (
            <div
              className={agGridThemeClass}
              style={{ height: "100%", width: "100%" }}
            >
              <AgGridReact
                ref={gridRef}
                key={`usage-stats-${environment}`}
                {...gridOptions}
                loading={isLoading}
              />
            </div>
          )}
        </Box>

        {/* Side Panel for Additional Info */}
        {filters.group !== "EXCEPTION" && (
          <Box
            sx={{
              width: "60%",
              borderLeft: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              p: 2,
            }}
          >
            <Box sx={{ typography: "h6", mb: 2 }}>Usage Details</Box>
            <Box sx={{ color: "text.secondary" }}>
              Select a row to view detailed usage information
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
