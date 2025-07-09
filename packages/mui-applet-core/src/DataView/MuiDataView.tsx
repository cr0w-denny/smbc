import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  CircularProgress,
  Alert,
  Box,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import { Filter } from "@smbc/mui-components";
import type {
  DataView,
  DataViewTableProps,
  DataViewFilterProps,
  DataViewFormProps,
  DataViewPaginationProps,
  DataViewCreateButtonProps,
} from "@smbc/react-query-dataview";

// MUI-specific table component
function MuiDataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  isLoading,
  error,
  onRowClick,
  selection,
  transactionState,
  primaryKey = 'id' as keyof T,
}: DataViewTableProps<T>) {
  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {selection?.enabled && (
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={(() => {
                    const currentPageIds = data.map((item) => item[primaryKey] as string | number);
                    const selectedOnPage = currentPageIds.filter((id) =>
                      selection.selectedIds.includes(id),
                    ).length;
                    return selectedOnPage > 0 && selectedOnPage < data.length;
                  })()}
                  checked={(() => {
                    if (data.length === 0) return false;
                    const currentPageIds = data.map((item) => item[primaryKey] as string | number);
                    return currentPageIds.every((id) =>
                      selection.selectedIds.includes(id),
                    );
                  })()}
                  onChange={(event) => {
                    const currentPageIds = data.map((item) => item[primaryKey] as string | number);
                    if (event.target.checked) {
                      // Add current page IDs to existing selection
                      const newSelection = [
                        ...new Set([
                          ...selection.selectedIds,
                          ...currentPageIds,
                        ]),
                      ];
                      selection.onSelectionChange(newSelection);
                    } else {
                      // Remove current page IDs from selection
                      const newSelection = selection.selectedIds.filter(
                        (id) => !currentPageIds.includes(id),
                      );
                      selection.onSelectionChange(newSelection);
                    }
                  }}
                />
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell key={column.key} sx={(column as any).sx}>
                {column.label}
              </TableCell>
            ))}
            {actions.length > 0 && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Merge pending created items with existing data */}
          {(() => {
            let displayData = [...data];
            
            // If we have an active transaction, prepend pending created items
            if (transactionState?.hasActiveTransaction && transactionState.pendingStates) {
              const pendingCreatedItems: T[] = [];
              
              transactionState.pendingStates.forEach((stateInfo, id) => {
                // For 'added' state, always include
                if (stateInfo.state === 'added' && stateInfo.data) {
                  // Only add if this item isn't already in the data (shouldn't happen but be safe)
                  if (!data.some(item => item[primaryKey] === id)) {
                    pendingCreatedItems.push({
                      ...stateInfo.data,
                      [primaryKey]: id
                    } as T);
                  }
                }
                // For 'edited' state, only include if the item doesn't exist in regular data
                // (meaning it was originally a pending created item that got edited)
                else if (stateInfo.state === 'edited' && stateInfo.data) {
                  if (!data.some(item => item[primaryKey] === id)) {
                    pendingCreatedItems.push({
                      ...stateInfo.data,
                      [primaryKey]: id
                    } as T);
                  }
                }
              });
              
              // Prepend pending created items to the beginning
              displayData = [...pendingCreatedItems, ...displayData];
            }
            
            return displayData.map((item, index) => {
            // Get pending state from transaction state (if any)
            const entityId = item[primaryKey] as string | number;
            const pendingStateInfo = transactionState?.hasActiveTransaction
              ? transactionState.pendingStates.get(entityId)
              : null;
            const pendingState = pendingStateInfo?.state;
            
            
            // Create merged item with pending data (for edited items)
            const displayItem = pendingState === "edited" && pendingStateInfo?.data
              ? { ...item, ...pendingStateInfo.data }
              : item;

            // Define styling based on pending state
            const getPendingStyles = () => {
              switch (pendingState) {
                case "added":
                  return {
                    backgroundColor: "rgba(76, 175, 80, 0.1)", // Light green
                    borderLeft: "4px solid #4caf50",
                  };
                case "edited":
                  return {
                    backgroundColor: "rgba(255, 152, 0, 0.1)", // Light orange
                    borderLeft: "4px solid #ff9800",
                  };
                case "deleted":
                  return {
                    backgroundColor: "rgba(244, 67, 54, 0.1)", // Light red
                    borderLeft: "4px solid #f44336",
                    textDecoration: "line-through",
                    opacity: 0.7,
                  };
                default:
                  return {};
              }
            };

            return (
              <TableRow
                key={entityId || index}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                sx={{
                  cursor: onRowClick ? "pointer" : "default",
                  ...getPendingStyles(),
                }}
              >
                {selection?.enabled && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selection.selectedIds.includes(entityId)}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selection.onSelectionChange([
                            ...selection.selectedIds,
                            entityId,
                          ]);
                        } else {
                          selection.onSelectionChange(
                            selection.selectedIds.filter(
                              (id) => id !== entityId,
                            ),
                          );
                        }
                      }}
                    />
                  </TableCell>
                )}
                {columns.map((column, colIndex) => (
                  <TableCell key={column.key} sx={(column as any).sx}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {/* Show pending state chip on first column */}
                      {colIndex === 0 && pendingState && (
                        <Chip
                          size="small"
                          label={
                            pendingState === "added"
                              ? "NEW"
                              : pendingState === "edited"
                                ? "EDITED"
                                : "DELETED"
                          }
                          color={
                            pendingState === "added"
                              ? "success"
                              : pendingState === "edited"
                                ? "warning"
                                : "error"
                          }
                          variant="outlined"
                        />
                      )}
                      <span
                        style={{
                          textDecoration:
                            pendingState === "deleted"
                              ? "line-through"
                              : "none",
                        }}
                      >
                        {column.render ? column.render(displayItem) : displayItem[column.key]}
                      </span>
                    </Box>
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    {actions
                      .filter((action) => !action.hidden?.(item))
                      .map((action) => (
                        <IconButton
                          key={action.key}
                          onClick={() => action.onClick?.(item)}
                          disabled={action.disabled?.(item)}
                          color={action.color}
                          size="small"
                        >
                          {action.icon && <action.icon />}
                        </IconButton>
                      ))}
                  </TableCell>
                )}
              </TableRow>
            );
          });
          })()}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// MUI-specific filter component
