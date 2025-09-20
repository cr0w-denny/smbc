import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Chip,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ThemeProvider,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { AgGridTheme, ConfigurableCard, darkTheme } from "@smbc/mui-components";
import { AppletPage } from "@smbc/mui-applet-core";
import type {
  ColDef,
  GridReadyEvent,
  SelectionChangedEvent,
} from "ag-grid-community";
import { useHashNavigationWithApply } from "@smbc/applet-core";
import { FilterBar } from "./FilterBar";
import { ActionBar } from "./ActionBar";
import type { components, paths } from "@smbc/ewi-events-api/types";

type Event = components["schemas"]["Event"];
import { useApiClient } from "@smbc/applet-core";
import { useQuery } from "@tanstack/react-query";

import {
  MoreVert as MoreIcon,
  AddCircle as AddCircleIcon,
  List as ListIcon,
} from "@smbc/mui-components";
import {
  PersonAdd as PersonAddIcon,
  SupervisorAccount as SupervisorAccountIcon,
  FileDownload as FileDownloadIcon,
  Print as PrintIcon,
  ViewColumn as ViewColumnIcon,
  FilterListOff as FilterListOffIcon,
} from "@mui/icons-material";

function useEvents(params: Record<string, any>) {
  const client = useApiClient<paths>("ewi-events");

  // Server-side filters: dates, status (lifecycle_status), types (trigger_type)
  const serverParams = React.useMemo(() => {
    const queryParams: Record<string, any> = {};
    if (params.dateFrom) {
      queryParams.start_date = params.dateFrom;
    }
    if (params.dateTo) {
      queryParams.end_date = params.dateTo;
    }
    if (params.status) {
      queryParams.status = params.status;
    }
    if (
      params.types &&
      Array.isArray(params.types) &&
      params.types.length > 0
    ) {
      queryParams.types = params.types.join(",");
    }
    return queryParams;
  }, [params.dateFrom, params.dateTo, params.status, params.types]);

  // Fetch events with server-side filtering
  const query = useQuery({
    queryKey: ["events", serverParams],
    queryFn: async () => {
      const response = await client.GET("/events", {
        params: {
          query: serverParams,
        },
      });
      return response.data || [];
    },
  });

  // Apply client-side filters: workflow (workflow_status), category (event_category)
  const data = React.useMemo(() => {
    const allEvents = query.data || [];
    let filteredEvents = allEvents;

    // Workflow filtering (client-side)
    if (params.workflow) {
      filteredEvents = filteredEvents.filter(
        (event: Event) => event.workflow_status === params.workflow,
      );
    }

    // Category filtering (client-side) - for discretionary/mandatory filter chips
    if (params.category) {
      filteredEvents = filteredEvents.filter(
        (event: Event) => event.event_category === params.category,
      );
    }

    return {
      events: filteredEvents,
      allEvents: allEvents,
    };
  }, [query.data, params.workflow, params.category]);

  // Return query state with server-filtered data
  return {
    ...query,
    data: data,
  };
}

