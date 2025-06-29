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
} from "@mui/material";
import { Filter } from "./Filter";
import type {
  DataView,
  DataViewTableProps,
  DataViewFilterProps,
  DataViewFormProps,
  DataViewPaginationProps,
  DataViewCreateButtonProps,
} from "@smbc/react-dataview";

// MUI-specific table component
function MuiDataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  isLoading,
  error,
  onRowClick,
  selection,
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
                  indeterminate={
                    selection.selectedIds.length > 0 &&
                    selection.selectedIds.length < data.length
                  }
                  checked={
                    data.length > 0 &&
                    selection.selectedIds.length === data.length
                  }
                  onChange={(event) => {
                    if (event.target.checked) {
                      selection.onSelectionChange(data.map((item) => item.id));
                    } else {
                      selection.onSelectionChange([]);
                    }
                  }}
                />
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell key={column.key}>{column.label}</TableCell>
            ))}
            {actions.length > 0 && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={item.id || index}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              sx={{ cursor: onRowClick ? "pointer" : "default" }}
            >
              {selection?.enabled && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selection.selectedIds.includes(item.id)}
                    onChange={(event) => {
                      if (event.target.checked) {
                        selection.onSelectionChange([
                          ...selection.selectedIds,
                          item.id,
                        ]);
                      } else {
                        selection.onSelectionChange(
                          selection.selectedIds.filter((id) => id !== item.id),
                        );
                      }
                    }}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render ? column.render(item) : item[column.key]}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="right">
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
          ))}
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

  return (
    <Dialog open={true} onClose={onCancel} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === "create" ? "Create New Item" : "Edit Item"}
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
                      onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                      disabled={isSubmitting}
                    />
                  }
                  label={field.label}
                  sx={{ display: 'block', mt: 2, mb: 1 }}
                />
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
                      : "text"
                }
                required={field.required}
                fullWidth
                margin="normal"
                value={formData[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                disabled={isSubmitting}
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
  return (
    <TablePagination
      component="div"
      count={total}
      page={page}
      rowsPerPage={pageSize}
      rowsPerPageOptions={pageSizeOptions}
      onPageChange={(_, newPage) => onPageChange(newPage)}
      onRowsPerPageChange={(e) =>
        onPageSizeChange(parseInt(e.target.value, 10))
      }
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
    <Button 
      variant="contained" 
      onClick={onClick} 
      disabled={disabled}
    >
      {label}
    </Button>
  );
}

// Map columns to MUI table format
function mapColumnsForMui(columns: any[]) {
  return columns.map((column) => ({
    ...column,
    // MUI-specific column properties could be added here
  }));
}

// Map filters to MUI filter format
function mapFiltersForMui(filters: any) {
  return {
    ...filters,
    // MUI-specific filter properties could be added here
  };
}

// Map form fields to MUI form field format
function mapFormFieldsForMui(fields: any[]) {
  return fields.map((field) => ({
    ...field,
    // MUI-specific field properties could be added here
  }));
}

// Export the complete MUI renderer
export const MuiDataView: DataView<any> = {
  name: "MUI",
  TableComponent: MuiDataTable,
  FilterComponent: MuiDataFilter,
  FormComponent: MuiDataForm,
  CreateButtonComponent: MuiCreateButton,
  PaginationComponent: MuiDataPagination,
  mapColumns: mapColumnsForMui,
  mapFilters: mapFiltersForMui,
  mapFormFields: mapFormFieldsForMui,
};
