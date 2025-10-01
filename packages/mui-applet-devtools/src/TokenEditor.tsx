import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Snackbar,
  Chip,
  Stack,
  MenuItem,
  Tooltip,
  Menu,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { tokens } from "@smbc/ui-core";
import { useFeatureFlagEnabled } from "@smbc/applet-core";
import { ContextEditor } from "./ContextEditor";

// Helper function to build complete token structure with overrides applied
const buildCompleteTokenStructure = (overrides: Record<string, any>): any => {
  const result = JSON.parse(JSON.stringify(tokens)); // Deep clone

  // Apply any overrides
  for (const [path, value] of Object.entries(overrides)) {
    setNestedValue(result, path, value);
  }

  return result;
};

// Helper to set a nested value using dot notation
const setNestedValue = (obj: any, path: string, value: any): void => {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
};

// Helper function to get original token value without overrides
const getOriginalTokenValue = (path: string): any => {
  const pathParts = path.split(".");
  let current = tokens;

  for (const part of pathParts) {
    current = (current as any)?.[part];
  }
  return current;
};

// Helper function to compare imported structure with current tokens
const createMinimalOverrides = (importedTokens: any): Record<string, any> => {
  const overrides: Record<string, any> = {};

  const traverse = (imported: any, currentPath: string) => {
    if (typeof imported !== "object" || imported === null) {
      // Compare leaf value with original
      const originalValue = getOriginalTokenValue(currentPath);
      if (imported !== originalValue) {
        console.log(`Override detected: ${currentPath}`, {
          imported,
          originalValue,
        });

        // Check if this is a theme token (has light/dark structure)
        if (currentPath.endsWith(".light") || currentPath.endsWith(".dark")) {
          const basePath = currentPath.replace(/\.(light|dark)$/, "");
          const mode = currentPath.endsWith(".light") ? "light" : "dark";

          if (!overrides[basePath]) {
            overrides[basePath] = {};
          }
          if (typeof overrides[basePath] === "object") {
            overrides[basePath][mode] = imported;
          }
        } else {
          overrides[currentPath] = imported;
        }
      }
    } else {
      for (const [key, value] of Object.entries(imported)) {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        traverse(value, newPath);
      }
    }
  };

  traverse(importedTokens, "");
  return overrides;
};

// Helper to detect property type from name
const detectPropertyType = (
  propertyName: string,
):
  | "color"
  | "spacing"
  | "size"
  | "border"
  | "shadow"
  | "typography"
  | "text" => {
  const name = propertyName.toLowerCase();

  if (
    name.includes("color") ||
    name.includes("text") ||
    name.includes("background")
  ) {
    return "color";
  }
  if (
    name.includes("spacing") ||
    name.includes("margin") ||
    name.includes("padding")
  ) {
    return "spacing";
  }
  if (
    name.includes("size") ||
    name.includes("width") ||
    name.includes("height")
  ) {
    return "size";
  }
  if (name.includes("radius") || name.includes("border")) {
    return "border";
  }
  if (name.includes("shadow")) {
    return "shadow";
  }
  if (
    name.includes("font") ||
    name.includes("weight") ||
    name.includes("family")
  ) {
    return "typography";
  }

  return "text";
};

// Helper to check if a value is a theme-aware token
const isThemeToken = (value: any): value is { light: string; dark: string } => {
  return (
    typeof value === "object" &&
    value !== null &&
    "light" in value &&
    "dark" in value
  );
};

interface ComponentPropertiesGridProps {
  componentTokens: any;
  componentName: string;
  selectedVariant: string;
  selectedState: string;
  tokenOverrides: Record<string, any>;
  onTokenChange: (path: string, value: any, context?: string) => void;
  onTokenClear: (path: string, context?: string) => void;
  onVariantChange: (variant: string) => void;
  onStateChange: (state: string) => void;
}

