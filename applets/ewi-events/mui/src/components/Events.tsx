import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Chip,
  IconButton,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { AgGridTheme } from "@smbc/mui-components";
import Page from "./Page";
import type {
  ColDef,
  GridReadyEvent,
  SelectionChangedEvent,
} from "ag-grid-community";
import { useHashNavigation, useAppletCore } from "@smbc/applet-core";
import { FilterBar } from "./FilterBar";
import { ActionBar } from "./ActionBar";
import type { components, paths } from "@smbc/ewi-events-api/types";

type Event = components["schemas"]["Event"];
import { useApiClient } from "@smbc/applet-core";
import { useQuery } from "@tanstack/react-query";

import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as AssignIcon,
  PriorityHigh as PriorityIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";

function useEvents(params: Record<string, any>) {
  const client = useApiClient<paths>("ewi-events");

  // Fetch all events once
  const query = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await client.GET("/events");
      return response.data || [];
    },
  });

  // Apply client-side filters
  const filteredData = React.useMemo(() => {
    const allEvents = query.data || [];
    let filteredEvents = allEvents;

    // Date filtering
    if (params.dateFrom) {
      filteredEvents = filteredEvents.filter(
        (event: Event) =>
          event.event_date && event.event_date >= params.dateFrom,
      );
    }
    if (params.dateTo) {
      filteredEvents = filteredEvents.filter(
        (event: Event) => event.event_date && event.event_date <= params.dateTo,
      );
    }

    // Status filtering (lifecycle status)
    if (
      params.status &&
      ["on-course", "almost-due", "past-due", "needs-attention"].includes(
        params.status,
      )
    ) {
      filteredEvents = filteredEvents.filter(
        (event: Event) => event.lifecycle_status === params.status,
      );
    }

    // Category filtering
    if (
      params.status &&
      ["mandatory", "discretionary"].includes(params.status)
    ) {
      filteredEvents = filteredEvents.filter(
        (event: Event) =>
          event.event_category?.toLowerCase() === params.status.toLowerCase(),
      );
    }

    // Types filtering
    if (params.types) {
      filteredEvents = filteredEvents.filter((event: Event) =>
        event.trigger_type?.includes(params.types),
      );
    }

    return {
      events: filteredEvents,
      allEvents: allEvents,
    };
  }, [query.data, params]);

  // Return query state with filtered data
  return {
    ...query,
    data: filteredData,
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
    <Box sx={{ p: 2, bgcolor: "action.selected", width: "100%" }}>
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
            Description
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {event.description || "No description available"}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 0.5 }}
          >
            Priority
          </Typography>
          <Box sx={{ mb: 1 }}>
            <Chip
              label={event.priority?.toUpperCase() || "Not Set"}
              size="small"
              color={
                event.priority === "high"
                  ? "error"
                  : event.priority === "medium"
                  ? "warning"
                  : "default"
              }
            />
          </Box>
        </Box>

        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 0.5 }}
          >
            Workflow Status
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {event.workflow || "Not Set"}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 0.5 }}
          >
            External Rating
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {event.exRating || "Not Set"}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 0.5 }}
          >
            Created
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {event.createdAt
              ? new Date(event.createdAt).toLocaleDateString()
              : "Unknown"}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 0.5 }}
          >
            Last Updated
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {event.updatedAt
              ? new Date(event.updatedAt).toLocaleDateString()
              : "Unknown"}
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
          transition: "none !important",
          "& .MuiChip-label": {
            px: 1.5,
            py: 0.5,
          },
        }}
        size="small"
      />
    );
  }

  return (
    <Chip
      label={params.value.replace("-", " ").toUpperCase()}
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
          transition: "none !important",
          "& .MuiChip-label": {
            px: 1.5,
            py: 0.5,
          },
        };
      }}
      size="small"
    />
  );
};

// Actions cell renderer - just the menu button
const ActionsCellRenderer = (params: any) => {
  console.log(
    "ActionsCellRenderer: Rendering UPDATED version with menu-only design for row:",
    params.data?.id,
  );

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
        <MenuItem onClick={(e) => handleAction("view", e)}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={(e) => handleAction("edit", e)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Event
        </MenuItem>
        <MenuItem
          onClick={(e) => handleAction("delete", e)}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Event
        </MenuItem>
      </Menu>
    </Box>
  );
};

