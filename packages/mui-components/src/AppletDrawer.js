import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Toolbar, Chip, } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
/**
 * Navigation component that renders a list of navigable routes
 * with proper selection highlighting and permission-based filtering
 */
export function AppletNavigation({ currentPath, onNavigate, routes, showDebugInfo = false, totalApplets = 0, }) {
    const handleNavigation = (path) => {
        onNavigate(path);
    };
    return (_jsx(List, { children: routes.map((route) => {
            const IconComponent = route.icon;
            const isSelected = currentPath === route.path;
            return (_jsx(ListItem, { disablePadding: true, children: _jsxs(ListItemButton, { selected: isSelected, onClick: () => handleNavigation(route.path), children: [_jsx(ListItemIcon, { children: IconComponent ? _jsx(IconComponent, {}) : _jsx(DashboardIcon, {}) }), _jsx(ListItemText, { primary: route.label }), route.path === "/" && showDebugInfo && (_jsx(Chip, { label: totalApplets, size: "small", color: "primary", variant: "outlined" }))] }) }, route.path));
        }) }));
}
/**
 * A reusable drawer component for application navigation
 * that provides a consistent sidebar with navigation items
 *
 * @example
 * ```tsx
 * <AppletDrawer
 *   title="My Application"
 *   currentPath={currentPath}
 *   onNavigate={handleNavigate}
 *   routes={navigationRoutes}
 *   width={240}
 *   showDebugInfo={true}
 *   totalApplets={5}
 * />
 * ```
 */
export function AppletDrawer({ title = "Application", width = 240, currentPath, onNavigate, routes, showDebugInfo = false, totalApplets = 0, headerContent, footerContent, sx, }) {
    return (_jsxs(Drawer, { variant: "permanent", sx: {
            width: width,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
                width: width,
                boxSizing: "border-box",
            },
            ...sx,
        }, children: [_jsx(Toolbar, { children: _jsx(Typography, { variant: "h6", noWrap: true, component: "div", children: title }) }), headerContent && (_jsx(Box, { sx: { px: 2, py: 1 }, children: headerContent })), _jsx(AppletNavigation, { currentPath: currentPath, onNavigate: onNavigate, routes: routes, showDebugInfo: showDebugInfo, totalApplets: totalApplets }), footerContent && (_jsx(Box, { sx: { px: 2, py: 1, mt: 'auto' }, children: footerContent }))] }));
}
