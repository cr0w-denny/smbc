import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TablePagination, Alert, Box, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Switch, Select, MenuItem, FormControl, InputLabel, Chip, } from "@mui/material";
import { Filter, LoadingTable } from "@smbc/mui-components";
// MUI-specific table component
function MuiDataTable({ data, columns, actions = [], isLoading, error, onRowClick, selection, transactionState, primaryKey = 'id', hover = false, rendererConfig: _rendererConfig, }) {
    if (error) {
        return _jsx(Alert, { severity: "error", children: error.message });
    }
    if (isLoading) {
        const totalColumns = columns.length + (selection?.enabled ? 1 : 0) + (actions.length > 0 ? 1 : 0);
        return (_jsx(LoadingTable, { rows: 10, columns: totalColumns, rowHeight: 60 }));
    }
    return (_jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [selection?.enabled && (_jsx(TableCell, { padding: "checkbox", children: _jsx(Checkbox, { indeterminate: (() => {
                                        const currentPageIds = data.map((item) => item[primaryKey]);
                                        const selectedOnPage = currentPageIds.filter((id) => selection.selectedIds.includes(id)).length;
                                        return selectedOnPage > 0 && selectedOnPage < data.length;
                                    })(), checked: (() => {
                                        if (data.length === 0)
                                            return false;
                                        const currentPageIds = data.map((item) => item[primaryKey]);
                                        return currentPageIds.every((id) => selection.selectedIds.includes(id));
                                    })(), onChange: (event) => {
                                        const currentPageIds = data.map((item) => item[primaryKey]);
                                        if (event.target.checked) {
                                            // Add current page IDs to existing selection
                                            const newSelection = [
                                                ...new Set([
                                                    ...selection.selectedIds,
                                                    ...currentPageIds,
                                                ]),
                                            ];
                                            selection.onSelectionChange(newSelection);
                                        }
                                        else {
                                            // Remove current page IDs from selection
                                            const newSelection = selection.selectedIds.filter((id) => !currentPageIds.includes(id));
                                            selection.onSelectionChange(newSelection);
                                        }
                                    } }) })), columns.map((column) => (_jsx(TableCell, { sx: column.sx, children: column.label }, column.key))), actions.length > 0 && _jsx(TableCell, { align: "right", children: "Actions" })] }) }), _jsx(TableBody, { children: (() => {
                        let displayData = [...data];
                        // If we have an active transaction or pending states, prepend pending created items
                        if (transactionState && transactionState.pendingStates && transactionState.pendingStates.size > 0) {
                            const pendingCreatedItems = [];
                            transactionState.pendingStates.forEach((stateInfo, id) => {
                                console.log("🔵 MuiDataView: Processing pending state", { id, state: stateInfo.state, hasData: !!stateInfo.data });
                                // For 'added' state, always include
                                if (stateInfo.state === 'added' && stateInfo.data) {
                                    // Only add if this item isn't already in the data (shouldn't happen but be safe)
                                    if (!data.some(item => item[primaryKey] === id)) {
                                        pendingCreatedItems.push({
                                            ...stateInfo.data,
                                            [primaryKey]: id
                                        });
                                    }
                                }
                                // For 'edited' state, only include if it's an edited version of a pending created item
                                // This happens when you create an item and then immediately edit it before committing
                                else if (stateInfo.state === 'edited' && stateInfo.data) {
                                    // Check if this was originally a created item (temp ID or not in original dataset)
                                    const isEditedCreatedItem = typeof id === 'string' && id.startsWith('temp-');
                                    if (isEditedCreatedItem && !data.some(item => item[primaryKey] === id)) {
                                        pendingCreatedItems.push({
                                            ...stateInfo.data,
                                            [primaryKey]: id
                                        });
                                    }
                                }
                                // For 'deleted' state, include if it's a deleted version of a pending created item
                                // This happens when you create an item and then delete it before committing
                                else if (stateInfo.state === 'deleted' && stateInfo.data) {
                                    // Check if this was originally a created item (temp ID or not in original dataset)
                                    const isDeletedCreatedItem = typeof id === 'string' && id.startsWith('temp_');
                                    console.log("🟡 MuiDataView: Checking deleted item", {
                                        id,
                                        stateInfo,
                                        isDeletedCreatedItem,
                                        inOriginalData: data.some(item => item[primaryKey] === id),
                                    });
                                    if (isDeletedCreatedItem && !data.some(item => item[primaryKey] === id)) {
                                        console.log("🟡 MuiDataView: Including deleted created item", { id, data: stateInfo.data });
                                        pendingCreatedItems.push({
                                            ...stateInfo.data,
                                            [primaryKey]: id
                                        });
                                    }
                                }
                            });
                            // Prepend pending created items to the beginning
                            displayData = [...pendingCreatedItems, ...displayData];
                        }
                        return displayData.map((item, index) => {
                            // Get pending state from transaction state (if any)
                            const entityId = item[primaryKey];
                            const pendingStateInfo = transactionState?.pendingStates
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
                            return (_jsxs(TableRow, { hover: hover, onClick: onRowClick ? () => onRowClick(item) : undefined, sx: {
                                    cursor: onRowClick ? "pointer" : "default",
                                    ...getPendingStyles(),
                                }, children: [selection?.enabled && (_jsx(TableCell, { padding: "checkbox", children: _jsx(Checkbox, { checked: selection.selectedIds.includes(entityId), onChange: (event) => {
                                                if (event.target.checked) {
                                                    selection.onSelectionChange([
                                                        ...selection.selectedIds,
                                                        entityId,
                                                    ]);
                                                }
                                                else {
                                                    selection.onSelectionChange(selection.selectedIds.filter((id) => id !== entityId));
                                                }
                                            } }) })), columns.map((column, colIndex) => (_jsx(TableCell, { sx: column.sx, children: _jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [colIndex === 0 && pendingState && (_jsx(Chip, { size: "small", label: pendingState === "added"
                                                        ? "NEW"
                                                        : pendingState === "edited"
                                                            ? "EDITED"
                                                            : "DELETED", color: pendingState === "added"
                                                        ? "success"
                                                        : pendingState === "edited"
                                                            ? "warning"
                                                            : "error", variant: "outlined" })), _jsx("span", { style: {
                                                        textDecoration: pendingState === "deleted"
                                                            ? "line-through"
                                                            : "none",
                                                    }, children: column.render ? column.render(displayItem) : displayItem[column.key] })] }) }, column.key))), actions.length > 0 && (_jsx(TableCell, { align: "right", sx: { whiteSpace: "nowrap" }, children: actions
                                            .filter((action) => !action.hidden?.(item))
                                            .map((action) => (_jsx(IconButton, { onClick: () => action.onClick?.(item), disabled: action.disabled?.(item), color: action.color, size: "small", children: action.icon && _jsx(action.icon, {}) }, action.key))) }))] }, entityId || index));
                        });
                    })() })] }) }));
}
// MUI-specific filter component
function MuiDataFilter({ spec, values, onFiltersChange }) {
    return (_jsx(Filter, { spec: spec, values: values, onFiltersChange: onFiltersChange }));
}
// MUI-specific form component
function MuiDataForm({ mode, fields, initialValues, onSubmit, onCancel, isSubmitting, error, entityType = "Item", }) {
    const [formData, setFormData] = React.useState(initialValues || {});
    const handleFieldChange = (fieldName, value) => {
        setFormData((prev) => ({ ...prev, [fieldName]: value }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };
    const capitalizedEntityType = entityType.charAt(0).toUpperCase() + entityType.slice(1);
    return (_jsx(Dialog, { open: true, onClose: onCancel, maxWidth: "sm", fullWidth: true, children: _jsxs("form", { onSubmit: handleSubmit, children: [_jsx(DialogTitle, { children: mode === "create"
                        ? `Create New ${capitalizedEntityType}`
                        : `Edit ${capitalizedEntityType}` }), _jsxs(DialogContent, { children: [error && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error.message })), fields.map((field) => {
                            if (field.type === "boolean") {
                                return (_jsx(FormControlLabel, { control: _jsx(Switch, { checked: !!formData[field.name], onChange: (e) => handleFieldChange(field.name, e.target.checked), disabled: isSubmitting }), label: field.label, sx: { display: "block", mt: 2, mb: 1 } }, field.name));
                            }
                            if (field.type === "select") {
                                return (_jsxs(FormControl, { fullWidth: true, margin: "normal", required: field.required, size: "medium", sx: {
                                        "& .MuiInputLabel-root": {
                                            transform: "translate(14px, 10px) scale(1)",
                                        },
                                        "& .MuiInputLabel-shrink": {
                                            transform: "translate(14px, -9px) scale(0.75)",
                                        },
                                    }, children: [_jsx(InputLabel, { children: field.label }), _jsx(Select, { value: formData[field.name] || "", label: field.label, onChange: (e) => handleFieldChange(field.name, e.target.value), disabled: isSubmitting, size: "medium", sx: {
                                                "& .MuiSelect-select": {
                                                    paddingTop: "8.5px",
                                                    paddingBottom: "11.5px",
                                                },
                                            }, children: field.options?.map((option) => (_jsx(MenuItem, { value: option.value, children: option.label }, option.value))) })] }, field.name));
                            }
                            return (_jsx(TextField, { name: field.name, label: field.label, type: field.type === "email"
                                    ? "email"
                                    : field.type === "number"
                                        ? "number"
                                        : field.type === "date"
                                            ? "date"
                                            : "text", required: field.required, fullWidth: true, margin: "normal", size: "medium", value: formData[field.name] || "", onChange: (e) => handleFieldChange(field.name, e.target.value), disabled: isSubmitting, slotProps: {
                                    inputLabel: field.type === "date" ? { shrink: true } : undefined,
                                }, sx: {
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
                                } }, field.name));
                        })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: onCancel, disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "contained", disabled: isSubmitting, children: isSubmitting
                                ? "Saving..."
                                : mode === "create"
                                    ? "Create"
                                    : "Update" })] })] }) }));
}
// MUI-specific pagination component
function MuiDataPagination({ page, pageSize, total, onPageChange, onPageSizeChange, pageSizeOptions = [5, 10, 25, 50], }) {
    // Fix for pagination out of range error
    // When total is 0, ensure page is also 0
    const safePage = total === 0 ? 0 : Math.min(page, Math.floor((total - 1) / pageSize));
    return (_jsx(TablePagination, { component: "div", count: total, page: safePage, rowsPerPage: pageSize, rowsPerPageOptions: pageSizeOptions, onPageChange: (_, newPage) => {
            onPageChange(newPage);
        }, onRowsPerPageChange: (e) => {
            const newPageSize = parseInt(e.target.value, 10);
            onPageSizeChange(newPageSize);
        } }));
}
// MUI-specific create button component
function MuiCreateButton({ onClick, label, disabled = false, }) {
    return (_jsx(Button, { variant: "contained", onClick: onClick, disabled: disabled, children: label }));
}
// Export the complete MUI renderer
export const MuiDataView = {
    name: "MUI",
    TableComponent: MuiDataTable,
    FilterComponent: MuiDataFilter,
    FormComponent: MuiDataForm,
    CreateButtonComponent: MuiCreateButton,
    PaginationComponent: MuiDataPagination,
};