const ComponentPropertiesGrid: React.FC<ComponentPropertiesGridProps> = ({
  componentTokens,
  componentName,
  selectedVariant,
  selectedState,
  tokenOverrides,
  onTokenChange,
  onTokenClear,
}) => {
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(
    new Set(),
  );
  const [contextMenuAnchor, setContextMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const [contextMenuProperty, setContextMenuProperty] =
    React.useState<string>("");

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };
  const isDarkMode = useFeatureFlagEnabled("darkMode");

  // Available contexts for styling
  const availableContexts = [
    { id: "global", label: "Global", description: "Default styles" },
    { id: "app", label: "App", description: "Within main application" },
    {
      id: "appheader",
      label: "App Header",
      description: "Within app header/navigation",
    },
    {
      id: "apptoolbar",
      label: "App Toolbar",
      description: "Within app toolbar",
    },
    {
      id: "appcontent",
      label: "App Content",
      description: "Within app content area",
    },
    { id: "modal", label: "Modal", description: "Within modal dialogs" },
    { id: "card", label: "Card", description: "Within card components" },
  ];

  // Helper function to build token path based on new structure
  const buildTokenPath = (
    component: string,
    variant: string,
    state: string,
    property: string = "",
  ) => {
    let path = `ui.${component}`;

    // Handle "all" variant - build path from property parameter directly
    if (variant === "all") {
      if (property) {
        path += `.${property}`;
      }
      return path;
    }

    // For state-based properties, the property parameter already contains the full path like "on.hover.background"
    // We don't need to add variant/state information again
    if (property && property.startsWith("on.")) {
      path += `.${property}`;
      return path;
    }

    // For class-based properties that include state, same logic applies
    if (property && property.startsWith("classes.")) {
      path += `.${property}`;
      return path;
    }

    if (variant === "props") {
      // Direct props: ui.button.borderRadius (no .props wrapper)
      // path stays as ui.component
    } else if (variant === "on") {
      // States: ui.button.on.hover.borderColor
      path += ".on";
      if (state) {
        path += `.${state}`;
      }
    } else if (variant.startsWith("classes.")) {
      // Classes: ui.button.classes.secondary.borderRadius or ui.button.classes.secondary.on.hover.borderColor
      const className = variant.replace("classes.", "");
      path += `.classes.${className}`;
      if (state === "on") {
        path += ".on";
      } else if (state.startsWith("on.")) {
        const stateName = state.replace("on.", "");
        path += `.on.${stateName}`;
      }
    }

    if (property) {
      path += `.${property}`;
    }

    return path;
  };

  // Group overrides by context for current component and state
  const getOverridesByContext = useMemo(() => {
    const result: Record<string, Record<string, any>> = {};

    Object.entries(tokenOverrides).forEach(([key, value]) => {
      const componentPrefix = `ui.${componentName}.`;

      if (key.includes(":")) {
        // Context-specific override (e.g., "appbar:ui.input.borderColor")
        const [context, path] = key.split(":", 2);
        if (path.startsWith(componentPrefix)) {
          const relativePath = path.substring(componentPrefix.length);

          // Filter based on selected state
          if (selectedVariant === "on" && selectedState) {
            // Only show overrides for the selected state
            if (relativePath.startsWith(`on.${selectedState}.`)) {
              const stateRelativePath = relativePath.substring(
                `on.${selectedState}.`.length,
              );
              if (!result[context]) result[context] = {};
              result[context][stateRelativePath] = value;
            }
          } else if (selectedVariant === "all" || selectedVariant === "props") {
            // Only show overrides for direct properties (not state-specific)
            if (
              !relativePath.startsWith("on.") &&
              !relativePath.startsWith("classes.")
            ) {
              if (!result[context]) result[context] = {};
              result[context][relativePath] = value;
            }
          }
        }
      } else {
        // Global override
        if (key.startsWith(componentPrefix)) {
          const relativePath = key.substring(componentPrefix.length);

          // Filter based on selected state
          if (selectedVariant === "on" && selectedState) {
            // Only show overrides for the selected state
            if (relativePath.startsWith(`on.${selectedState}.`)) {
              const stateRelativePath = relativePath.substring(
                `on.${selectedState}.`.length,
              );
              if (!result["global"]) result["global"] = {};
              result["global"][stateRelativePath] = value;
            }
          } else if (selectedVariant === "all" || selectedVariant === "props") {
            // Only show overrides for direct properties (not state-specific)
            if (
              !relativePath.startsWith("on.") &&
              !relativePath.startsWith("classes.")
            ) {
              if (!result["global"]) result["global"] = {};
              result["global"][relativePath] = value;
            }
          }
        }
      }
    });

    return result;
  }, [tokenOverrides, componentName, selectedVariant, selectedState]);

  // Render a property input control
  const renderPropertyInput = (
    propPath: string,
    propName: string,
    value: any,
    context: string = "global",
  ) => {
    const fullPath = buildTokenPath(
      componentName,
      selectedVariant,
      selectedState,
      propPath,
    );
    const propertyType = detectPropertyType(propName);

    // For context-specific renders, use the exact override value
    // For global renders, check both global and context-specific overrides
    let overrideValue, effectiveValue, isModified, contextOverrides: string[];

    if (context === "global") {
      // In global section, show base value unless there's a global override
      overrideValue = tokenOverrides[fullPath];
      effectiveValue = overrideValue !== undefined ? overrideValue : value;
      isModified = overrideValue !== undefined;

      // Find all context-specific overrides for this property
      contextOverrides = Object.keys(tokenOverrides)
        .filter((key) => key.includes(":") && key.endsWith(fullPath))
        .map((key) => key.split(":")[0]);
    } else {
      // In context section, we're showing a context-specific override
      effectiveValue = value;
      isModified = true; // Always true since this is an override section
      contextOverrides = [];
    }

    const currentValue = isThemeToken(effectiveValue)
      ? isDarkMode
        ? effectiveValue.dark
        : effectiveValue.light
      : effectiveValue;

    const handleChange = (newValue: string) => {
      if (isThemeToken(value)) {
        // Update the appropriate theme variant
        const updatedValue = { ...value };
        if (isDarkMode) {
          updatedValue.dark = newValue;
        } else {
          updatedValue.light = newValue;
        }
        onTokenChange(fullPath, updatedValue, context);
      } else {
        // For non-theme tokens, just update the value
        onTokenChange(fullPath, newValue, context);
      }
    };

    const handleClear = () => {
      onTokenClear(fullPath, context);
    };

    return (
      <Box
        key={propPath}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <Tooltip
          title={
            contextOverrides.length > 0
              ? `Overrides: ${contextOverrides
                  .map(
                    (ctx) =>
                      availableContexts.find((c) => c.id === ctx)?.label || ctx,
                  )
                  .join(", ")}`
              : ""
          }
          arrow={false}
        >
          <Typography
            variant="body2"
            sx={{
              minWidth: 120,
              fontSize: 12,
              color:
                contextOverrides.length > 0 ? "text.disabled" : "text.primary",
              cursor: contextOverrides.length > 0 ? "help" : "default",
            }}
          >
            {propName}
          </Typography>
        </Tooltip>
        {propertyType === "color" ? (
          <TextField
            type="color"
            value={currentValue || "#000000"}
            onChange={(e) => handleChange(e.target.value)}
            size="small"
            sx={{
              width: 80,
              "& .MuiInputBase-input": {
                padding: "4px",
                cursor: "pointer",
                minHeight: 0,
              },
            }}
          />
        ) : (
          <TextField
            value={currentValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, maxWidth: 200 }}
          />
        )}
        {propertyType === "color" && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: 60 }}
          >
            {typeof currentValue === "object"
              ? isDarkMode
                ? currentValue.dark
                : currentValue.light
              : currentValue}
          </Typography>
        )}
        {context === "global" && (
          <>
            <IconButton
              size="small"
              sx={{
                width: 20,
                height: 20,
                color: "text.disabled",
                "&:hover": { color: "text.secondary" },
              }}
              onClick={(e) => {
                e.stopPropagation();
                setContextMenuAnchor(e.currentTarget);
                setContextMenuProperty(fullPath);
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </>
        )}
        {isModified && (
          <IconButton size="small" onClick={handleClear}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  };

  // Recursively render token properties
  const renderTokenGroup = (tokens: any, path: string = "") => {
    if (!tokens || typeof tokens !== "object") return null;

    return Object.entries(tokens).map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (isThemeToken(value)) {
        return renderPropertyInput(currentPath, key, value);
      } else if (typeof value === "string") {
        return renderPropertyInput(currentPath, key, value);
      } else if (typeof value === "object") {
        return (
          <Box key={currentPath}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "text.secondary", mt: 1 }}
            >
              {key}
            </Typography>
            {renderTokenGroup(value, currentPath)}
          </Box>
        );
      }
      return null;
    });
  };

  // Create DevTools-style cascade sections
  const renderCascadeSections = () => {
    const sections = [];

    // Always show the cascade structure (context overrides + global section)
    if (true) {
      // 1. Context-specific overrides (show first, like DevTools)
      Object.entries(getOverridesByContext).forEach(([context, overrides]) => {
        if (context !== "global" && Object.keys(overrides).length > 0) {
          sections.push(
            <Box key={context} sx={{ mb: 2 }}>
              <Box
                sx={{
                  bgcolor: "action.hover",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
                onClick={() => toggleSection(context)}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {collapsedSections.has(context) ? "▶" : "▼"}{" "}
                  {availableContexts.find((c) => c.id === context)?.label ||
                    context}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {Object.keys(overrides).length} override
                  {Object.keys(overrides).length !== 1 ? "s" : ""}
                </Typography>
              </Box>
              {!collapsedSections.has(context) && (
                <Box
                  sx={{
                    pl: 2,
                    borderLeft: 2,
                    borderColor: "divider",
                    borderRadius: 0,
                  }}
                >
                  {Object.entries(overrides).map(([path, value]) =>
                    renderPropertyInput(
                      path,
                      path.split(".").pop() || path,
                      value,
                      context,
                    ),
                  )}
                </Box>
              )}
            </Box>,
          );
        }
      });

      // 2. Global properties with states inside
      const directProps = Object.fromEntries(
        Object.entries(componentTokens).filter(
          ([key]) => key !== "on" && key !== "classes",
        ),
      );

      if (
        Object.keys(directProps).length > 0 ||
        (componentTokens.on && Object.keys(componentTokens.on).length > 0)
      ) {
        sections.push(
          <Box key="global">
            <Box
              sx={{
                bgcolor: "background.default",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                mb: 1,
                border: 1,
                borderColor: "divider",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Properties
              </Typography>
            </Box>
            <Box sx={{ pl: 2 }}>
              {/* Show direct properties only when in base state or when no variant is selected */}
              {(selectedVariant === "props" || selectedVariant === "all") &&
                Object.entries(directProps)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([key, value]) =>
                    renderPropertyInput(key, key, value, "global"),
                  )}

              {/* Show state properties when state is selected */}
              {selectedVariant === "on" &&
                selectedState &&
                componentTokens.on?.[selectedState] &&
                Object.entries(componentTokens.on[selectedState])
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([key, value]) =>
                    renderPropertyInput(
                      `on.${selectedState}.${key}`,
                      key,
                      value,
                      "global",
                    ),
                  )}
            </Box>
          </Box>,
        );
      }
    }

    return sections;
  };

  return (
    <Box sx={{ p: 2, overflowY: "auto", height: "100%" }}>
      {renderCascadeSections()}

      {/* Context Menu */}
      <Menu
        anchorEl={contextMenuAnchor}
        open={Boolean(contextMenuAnchor)}
        onClose={() => setContextMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: { minWidth: 120 },
          },
        }}
      >
        {availableContexts.slice(1).map((ctx) => (
          <MenuItem
            key={ctx.id}
            onClick={() => {
              // Get the current value for the property
              const propertyPath = contextMenuProperty;
              // Get the actual current value from the input field, not from overrides
              const propertyInputs = document.querySelectorAll(
                `input[data-path="${propertyPath}"]`,
              );
              let currentValue = "inherit";
              if (propertyInputs.length > 0) {
                const input = propertyInputs[0] as HTMLInputElement;
                currentValue = input.value || input.placeholder || "inherit";
              }
              console.log("Creating context override:", {
                propertyPath,
                currentValue,
                context: ctx.id,
              });
              onTokenChange(propertyPath, currentValue, ctx.id);
              setContextMenuAnchor(null);
              setContextMenuProperty("");
            }}
          >
            {ctx.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

// Context-to-CSS selector mapping
const getContextSelector = (context: string): string => {
  switch (context) {
    case "app":
      return "#app";
    case "appheader":
      return "#app-header";
    case "apptoolbar":
      return ".AppShell-toolbar";
    case "appcontent":
      return "#app-content";
    case "devconsole":
      return "#devconsole";
    case "modal":
      return ".MuiDialog-root, .MuiModal-root";
    case "card":
      return ".MuiCard-root, .MuiPaper-root.card";
    case "global":
    default:
      return ":root";
  }
};

// Helper to generate base CSS from tokens object
const generateBaseCss = (tokensObj: any, isDark: boolean = false): string => {
  const generateCssVariables = (obj: any, prefix: string = ""): string[] => {
    const variables: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = prefix ? `${prefix}-${key}` : key;

      if (value && typeof value === "object") {
        if ("light" in value && "dark" in value) {
          // Theme-aware token
          const tokenValue = isDark
            ? (value as any).dark
            : (value as any).light;
          variables.push(`  --${currentPath}: ${tokenValue};`);
        } else if (!("light" in value) && !("dark" in value)) {
          // Nested object - recurse
          variables.push(...generateCssVariables(value, currentPath));
        }
      } else if (typeof value === "string") {
        // Direct value
        variables.push(`  --${currentPath}: ${value};`);
      }
    }

    return variables;
  };

  const variables = generateCssVariables(tokensObj);

  return `:root {\n${variables.join("\n")}\n}`;
};

// Helper to apply token overrides as CSS variables
const applyTokenOverrides = (
  overrides: Record<string, any>,
  isDark: boolean = false,
  showBaseTokens: boolean = false,
  onCssGenerated?: (css: string) => void,
) => {
  console.log("Applying token overrides:", overrides);

  // Group overrides by context
  const overridesByContext: Record<string, Record<string, any>> = {};

  for (const [key, value] of Object.entries(overrides)) {
    if (key.includes(":")) {
      // Context-specific override (e.g., "appbar:ui.input.borderColor")
      const [context, path] = key.split(":", 2);
      if (!overridesByContext[context]) {
        overridesByContext[context] = {};
      }
      overridesByContext[context][path] = value;
    } else {
      // Global override
      if (!overridesByContext["global"]) {
        overridesByContext["global"] = {};
      }
      overridesByContext["global"][key] = value;
    }
  }

  // Build combined CSS for all contexts
  let styleElement = document.getElementById("token-overrides-css");
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = "token-overrides-css";
    document.head.appendChild(styleElement);
  }

  let combinedCssText = "";

  // Generate CSS for each context
  for (const [context, contextOverrides] of Object.entries(
    overridesByContext,
  )) {
    const selector = getContextSelector(context);
    let cssText = `${selector} {\n`;

    for (const [tokenPath, tokenValue] of Object.entries(contextOverrides)) {
      const cssVar = `--${tokenPath.replace(/\./g, "-")}`;
      // Handle theme tokens (light/dark)
      if (
        typeof tokenValue === "object" &&
        tokenValue.light &&
        tokenValue.dark
      ) {
        // Use the appropriate value based on current mode
        const value = isDark ? tokenValue.dark : tokenValue.light;
        cssText += `  ${cssVar}: ${value};\n`;
      } else {
        // Direct value
        cssText += `  ${cssVar}: ${tokenValue};\n`;
      }
    }
    cssText += "}\n";
    combinedCssText += cssText;
  }

  styleElement.textContent = combinedCssText;
  console.log("Injected CSS variables for all contexts:");
  console.log("Raw overrides:", overrides);
  console.log("Grouped by context:", overridesByContext);
  console.log("Final CSS:", combinedCssText);

  // Call the callback to update the CSS display with what WE generate
  if (onCssGenerated) {
    let cssOutput = "";

    // 1. Base tokens CSS (optional)
    if (showBaseTokens) {
      cssOutput += "/* Base UI Tokens (generated from @smbc/ui-core) */\n";
      cssOutput += generateBaseCss(tokens, isDark);
      cssOutput += "\n\n";
    }

    // 2. Our generated CSS that we inject
    if (combinedCssText.trim()) {
      cssOutput += "/* Generated CSS (injected to DOM) */\n";
      cssOutput += combinedCssText;
    } else {
      cssOutput += "/* No CSS being injected */\n";
    }

    onCssGenerated(cssOutput);
  }
};

const TokenEditor: React.FC = () => {
  const isDarkMode = useFeatureFlagEnabled("darkMode");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("button");
  const [selectedVariant, setSelectedVariant] = useState("all");
  const [selectedState, setSelectedState] = useState("");
  const [tokenOverrides, setTokenOverrides] = useState<Record<string, any>>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [appliedCss, setAppliedCss] = useState("");
  const [showBaseTokens, setShowBaseTokens] = useState(false);
  const [activeView, setActiveView] = useState<"tokens" | "context-editor">("tokens");
  const [selectedContext, setSelectedContext] = useState<string | null>(null);

  // Section expansion states
  const [expandedSections, setExpandedSections] = useState({
    tokens: true,
    contexts: false,
    palettes: false,
  });

  // Get color tokens from ui-core
  const colorTokens = useMemo(() => {
    const colors: Array<{ name: string; value: string; path: string }> = [];

    const extractColors = (obj: any, path: string = "") => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === "string" && value.startsWith("#")) {
          colors.push({
            name: key,
            value,
            path: currentPath,
          });
        } else if (typeof value === "object" && value !== null) {
          extractColors(value, currentPath);
        }
      }
    };

    if (tokens.color) {
      extractColors(tokens.color, "color");
    }

    return colors;
  }, []);

  // Dummy context data
  const dummyContexts = [
    { name: "default", description: "Base context" },
    { name: "hdModal", description: "Header + Modal" },
    { name: "cardDrawer", description: "Card + Drawer" },
    { name: "modalTip", description: "Modal + Tooltip" },
  ];

  const handleSectionToggle = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Get available component names from ui namespace
  const availableComponents = useMemo(() => {
    if (!tokens.ui) return [];
    return Object.keys(tokens.ui)
      .filter((key) => typeof (tokens.ui as any)[key] === "object")
      .sort();
  }, []);

  // Filter components based on search
  const filteredComponents = useMemo(() => {
    return availableComponents.filter((comp) =>
      comp.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [availableComponents, searchTerm]);

  // Filter contexts based on search
  const filteredContexts = useMemo(() => {
    return dummyContexts.filter((context) =>
      context.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      context.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Filter colors based on search
  const filteredColors = useMemo(() => {
    return colorTokens.filter((color) =>
      color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.path.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [colorTokens, searchTerm]);

  // Get current component tokens
  const currentComponentTokens = useMemo(() => {
    if (!tokens.ui || !selectedComponent) return null;
    return (tokens.ui as any)[selectedComponent];
  }, [selectedComponent]);

  // Get available variants for the selected component
  const availableVariants = useMemo(() => {
    if (!currentComponentTokens) return [];
    const variants = ["props"]; // Always start with direct properties

    // Add "on" for states if it exists
    if (currentComponentTokens.on) {
      variants.push("on");
    }

    // Add class variants
    if (currentComponentTokens.classes) {
      Object.keys(currentComponentTokens.classes).forEach((className) => {
        variants.push(`classes.${className}`);
      });
    }

    return variants;
  }, [currentComponentTokens]);

  // Get available states for the selected component and variant
  const availableStates = useMemo(() => {
    if (!currentComponentTokens || !selectedVariant) return [];

    if (selectedVariant === "props") {
      // For props, get direct property names
      const props: string[] = [];
      Object.keys(currentComponentTokens).forEach((key) => {
        if (
          (key !== "on" &&
            key !== "classes" &&
            typeof currentComponentTokens[key] !== "object") ||
          (typeof currentComponentTokens[key] === "object" &&
            "light" in currentComponentTokens[key])
        ) {
          props.push(key);
        }
      });
      return props;
    } else if (selectedVariant === "on") {
      // For states, get available state names from "on" object
      return currentComponentTokens.on
        ? Object.keys(currentComponentTokens.on)
        : [];
    } else if (selectedVariant.startsWith("classes.")) {
      // For class variants, get the available properties and states
      const className = selectedVariant.replace("classes.", "");
      const classData = currentComponentTokens.classes?.[className];
      if (!classData) return [];

      const items: string[] = [];
      // Add direct properties
      Object.keys(classData).forEach((key) => {
        if (
          key !== "on" &&
          (typeof classData[key] !== "object" || "light" in classData[key])
        ) {
          items.push(key);
        }
      });
      // Add states with "on." prefix
      if (classData.on) {
        Object.keys(classData.on).forEach((state) => {
          items.push(`on.${state}`);
        });
      }
      return items;
    }

    return [];
  }, [currentComponentTokens, selectedVariant]);

  // Reset selected variant when component changes
  React.useEffect(() => {
    if (
      availableVariants.length > 0 &&
      !availableVariants.includes(selectedVariant)
    ) {
      setSelectedVariant(availableVariants[0]);
    }
  }, [availableVariants, selectedVariant]);

  // Reset selected state when component or variant changes
  React.useEffect(() => {
    if (
      availableStates.length > 0 &&
      !availableStates.includes(selectedState)
    ) {
      setSelectedState(availableStates[0]);
    }
  }, [availableStates, selectedState]);

  // Apply current state tokens as CSS variables when state changes
  React.useEffect(() => {
    if (!currentComponentTokens) return;

    const currentTokensToApply: Record<string, any> = {};

    if (
      selectedVariant === "on" &&
      selectedState &&
      currentComponentTokens.on?.[selectedState]
    ) {
      // Apply state-specific tokens with correct path
      Object.entries(currentComponentTokens.on[selectedState]).forEach(
        ([key, value]) => {
          currentTokensToApply[
            `ui.${selectedComponent}.on.${selectedState}.${key}`
          ] = value;
        },
      );
    } else if (selectedVariant === "all" || selectedVariant === "props") {
      // Apply base tokens
      const directProps = Object.fromEntries(
        Object.entries(currentComponentTokens).filter(
          ([key]) => key !== "on" && key !== "classes",
        ),
      );
      Object.entries(directProps).forEach(([key, value]) => {
        currentTokensToApply[`ui.${selectedComponent}.${key}`] = value;
      });
    }

    // Merge with existing overrides
    const allTokens = { ...currentTokensToApply, ...tokenOverrides };
    applyTokenOverrides(allTokens, isDarkMode, showBaseTokens, setAppliedCss);
  }, [
    selectedVariant,
    selectedState,
    selectedComponent,
    currentComponentTokens,
    tokenOverrides,
    isDarkMode,
    showBaseTokens,
  ]);

  // Initialize CSS display on mount with our generated base CSS
  useEffect(() => {
    const baseCss = generateBaseCss(tokens, isDarkMode);
    const initialCss = `/* Base UI Tokens (generated from @smbc/ui-core) */\n${baseCss}\n\n/* No token overrides active */`;
    setAppliedCss(initialCss);
  }, [isDarkMode]);

  const handleTokenChange = (
    path: string,
    value: any,
    context: string = "global",
  ) => {
    // Update local state - store with context metadata
    const newOverrides = { ...tokenOverrides };
    const tokenKey = context === "global" ? path : `${context}:${path}`;
    console.log("handleTokenChange:", { path, value, context, tokenKey });
    newOverrides[tokenKey] = value;
    setTokenOverrides(newOverrides);

    // Apply CSS variable updates
    applyTokenOverrides(
      newOverrides,
      isDarkMode,
      showBaseTokens,
      setAppliedCss,
    );
  };

  const handleTokenClear = (path: string, context: string = "global") => {
    // Update local state
    const newOverrides = { ...tokenOverrides };
    const tokenKey = context === "global" ? path : `${context}:${path}`;
    delete newOverrides[tokenKey];
    setTokenOverrides(newOverrides);

    // Apply CSS variable updates
    applyTokenOverrides(
      newOverrides,
      isDarkMode,
      showBaseTokens,
      setAppliedCss,
    );
  };

  const handleClearAll = () => {
    setTokenOverrides({});

    // Clear CSS variables
    applyTokenOverrides({}, isDarkMode, showBaseTokens, setAppliedCss);

    setSnackbarMessage("All overrides cleared");
    setSnackbarOpen(true);
  };

  const handleExport = () => {
    // Build complete token structure with overrides applied
    const completeTokens = buildCompleteTokenStructure(tokenOverrides);
    const dataStr = JSON.stringify(completeTokens, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "smbc-tokens.json";
    link.click();
    URL.revokeObjectURL(url);
    setSnackbarMessage("Complete tokens exported");
    setSnackbarOpen(true);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string);
            // Create minimal overrides by comparing with original values
            const minimalOverrides = createMinimalOverrides(imported);
            setTokenOverrides(minimalOverrides);

            // Apply imported overrides
            applyTokenOverrides(
              minimalOverrides,
              isDarkMode,
              showBaseTokens,
              setAppliedCss,
            );

            const overrideCount = Object.keys(minimalOverrides).length;
            setSnackbarMessage(`Imported ${overrideCount} token overrides`);
            setSnackbarOpen(true);
          } catch (error) {
            setSnackbarMessage("Failed to import tokens");
            setSnackbarOpen(true);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Main Content Area */}
      <Box
        sx={{
          display: "flex",
          height: "100%",
          flex: 1,
        }}
      >
        {/* Three-Section Sidebar */}
        <Box
          sx={{
            width: 280,
            borderRight: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            bgcolor: "rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Search */}
          <Box sx={{ p: 1, borderBottom: 1, borderColor: "divider" }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Collapsible Sections */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            {/* Tokens Section */}
            {filteredComponents.length > 0 && (
            <Accordion
              expanded={expandedSections.tokens}
              onChange={() => handleSectionToggle("tokens")}
              disableGutters
              elevation={0}
              TransitionProps={{ timeout: 0 }}
              sx={{
                "&:before": { display: "none" },
                flex: expandedSections.tokens ? 1 : "none",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                "& .MuiCollapse-root": {
                  overflowY: "scroll",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: 2,
                  py: 1,
                  flexShrink: 0,
                  bgcolor: "background.paper",
                  borderTop: 1,
                  borderColor: "divider",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  Tokens
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, flex: 1, overflow: "auto" }}>
                <Box sx={{ px: 1, py: 0.5 }}>
                  {filteredComponents.map((comp) => (
                    <Box
                      key={comp}
                      onClick={() => {
                        setSelectedComponent(comp);
                        setActiveView("tokens");
                      }}
                      sx={{
                        p: 1,
                        cursor: "pointer",
                        borderRadius: 1,
                        bgcolor:
                          selectedComponent === comp
                            ? "action.selected"
                            : "transparent",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <Typography variant="body2">{comp}</Typography>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
            )}

            {/* Contexts Section */}
            {filteredContexts.length > 0 && (
            <Accordion
              expanded={expandedSections.contexts}
              onChange={() => handleSectionToggle("contexts")}
              disableGutters
              elevation={0}
              TransitionProps={{ timeout: 0 }}
              sx={{
                "&:before": { display: "none" },
                flex: expandedSections.contexts ? 1 : "none",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                "& .MuiCollapse-root": {
                  overflowY: "scroll",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: 2,
                  py: 1,
                  flexShrink: 0,
                  bgcolor: "background.paper",
                  borderTop: 1,
                  borderColor: "divider",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  Contexts
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, flex: 1, overflow: "auto" }}>
                <Box sx={{ px: 1, py: 0.5 }}>
                  {filteredContexts.map((context) => (
                    <Box
                      key={context.name}
                      onClick={() => {
                        setSelectedContext(context.name);
                        setActiveView("context-editor");
                      }}
                      sx={{
                        p: 1,
                        cursor: "pointer",
                        borderRadius: 1,
                        bgcolor: selectedContext === context.name && activeView === "context-editor" ? "action.selected" : "transparent",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {context.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {context.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
            )}

            {/* Palettes Section */}
            {filteredColors.length > 0 && (
            <Accordion
              expanded={expandedSections.palettes}
              onChange={() => handleSectionToggle("palettes")}
              disableGutters
              elevation={0}
              TransitionProps={{ timeout: 0 }}
              sx={{
                "&:before": { display: "none" },
                flex: expandedSections.palettes ? 1 : "none",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                "& .MuiCollapse-root": {
                  overflowY: "scroll",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: 2,
                  py: 1,
                  flexShrink: 0,
                  bgcolor: "background.paper",
                  borderTop: 1,
                  borderColor: "divider",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  Palettes
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, flex: 1, overflow: "auto" }}>
                <Box sx={{ px: 1, py: 0.5 }}>
                  {filteredColors.map((color) => (
                    <Box
                      key={color.path}
                      onClick={() => {
                        navigator.clipboard?.writeText(`ui.${color.path}`);
                        setSnackbarMessage(`Copied: ui.${color.path}`);
                        setSnackbarOpen(true);
                      }}
                      sx={{
                        p: 1,
                        cursor: "pointer",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          backgroundColor: color.value,
                          borderRadius: "50%",
                          border: "1px solid",
                          borderColor: "divider",
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" noWrap>
                          {color.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {color.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
            )}
          </Box>
        </Box>

        {/* Content Area - Conditional View */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {activeView === "context-editor" ? (
            <ContextEditor />
          ) : (
            <>
          {/* States filter and action buttons */}
          {currentComponentTokens && (
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1,
              }}
            >
              {/* States filter */}
              {currentComponentTokens.on &&
              Object.keys(currentComponentTokens.on).length > 0 ? (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  <Chip
                    label="Base"
                    onClick={() => {
                      setSelectedVariant("all");
                      setSelectedState("");
                    }}
                    variant={
                      selectedVariant === "props" || selectedVariant === "all"
                        ? "filled"
                        : "outlined"
                    }
                    color={
                      selectedVariant === "props" || selectedVariant === "all"
                        ? "primary"
                        : "default"
                    }
                    size="small"
                  />
                  {Object.keys(currentComponentTokens.on).map((state) => (
                    <Chip
                      key={state}
                      label={state.charAt(0).toUpperCase() + state.slice(1)}
                      onClick={() => {
                        setSelectedVariant("on");
                        setSelectedState(state);
                      }}
                      variant={
                        selectedVariant === "on" && selectedState === state
                          ? "filled"
                          : "outlined"
                      }
                      color={
                        selectedVariant === "on" && selectedState === state
                          ? "primary"
                          : "default"
                      }
                      size="small"
                    />
                  ))}
                </Stack>
              ) : (
                <Box />
              )}

              <Stack direction="row" spacing={1} alignItems="center">
                {Object.keys(tokenOverrides).length > 0 && (
                  <Chip
                    label={`${Object.keys(tokenOverrides).length} overrides`}
                    size="small"
                    color="primary"
                  />
                )}
                <IconButton size="small" onClick={handleExport} title="Export">
                  <DownloadIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleImport} title="Import">
                  <UploadIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleClearAll}
                  title="Clear All"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          )}

          {/* Content Area - Properties and CSS side by side */}
          {currentComponentTokens && (
            <Box sx={{ display: "flex", flex: 1, height: "100%" }}>
              {/* Properties Grid */}
              <Box sx={{ flex: 1, minWidth: 0, pt: 0 }}>
                <ComponentPropertiesGrid
                  componentTokens={currentComponentTokens}
                  componentName={selectedComponent}
                  selectedVariant={selectedVariant}
                  selectedState={selectedState}
                  tokenOverrides={tokenOverrides}
                  onTokenChange={handleTokenChange}
                  onTokenClear={handleTokenClear}
                  onVariantChange={setSelectedVariant}
                  onStateChange={setSelectedState}
                />
              </Box>

              {/* CSS Output */}
              {appliedCss && (
                <Box
                  sx={{
                    width: "55%",
                    borderLeft: 1,
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  {/* Show Base Tokens Checkbox */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(4px)",
                      borderRadius: 4,
                      px: 1,
                      py: 0.5,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      opacity: 0.7,
                      "&:hover": {
                        opacity: 1,
                        bgcolor: "rgba(255, 255, 255, 0.15)",
                      },
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={showBaseTokens}
                          onChange={(e) => setShowBaseTokens(e.target.checked)}
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ fontSize: 11 }}>
                          Show base tokens
                        </Typography>
                      }
                      sx={{ mr: 0 }}
                    />
                  </Box>
                  <TextField
                    multiline
                    fullWidth
                    value={appliedCss}
                    InputProps={{
                      readOnly: true,
                      sx: {
                        fontFamily: "monospace",
                        fontSize: "12px",
                        backgroundColor: "background.default",
                      },
                    }}
                    sx={{
                      height: "100%",
                      "& .MuiInputBase-root": {
                        height: "100%",
                        alignItems: "flex-start",
                      },
                      "& .MuiInputBase-input": {
                        height: "100% !important",
                        overflow: "auto !important",
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
            </>
          )}
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </Box>
  );
};

export { TokenEditor };
