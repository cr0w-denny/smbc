import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Chip,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import {
  AgGridTheme,
  Card,
  darkTheme,
  StatusChip,
  token,
} from "@smbc/mui-components";
import { Width } from "@smbc/mui-components";
import { AppletPage } from "@smbc/mui-applet-core";
import type { ColDef, SelectionChangedEvent } from "ag-grid-community";
import { useHashNavigation } from "@smbc/applet-core";
import { ui, color, shadow } from "@smbc/ui-core";
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
  Clear as ClearIcon,
} from "@mui/icons-material";

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
  const theme = useTheme();

  // Map specific status values to StatusChip variants
  const getVariant = (status: string) => {
    const statusMap = {
      "on-course": "success" as const,
      "almost-due": "warning" as const,
      "past-due": "error" as const,
      "needs-attention": "custom" as const,
    };
    return statusMap[status as keyof typeof statusMap] || ("default" as const);
  };

  // Handle undefined or null values
  if (!params.value) {
    return (
      <StatusChip
        variant="default"
        label="UNKNOWN"
        sx={{
          fontSize: "12px",
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

  const variant = getVariant(params.value);
  const label = params.value
    .replace("-", " ")
    .replace(/\b\w/g, (l: string) => l.toUpperCase());

  // Special handling for needs-attention (purple) variant
  if (variant === "custom") {
    return (
      <StatusChip
        variant="custom"
        label={label}
        outlineColor={color.tertiary.plum100}
        fillColor={token(theme, ui.color.background.tertiary)}
        textColor={token(theme, ui.color.text.primary)}
        sx={{
          fontSize: "12px",
          fontWeight: theme.palette.mode === "dark" ? 300 : 400,
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
    <StatusChip
      variant={variant}
      label={label}
      sx={{
        fontSize: "12px",
        fontWeight: theme.palette.mode === "dark" ? 300 : 400,
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
        // Navigate to event details applet with only event ID - bypass hook navigation
        window.location.hash = `/events/detail?id=${params.data.id}`;
        return;
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
                boxShadow: shadow.md,
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

  // Define defaults once to reuse
  const autoDefaults = {
    status: "",
    category: "",
  };

  const draftDefaults = {
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end_date: new Date(),
    types: [],
    plo: [],
    my: false,
  };

  const {
    navigate,
    autoParams,
    setAutoParams,
    params,
    appliedParams,
    setParams,
    applyParams,
    hasChanges,
  } = useHashNavigation(
    autoDefaults, // Filter chips (auto-applied)
    draftDefaults, // Server filters (draft/apply)
  );

  const [selectedRows, setSelectedRows] = useState<Event[]>([]);

  const handleApplyFilters = (overrideParams?: any) =>
    applyParams?.(overrideParams);

  const client = useApiClient<paths>("ewi-events");

  // Create stable query key that only changes when server params change
  const queryKey = useMemo(() => {
    return ["events", appliedParams || {}];
  }, [appliedParams]);

  // Direct React Query - only use server-side parameters
  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await client.GET("/events", {
        params: { query: appliedParams || {} },
      });
      return response.data || [];
    },
  });

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
        cellClass: "expand-cell",
        suppressColumnsToolPanel: true,
      },
      {
        headerName: "Event Date",
        field: "event_date",
        minWidth: 150,
        valueFormatter: ({ value }) => (value ? value.split("T")[0] : "---"),
        flex: 1,
        sort: "asc",
        sortIndex: 1,
      },
      {
        headerName: "Category",
        field: "event_category",
        minWidth: 160,
        flex: 1,
        sort: "asc",
        sortIndex: 0,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Workflow Status",
        field: "workflow_status",
        flex: 1,
      },
      {
        headerName: "Obligor Name",
        minWidth: 150,
        field: "obligor",
        flex: 1,
        sort: "asc",
        sortIndex: 2,
      },
      {
        headerName: "SUN ID",
        maxWidth: 110,
        field: "sun_id",
        flex: 1,
      },
      {
        headerName: "PLO",
        maxWidth: 110,
        field: "plo",
        flex: 1,
      },
      {
        headerName: "Exposure $",
        field: "exposure",
        flex: 1,
      },
      {
        headerName: "Trigger",
        field: "trigger_shortname",
        minWidth: 120,
        flex: 1,
      },
      {
        headerName: "Trigger Type",
        field: "trigger_type",
        flex: 1,
      },
      {
        headerName: "Trigger Values",
        field: "trigger_values",
        hide: true,
      },
      {
        minWidth: 180,
        headerName: "Lifecycle Status",
        field: "lifecycle_status",
        cellRenderer: StatusCellRenderer,
        pinned: "right",
        filter: "agTextColumnFilter",
      },
      {
        field: "actions",
        headerName: "",
        maxWidth: 50,
        sortable: false,
        filter: false,
        cellRenderer: ActionsCellRenderer,
        pinned: "right",
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

  const onRowGroupOpened = useCallback((event: any) => {
    console.log("Row group opened/closed:", event.node.expanded);
    // Force refresh of row styles
    event.api.redrawRows();
  }, []);

  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    console.log("Selection changed:", selectedData.length, selectedData);
    setSelectedRows(selectedData);
  }, []);

  // Workflow actions
  const workflowActions = useMemo(
    () => [
      {
        type: "bulk" as const,
        key: "remove-selections",
        label: "Clear selections",
        icon: ClearIcon,
        color: "secondary" as const,
        onClick: (_selectedItems: any[]) => {
          console.log("Clearing selections");
          if (gridRef?.current?.api) {
            gridRef.current.api.deselectAll();
          }
          setSelectedRows([]);
        },
      },
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
    [selectedRows.length, gridRef],
  );

  // Calculate status counts from filtered dataset
  const statusCounts = React.useMemo(() => {
    const filteredEvents = events || [];
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
  }, [events]);

  const toolbar = (
    <>
      <FilterBar
        values={params}
        onValuesChange={setParams}
        onApply={handleApplyFilters}
        filtersChanged={hasChanges}
      />
      <ActionBar
        values={autoParams}
        appliedParams={autoParams}
        onValuesChange={setAutoParams}
        statusCounts={statusCounts}
        workflowActions={workflowActions}
        selectedItems={selectedRows}
        gridRef={gridRef}
      />
    </>
  );

  return (
    <AppletPage
      toolbar={toolbar}
      error={error ? new Error(`Error loading events: ${error.message}`) : null}
      toolbarHeight={175}
      maxWidth={{
        xs: "96%",
        sm: "96%",
        md: "88%",
        lg: "88%",
        xl: "92%",
      }}
      bgExtended={true}
    >
      <Card
        size="large"
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            Events Workflow
            <Chip
              label={events?.length || 0}
              size="small"
              sx={(theme) => ({
                color: token(theme, ui.color.chip.default.text),
                backgroundColor: token(theme, ui.color.chip.default.background),
                fontSize: "14px",
                "& .MuiChip-label": {
                  px: 1.5,
                  fontSize: "14px",
                },
              })}
            />
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
              // Reset to applied params if they exist, otherwise use initial defaults
              const resetValues = Object.keys(appliedParams || {}).length > 0
                ? appliedParams
                : draftDefaults;
              setParams(resetValues);
              setAutoParams(autoDefaults);
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
          height="92%"
          wrapHeaders={true}
          popupParentRef={popupParentRef}
        >
          <AgGridReact
            ref={gridRef}
            headerHeight={54}
            popupParent={popupParent}
            rowData={events || []}
            columnDefs={columnDefs}
            rowSelection="multiple"
            onSelectionChanged={onSelectionChanged}
            onRowGroupOpened={onRowGroupOpened}
            loading={isLoading}
            animateRows
            suppressCellFocus
            suppressRowClickSelection
            cellSelection={false}
            suppressHorizontalScroll={false}
            alwaysShowHorizontalScroll={false}
            masterDetail
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
                  backgroundColor: token(darkTheme, ui.color.table.row.hover),
                };
              }
              if (params.node.detail) {
                return {
                  backgroundColor: token(
                    darkTheme,
                    ui.color.table.row.selected,
                  ),
                };
              }
              return undefined;
            }}
            defaultColDef={{
              filter: true,
              sortable: true,
              resizable: true,
              menuTabs: ["filterMenuTab", "columnsMenuTab"],
            }}
            sortingOrder={["asc", "desc"]}
            multiSortKey={"ctrl"}
            columnMenu="legacy"
          />
        </AgGridTheme>
      </Card>
    </AppletPage>
  );
};

export default EventsAgGrid;
