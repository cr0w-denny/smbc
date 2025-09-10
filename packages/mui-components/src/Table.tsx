import * as React from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

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
                bgcolor: "action.hover",
                fontWeight: 600,
                width: c.width,
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
                sx={{ borderBottomColor: "divider", ...c.cellSx }}
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