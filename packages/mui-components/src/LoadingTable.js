import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, } from '@mui/material';
/**
 * A reusable loading table skeleton component that shows
 * placeholder content while data is being fetched
 */
export const LoadingTable = ({ rows = 5, columns = 4, rowHeight = 53, }) => {
    return (_jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsx(TableRow, { children: Array.from({ length: columns }).map((_, index) => (_jsx(TableCell, { children: _jsx(Skeleton, { variant: "text", width: "80%" }) }, `header-${index}`))) }) }), _jsx(TableBody, { children: Array.from({ length: rows }).map((_, rowIndex) => (_jsx(TableRow, { children: Array.from({ length: columns }).map((_, colIndex) => (_jsx(TableCell, { children: _jsx(Box, { sx: { height: rowHeight - 20, display: 'flex', alignItems: 'center' }, children: _jsx(Skeleton, { variant: "text", width: colIndex === 0 ? '60%' : colIndex === columns - 1 ? '40%' : '80%' }) }) }, `cell-${rowIndex}-${colIndex}`))) }, `row-${rowIndex}`))) })] }) }));
};
