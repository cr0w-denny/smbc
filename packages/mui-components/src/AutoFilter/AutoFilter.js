import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AutoFilter - Main component for auto-generating filter UIs from OpenAPI specs
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, IconButton, Collapse, Divider, Tooltip, } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Clear as ClearIcon, Tune as TuneIcon, } from '@mui/icons-material';
import { FilterFieldGroup } from './FilterField';
import { useAutoFilterFromOperation, useAutoFilterFromFields } from './useAutoFilter';
import { cleanFilterValues, validateFilterValues } from './utils';
/**
 * AutoFilter component using operation types (recommended approach)
 */
export function AutoFilterFromOperation({ operationType, onFiltersChange, values: controlledValues, config = {}, visible = true, collapsible = false, defaultCollapsed = false, title = 'Filters', showClearButton = true, showFilterCount = true, debounceMs = 300, sx, }) {
    const { fields, initialValues } = useAutoFilterFromOperation(operationType, config);
    return (_jsx(AutoFilterCore, { fields: fields, initialValues: initialValues, onFiltersChange: onFiltersChange, values: controlledValues, visible: visible, collapsible: collapsible, defaultCollapsed: defaultCollapsed, title: title, showClearButton: showClearButton, showFilterCount: showFilterCount, debounceMs: debounceMs, sx: sx }));
}
/**
 * AutoFilter component using manual field definitions
 */
export function AutoFilterFromFields({ fields: fieldConfigs, onFiltersChange, values: controlledValues, config = {}, visible = true, collapsible = false, defaultCollapsed = false, title = 'Filters', showClearButton = true, showFilterCount = true, debounceMs = 300, sx, }) {
    const { fields, initialValues } = useAutoFilterFromFields(fieldConfigs, config);
    return (_jsx(AutoFilterCore, { fields: fields, initialValues: initialValues, onFiltersChange: onFiltersChange, values: controlledValues, visible: visible, collapsible: collapsible, defaultCollapsed: defaultCollapsed, title: title, showClearButton: showClearButton, showFilterCount: showFilterCount, debounceMs: debounceMs, sx: sx }));
}
function AutoFilterCore({ fields, initialValues, onFiltersChange, values: controlledValues, visible, collapsible, defaultCollapsed, title, showClearButton, showFilterCount, debounceMs, sx, }) {
    const [internalValues, setInternalValues] = useState(controlledValues || initialValues);
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [errors, setErrors] = useState({});
    const isControlled = controlledValues !== undefined;
    const currentValues = isControlled ? controlledValues : internalValues;
    // Update internal values when controlled values change
    useEffect(() => {
        if (isControlled && controlledValues) {
            setInternalValues(controlledValues);
        }
    }, [controlledValues, isControlled]);
    // Debounced filter change handler
    const debouncedOnFiltersChange = useCallback(debounceCallback((filters) => {
        const cleaned = cleanFilterValues(filters);
        onFiltersChange(cleaned);
    }, debounceMs), [onFiltersChange, debounceMs]);
    const handleFieldChange = useCallback((name, value) => {
        const newValues = { ...currentValues, [name]: value };
        // Validate
        const newErrors = validateFilterValues(newValues, fields);
        setErrors(newErrors);
        // Update state
        if (!isControlled) {
            setInternalValues(newValues);
        }
        // Notify parent (debounced)
        debouncedOnFiltersChange(newValues);
    }, [currentValues, fields, isControlled, debouncedOnFiltersChange]);
    const handleClearFilters = useCallback(() => {
        const clearedValues = { ...initialValues };
        if (!isControlled) {
            setInternalValues(clearedValues);
        }
        setErrors({});
        onFiltersChange(clearedValues);
    }, [initialValues, isControlled, onFiltersChange]);
    const toggleCollapsed = useCallback(() => {
        setIsCollapsed(prev => !prev);
    }, []);
    // Count active filters (non-empty, non-default values)
    const activeFilterCount = React.useMemo(() => {
        return Object.entries(currentValues).filter(([key, value]) => {
            const field = fields.find(f => f.name === key);
            if (!field || field.type === 'hidden')
                return false;
            const defaultValue = field.defaultValue;
            return value !== undefined &&
                value !== null &&
                value !== '' &&
                value !== defaultValue;
        }).length;
    }, [currentValues, fields]);
    if (!visible) {
        return null;
    }
    const visibleFields = fields.filter(f => f.type !== 'hidden' && !f.hidden);
    if (visibleFields.length === 0) {
        return null;
    }
    return (_jsxs(Paper, { elevation: 1, sx: {
            p: 2,
            mb: 2,
            ...sx,
        }, children: [_jsxs(Box, { sx: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: collapsible || !isCollapsed ? 1 : 0,
                }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(TuneIcon, { color: "action" }), _jsx(Typography, { variant: "subtitle1", fontWeight: "medium", children: title }), showFilterCount && activeFilterCount > 0 && (_jsx(Typography, { variant: "caption", sx: {
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    fontWeight: 'medium',
                                }, children: activeFilterCount }))] }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 0.5 }, children: [showClearButton && activeFilterCount > 0 && (_jsx(Tooltip, { title: "Clear all filters", children: _jsx(IconButton, { size: "small", onClick: handleClearFilters, children: _jsx(ClearIcon, {}) }) })), collapsible && (_jsx(Tooltip, { title: isCollapsed ? 'Show filters' : 'Hide filters', children: _jsx(IconButton, { size: "small", onClick: toggleCollapsed, children: isCollapsed ? _jsx(ExpandMoreIcon, {}) : _jsx(ExpandLessIcon, {}) }) }))] })] }), _jsx(Collapse, { in: !isCollapsed, timeout: 200, children: _jsxs(Box, { children: [_jsx(Divider, { sx: { mb: 2 } }), _jsx(FilterFieldGroup, { fields: visibleFields, values: currentValues, onChange: handleFieldChange, errors: errors, spacing: 2, direction: "row", wrap: true })] }) })] }));
}
/**
 * Simple debounce utility
 */
function debounceCallback(callback, delay) {
    let timeoutId;
    return ((...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(...args), delay);
    });
}
// Export the main components
export const AutoFilter = {
    fromOperation: AutoFilterFromOperation,
    fromFields: AutoFilterFromFields,
};
// Default export for backwards compatibility
export default AutoFilter;
