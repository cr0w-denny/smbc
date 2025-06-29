import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import SwaggerUI from "swagger-ui-react";
// Note: swagger-ui-react CSS must be imported by the host application
// import 'swagger-ui-react/swagger-ui.css' in your app's main.tsx or App.tsx

export interface ApiDocsModalProps {
  /** Controls whether the modal is open */
  open: boolean;
  /** Function called when the modal should be closed */
  onClose: () => void;
  /** Name of the applet/service for display */
  appletName: string;
  /** OpenAPI/Swagger specification object */
  apiSpec: any;
  /** Whether to apply dark mode styling to Swagger UI */
  isDarkMode?: boolean;
}

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
export function ApiDocsModal({
  open,
  onClose,
  appletName,
  apiSpec,
  isDarkMode = false,
}: ApiDocsModalProps) {
  // Debug logging
  React.useEffect(() => {
    if (open && apiSpec) {
      console.log("🔍 API Docs Modal opened for:", appletName);
      console.log("📄 API Spec:", apiSpec);
    }
  }, [open, appletName, apiSpec]);

  if (!apiSpec) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm">
        <DialogTitle>
          API Documentation
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography color="error" paragraph>
            No API specification available for {appletName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This might happen if:
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            component="ul"
            sx={{ pl: 2 }}
          >
            <li>The applet doesn't export an apiSpec</li>
            <li>The API package isn't built properly</li>
            <li>The OpenAPI spec file is missing</li>
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: "85vh", overflow: "visible" },
      }}
    >
      <DialogTitle sx={{ pb: 1, pr: 5 }}>
        {appletName} API Documentation
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, overflow: "auto", height: "100%" }}>
        <Box
          sx={{
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
              "& .opblock-tag": {
                paddingRight: "5px !important",
              },
              "& section.models h4": {
                paddingRight: "10px !important",
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
              "& section.models.is-open": {
                margin: "0 !important",
              },
              "& section.models .model-container": {
                margin: "10px !important",
              },
              "& section.models .model-container .model-box": {
                padding: "0 4px",
              },
              "& .wrapper:last-child": {
                paddingBottom: "20px",
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
          }}
        >
          <SwaggerUI
            spec={apiSpec}
            docExpansion="list"
            defaultModelsExpandDepth={1}
            defaultModelExpandDepth={1}
            tryItOutEnabled={true}
            displayRequestDuration={true}
            filter={true}
            showExtensions={true}
            showCommonExtensions={true}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
