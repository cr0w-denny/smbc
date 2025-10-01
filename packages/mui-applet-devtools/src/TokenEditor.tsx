import React, { useState, useMemo } from "react";
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Snackbar,
  Tabs,
  Tab,
  Chip,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { tokens } from "@smbc/ui-core";
import { useFeatureFlagEnabled } from "@smbc/applet-core";

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
  const isDarkMode = useFeatureFlagEnabled("darkMode");

  // Apply overrides to get current token values
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
        result = JSON.parse(JSON.stringify(result));
        setNestedValue(result, relativePath, value);
      }
    });
    return result;
  }, [
    componentTokens,
    tokenOverrides,
    componentName,
    selectedVariant,
    selectedState,
  ]);

  const currentTokens = getCurrentTokens;

  // Render a property input control
  const renderPropertyInput = (
    propPath: string,
    propName: string,
    value: any,
  ) => {
    const fullPath = `ui.${componentName}.${selectedVariant}.${selectedState}.${propPath}`;
    const propertyType = detectPropertyType(propName);
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
            {typeof currentValue === "object"
              ? isDarkMode
                ? currentValue.dark
                : currentValue.light
              : currentValue}
          </Typography>
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

  return (
    <Box sx={{ p: 2, overflowY: "auto", height: "100%" }}>
      {renderTokenGroup(currentTokens)}
    </Box>
  );
};

// Helper to inject CSS variables for token overrides
const injectTokenCssVars = (
  overrides: Record<string, any>,
  isDark: boolean,
) => {
  let styleElement = document.getElementById("token-overrides-css");
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = "token-overrides-css";
    document.head.appendChild(styleElement);
  }

  // Build CSS text with overrides
  let cssText = ":root {\n";

  for (const [tokenPath, tokenValue] of Object.entries(overrides)) {
    const cssVar = `--${tokenPath.replace(/\./g, "-")}`;

    // Handle theme tokens (light/dark)
    if (typeof tokenValue === "object" && tokenValue.light && tokenValue.dark) {
      // Use the appropriate value based on current mode
      const value = isDark ? tokenValue.dark : tokenValue.light;
      cssText += `  ${cssVar}: ${value};\n`;
    } else {
      // Direct value
      cssText += `  ${cssVar}: ${tokenValue};\n`;
    }
  }

  cssText += "}";
  styleElement.textContent = cssText;
  console.log("Injected CSS variables:", cssText);
};

// Helper to apply token overrides as CSS variables
const applyTokenOverrides = (
  overrides: Record<string, any>,
  isDark: boolean = false,
) => {
  console.log("Applying token overrides:", overrides);

  // Set the global overrides for persistence
  (window as any).__tokenOverrides = overrides;

  // Inject CSS variables for the overridden tokens
  injectTokenCssVars(overrides, isDark);

  console.log("CSS variables updated");
};

const TokenEditor: React.FC = () => {
  const isDarkMode = useFeatureFlagEnabled("darkMode");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("button");
  const [selectedVariant, setSelectedVariant] = useState("contained");
  const [selectedState, setSelectedState] = useState("default");
  const [tokenOverrides, setTokenOverrides] = useState<Record<string, any>>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

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

  // Get current component tokens
  const currentComponentTokens = useMemo(() => {
    if (!tokens.ui || !selectedComponent) return null;
    return (tokens.ui as any)[selectedComponent];
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
    const newOverrides = { ...tokenOverrides, [path]: value };
    setTokenOverrides(newOverrides);

    // Apply CSS variable updates
    applyTokenOverrides(newOverrides, isDarkMode);
  };

  const handleTokenClear = (path: string) => {
    // Update local state
    const newOverrides = { ...tokenOverrides };
    delete newOverrides[path];
    setTokenOverrides(newOverrides);

    // Apply CSS variable updates
    applyTokenOverrides(newOverrides, isDarkMode);
  };

  const handleClearAll = () => {
    setTokenOverrides({});

    // Clear CSS variables
    applyTokenOverrides({}, isDarkMode);

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
            applyTokenOverrides(minimalOverrides, isDarkMode);

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
        height: "100%",
      }}
    >
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
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <IconButton size="small" onClick={handleExport} title="Export">
              <DownloadIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleImport} title="Import">
              <UploadIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleClearAll} title="Clear All">
              <ClearIcon fontSize="small" />
            </IconButton>
          </Stack>

          <TextField
            fullWidth
            size="small"
            placeholder="Search components..."
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

          {Object.keys(tokenOverrides).length > 0 && (
            <Chip
              label={`${Object.keys(tokenOverrides).length} overrides`}
              size="small"
              color="primary"
              sx={{ mt: 1 }}
            />
          )}
        </Box>

        {/* Component List */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 1 }}>
          {filteredComponents.map((comp) => (
            <Box
              key={comp}
              onClick={() => setSelectedComponent(comp)}
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
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Variant and State Tabs */}
        {currentComponentTokens && (
          <>
            <Tabs
              value={selectedVariant}
              onChange={(_, newValue) => setSelectedVariant(newValue)}
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              {availableVariants.map((variant) => (
                <Tab key={variant} label={variant} value={variant} />
              ))}
            </Tabs>

            {availableStates.length > 0 && (
              <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  States
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
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </>
        )}

        {/* Properties Grid */}
        {currentComponentTokens &&
        currentComponentTokens[selectedVariant] &&
        currentComponentTokens[selectedVariant][selectedState] ? (
          <ComponentPropertiesGrid
            componentTokens={
              currentComponentTokens[selectedVariant][selectedState]
            }
            componentName={selectedComponent}
            selectedVariant={selectedVariant}
            selectedState={selectedState}
            tokenOverrides={tokenOverrides}
            onTokenChange={handleTokenChange}
            onTokenClear={handleTokenClear}
          />
        ) : (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">
              No tokens available for this selection
            </Typography>
          </Box>
        )}
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export { TokenEditor };
