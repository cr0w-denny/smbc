import React, { useMemo, useState } from "react";
import { Box, GridLegacy as Grid, Paper, Typography, useTheme } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import ReactECharts from "echarts-for-react";
import type { ColDef } from "ag-grid-community";
import { AppletPage } from "@smbc/mui-applet-core";
import { AgGridTheme } from "@smbc/mui-components";

export interface AppletProps {
  mountPath: string;
}

// Mock data for reports
const mockReportsData = [
  {
    id: 1,
    reportName: "Monthly Sales Report",
    category: "Sales",
    lastRun: "2024-01-15",
    status: "Completed",
    size: "2.3 MB",
  },
  {
    id: 2,
    reportName: "User Activity Analysis",
    category: "Analytics",
    lastRun: "2024-01-14",
    status: "Running",
    size: "1.8 MB",
  },
  {
    id: 3,
    reportName: "Financial Summary",
    category: "Finance",
    lastRun: "2024-01-13",
    status: "Failed",
    size: "5.2 MB",
  },
  {
    id: 4,
    reportName: "Performance Metrics",
    category: "Operations",
    lastRun: "2024-01-12",
    status: "Completed",
    size: "3.1 MB",
  },
];

const statusCellRenderer = (params: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "#4caf50";
      case "Running":
        return "#ff9800";
      case "Failed":
        return "#f44336";
      default:
        return "#757575";
    }
  };

  return (
    <Box
      sx={{
        display: "inline-block",
        px: 1,
        py: 0.5,
        borderRadius: 1,
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: getStatusColor(params.value) + "20",
        color: getStatusColor(params.value),
        border: `1px solid ${getStatusColor(params.value)}40`,
      }}
    >
      {params.value}
    </Box>
  );
};

export const Applet: React.FC<AppletProps> = ({ mountPath: _mountPath }) => {
  const [pageSize, setPageSize] = useState(25);
  const theme = useTheme();
  const textColor = theme.palette.text.primary;
  const axisLineColor = theme.palette.divider;

  const columnDefs: ColDef[] = useMemo(
    () => [
      { field: "reportName", headerName: "Report Name", flex: 2 },
      { field: "category", headerName: "Category", flex: 1 },
      { field: "lastRun", headerName: "Last Run", flex: 1 },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        cellRenderer: statusCellRenderer,
      },
      { field: "size", headerName: "Size", flex: 1 },
    ],
    [],
  );

  // Sample chart data - memoized to update with theme changes
  const chartOption = useMemo(
    () => ({
      title: {
        text: "Reports by Category",
        left: "center",
        textStyle: {
          color: textColor,
        },
      },
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: "horizontal",
        bottom: 10,
        textStyle: {
          color: textColor,
        },
      },
      series: [
        {
          name: "Reports",
          type: "pie",
          radius: ["30%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 5,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
            },
          },
          data: [
            { value: 25, name: "Sales" },
            { value: 20, name: "Analytics" },
            { value: 18, name: "Finance" },
            { value: 15, name: "Operations" },
            { value: 12, name: "Marketing" },
            { value: 10, name: "HR" },
          ],
        },
      ],
    }),
    [theme.palette.mode],
  );
  console.log(chartOption, theme.palette.mode);
  const barChartOption = useMemo(
    () => ({
      title: {
        text: "Report Execution Status",
        left: "center",
        textStyle: {
          color: textColor,
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      xAxis: {
        type: "category",
        data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        axisLine: {
          lineStyle: {
            color: axisLineColor,
          },
        },
        axisLabel: {
          color: textColor,
        },
      },
      yAxis: {
        type: "value",
        axisLine: {
          lineStyle: {
            color: axisLineColor,
          },
        },
        axisLabel: {
          color: textColor,
        },
        splitLine: {
          lineStyle: {
            color: axisLineColor,
          },
        },
      },
      series: [
        {
          name: "Completed",
          type: "bar",
          data: [120, 200, 150, 80, 70, 110],
          itemStyle: { color: "#4caf50" },
        },
        {
          name: "Failed",
          type: "bar",
          data: [20, 30, 25, 15, 10, 18],
          itemStyle: { color: "#f44336" },
        },
      ],
    }),
    [theme.palette.mode],
  );

  return (
    <>
      <Box sx={{ p: 3, pb: 0 }}>
        <Typography variant="h4" gutterBottom>
          Reports Dashboard
        </Typography>
      </Box>
      <AppletPage>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Charts Row */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <ReactECharts
                  option={chartOption}
                  style={{ height: "100%", width: "100%" }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <ReactECharts
                  option={barChartOption}
                  style={{ height: "100%", width: "100%" }}
                />
              </Paper>
            </Grid>

            {/* AG Grid Row */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: 400 }}>
                <AgGridTheme>
                  <AgGridReact
                    rowData={mockReportsData}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={pageSize}
                    paginationPageSizeSelector={[10, 25, 50]}
                    onPaginationChanged={(event) => {
                      if (event.api) {
                        const newPageSize = event.api.paginationGetPageSize();
                        if (newPageSize !== pageSize) {
                          setPageSize(newPageSize);
                        }
                      }
                    }}
                    animateRows={true}
                    defaultColDef={{
                      sortable: true,
                      filter: true,
                      resizable: true,
                    }}
                  />
                </AgGridTheme>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </AppletPage>
    </>
  );
};
