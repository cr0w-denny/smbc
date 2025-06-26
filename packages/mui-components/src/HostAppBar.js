import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppBar, Toolbar, Box, Button, IconButton, Tooltip, Switch, FormControlLabel, Typography, } from '@mui/material';
import { Api as ApiIcon, LightMode as LightModeIcon, DarkMode as DarkModeIcon, } from '@mui/icons-material';
/**
 * A reusable host application bar component that provides common navigation controls
 * including dark mode toggle, mock data toggle, and API documentation access.
 *
 * @example
 * ```tsx
 * <HostAppBar
 *   currentAppletInfo={currentAppletInfo}
 *   isDarkMode={isDarkMode}
 *   onDarkModeToggle={toggleDarkMode}
 *   mockEnabled={mockEnabled}
 *   onMockToggle={setMockEnabled}
 *   onApiDocsOpen={handleApiDocsOpen}
 *   drawerWidth={240}
 * />
 * ```
 */
export function HostAppBar({ currentAppletInfo, isDarkMode, onDarkModeToggle, mockEnabled, onMockToggle, onApiDocsOpen, drawerWidth = 240, children, sx, }) {
    return (_jsx(AppBar, { position: "fixed", sx: {
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
            ...sx,
        }, children: _jsx(Toolbar, { children: _jsxs(Box, { sx: { ml: "auto", display: "flex", alignItems: "center", gap: 2 }, children: [currentAppletInfo && onApiDocsOpen && (_jsx(Tooltip, { title: `View ${currentAppletInfo.hostApplet.label} API Documentation`, children: _jsx(Button, { color: "inherit", startIcon: _jsx(ApiIcon, {}), onClick: onApiDocsOpen, size: "small", sx: {
                                textTransform: "none",
                                color: "inherit",
                                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                            }, children: "API Docs" }) })), _jsx(Tooltip, { title: "Toggle dark mode", children: _jsx(IconButton, { color: "inherit", onClick: onDarkModeToggle, size: "small", sx: {
                                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                            }, children: isDarkMode ? _jsx(LightModeIcon, {}) : _jsx(DarkModeIcon, {}) }) }), _jsx(Tooltip, { title: `${mockEnabled ? "Using mock data for development" : "Using real API endpoints"} - Toggle to switch between mock and real data`, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: mockEnabled, onChange: (e) => onMockToggle(e.target.checked), size: "small", color: "secondary" }), label: _jsx(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5 }, children: _jsx(Typography, { variant: "body2", sx: { color: "inherit" }, children: "Mock Data" }) }), sx: {
                                color: "inherit",
                                "& .MuiFormControlLabel-label": { fontSize: "0.875rem" },
                            } }) }), children] }) }) }));
}
