import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Paper,
} from "@mui/material";
import { Close as CloseIcon, Code as CodeIcon } from "@mui/icons-material";
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
 * Custom Swagger UI plugin to enhance parameter documentation with mock response information.
 * This plugin intercepts parameter rendering to inject x-mock-response documentation
 * directly into the relevant parameter's description.
 */
const MockResponsePlugin = {
  wrapComponents: {
    parameterRow: (Original: any) => (props: any) => {
      const { param, specPath, specSelectors } = props;
      const paramName = param.get("name");
      const paramIn = param.get("in");

      // Only process query parameters
      if (paramIn !== "query") {
        return <Original {...props} />;
      }

      let enhancedParam = param;
      let mockInfoAdded = false;

      // Get the full spec
      const spec = specSelectors.spec();
      const specJS = spec.toJS();

      // Check for x-mock-response at operation level
      if (specPath && specPath.size >= 3) {
        const pathSegments = specPath.toJS();
        const pathKey = pathSegments[1]; // e.g., "/users"
        const method = pathSegments[2]; // e.g., "get"

        const operation = specJS?.paths?.[pathKey]?.[method];
        const mockResponse = operation?.["x-mock-response"];

        if (mockResponse && mockResponse.case === paramName) {
          const currentDesc = enhancedParam.get("description") || "";
          const mockInfo =
            "\n\n**Mock Response Behavior:**\n" +
            Object.entries(mockResponse.when || {})
              .map(
                ([value, responseType]) =>
                  `- \`${value}\`: Returns \`${responseType}\` objects`,
              )
              .join("\n") +
            (mockResponse.default
              ? `\n- *Default*: Returns \`${mockResponse.default}\` objects`
              : "");

          enhancedParam = enhancedParam.set("description", currentDesc + mockInfo);
          mockInfoAdded = true;
        }
      }

      // Format parameter-level x-mock-* extensions
      const schema = param.get("schema");
      if (schema) {
        const schemaJS = schema.toJS ? schema.toJS() : schema;
        const mockExtensions = Object.entries(schemaJS || {})
          .filter(([key]) => key.startsWith("x-mock-"))
          .filter(([, value]) => value !== true); // Skip simple boolean flags

        if (mockExtensions.length > 0 && !mockInfoAdded) {
          const currentDesc = enhancedParam.get("description") || "";
          let extensionInfo = "\n\n**Mock Configuration:**\n";

          mockExtensions.forEach(([key, value]) => {
            if (key === "x-mock-filter" && typeof value === "object" && value) {
              const filterValue = value as { strategy: string; field: string };
              extensionInfo += `- Filter: ${filterValue.strategy} on field \`${filterValue.field}\`\n`;
            } else if (key === "x-mock-search" && typeof value === "object" && value) {
              const searchValue = value as { fields: string[] };
              extensionInfo += `- Search fields: ${searchValue.fields.join(", ")}\n`;
            } else if (key === "x-mock-data" && typeof value === "object" && value) {
              const dataValue = value as { faker?: string; unique?: boolean; weight?: number; relative?: string; format?: string };
              if (dataValue.faker) {
                extensionInfo += `- Generated using: \`${dataValue.faker}\``;
                if (dataValue.unique) extensionInfo += " (unique)";
                if (dataValue.weight !== undefined) extensionInfo += ` with ${dataValue.weight * 100}% probability`;
                extensionInfo += "\n";
              }
              if (dataValue.relative) {
                extensionInfo += `- Date range: ${dataValue.relative}`;
                if (dataValue.format) extensionInfo += ` (format: ${dataValue.format})`;
                extensionInfo += "\n";
              }
            } else if (key === "x-mock-sort") {
              extensionInfo += `- Sortable field\n`;
            } else if (key === "x-mock-pagination") {
              extensionInfo += `- Pagination parameter\n`;
            }
          });

          enhancedParam = enhancedParam.set("description", currentDesc + extensionInfo);
        }
      }

      return <Original {...props} param={enhancedParam} />;
    },

    // Still wrap operation to show other extensions (non x-mock-response)
    operation: (Original: any) => (props: any) => {
      const operation = props.operation?.toJS
        ? props.operation.toJS()
        : props.operation;

      // Extract all x-* extensions except x-mock-response
      const extensions = Object.entries(operation || {})
        .filter(([key]) => key.startsWith("x-") && key !== "x-mock-response")
        .reduce(
          (acc, [key, value]) => ({ ...acc, [key]: value }),
          {} as Record<string, any>,
        );

      const hasExtensions = Object.keys(extensions).length > 0;

      return (
        <>
          <Original {...props} />
          {hasExtensions && (
            <Box
              className="opblock-section opblock-section-operation-extensions"
              sx={{
                margin: "0 0 0 0",
                padding: "15px 20px",
                "& .opblock-section-header": {
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  marginBottom: "10px",
                },
              }}
            >
              <Box className="opblock-section-header">
                <Typography
                  component="h4"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    margin: 0,
                    fontFamily: "sans-serif",
                  }}
                >
                  Extensions
                </Typography>
                <Chip
                  icon={<CodeIcon />}
                  label="Operation Level"
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "11px",
                    height: "20px",
                    "& .MuiChip-icon": {
                      fontSize: "14px",
                    },
                  }}
                />
              </Box>
              <Paper
                variant="outlined"
                sx={{
                  padding: "12px",
                  backgroundColor: "rgba(0, 0, 0, 0.02)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "4px",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    lineHeight: "1.5",
                    fontFamily: "Monaco, monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {JSON.stringify(extensions, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </>
      );
    },
  },
};

/**
 * A modal component for displaying API documentation using Swagger UI.
 *
 * Features:
 * - Full-screen responsive modal layout
 * - Dark mode support with custom styling
 * - Error handling for missing API specs
 * - Optimized Swagger UI configuration
 * - Custom plugin to display operation-level extensions
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
            showExtensions={false}
            showCommonExtensions={false}
            plugins={[MockResponsePlugin]}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
