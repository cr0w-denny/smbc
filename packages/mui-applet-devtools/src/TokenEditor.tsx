import React, { useState, useMemo } from "react";
import { useImmer } from "use-immer";
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Snackbar,
  Tabs,
  Tab,
  useTheme,
  Chip,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { ui, tokens, clearTokenCache } from "@smbc/ui-core";

// Global storage for token overrides (no event listeners, just direct access)
(window as any).__tokenOverrides = (window as any).__tokenOverrides || {};

// Helper function to build complete token structure with overrides applied
const buildCompleteTokenStructure = (): any => {
  // Use the consolidated tokens structure instead of just ui
  const result = JSON.parse(JSON.stringify(tokens)); // Deep clone

  // Apply any overrides
  const overrides = (window as any).__tokenOverrides || {};
  for (const [path, value] of Object.entries(overrides)) {
    setNestedValue(result, path, value);
  }

  return result;
};

// Helper to set a nested value in an immer draft using dot notation
const setNestedValue = (draft: any, path: string, value: any): void => {
  const keys = path.split('.');
  let current = draft;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
};


// Helper function to get original token value without overrides
const getOriginalTokenValue = (path: string): any => {
  const pathParts = path.split('.');
  let current = tokens; // Start from root tokens object

  // Temporarily clear overrides to get original value
  const originalOverrides = (window as any).__tokenOverrides;
  (window as any).__tokenOverrides = {};

  try {
    for (const part of pathParts) {
      current = (current as any)?.[part];
    }
    return current;
  } finally {
    // Restore overrides
    (window as any).__tokenOverrides = originalOverrides;
  }
};

// Helper function to compare imported structure with current tokens and create minimal overrides
const createMinimalOverrides = (importedTokens: any, path: string = ''): Record<string, any> => {
  const overrides: Record<string, any> = {};

  const traverse = (imported: any, currentPath: string) => {
    if (typeof imported !== 'object' || imported === null) {
      // Compare leaf value with original
      const originalValue = getOriginalTokenValue(currentPath);
      if (imported !== originalValue) {
        console.log(`Override detected: ${currentPath}`, { imported, originalValue });

        // Check if this is a theme token (ends with .light or .dark)
        if (currentPath.endsWith('.light') || currentPath.endsWith('.dark')) {
          const basePath = currentPath.replace(/\.(light|dark)$/, '');
          const mode = currentPath.endsWith('.light') ? 'light' : 'dark';

          // Create or update theme token object
          if (!overrides[basePath]) {
            overrides[basePath] = {};
          }
          if (typeof overrides[basePath] === 'object') {
            overrides[basePath][mode] = imported;
          }
        } else {
          overrides[currentPath] = imported;
        }
      }
      return;
    }

    // Recursively check nested objects
    for (const [key, value] of Object.entries(imported)) {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      traverse(value, nextPath);
    }
  };

  traverse(importedTokens, path);
  return overrides;
};

// Helper to detect property type for appropriate input control
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

