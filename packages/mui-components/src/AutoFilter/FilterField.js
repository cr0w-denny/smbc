import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, FormHelperText, Box, } from '@mui/material';
import { SearchInput } from '../SearchInput';
export const FilterField = ({ field, value, onChange, error, }) => {
    const handleChange = (newValue) => {
        onChange(field.name, newValue);
    };
    // Don't render hidden fields
    if (field.type === 'hidden' || field.hidden) {
        return null;
    }
    const commonProps = {
        disabled: field.disabled,
        size: field.size || 'medium',
        fullWidth: field.fullWidth,
        error: !!error,
    };
    switch (field.type) {
        case 'search':
            return (_jsxs(Box, { children: [_jsx(SearchInput, { value: value || '', onChange: handleChange, placeholder: field.placeholder, disabled: field.disabled, debounceMs: field.debounceMs, size: field.size, fullWidth: field.fullWidth }), error && (_jsx(FormHelperText, { error: true, children: error }))] }));
        case 'text':
            return (_jsx(TextField, { ...commonProps, label: field.label, value: value || '', onChange: (e) => handleChange(e.target.value), placeholder: field.placeholder, required: field.required, helperText: error }));
        case 'number':
            return (_jsx(TextField, { ...commonProps, label: field.label, type: "number", value: value || '', onChange: (e) => {
                    const numValue = e.target.value === '' ? undefined : Number(e.target.value);
                    handleChange(numValue);
                }, placeholder: field.placeholder, required: field.required, helperText: error, inputProps: {
                    min: field.min,
                    max: field.max,
                    step: 'any',
                } }));
        case 'select':
            return (_jsxs(FormControl, { ...commonProps, error: !!error, children: [_jsx(InputLabel, { required: field.required, children: field.label }), _jsxs(Select, { value: value || '', onChange: (e) => handleChange(e.target.value), label: field.label, children: [!field.required && (_jsx(MenuItem, { value: "", children: _jsx("em", { children: "None" }) })), field.options?.map((option) => (_jsx(MenuItem, { value: option.value, children: option.label }, option.value)))] }), error && _jsx(FormHelperText, { children: error })] }));
        case 'checkbox':
            return (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: !!value, onChange: (e) => handleChange(e.target.checked), disabled: field.disabled, size: field.size }), label: field.label }));
        default:
            return (_jsx(TextField, { ...commonProps, label: field.label, value: value || '', onChange: (e) => handleChange(e.target.value), placeholder: field.placeholder, required: field.required, helperText: error }));
    }
};
export const FilterFieldGroup = ({ fields, values, onChange, errors, spacing = 2, direction = 'row', wrap = true, }) => {
    const visibleFields = fields.filter(field => field.type !== 'hidden' && !field.hidden);
    if (visibleFields.length === 0) {
        return null;
    }
    return (_jsx(Box, { sx: {
            display: 'flex',
            flexDirection: direction,
            gap: spacing,
            flexWrap: wrap ? 'wrap' : 'nowrap',
            alignItems: 'flex-start',
        }, children: visibleFields.map((field) => (_jsx(Box, { sx: {
                minWidth: field.fullWidth ? '100%' : direction === 'row' ? 200 : 'auto',
                flex: field.fullWidth ? '1 1 100%' : direction === 'row' ? '0 0 auto' : '1',
            }, children: _jsx(FilterField, { field: field, value: values[field.name], onChange: onChange, error: errors[field.name] }) }, field.name))) }));
};
