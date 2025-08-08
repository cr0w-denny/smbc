import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Checkbox,
  Backdrop,
  Portal,
} from "@mui/material";

export interface TableColumn<T = any> {
  /** Unique key for the column */
  key: string;
  /** Display label for column header */
  label: string;
  /** Custom render function for cell content */
  render?: (item: T) => React.ReactNode;
  /** Column width */
  width?: string | number;
  /** Alignment for cell content */
  align?: "left" | "right" | "center";
  /** MUI sx styles */
  sx?: any;
}

export interface RowDetailModalProps<T = any> {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** The selected row data */
  item: T | null;
  /** Table column configuration */
  columns: TableColumn<T>[];
  /** Whether to show the checkbox column */
  showCheckbox?: boolean;
  /** Whether the checkbox is currently checked */
  isChecked?: boolean;
  /** Callback when checkbox is toggled */
  onCheckboxChange?: (checked: boolean) => void;
  /** Whether to show actions column placeholder */
  hasActionsColumn?: boolean;
  /** Custom content to display below the row */
  children?: React.ReactNode;
  /** Position of the clicked row for positioning the modal */
  rowPosition?: { top: number; left: number; width: number; height: number } | null;
  /** Actual column widths from the DOM */
  columnWidths?: number[];
  /** Computed styles for checkbox cell */
  checkboxCellStyle?: any;
}

export function RowDetailModal<T = any>({
  open,
  onClose,
  item,
  columns,
  showCheckbox = false,
  isChecked = false,
  onCheckboxChange,
  hasActionsColumn = false,
  children,
  rowPosition,
  columnWidths,
  checkboxCellStyle,
}: RowDetailModalProps<T>) {
  if (!open || !item) {
    return null;
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckboxChange) {
      onCheckboxChange(event.target.checked);
    }
  };

  // Calculate position based on row position if provided
  const modalStyle = rowPosition ? {
    position: 'absolute' as const,
    top: rowPosition.top,
    left: rowPosition.left,
    width: rowPosition.width,
    minWidth: rowPosition.width,
    zIndex: 1301,
  } : {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 900,
    zIndex: 1301,
  };

  return (
    <Portal>
      <Backdrop
        open={open}
        onClick={onClose}
        sx={{ 
          zIndex: 1300,
          bgcolor: 'rgba(0, 0, 0, 0.2)',
        }}
      />
      
      <Box
        sx={{
          ...modalStyle,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 4,
          // Remove any default spacing/padding
          margin: 0,
          padding: 0,
          // Remove border to avoid shifting content
          // border: '1px solid',
          // borderColor: 'divider',
        }}
      >
        {/* Row with exact column widths from DOM */}
        <Table size="small">
          <TableBody>
            <TableRow 
              sx={{ 
                bgcolor: 'action.selected',
                height: rowPosition?.height || 'auto',
                '& .MuiTableCell-root': {
                  borderBottom: 'none',
                }
              }}
            >
              {showCheckbox && (
                <TableCell 
                  sx={{ 
                    width: columnWidths?.[0] || 'auto',
                    minWidth: columnWidths?.[0] || 'auto',
                    maxWidth: columnWidths?.[0] || 'auto',
                    ...checkboxCellStyle,
                  }}
                >
                  <Checkbox
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    color="primary"
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
              )}
              {columns.map((column, index) => {
                const colIndex = showCheckbox ? index + 1 : index;
                return (
                  <TableCell 
                    key={column.key}
                    align={column.align || "left"}
                    sx={{ 
                      width: columnWidths?.[colIndex] || 'auto',
                      minWidth: columnWidths?.[colIndex] || 'auto',
                      maxWidth: columnWidths?.[colIndex] || 'auto',
                    }}
                  >
                    {column.render 
                      ? column.render(item)
                      : (item as any)[column.key] ?? ""
                    }
                  </TableCell>
                );
              })}
              {hasActionsColumn && (
                <TableCell 
                  align="right" 
                  sx={{ 
                    width: columnWidths?.[columnWidths.length - 1] || 48,
                    minWidth: columnWidths?.[columnWidths.length - 1] || 48,
                    maxWidth: columnWidths?.[columnWidths.length - 1] || 48,
                    px: 1,
                  }}
                >
                  {/* Empty cell to match the actions column */}
                </TableCell>
              )}
            </TableRow>
          </TableBody>
        </Table>

        {/* Custom Content Area */}
        {children && (
          <Box sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper',
            color: 'text.primary'
          }}>
            {children}
          </Box>
        )}
      </Box>
    </Portal>
  );
}

export default RowDetailModal;