// Helper to check if a value is a theme-aware token (has light/dark)
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
  onTokenChange: (path: string, value: any) => void;
  onTokenClear: (path: string) => void;
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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  // Apply overrides to get current token values with immer
  const getCurrentTokens = useMemo(() => {
    let result = { ...componentTokens };
    Object.entries(tokenOverrides).forEach(([path, value]) => {
      if (
        path.startsWith(
          `ui.${componentName}.${selectedVariant}.${selectedState}.`,
        )
      ) {
        const relativePath = path.substring(
          `ui.${componentName}.${selectedVariant}.${selectedState}.`.length,
        );
        // Create a deep clone and apply the override
        result = JSON.parse(JSON.stringify(result));
        setNestedValue(result, relativePath, value);
      }
    });
    return result;
  }, [componentTokens, tokenOverrides, componentName, selectedVariant, selectedState]);

  const currentTokens = getCurrentTokens;

  // Render a property input control
  const renderPropertyInput = (
    propPath: string,
    propName: string,
    value: any,
  ) => {
    const fullPath = `ui.${componentName}.${selectedVariant}.${selectedState}.${propPath}`;
    const propertyType = detectPropertyType(propName);
    // Check if there's an override for this specific path
    const overrideValue = tokenOverrides[fullPath];
    const effectiveValue = overrideValue !== undefined ? overrideValue : value;

    const currentValue = isThemeToken(effectiveValue)
      ? isDarkMode
        ? effectiveValue.dark
        : effectiveValue.light
      : effectiveValue;

    const isModified = tokenOverrides.hasOwnProperty(fullPath);

    const handleChange = (newValue: string) => {
      if (isThemeToken(value)) {
        // Update the appropriate theme variant
        const updatedValue = { ...value };
        if (isDarkMode) {
          updatedValue.dark = newValue;
        } else {
          updatedValue.light = newValue;
        }
        onTokenChange(fullPath, updatedValue);
      } else {
        // For non-theme tokens, just update the value
        onTokenChange(fullPath, newValue);
      }
    };

    const handleClear = () => {
      onTokenClear(fullPath);
    };

    return (
      <Box
        key={propPath}
        sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
      >
        <Typography variant="body2" sx={{ minWidth: 120, fontSize: 12 }}>
          {propName}
        </Typography>
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
            {typeof currentValue === 'object' ? (isDarkMode ? currentValue.dark : currentValue.light) : currentValue}
          </Typography>
        )}
        {isModified && (
          <IconButton
            size="small"
            onClick={handleClear}
            title="Reset to default"
          >
            <ClearIcon fontSize="inherit" />
          </IconButton>
        )}
      </Box>
    );
  };

  // Flatten and collect all properties from nested object
  const collectAllProperties = (
    obj: any,
    basePath: string = "",
  ): Array<{ path: string, name: string, value: any }> => {
    const properties: Array<{ path: string, name: string, value: any }> = [];

    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = basePath ? `${basePath}.${key}` : key;

      if (isThemeToken(value) || typeof value === "string") {
        // This is a property - use the full path as display name
        properties.push({ path: currentPath, name: currentPath, value });
      } else if (typeof value === "object" && value !== null) {
        // This is a nested object - recurse
        properties.push(...collectAllProperties(value, currentPath));
      }
    });

    return properties;
  };

  // Render all properties in alphabetical order
  const renderAllProperties = (stateObj: any) => {
    if (!stateObj || typeof stateObj !== "object") return null;

    const allProperties = collectAllProperties(stateObj);

    // Sort alphabetically by property name
    allProperties.sort((a, b) => a.name.localeCompare(b.name));

    if (allProperties.length === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        {allProperties.map((prop) =>
          renderPropertyInput(prop.path, prop.name, prop.value)
        )}
      </Box>
    );
  };

  if (!currentTokens || typeof currentTokens !== "object") {
    return (
      <Typography variant="body2" color="text.secondary">
        No properties found for {componentName}
      </Typography>
    );
  }

  // Get selected variant and state
  const variantData = currentTokens[selectedVariant];
  const selectedStateData = variantData?.[selectedState];

  return (
    <Box sx={{ p: 2 }}>
      {selectedStateData ? (
        renderAllProperties(selectedStateData)
      ) : (
        <Typography variant="body2" color="text.secondary">
          No properties found for {selectedState} state of {componentName}.
          {selectedVariant}
        </Typography>
      )}
    </Box>
  );
};

interface TokenEditorProps {
  onClose?: () => void;
}

