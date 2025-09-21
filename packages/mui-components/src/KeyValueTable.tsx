import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";

export type KV = { label: string; value: React.ReactNode };

export const KeyValueTable: React.FC<{
  items: KV[];
  pairsPerRow?: 1 | 2;
  sx?: any;
  verticalAlign?: "top" | "center" | "bottom";
}> = ({ items, pairsPerRow = 1, sx, verticalAlign = "center" }) => {
  const rows: KV[][] = [];
  const step = pairsPerRow === 2 ? 2 : 1;
  for (let i = 0; i < items.length; i += step)
    rows.push(items.slice(i, i + step));

  return (
    <Table size="small" sx={{ width: "100%", tableLayout: "fixed", ...sx }}>
      <TableBody>
        {rows.map((pair, idx) => (
          <TableRow key={idx} sx={{ height: 44 }}>
            {pair.map((kv, j) => (
              <React.Fragment key={j}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    width: pairsPerRow === 2 ? "25%" : "50%",
                    color: "text.secondary",
                    fontWeight: 500,
                    borderBottomColor: "divider",
                    verticalAlign: verticalAlign,
                  }}
                >
                  {kv.label}
                </TableCell>
                <TableCell
                  sx={{ 
                    width: pairsPerRow === 2 ? "25%" : "50%",
                    borderBottomColor: "divider", 
                    verticalAlign: verticalAlign,
                    wordBreak: "break-word",
                  }}
                >
                  {kv.value}
                </TableCell>
              </React.Fragment>
            ))}
            {pairsPerRow === 2 && pair.length === 1 && (
              <>
                <TableCell sx={{ width: "25%", borderBottomColor: "divider" }} />
                <TableCell sx={{ width: "25%", borderBottomColor: "divider" }} />
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};