function MuiDataFilter({ spec, values, onFiltersChange }: DataViewFilterProps) {
  return (
    <Filter spec={spec} values={values} onFiltersChange={onFiltersChange} />
  );
}

// MUI-specific form component
function MuiDataForm<T extends Record<string, any>>({
  mode,
  fields,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  entityType = "Item",
}: DataViewFormProps<T>) {
  const [formData, setFormData] = React.useState<Partial<T>>(
    initialValues || {},
  );

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as T);
  };

  const capitalizedEntityType =
    entityType.charAt(0).toUpperCase() + entityType.slice(1);

  return (
    <Dialog open={true} onClose={onCancel} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === "create"
            ? `Create New ${capitalizedEntityType}`
            : `Edit ${capitalizedEntityType}`}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message}
            </Alert>
          )}
          {fields.map((field) => {
            if (field.type === "boolean") {
              return (
                <FormControlLabel
                  key={field.name}
                  control={
                    <Switch
                      checked={!!formData[field.name]}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.checked)
                      }
                      disabled={isSubmitting}
                    />
                  }
                  label={field.label}
                  sx={{ display: "block", mt: 2, mb: 1 }}
                />
              );
            }

            if (field.type === "select") {
              return (
                <FormControl
                  key={field.name}
                  fullWidth
                  margin="normal"
                  required={field.required}
                  size="medium"
                  sx={{
                    "& .MuiInputLabel-root": {
                      transform: "translate(14px, 10px) scale(1)",
                    },
                    "& .MuiInputLabel-shrink": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                  }}
                >
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    value={formData[field.name] || ""}
                    label={field.label}
                    onChange={(e) =>
                      handleFieldChange(field.name, e.target.value)
                    }
                    disabled={isSubmitting}
                    size="medium"
                    sx={{
                      "& .MuiSelect-select": {
                        paddingTop: "8.5px",
                        paddingBottom: "11.5px",
                      },
                    }}
                  >
                    {(field as any).options?.map((option: any) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }

            return (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                type={
                  field.type === "email"
                    ? "email"
                    : field.type === "number"
                      ? "number"
                      : field.type === "date"
                        ? "date"
                        : "text"
                }
                required={field.required}
                fullWidth
                margin="normal"
                size="medium"
                value={formData[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                disabled={isSubmitting}
                slotProps={{
                  inputLabel:
                    field.type === "date" ? { shrink: true } : undefined,
                }}
                sx={{
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 10px) scale(1)",
                  },
                  "& .MuiInputLabel-shrink": {
                    transform: "translate(14px, -9px) scale(0.75)",
                  },
                  ...(field.type === "date" && {
                    "& input[type=date]": {
                      colorScheme: "dark light",
                    },
                    "& input[type=date]::-webkit-calendar-picker-indicator": {
                      filter: "invert(var(--mui-palette-mode-dark, 0))",
                      cursor: "pointer",
                    },
                  }),
                }}
              />
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Create"
                : "Update"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// MUI-specific pagination component
function MuiDataPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
}: DataViewPaginationProps) {
  // Fix for pagination out of range error
  // When total is 0, ensure page is also 0
  const safePage = total === 0 ? 0 : Math.min(page, Math.floor((total - 1) / pageSize));
  
  return (
    <TablePagination
      component="div"
      count={total}
      page={safePage}
      rowsPerPage={pageSize}
      rowsPerPageOptions={pageSizeOptions}
      onPageChange={(_, newPage) => {
        onPageChange(newPage);
      }}
      onRowsPerPageChange={(e) => {
        const newPageSize = parseInt(e.target.value, 10);
        onPageSizeChange(newPageSize);
      }}
    />
  );
}

// MUI-specific create button component
function MuiCreateButton({
  onClick,
  label,
  disabled = false,
}: DataViewCreateButtonProps) {
  return (
    <Button variant="contained" onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  );
}


// Export the complete MUI renderer
export const MuiDataView: DataView<any> = {
  name: "MUI",
  TableComponent: MuiDataTable,
  FilterComponent: MuiDataFilter,
  FormComponent: MuiDataForm,
  CreateButtonComponent: MuiCreateButton,
  PaginationComponent: MuiDataPagination,
};
