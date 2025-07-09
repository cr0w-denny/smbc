import React from "react";
import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

export interface LoadingTableProps {
  /** Number of rows to show while loading */
  rows?: number;
  /** Number of columns to show while loading */
  columns?: number;
  /** Height of each skeleton row */
  rowHeight?: number;
}

/**
 * A reusable loading table skeleton component that shows
 * placeholder content while data is being fetched
 */
export const LoadingTable: React.FC<LoadingTableProps> = ({
  rows = 5,
  columns = 4,
  rowHeight = 53,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableCell key={`header-${index}`}>
                <Skeleton variant="text" width="80%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={`row-${rowIndex}`}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                  <Box
                    sx={{
                      height: rowHeight - 20,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Skeleton
                      variant="text"
                      width={
                        colIndex === 0
                          ? "60%"
                          : colIndex === columns - 1
                            ? "40%"
                            : "80%"
                      }
                    />
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
