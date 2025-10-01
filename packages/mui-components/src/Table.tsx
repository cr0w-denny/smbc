import * as React from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { ui } from "@smbc/ui-core";

type ColumnDef<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  width?: number | string;
  headSx?: any;
  cellSx?: any;
};

export function Table<T>({
  columns,
  rows,
  sx,
}: {
  columns: ColumnDef<T>[];
  rows: T[];
  sx?: any;
}) {

  return (
    <MuiTable size="small" sx={sx}>
      <TableHead>
        <TableRow>
          {columns.map((c, i) => (
            <TableCell
              key={i}
              align={c.align ?? "left"}
              sx={{
                bgcolor: ui.tableHeader.base.default.background,
                fontWeight: 600,
                width: c.width,
                borderBottom: "none",
                height: "42px",
                padding: "0 16px",
                ...c.headSx,
              }}
            >
              {c.header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            {columns.map((c, j) => (
              <TableCell
                key={j}
                align={c.align ?? "left"}
                sx={{
                  borderBottomColor: "divider",
                  height: "54px",
                  padding: "0 16px",
                  ...c.cellSx
                }}
              >
                {c.render(r)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </MuiTable>
  );
}