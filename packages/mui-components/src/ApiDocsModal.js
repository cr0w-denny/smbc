import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Dialog, DialogTitle, DialogContent, Typography, Box, IconButton, } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import SwaggerUI from "swagger-ui-react";
/**
 * A modal component for displaying API documentation using Swagger UI.
 *
 * Features:
 * - Full-screen responsive modal layout
 * - Dark mode support with custom styling
 * - Error handling for missing API specs
 * - Optimized Swagger UI configuration
 * - Debug logging for development
 */
export function ApiDocsModal({ open, onClose, appletName, apiSpec, isDarkMode = false, }) {
    // Debug logging
    React.useEffect(() => {
        if (open && apiSpec) {
            console.log("🔍 API Docs Modal opened for:", appletName);
            console.log("📄 API Spec:", apiSpec);
        }
    }, [open, appletName, apiSpec]);
    if (!apiSpec) {
        return (_jsxs(Dialog, { open: open, onClose: onClose, maxWidth: "sm", children: [_jsxs(DialogTitle, { children: ["API Documentation", _jsx(IconButton, { "aria-label": "close", onClick: onClose, sx: {
                                position: "absolute",
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                            }, size: "large", children: _jsx(CloseIcon, {}) })] }), _jsxs(DialogContent, { children: [_jsxs(Typography, { color: "error", paragraph: true, children: ["No API specification available for ", appletName] }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: "This might happen if:" }), _jsxs(Typography, { variant: "body2", color: "textSecondary", component: "ul", sx: { pl: 2 }, children: [_jsx("li", { children: "The applet doesn't export an apiSpec" }), _jsx("li", { children: "The API package isn't built properly" }), _jsx("li", { children: "The OpenAPI spec file is missing" })] })] })] }));
    }
    return (_jsxs(Dialog, { open: open, onClose: onClose, maxWidth: "lg", fullWidth: true, PaperProps: {
            sx: { height: "85vh", overflow: "visible" },
        }, children: [_jsxs(DialogTitle, { sx: { pb: 1, pr: 5 }, children: [appletName, " API Documentation", _jsx(IconButton, { "aria-label": "close", onClick: onClose, sx: {
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }, size: "large", children: _jsx(CloseIcon, {}) })] }), _jsx(DialogContent, { sx: { p: 0, overflow: "auto", height: "100%" }, children: _jsx(Box, { sx: {
                        height: "100%",
                        minHeight: 0,
                        "& .swagger-ui": {
                            height: "100%",
                            minHeight: 0,
                            overflow: "visible",
                            "& .wrapper": {
                                maxWidth: "100%",
                            },
                            "& .info": {
                                display: "none",
                            },
                            "& .servers-title": {
                                display: "none",
                            },
                            "& .scheme-container": {
                                padding: "0 0 10px",
                            },
                            "& .filter .operation-filter-input": {
                                margin: "0",
                            },
                            "& section.models": {
                                margin: "0",
                                padding: "0",
                            },
                            "& section.models .model-container": {
                                margin: "10px",
                            },
                            "& section.models .model-container .model-box": {
                                padding: "0 4px",
                            },
                            ...(isDarkMode && {
                                filter: "invert(1) hue-rotate(180deg)",
                                '& img[alt="Swagger UI"]': {
                                    filter: "invert(1) hue-rotate(180deg)",
                                },
                                "& input, & select, & textarea": {
                                    filter: "invert(1) hue-rotate(180deg)",
                                },
                                "& .opblock .opblock-section-header": {
                                    backgroundColor: "hsla(0,0%,100%,.3)",
                                },
                                "& .scheme-container": {
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                },
                            }),
                        },
                    }, children: _jsx(SwaggerUI, { spec: apiSpec, docExpansion: "list", defaultModelsExpandDepth: 1, defaultModelExpandDepth: 1, tryItOutEnabled: true, displayRequestDuration: true, filter: true, showExtensions: true, showCommonExtensions: true }) }) })] }));
}
