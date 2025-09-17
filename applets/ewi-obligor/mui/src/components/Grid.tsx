import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { Box } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import {
  AgGridTheme,
  ConfigurableCard,
  Filter,
  FilterChipToggle,
} from "@smbc/mui-components";
import type { ColDef, GridReadyEvent } from "ag-grid-community";
import type { CardMenuItem, FilterChip } from "@smbc/mui-components";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface ObligorData {
  id: string;
  obligor_name: string;
  sun_id: string;
  exposure: string;
  risk_rating: string;
  country: string;
  industry: string;
  last_review: string;
}

interface GridProps {
  obligors: ObligorData[];
  menuItems?: CardMenuItem[];
}

export const Grid: React.FC<GridProps> = ({ obligors, menuItems }) => {
  const gridRef = useRef<AgGridReact>(null);
  const popupParentRef = useRef<HTMLDivElement>(null);
  const [popupParent, setPopupParent] = useState<HTMLElement | null>(null);
  const [activeChips, setActiveChips] = useState<string[]>([]);

  const testChips: FilterChip[] = [
    {
      value: "past-due",
      label: "Past Due",
      icon: <ErrorIcon />,
      count: 3,
      style: { border: "#EF5569", badge: "#EF5569", fill: "#FAFDFD" },
      group: "status",
    },
    {
      value: "almost-due",
      label: "Almost Due",
      icon: <WarningIcon />,
      count: 7,
      style: { border: "#FD992E", badge: "#FD992E", fill: "#FAFDFD" },
      group: "status",
    },
    {
      value: "on-course",
      label: "On Course",
      icon: <CheckCircleIcon />,
      count: 12,
      style: { border: "#12A187", badge: "#12A187", fill: "#FAFDFD" },
      group: "status",
    },
  ];

  const handleChipToggle = (value: string, isActive: boolean) => {
    console.log("Chip toggled:", value, isActive);
    if (isActive) {
      setActiveChips((prev) => [...prev, value]);
    } else {
      setActiveChips((prev) => prev.filter((v) => v !== value));
    }
  };

  // Set popup parent after component mounts
  useEffect(() => {
    if (popupParentRef.current) {
      setPopupParent(popupParentRef.current);
    }
  }, []);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: "checkbox",
        headerName: "",
        maxWidth: 50,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        sortable: false,
        filter: false,
        pinned: "left",
        resizable: false,
        suppressColumnsToolPanel: true,
      },
      {
        headerName: "Obligor Name",
        field: "obligor_name",
        suppressMenu: true,
        minWidth: 200,
      },
      {
        headerName: "SUN ID",
        field: "sun_id",
        suppressMenu: true,
        width: 120,
      },
      {
        headerName: "Total Exposure",
        field: "exposure",
        suppressMenu: true,
        width: 140,
      },
      {
        headerName: "Risk Rating",
        field: "risk_rating",
        suppressMenu: true,
        width: 120,
      },
      {
        headerName: "Country",
        field: "country",
        suppressMenu: true,
        width: 100,
      },
      {
        headerName: "Industry",
        field: "industry",
        suppressMenu: true,
        width: 140,
      },
      {
        headerName: "Last Review",
        field: "last_review",
        suppressMenu: true,
        width: 130,
        valueFormatter: ({ value }) =>
          value ? new Date(value).toLocaleDateString() : "---",
      },
    ],
    [],
  );

  // Event handlers
  const onGridReady = useCallback(({ api }: GridReadyEvent) => {
    api.sizeColumnsToFit();

    const handleResize = () => {
      api.sizeColumnsToFit();
    };

    window.addEventListener("resize", handleResize);

    (api as any).resizeCleanup = () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const onColumnVisible = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.sizeColumnsToFit();
    }
  }, []);

  return (
    <ConfigurableCard
      title={`Obligor Related Events`}
      menuItems={menuItems}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "& .MuiCardContent-root": {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: 2,
        },
      }}
      toolbar={
        <Filter
          spec={{
            fields: [
              {
                name: "fromDate",
                type: "date" as const,
                label: "From Date",
                placeholder: "From date",
              },
              {
                name: "toDate",
                type: "date" as const,
                label: "To Date",
                placeholder: "To date",
              },
            ],
          }}
          values={{}}
          onFiltersChange={() => {}}
        />
      }
    >
      <FilterChipToggle
        chips={testChips}
        activeValues={activeChips}
        onChipToggle={handleChipToggle}
        sx={{ mb: 2, flexShrink: 0 }}
      />
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          "& .ag-root-wrapper": {
            height: "100%",
          },
          "& .ag-root": {
            height: "100%",
          },
        }}
      >
        <AgGridTheme wrapHeaders={true} popupParentRef={popupParentRef}>
          <AgGridReact
            ref={gridRef}
            popupParent={popupParent}
            headerHeight={50}
            rowData={obligors}
            columnDefs={columnDefs}
            rowSelection="multiple"
            suppressRowClickSelection={true}
            onGridReady={onGridReady}
            onColumnVisible={onColumnVisible}
            animateRows={true}
            cellSelection={true}
            pagination={false}
            suppressHorizontalScroll={false}
            alwaysShowHorizontalScroll={false}
          />
        </AgGridTheme>
      </Box>
    </ConfigurableCard>
  );
};
