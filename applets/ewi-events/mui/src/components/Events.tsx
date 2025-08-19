import React from "react";
import { Box, ThemeProvider } from "@mui/material";
import { MuiDataViewApplet } from "@smbc/mui-applet-core";
import { RowDetailModal, type TableColumn } from "@smbc/mui-components";
import { FilterBar } from "./FilterBar";
import { FilterChips } from "./FilterChips";
import { WorkflowActions } from "./WorkflowActions";
import { useHashNavigation, useAppletCore } from "@smbc/applet-core";
import { useEventsConfig } from "../config";
import { createColumnsConfig } from "../config/columns";

const Events: React.FC = () => {
  const { theme } = useAppletCore();
  console.log(
    "Events theme mode:",
    theme.palette.mode,
    "bg:",
    theme.palette.background.default,
  );
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

  // State for workflow actions integration (stable refs to prevent loops)
  const workflowActionsRef = React.useRef<any[]>([]);
  const selectedItemsRef = React.useRef<any[]>([]);
  // const selectionHandlerRef = React.useRef<(ids: (string | number)[]) => void>(() => {});
  const selectedIdsRef = React.useRef<(string | number)[]>([]);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  // State for row detail modal
  const [selectedDetailRow, setSelectedDetailRow] = React.useState<any | null>(
    null,
  );
  const [modalRowPosition, setModalRowPosition] = React.useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [columnWidths, setColumnWidths] = React.useState<number[]>([]);
  const [isRowChecked, setIsRowChecked] = React.useState(false);
  const [checkboxCellStyle, setCheckboxCellStyle] = React.useState<any>({});
  const [scrollPosition, setScrollPosition] = React.useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  function resetScroll() {
    if (scrollPosition.top > 0) {
      requestAnimationFrame(() => {
        const tableContainer = document.querySelector(
          ".MuiTableContainer-root",
        ) as HTMLElement;
        if (tableContainer) {
          // Restore immediately without delay to prevent jank
          tableContainer.scrollTop = scrollPosition.top;
          tableContainer.scrollLeft = scrollPosition.left;
        }
      });
    }
  }

  // Effect to restore scroll position when modal opens
  React.useEffect(() => {
    if (selectedDetailRow) {
      resetScroll();
    }
  }, [selectedDetailRow]); // Only trigger on modal open, not scroll position changes

  const filterValues = {
    dateFrom: params.dateFrom || "",
    dateTo: params.dateTo || "",
    status: params.status || "",
    exRatings: params.exRatings || "",
    workflow: params.workflow || "",
    priority: params.priority || "",
  };

  const setFilterValues = (newValues: typeof filterValues) => {
    setParams(newValues);
  };

  // Sorting state management
  const sorting = React.useMemo(() => {
    if (params.sortBy && params.sortDirection) {
      return {
        column: params.sortBy,
        direction: params.sortDirection as "asc" | "desc",
      };
    }
    return null;
  }, [params.sortBy, params.sortDirection]);

  const setSorting = React.useCallback(
    (newSorting: { column: string; direction: "asc" | "desc" } | null) => {
      setParams({
        ...params,
        sortBy: newSorting?.column || "",
        sortDirection: newSorting?.direction || "",
      });
    },
    [params, setParams],
  );

  const handleApplyFilters = () => {
    // DataView will handle the filtering
    console.log("Applying filters:", filterValues);
  };

  // Mock status counts - in real app this would come from API
  const statusCounts = {
    onCourse: 45,
    almostDue: 12,
    pastDue: 8,
    needsAttention: 3,
  };

  // Create the DataView configuration
  const config = useEventsConfig({
    permissions: {
      canEdit: true,
      canDelete: true,
    },
  });

  // Convert DataView columns to RowDetailModal columns
  const columnsConfig = createColumnsConfig();
  const modalColumns: TableColumn<any>[] = columnsConfig.map((col) => ({
    key: col.key,
    label: col.label,
    render: col.render,
    width: col.width,
    align: "left" as const,
    sx: (col as any).sx,
  }));

  // Custom ActionBar component that uses WorkflowActions
  const CustomActionBar = React.useCallback(
    (props: {
      globalActions: any[];
      bulkActions: any[];
      selectedItems: any[];
      totalItems: number;
      onClearSelection: () => void;
      transactionState?: any;
      primaryKey?: keyof any;
    }) => {
      // Update refs without causing re-renders
      workflowActionsRef.current = props.bulkActions.filter((action) => {
        if (action.hidden?.(props.selectedItems)) return false;
        if (action.appliesTo) {
          if (action.requiresAllRows) {
            return props.selectedItems.every((item) => action.appliesTo!(item));
          } else {
            return props.selectedItems.some((item) => action.appliesTo!(item));
          }
        }
        return true;
      });
      selectedItemsRef.current = props.selectedItems;

      // Store the selected IDs for checkbox state
      const primaryKey = props.primaryKey || "id";
      selectedIdsRef.current = props.selectedItems.map(
        (item) => item[primaryKey],
      );

      return (
        <WorkflowActions
          globalActions={props.globalActions}
          bulkActions={props.bulkActions}
          selectedItems={props.selectedItems}
          totalItems={props.totalItems}
          onClearSelection={props.onClearSelection}
          transactionState={props.transactionState}
          primaryKey={props.primaryKey}
          onWorkflowActionsChange={() => forceUpdate()}
        />
      );
    },
    [],
  );

  const configWithCustomActionBar = React.useMemo(() => {
    console.log("Creating config with onRowClick");
    return {
      ...config,
      onRowClick: (item: any, event?: React.MouseEvent) => {
        if (event && event.currentTarget) {
          // Check if the click was directly on the checkbox input
          const target = event.target as HTMLElement;

          // Only ignore if it's specifically the checkbox input or checkbox icon
          const isCheckboxInput =
            target.tagName === "INPUT" &&
            (target as HTMLInputElement).type === "checkbox";
          const isCheckboxIcon = target.closest(".MuiCheckbox-root") !== null;

          // Allow modal to open for all clicks except direct checkbox interactions
          if (isCheckboxInput || isCheckboxIcon) {
            return;
          }

          const rowElement = event.currentTarget as HTMLElement;
          const rect = rowElement.getBoundingClientRect();

          // Get current scroll position of the table container
          const tableContainer = rowElement.closest(
            ".MuiTableContainer-root",
          ) as HTMLElement;
          const currentScrollTop = tableContainer
            ? tableContainer.scrollTop
            : 0;
          const currentScrollLeft = tableContainer
            ? tableContainer.scrollLeft
            : 0;

          // Store scroll position to restore later
          setScrollPosition({ top: currentScrollTop, left: currentScrollLeft });

          // Get absolute position including scroll
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft =
            window.pageXOffset || document.documentElement.scrollLeft;

          // Get column widths from the actual table cells
          const cells = rowElement.querySelectorAll("td");
          const widths: number[] = [];
          cells.forEach((cell) => {
            const width = cell.getBoundingClientRect().width;
            widths.push(width);
          });

          // Get the checkbox cell's computed styles
          if (cells[0]) {
            const computedStyle = window.getComputedStyle(cells[0]);
            setCheckboxCellStyle({
              paddingLeft: computedStyle.paddingLeft,
              paddingRight: computedStyle.paddingRight,
              paddingTop: computedStyle.paddingTop,
              paddingBottom: computedStyle.paddingBottom,
            });
          }

          setColumnWidths(widths);
          setModalRowPosition({
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft,
            width: rect.width,
            height: rect.height,
          });

          // Check if this row's checkbox is checked in the DOM
          const checkbox = rowElement.querySelector(
            'input[type="checkbox"]',
          ) as HTMLInputElement;
          if (checkbox) {
            setIsRowChecked(checkbox.checked);
          } else {
            // Fallback to checking selectedIds
            const itemId = item.id || item;
            const isChecked = selectedIdsRef.current.includes(itemId);
            setIsRowChecked(isChecked);
          }
        }
        console.log("Setting selected detail row:", item);
        setSelectedDetailRow(item);
      },
    };
  }, [config]);

  // Event handlers for DataView
  const handleSuccess = (
    _action: "create" | "edit" | "delete",
    _item?: any,
  ) => {
    console.log("EWI Events action success:", _action, _item);
  };

  const handleError = (
    action: "create" | "edit" | "delete",
    error: any,
    item?: any,
  ) => {
    console.error(`EWI Events error: ${action}`, error, item);
  };

  return (
    <Box sx={{ bgcolor: "#1a1a1a" }}>
      {/* Filter Bar inherits app theme */}
      <FilterBar
        values={filterValues}
        onValuesChange={setFilterValues}
        onApply={handleApplyFilters}
      />
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "background.default",
          }}
        >
          {/* filter chips and content */}
          <Box
            sx={{
              maxWidth: "1200px",
              width: "100%",
              mx: "auto",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              position: "relative",
              top: "-100px",
              bgcolor: "background.paper",
              pt: 1,
              height: "calc(100vh - 150px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <FilterChips
              values={filterValues}
              onValuesChange={setFilterValues}
              statusCounts={statusCounts}
              workflowActions={workflowActionsRef.current}
              selectedItems={selectedItemsRef.current}
            />

            {/* Main content area with DataView table */}
            <Box
              sx={{
                p: 2,
                pt: 0,
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                "& > div": {
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                },
                "& .MuiTableContainer-root": {
                  flex: 1,
                  overflow: "auto",
                },
                "& .MuiTableHead-root": {
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  backgroundColor: "background.paper",
                },
                "& .MuiTablePagination-root": {
                  borderTop: 1,
                  borderColor: "divider",
                  flexShrink: 0,
                },
              }}
            >
              <MuiDataViewApplet
                key="ewi-events-dataview"
                config={configWithCustomActionBar}
                permissionContext="ewi-events"
                onSuccess={handleSuccess}
                onError={handleError}
                ActionBarComponent={CustomActionBar}
                enableUrlSync={false}
                options={{
                  filterState: {
                    filters: filterValues,
                    setFilters: setFilterValues,
                  },
                  sortingState: {
                    sorting,
                    setSorting,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Detail overlay */}
          <RowDetailModal
            open={!!selectedDetailRow}
            onClose={() => {
              resetScroll();
              setSelectedDetailRow(null);
              setModalRowPosition(null);
              setColumnWidths([]);
              setCheckboxCellStyle({});
            }}
            item={selectedDetailRow}
            columns={modalColumns}
            rowPosition={modalRowPosition}
            columnWidths={columnWidths}
            checkboxCellStyle={checkboxCellStyle}
            showCheckbox={true}
            isChecked={isRowChecked}
            onCheckboxChange={(_checked) => {
              resetScroll();
              // // Find the actual checkbox in the underlying table and click it
              // const allRows = document.querySelectorAll(
              //   ".MuiTableBody-root tr",
              // );
              // let found = false;
              // allRows.forEach((row) => {
              //   if (found) return;
              //   const rect = row.getBoundingClientRect();
              //   // Check if this is the row at our modal position
              //   if (
              //     Math.abs(
              //       rect.top +
              //         window.pageYOffset -
              //         (modalRowPosition?.top || 0),
              //     ) < 5
              //   ) {
              //     const checkbox = row.querySelector(
              //       'input[type="checkbox"]',
              //     ) as HTMLInputElement;
              //     if (checkbox) {
              //       checkbox.click();
              //       found = true;
              //       // Update state and close modal
              //       setIsRowChecked(checked);
              //       setSelectedDetailRow(null);
              //       setModalRowPosition(null);
              //       setColumnWidths([]);
              //     }
              //   }
              // });
            }}
            hasActionsColumn={true}
          >
            {/* Custom detail content can go here */}
            {selectedDetailRow && (
              <Box>
                <div>Custom detail content for: {selectedDetailRow.id}</div>
                <div>You can put any custom elements here</div>
              </Box>
            )}
          </RowDetailModal>
        </Box>
      </ThemeProvider>
    </Box>
  );
};

export default Events;