const EventsAgGrid: React.FC = () => {
  const { theme } = useAppletCore();
  const gridRef = React.useRef<AgGridReact>(null);

  const { params, setParams } = useHashNavigation({
    defaultParams: {
      dateFrom: "",
      dateTo: "",
      status: "",
      exRatings: "",
      workflow: "",
      priority: "",
      sortBy: "",
      sortDirection: "",
    },
  });

  // State
  const [selectedRows, setSelectedRows] = useState<Event[]>([]);
  const [pageSize, setPageSize] = useState(25);

  // Fetch data using the API client with keepPreviousData to avoid blanking
  // Only include filters in the query, let AG Grid handle sorting client-side
  const { data, isLoading, error, isFetching } = useEvents(params);

  // Debug logging for data state
  React.useEffect(() => {
    console.log("EventsAgGrid: Data state changed:", {
      hasData: !!data?.events?.length,
      dataLength: data?.events?.length,
      isLoading,
      isFetching,
      error: !!error,
      actualData: data?.events?.slice(0, 2), // Log first 2 items
    });
  }, [data, isLoading, isFetching, error]);

  const columnDefs: ColDef[] = useMemo(() => {
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
      },
      {
        // Master detail column for expand/collapse
        cellRenderer: "agGroupCellRenderer",
        headerName: "",
        width: 50,
        cellRendererParams: {
          innerRenderer: () => "", // No content in the cell
        },
        pinned: "left",
        lockPosition: true,
        sortable: false,
        filter: false,
        suppressMenu: true,
        cellClass: "expand-cell",
      },
      {
        minWidth: 180,
        headerName: "Lifecycle Status",
        field: "lifecycle_status",
        pinned: "left",
        cellRenderer: StatusCellRenderer,
        suppressMenu: true,
      },
      {
        headerName: "Event Workflow Status",
        field: "workflow_status",
        suppressMenu: true,
      },
      {
        headerName: "Event Category",
        field: "event_category",
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
        headerName: "Event Date",
        field: "event_date",
        valueFormatter: ({ value }) => (value ? value.split("T")[0] : "---"),
        suppressMenu: true,
      },
      {
        headerName: "Event Trigger Type",
        field: "trigger_type",
        suppressMenu: true,
      },
      {
        headerName: "Event Trigger Shortname",
        field: "trigger_shortname",
        minWidth: 120,
        suppressMenu: true,
      },
      {
        headerName: "Event Trigger Values",
        field: "trigger_values",
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
      },
    ];
  }, []);

  // Debug log AG Grid rendering
  React.useEffect(() => {
    console.log("EventsAgGrid: AG Grid render check:", {
      hasColumnDefs: !!columnDefs?.length,
      columnDefCount: columnDefs?.length,
      hasRowData: !!data?.events?.length,
      rowDataCount: data?.events?.length,
    });
  }, [columnDefs, data?.events]);

  // Check if grid ref is set
  React.useEffect(() => {
    console.log("🔍 Grid ref check:", {
      gridRef: !!gridRef.current,
      gridRefCurrent: gridRef.current
    });
  }, []);

  // Event handlers
  const onGridReady = useCallback(({ api }: GridReadyEvent) => {
    console.log("🔥 AG Grid onGridReady called! Grid is mounting successfully");
    api.sizeColumnsToFit();
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

  // Mock workflow actions
  const workflowActions = useMemo(
    () => [
      {
        type: "bulk" as const,
        key: "bulk-approve",
        label: "Bulk Approve",
        icon: ApproveIcon,
        color: "success" as const,
        onClick: (selectedItems: any[]) => {
          console.log("Bulk approve:", selectedItems);
        },
        appliesTo: (event: any) => event.status !== "on-course",
      },
      {
        type: "bulk" as const,
        key: "bulk-reject",
        label: "Bulk Reject",
        icon: RejectIcon,
        color: "error" as const,
        onClick: (selectedItems: any[]) => {
          console.log("Bulk reject:", selectedItems);
        },
        appliesTo: (event: any) => event.status !== "past-due",
      },
      {
        type: "bulk" as const,
        key: "assign-user",
        label: "Assign to User",
        icon: AssignIcon,
        color: "primary" as const,
        onClick: (selectedItems: any[]) => {
          console.log("Assign to user:", selectedItems);
        },
      },
      {
        type: "bulk" as const,
        key: "change-priority",
        label: "Change Priority",
        icon: PriorityIcon,
        color: "warning" as const,
        onClick: (selectedItems: any[]) => {
          console.log("Change priority:", selectedItems);
        },
      },
    ],
    [],
  );

  // Calculate status counts from complete unfiltered dataset
  const statusCounts = React.useMemo(() => {
    const allEvents = data?.allEvents || [];
    return {
      onCourse: allEvents.filter(
        (event: Event) => event.lifecycle_status === "on-course",
      ).length,
      almostDue: allEvents.filter(
        (event: Event) => event.lifecycle_status === "almost-due",
      ).length,
      pastDue: allEvents.filter(
        (event: Event) => event.lifecycle_status === "past-due",
      ).length,
      needsAttention: allEvents.filter(
        (event: Event) => event.lifecycle_status === "needs-attention",
      ).length,
      discretionary: allEvents.filter(
        (event: Event) => event.event_category === "Discretionary",
      ).length,
      mandatory: allEvents.filter(
        (event: Event) => event.event_category === "Mandatory",
      ).length,
    };
  }, [data]);

  return (
    <Page
      theme={theme}
      error={error ? new Error(`Error loading events: ${error.message}`) : null}
      header={
        <FilterBar
          values={params}
          onValuesChange={setParams}
          onApply={() => {}}
        />
      }
    >
      <ActionBar
        values={params}
        onValuesChange={setParams}
        statusCounts={statusCounts}
        workflowActions={workflowActions}
        selectedItems={selectedRows}
      />

      <AgGridTheme wrapHeaders={true}>
        <div style={{ border: '2px solid red', padding: '10px', margin: '10px' }}>
          Debug: AG Grid Container - Data length: {data?.events?.length || 0}
          <br />AgGridReact component should render below this line:
        </div>
        {(() => { console.log("🚨 About to render AgGridReact component"); return null; })()}
        <AgGridReact
          ref={gridRef}
          headerHeight={70}
          rowData={data?.events || []}
          columnDefs={columnDefs}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          onGridReady={onGridReady}
          onSelectionChanged={onSelectionChanged}
          onRowGroupOpened={onRowGroupOpened}
          loading={isLoading}
          animateRows={true}
          cellSelection={true}
          pagination={true}
          paginationPageSize={pageSize}
          paginationPageSizeSelector={[10, 25, 50, 100]}
          onPaginationChanged={(event) => {
            if (event.api) {
              const newPageSize = event.api.paginationGetPageSize();
              if (newPageSize !== pageSize) {
                setPageSize(newPageSize);
              }
            }
          }}
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
                backgroundColor: theme.palette.action.selected,
              };
            }
            return undefined;
          }}
        />
      </AgGridTheme>
    </Page>
  );
};

export default EventsAgGrid;