// Detail cell renderer for expandable rows
const DetailCellRenderer = (params: any) => {
  // Only render the detail content in the full-width detail row, not in individual cells
  if (!params.node.detail) {
    return null;
  }

  const event = params.node.parent.data; // Get parent row data for master-detail

  return (
    <Box sx={{ p: 2, width: "100%", height: "100%" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Event Details: {event.id}
      </Typography>

      <Box
        sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 0.5 }}
          >
            Workflow Status
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {event.workflow_status || "Not Set"}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 0.5 }}
          >
            Trigger Values
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {event.trigger_values || "Not Set"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// Status cell renderer
const StatusCellRenderer = (params: any) => {
  const getStatusConfig = (status: string, isDark: boolean) => {
    const lightConfig = {
      "on-course": { outline: "#12A187", fill: "#FAFDFD", text: "#1A1A1A" },
      "almost-due": { outline: "#FD992E", fill: "#FFFCFB", text: "#1A1A1A" },
      "past-due": { outline: "#CD463C", fill: "#FDF9F9", text: "#1A1A1A" },
      "needs-attention": {
        outline: "#A32B9A",
        fill: "#FDF9FD",
        text: "#1A1A1A",
      },
      default: { outline: "#757575", fill: "#F5F5F5", text: "#1A1A1A" },
    };

    const darkConfig = {
      "on-course": {
        outline: "#12A187",
        fill: "rgba(18, 161, 135, 0.1)",
        text: "#12A187",
      },
      "almost-due": {
        outline: "#FD992E",
        fill: "rgba(253, 153, 46, 0.1)",
        text: "#FD992E",
      },
      "past-due": {
        outline: "#CD463C",
        fill: "rgba(205, 70, 60, 0.1)",
        text: "#CD463C",
      },
      "needs-attention": {
        outline: "#A32B9A",
        fill: "rgba(163, 43, 154, 0.1)",
        text: "#A32B9A",
      },
      default: {
        outline: "#757575",
        fill: "rgba(117, 117, 117, 0.1)",
        text: "#757575",
      },
    };

    const config = isDark ? darkConfig : lightConfig;
    return config[status as keyof typeof config] || config.default;
  };

  // Handle undefined or null values
  if (!params.value) {
    return (
      <Chip
        label="UNKNOWN"
        sx={{
          backgroundColor: "#F5F5F5",
          color: "#757575",
          border: "1px solid #757575",
          fontSize: "12px",
          fontWeight: 500,
          height: "24px",
          width: "160px",
          transition: "none !important",
          "& .MuiChip-label": {
            px: 1.5,
            py: 0.5,
            textAlign: "center",
            width: "100%",
          },
        }}
        size="small"
      />
    );
  }

  return (
    <Chip
      label={params.value
        .replace("-", " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase())}
      sx={(theme: any) => {
        const isDark = theme.palette.mode === "dark";
        const config = getStatusConfig(params.value, isDark);

        return {
          backgroundColor: config.fill,
          color: config.text,
          border: `1px solid ${config.outline}`,
          fontSize: "12px",
          fontWeight: 500,
          height: "24px",
          width: "160px",
          transition: "none !important",
          "& .MuiChip-label": {
            px: 1.5,
            py: 0.5,
            textAlign: "center",
            width: "100%",
          },
        };
      }}
      size="small"
    />
  );
};

// Actions cell renderer - just the menu button
const createActionsCellRenderer =
  (navigate: (path: string) => void) => (params: any) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      console.log(
        "ActionsCellRenderer: Menu button clicked for row:",
        params.data?.id,
      );
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleAction = (action: string, event: React.MouseEvent) => {
      event.stopPropagation();
      console.log(`${action} action for:`, params.data);

      if (action === "view" && params.data?.id) {
        // Navigate to event details applet with event ID as query param
        navigate(`/events/detail?id=${params.data.id}`);
      }

      handleMenuClose();
    };

    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <IconButton
          size="small"
          color="inherit"
          onClick={handleMenuClick}
          title="More Actions"
          aria-controls={open ? "row-actions-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <MoreIcon fontSize="small" />
        </IconButton>
        <Menu
          id="row-actions-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          slotProps={{
            paper: {
              "aria-labelledby": "row-actions-button",
              sx: {
                boxShadow:
                  "0px 2px 4px rgba(0,0,0,0.1), 0px 4px 8px rgba(0,0,0,0.08)",
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem
            component="a"
            href={`#/events/detail?id=${params.data.id}`}
            onClick={(e) => {
              // Allow Cmd+Click (metaKey) or Ctrl+Click (ctrlKey) to open in new tab
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                handleAction("view", e);
              }
            }}
          >
            <ListIcon fontSize="small" sx={{ mr: 1 }} />
            Show Details
          </MenuItem>
          <MenuItem onClick={(e) => handleAction("add-1lod-analyst", e)}>
            <PersonAddIcon fontSize="small" sx={{ mr: 1 }} />
            Add 1 LOD Analyst(s)
          </MenuItem>
          <MenuItem onClick={(e) => handleAction("add-1lod-management", e)}>
            <SupervisorAccountIcon fontSize="small" sx={{ mr: 1 }} />
            Add 1 LOD Management Reviewer(s)
          </MenuItem>
          <MenuItem onClick={(e) => handleAction("add-gbr-number", e)}>
            <AddCircleIcon fontSize="small" sx={{ mr: 1 }} />
            Add GBR Application Number
          </MenuItem>
        </Menu>
      </Box>
    );
  };

const EventsAgGrid: React.FC = () => {
  const gridRef = React.useRef<AgGridReact>(null);
  const popupParentRef = React.useRef<HTMLDivElement>(null);

  const [popupParent, setPopupParent] = useState<HTMLElement | null>(null);

  // Set popup parent after component mounts
  React.useEffect(() => {
    if (popupParentRef.current) {
      setPopupParent(popupParentRef.current);
    }
  }, []);

  const {
    params: filterValues,
    setParams: setFilterValues,
    appliedParams: urlParams,
    applyParams,
    hasChanges: filtersChanged,
    navigate,
  } = useHashNavigationWithApply({
    defaultParams: {
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // Today - 1 month
      dateTo: new Date().toISOString().split("T")[0], // Today
      status: "",
      workflow: "",
      types: "",
      category: "",
      plo: "",
      my: "",
    },
  });

  // Helper to transform CSV strings to arrays (keep booleans as strings)
  const transformParams = (params: any) => {
    const transformed = { ...params };
    // Convert CSV strings to arrays for internal use
    ["types", "plo"].forEach((field) => {
      if (typeof transformed[field] === "string" && transformed[field]) {
        transformed[field] = transformed[field].split(",");
      } else if (!transformed[field]) {
        transformed[field] = [];
      }
    });
    // Keep 'my' as string for consistency
    return transformed;
  };

  // Transform filter values for UI (arrays and convert 'my' to boolean for checkbox)
  const params = React.useMemo(() => {
    const transformed = transformParams(filterValues);
    // Convert 'my' to boolean for checkbox display
    transformed.my = transformed.my === "true" || transformed.my === true;
    return transformed;
  }, [filterValues]);

  // Transform applied filters for data fetching (arrays)
  const appliedParams = React.useMemo(
    () => transformParams(urlParams),
    [urlParams],
  );

  // Update UI filter state (convert boolean back to string)
  const setParams = React.useCallback(
    (newParams: any) => {
      console.log("setParams received:", newParams);

      // Clean the params - remove any non-filter fields
      const toSet: any = {};
      const validFields = [
        "dateFrom",
        "dateTo",
        "status",
        "workflow",
        "types",
        "category",
        "plo",
        "my",
      ];

      validFields.forEach((field) => {
        if (field in newParams) {
          toSet[field] = newParams[field];
        }
      });

      // Convert boolean to string for storage
      if (typeof toSet.my === "boolean") {
        toSet.my = toSet.my ? "true" : "";
      } else if (toSet.my && typeof toSet.my === "object") {
        // Prevent passing event objects
        console.error("Received object for my field:", toSet.my);
        toSet.my = "";
      }

      setFilterValues(toSet);
    },
    [setFilterValues],
  );

  // Apply filters function - updates URL and triggers data fetch
  const handleApplyFilters = React.useCallback(
    (valuesToApply?: any) => {
      const values = valuesToApply || filterValues;
      const transformed = { ...values };

      // Validate all values are serializable before sending to URL
      Object.keys(transformed).forEach((key) => {
        const val = transformed[key];
        // Check for non-serializable objects (like DOM events)
        if (
          val &&
          typeof val === "object" &&
          !Array.isArray(val) &&
          !(val instanceof Date)
        ) {
          console.error(`Warning: Non-serializable value for ${key}:`, val);
          // Reset to default
          if (key === "my") {
            transformed[key] = "";
          } else {
            transformed[key] = "";
          }
        }
      });

      // Convert arrays to CSV strings for URL
      ["types", "plo"].forEach((field) => {
        if (Array.isArray(transformed[field])) {
          transformed[field] =
            transformed[field].length > 0 ? transformed[field].join(",") : "";
        }
      });

      // Handle 'my' field - ensure it's a string
      if (typeof transformed.my === "boolean") {
        transformed.my = transformed.my ? "true" : "";
      } else if (transformed.my === "true" || transformed.my === true) {
        transformed.my = "true";
      } else if (
        !transformed.my ||
        transformed.my === "false" ||
        transformed.my === false
      ) {
        transformed.my = "";
      }

      applyParams(transformed);
    },
    [filterValues, applyParams],
  );

  const [selectedRows, setSelectedRows] = useState<Event[]>([]);

  const { data, isLoading, error } = useEvents(appliedParams);

  const columnDefs: ColDef[] = useMemo(() => {
    const ActionsCellRenderer = createActionsCellRenderer(navigate);
    return [
      {
        field: "checkbox",
        headerName: "",
        maxWidth: 30,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        sortable: false,
        filter: false,
        pinned: "left",
        resizable: false,
        lockPosition: true,
        suppressColumnsToolPanel: true,
      },
      {
        // Master detail column for expand/collapse
        cellRenderer: "agGroupCellRenderer",
        headerName: "",
        width: 60,
        minWidth: 60,
        cellRendererParams: {
          innerRenderer: () => "", // No content in the cell
        },
        pinned: "left",
        lockPosition: true,
        sortable: false,
        filter: false,
        suppressMenu: true,
        cellClass: "expand-cell",
        suppressColumnsToolPanel: true,
      },
      {
        headerName: "Event Date",
        field: "event_date",
        valueFormatter: ({ value }) => (value ? value.split("T")[0] : "---"),
        suppressMenu: true,
      },
      {
        headerName: "Category",
        field: "event_category",
        suppressMenu: true,
      },
      {
        headerName: "Workflow Status",
        field: "workflow_status",
        suppressMenu: true,
      },
      {
        headerName: "Obligor Name",
        field: "obligor",
        suppressMenu: true,
      },
      {
        headerName: "SUN ID",
        field: "sun_id",
        suppressMenu: true,
      },
      {
        headerName: "PLO",
        field: "plo",
        suppressMenu: true,
      },
      {
        headerName: "Exposure $",
        field: "exposure",
        suppressMenu: true,
      },
      {
        headerName: "Trigger",
        field: "trigger_shortname",
        minWidth: 120,
        suppressMenu: true,
      },
      {
        headerName: "Trigger Type",
        field: "trigger_type",
        suppressMenu: true,
      },
      {
        headerName: "Trigger Values",
        field: "trigger_values",
        suppressMenu: true,
        hide: true,
      },
      {
        minWidth: 180,
        headerName: "Lifecycle Status",
        field: "lifecycle_status",
        cellRenderer: StatusCellRenderer,
        pinned: "right",
        suppressMenu: true,
      },
      {
        field: "actions",
        headerName: "",
        maxWidth: 50,
        sortable: false,
        filter: false,
        cellRenderer: ActionsCellRenderer,
        pinned: "right",
        suppressMenu: true,
        resizable: false,
        cellClass: "actions-cell",
        suppressColumnsToolPanel: true,
      },
    ];
  }, [navigate]);

  // Check if grid ref is set
  React.useEffect(() => {
    console.log("🔍 Grid ref check:", {
      gridRef: !!gridRef.current,
      gridRefCurrent: gridRef.current,
    });
  }, []);

  // Cleanup resize listener on unmount
  React.useEffect(() => {
    return () => {
      if (gridRef.current?.api && (gridRef.current.api as any).resizeCleanup) {
        (gridRef.current.api as any).resizeCleanup();
      }
    };
  }, []);

  // Event handlers
  const onGridReady = useCallback(({ api }: GridReadyEvent) => {
    api.sizeColumnsToFit();

    // Set initial sort order: event category, event date, obligor
    api.applyColumnState({
      state: [
        { colId: "event_category", sort: "asc", sortIndex: 0 },
        { colId: "event_date", sort: "asc", sortIndex: 1 },
        { colId: "obligor", sort: "asc", sortIndex: 2 },
      ],
      defaultState: { sort: null },
    });

    // Add window resize listener
    const handleResize = () => {
      api.sizeColumnsToFit();
    };

    window.addEventListener("resize", handleResize);

    // Store cleanup function on the api object
    (api as any).resizeCleanup = () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Recalculate column widths when columns are shown/hidden
  const onColumnVisible = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.sizeColumnsToFit();
    }
  }, []);

  const onRowGroupOpened = useCallback((event: any) => {
    console.log("Row group opened/closed:", event.node.expanded);
    // Force refresh of row styles
    event.api.redrawRows();
  }, []);

  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  }, []);

  // Workflow actions
  const workflowActions = useMemo(
    () => [
      {
        type: "bulk" as const,
        key: "add-1lod-analyst",
        label: "Add 1 LOD Analyst(s)",
        icon: PersonAddIcon,
        color: "primary" as const,
        onClick: (selectedItems: any[]) => {
          console.log("Add 1 LOD Analyst(s):", selectedItems);
        },
      },
      {
        type: "bulk" as const,
        key: "add-1lod-management",
        label: "Add 1 LOD Management Reviewer(s)",
        icon: SupervisorAccountIcon,
        color: "primary" as const,
        onClick: (selectedItems: any[]) => {
          console.log("Add 1 LOD Management Reviewer(s):", selectedItems);
        },
      },
    ],
    [],
  );

  // Calculate status counts from filtered dataset
  const statusCounts = React.useMemo(() => {
    const filteredEvents = data?.events || [];
    return {
      onCourse: filteredEvents.filter(
        (event: Event) => event.lifecycle_status === "on-course",
      ).length,
      almostDue: filteredEvents.filter(
        (event: Event) => event.lifecycle_status === "almost-due",
      ).length,
      pastDue: filteredEvents.filter(
        (event: Event) => event.lifecycle_status === "past-due",
      ).length,
      discretionary: filteredEvents.filter(
        (event: Event) => event.event_category === "Discretionary",
      ).length,
      mandatory: filteredEvents.filter(
        (event: Event) => event.event_category === "Mandatory",
      ).length,
    };
  }, [data]);

  return (
    <AppletPage
      maxWidth={{ xs: "96%", sm: "96%", md: "88%", lg: "88%", xl: "92%" }}
      error={error ? new Error(`Error loading events: ${error.message}`) : null}
      height="100%"
      toolbarHeight={175}
      toolbar={
        <ThemeProvider theme={darkTheme}>
          <FilterBar
            values={params}
            onValuesChange={setParams}
            onApply={handleApplyFilters}
            filtersChanged={filtersChanged}
          />
          <ActionBar
            values={params}
            onValuesChange={setParams}
            onApply={handleApplyFilters}
            statusCounts={statusCounts}
            workflowActions={workflowActions}
            selectedItems={selectedRows}
            gridRef={gridRef}
          />
        </ThemeProvider>
      }
    >
      <ConfigurableCard
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            Events Workflow
            <Chip label={data?.events?.length || 0} size="small" />
          </Box>
        }
        menuItems={[
          {
            label: "Export Data",
            icon: <FileDownloadIcon fontSize="small" />,
            onClick: () => {
              // TODO: Implement export functionality
              console.log("Export data");
            },
          },
          {
            label: "Print Report",
            icon: <PrintIcon fontSize="small" />,
            onClick: () => {
              // TODO: Implement print functionality
              console.log("Print report");
            },
          },
          {
            label: "Column Settings",
            icon: <ViewColumnIcon fontSize="small" />,
            onClick: () => {
              if (gridRef?.current?.api) {
                gridRef.current.api.showColumnChooser();
              }
            },
          },
          {
            label: "Reset Filters",
            icon: <FilterListOffIcon fontSize="small" />,
            onClick: () => {
              const resetValues = {
                dateFrom: "",
                dateTo: "",
                status: "",
                category: "",
                exRatings: "",
                workflow: "",
                priority: "",
                types: "",
                plo: "",
                my: "",
              };
              setParams(resetValues);
              if (gridRef?.current?.api) {
                gridRef.current.api.setFilterModel(null);
              }
            },
            divider: true,
          },
        ]}
        sx={{ height: "100%" }}
      >
        <AgGridTheme
          height="95%"
          wrapHeaders={true}
          popupParentRef={popupParentRef}
        >
          <AgGridReact
            ref={gridRef}
            headerHeight={54}
            popupParent={popupParent}
            rowData={data?.events || []}
            columnDefs={columnDefs}
            rowSelection="multiple"
            suppressRowClickSelection={true}
            onGridReady={onGridReady}
            onSelectionChanged={onSelectionChanged}
            onRowGroupOpened={onRowGroupOpened}
            onColumnVisible={onColumnVisible}
            loading={isLoading}
            animateRows={true}
            cellSelection={true}
            pagination={false}
            suppressHorizontalScroll={false}
            alwaysShowHorizontalScroll={false}
            masterDetail={true}
            detailCellRenderer={DetailCellRenderer}
            detailRowHeight={200}
            isRowMaster={(dataItem) => {
              // All rows can be expanded
              console.log("isRowMaster called for:", dataItem);
              return true;
            }}
            getRowStyle={(params) => {
              console.log("getRowStyle called:", {
                id: params.data?.id,
                expanded: params.node.expanded,
                nodeLevel: params.node.level,
                detail: params.node.detail,
              });
              if (params.node.expanded) {
                return {
                  borderBottom: "none",
                };
              }
              return undefined;
            }}
            defaultColDef={{
              sortable: true,
              resizable: true,
            }}
            sortingOrder={["asc", "desc"]}
            multiSortKey={"ctrl"}
          />
        </AgGridTheme>
      </ConfigurableCard>
    </AppletPage>
  );
};

export default EventsAgGrid;