export const TokenEditor: React.FC<TokenEditorProps> = () => {
  const [selectedComponent, setSelectedComponent] = useState<string>("input");
  const [selectedVariant, setSelectedVariant] = useState<string>("base");
  const [selectedState, setSelectedState] = useState<string>("default");
  const [searchTerm, setSearchTerm] = useState("");
  // Initialize with existing global overrides using immer
  const [tokenOverrides, updateTokenOverrides] = useImmer<Record<string, any>>(
    (window as any).__tokenOverrides || {}
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Detect available components from ui tokens
  const availableComponents = useMemo(() => {
    if (!ui || typeof ui !== "object") return [];

    return Object.keys(ui)
      .filter((key) => {
        const value = (ui as any)[key];
        return value && typeof value === "object";
      })
      .sort();
  }, []);

  // Filter components based on search
  const filteredComponents = useMemo(() => {
    if (!searchTerm.trim()) return availableComponents;
    return availableComponents.filter((comp) =>
      comp.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [availableComponents, searchTerm]);

  // Get current component tokens
  const currentComponentTokens = useMemo(() => {
    if (!ui || !selectedComponent) return null;
    return (ui as any)[selectedComponent];
  }, [selectedComponent]);

  // Get available variants for the selected component
  const availableVariants = useMemo(() => {
    if (!currentComponentTokens) return [];
    return Object.keys(currentComponentTokens);
  }, [currentComponentTokens]);

  // Get available states for the selected component and variant
  const availableStates = useMemo(() => {
    if (!currentComponentTokens || !selectedVariant) return [];
    const variantData = currentComponentTokens[selectedVariant];
    if (!variantData || typeof variantData !== "object") return [];
    return Object.keys(variantData);
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

  const handleTokenChange = (path: string, value: any) => {
    // Update local state
    updateTokenOverrides(draft => {
      draft[path] = value;
    });

    // Update global overrides for token resolution
    (window as any).__tokenOverrides = {
      ...(window as any).__tokenOverrides,
      [path]: value,
    };

    console.log('🎨 Token changed:', path, '=', value);
    console.log('🎨 All overrides:', (window as any).__tokenOverrides);

    // Clear token resolution cache so new overrides are picked up
    clearTokenCache();

    // Trigger theme re-render by dispatching the tokenApply event
    window.dispatchEvent(new Event('tokenApply'));
    console.log('🎨 Dispatched tokenApply event');
  };

  const handleTokenClear = (path: string) => {
    // Update local state
    updateTokenOverrides(draft => {
      delete draft[path];
    });

    // Update global overrides
    const globalOverrides = { ...(window as any).__tokenOverrides };
    delete globalOverrides[path];
    (window as any).__tokenOverrides = globalOverrides;

    // Clear token resolution cache so changes are picked up
    clearTokenCache();

    // Trigger theme re-render by dispatching the tokenApply event
    window.dispatchEvent(new Event('tokenApply'));
  };

  const handleClearAll = () => {
    updateTokenOverrides(() => ({}));
    (window as any).__tokenOverrides = {};

    // Clear token resolution cache so changes are picked up
    clearTokenCache();

    setSnackbarMessage("All overrides cleared");
    setSnackbarOpen(true);
    // Trigger theme re-render by dispatching the tokenApply event
    window.dispatchEvent(new Event('tokenApply'));
  };

  const handleExport = () => {
    // Build complete token structure with overrides applied
    const completeTokens = buildCompleteTokenStructure();
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
            updateTokenOverrides(() => minimalOverrides);
            // Update global overrides
            (window as any).__tokenOverrides = minimalOverrides;
            const overrideCount = Object.keys(minimalOverrides).length;
            setSnackbarMessage(`Imported ${overrideCount} token overrides`);
            setSnackbarOpen(true);
            // Trigger theme re-render by dispatching the tokenApply event
            window.dispatchEvent(new Event('tokenApply'));
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
    <Box sx={{ display: "flex", height: "100%", bgcolor: "background.paper" }}>
      {/* Component Sidebar */}
      <Box
        sx={{
          width: 250,
          borderRight: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Controls */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton size="small" onClick={handleClearAll} title="Clear All">
              <ClearIcon fontSize="inherit" />
            </IconButton>
            <IconButton size="small" onClick={handleExport} title="Export">
              <DownloadIcon fontSize="inherit" />
            </IconButton>
            <IconButton size="small" onClick={handleImport} title="Import">
              <UploadIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Box>

        {/* Search */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* Component List */}
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          {filteredComponents.map((component) => (
            <Box
              key={component}
              onClick={() => setSelectedComponent(component)}
              sx={{
                p: 1.5,
                mx: 1,
                mb: 0.5,
                borderRadius: 1,
                cursor: "pointer",
                backgroundColor:
                  selectedComponent === component
                    ? "action.selected"
                    : "transparent",
                "&:hover": {
                  backgroundColor:
                    selectedComponent === component
                      ? "action.selected"
                      : "action.hover",
                },
              }}
            >
              <Typography variant="body2">
                {component.charAt(0).toUpperCase() + component.slice(1)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Properties Grid */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {currentComponentTokens ? (
          <>
            {/* Variant Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={selectedVariant}
                onChange={(_, newValue) => setSelectedVariant(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ minHeight: 48 }}
              >
                {availableVariants.map((variant) => (
                  <Tab
                    key={variant}
                    label={variant.charAt(0).toUpperCase() + variant.slice(1)}
                    value={variant}
                    sx={{ minWidth: 80, textTransform: "none" }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* State Pills */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: "block" }}
              >
                States:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {availableStates.map((state) => (
                  <Chip
                    key={state}
                    label={state.charAt(0).toUpperCase() + state.slice(1)}
                    onClick={() => setSelectedState(state)}
                    variant={selectedState === state ? "filled" : "outlined"}
                    color={selectedState === state ? "primary" : "default"}
                    size="small"
                    sx={{ textTransform: "none" }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Properties for selected state */}
            <Box sx={{ flexGrow: 1, overflow: "auto" }}>
              <ComponentPropertiesGrid
                componentTokens={currentComponentTokens}
                componentName={selectedComponent}
                selectedVariant={selectedVariant}
                selectedState={selectedState}
                tokenOverrides={tokenOverrides}
                onTokenChange={handleTokenChange}
                onTokenClear={handleTokenClear}
              />
            </Box>
          </>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Select a component to edit its properties
            </Typography>
          </Box>
        )}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default TokenEditor;
