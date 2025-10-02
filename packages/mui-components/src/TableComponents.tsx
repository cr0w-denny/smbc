import React from "react";
import {
  Table as MuiTable,
  TableHead as MuiTableHead,
  TableBody as MuiTableBody,
  TableRow as MuiTableRow,
  TableCell as MuiTableCell,
  TableProps as MuiTableProps,
  TableHeadProps as MuiTableHeadProps,
  TableBodyProps as MuiTableBodyProps,
  TableRowProps as MuiTableRowProps,
  TableCellProps as MuiTableCellProps,
} from "@mui/material";
import { ui } from "@smbc/ui-core";

// Table wrapper
export type TableProps = MuiTableProps;
export const Table: React.FC<TableProps> = ({ sx, ...props }) => {
  return <MuiTable sx={{ ...sx }} {...props} />;
};

// TableHead wrapper
export type TableHeadProps = MuiTableHeadProps;
export const TableHead: React.FC<TableHeadProps> = ({ sx, ...props }) => {
  return (
    <MuiTableHead
      sx={{
        backgroundColor: ui.tableHeader.background,
        ...sx,
      }}
      {...props}
    />
  );
};

// TableBody wrapper
export type TableBodyProps = MuiTableBodyProps;
export const TableBody: React.FC<TableBodyProps> = ({ sx, ...props }) => {
  return <MuiTableBody sx={{ ...sx }} {...props} />;
};

// TableRow wrapper
export type TableRowProps = MuiTableRowProps;
export const TableRow: React.FC<TableRowProps> = ({ sx, ...props }) => {
  return (
    <MuiTableRow
      sx={{
        transition: "none",
        "&:hover": {
          backgroundColor: ui.tableRow.on.hover.background,
        },
        "&.Mui-selected": {
          backgroundColor: ui.tableRow.on.selected.background,
          "&:hover": {
            backgroundColor: ui.tableRow.on.selected.background,
          },
        },
        ...sx,
      }}
      {...props}
    />
  );
};

// TableCell wrapper
export type TableCellProps = MuiTableCellProps;
export const TableCell: React.FC<TableCellProps> = ({ sx, ...props }) => {
  const isHeader = props.variant === "head";

  return (
    <MuiTableCell
      sx={{
        padding: "8px 16px",
        fontSize: "0.875rem",
        borderColor: ui.tableRow.borderColor,
        ...(isHeader && {
          fontWeight: 600,
          backgroundColor: ui.tableHeader.background,
          color: ui.tableHeader.color,
        }),
        ...sx,
      }}
      {...props}
    />
  );
};
