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
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Send as SendIcon,
  CancelScheduledSend as CancelScheduledSendIcon,
  AssignmentAdd as AssignmentAddIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AddCircle as AddCircleIcon,
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
const ActionsCellRenderer = (params: any) => {
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

  const { params: rawParams, setParams: setRawParams } = useHashNavigation({
    defaultParams: {
      dateFrom: "",
      dateTo: "",
      status: "",
      workflow: "",
      types: "",
      category: "",
      sortBy: "",
      sortDirection: "",
    },
  });

  // Transform params to handle types as CSV
  const params = React.useMemo(() => {
    const transformed = { ...rawParams };
    // Convert CSV string to array for internal use
    if (typeof transformed.types === "string" && transformed.types) {
      transformed.types = transformed.types.split(",");
    } else if (!transformed.types) {
      transformed.types = [];
    }
    return transformed;
  }, [rawParams]);

  // Transform setParams to handle types as CSV
  const setParams = React.useCallback(
    (newParams: any) => {
      const transformed = { ...newParams };
      // Convert array to CSV string for URL
      if (Array.isArray(transformed.types)) {
        transformed.types =
          transformed.types.length > 0 ? transformed.types.join(",") : "";
      }
      setRawParams(transformed);
    },
    [setRawParams],
  );

  // State
  const [selectedRows, setSelectedRows] = useState<Event[]>([]);
  const [pageSize, setPageSize] = useState(25);

  // Fetch data using the API client with keepPreviousData to avoid blanking
  // Only include filters in the query, let AG Grid handle sorting client-side
  const { data, isLoading, error } = useEvents(params);

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
        minWidth: 180,
        headerName: "Lifecycle Status",
        field: "lifecycle_status",
        cellRenderer: StatusCellRenderer,
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

  // Check if grid ref is set
  React.useEffect(() => {
    console.log("🔍 Grid ref check:", {
      gridRef: !!gridRef.current,
      gridRefCurrent: gridRef.current,
    });
  }, []);

  // Event handlers
  const onGridReady = useCallback(({ api }: GridReadyEvent) => {
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

  // Workflow actions
  const workflowActions = useMemo(
    () => [
      {
        type: "bulk" as const,
        key: "submit-for-review",
        label: "Submit for Review",
        icon: SendIcon,
        color: "primary" as const,
        onClick: (selectedItems: any[]) => {
          console.log("Submit for Review:", selectedItems);
        },
      },
      {
        type: "bulk" as const,
        key: "revoke-review-request",
        label: "Revoke Review Request",
        icon: CancelScheduledSendIcon,
        color: "warning" as const,
        onClick: (selectedItems: any[]) => {
          console.log("Revoke Review Request:", selectedItems);
        },
      },
      {
        type: "bulk" as const,
        key: "reassign-event-owner",
        label: "Reassign Event Owner",
        icon: AssignmentAddIcon,
        color: "primary" as const,
        onClick: (selectedItems: any[]) => {
          console.log("Reassign Event Owner:", selectedItems);
        },
      },
      {
        type: "bulk" as const,
        key: "reassign-event-approvers",
        label: "Reassign Event Approvers",
        icon: AssignmentTurnedInIcon,
        color: "primary" as const,
        onClick: (selectedItems: any[]) => {
          console.log("Reassign Event Approvers:", selectedItems);
        },
      },
      {
        type: "bulk" as const,
        key: "add-gbr-ref",
        label: "Add GBR Ref #",
        icon: AddCircleIcon,
        color: "success" as const,
        onClick: (selectedItems: any[]) => {
          console.log("Add GBR Ref #:", selectedItems);
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
