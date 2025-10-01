import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { tokens } from "@smbc/ui-core";

// Convert existing contexts to the format needed for the context builder
const convertContextsForBuilder = (existingContexts: Array<{
  name: string;
  shortName: string;
  cssSelector: string;
}>) => {
  return existingContexts
    .filter(ctx => ctx.cssSelector !== ":root") // Exclude root context
    .map(ctx => ({
      id: ctx.shortName,
      label: ctx.name,
      shortName: ctx.shortName,
      selector: ctx.cssSelector,
    }));
};

// Get token usage for a context by checking immediate children of shortName in tokens
const getTokenUsage = (shortName: string): Array<{ path: string; component: string; property: string }> => {
  const usage: Array<{ path: string; component: string; property: string }> = [];

  // Check if tokens[shortName] exists (e.g., tokens.modal, tokens.card)
  if ((tokens as any)[shortName]) {
    const contextTokens = (tokens as any)[shortName];

    // Recursively walk through the token structure to find all defined paths
    const walkTokens = (obj: any, path: string[] = []) => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key];

        if (typeof value === "object" && value !== null && !("light" in value && "dark" in value)) {
          // Continue walking if it's a nested object (but not a theme token)
          walkTokens(value, currentPath);
        } else {
          // This is a leaf value (either a string or theme token)
          usage.push({
            path: `${shortName}.${currentPath.join(".")}`,
            component: currentPath[0], // First level is usually the component
            property: currentPath.slice(1).join("."), // Rest is the property path
          });
        }
      }
    };

    walkTokens(contextTokens);
  }

  return usage;
};

interface ContextEditorProps {
  onContextGenerated?: (
    name: string,
    shortName: string,
    cssSelector: string,
  ) => void;
  existingContexts?: Array<{
    name: string;
    shortName: string;
    cssSelector: string;
  }>;
  selectedContext?: {
    id: string;
    name: string;
    shortName: string;
    isBaseContext: boolean;
    cssSelector: string;
  } | null;
}

export const ContextEditor: React.FC<ContextEditorProps> = ({
  onContextGenerated,
  existingContexts = [],
  selectedContext = null,
}) => {
  const [contextChain, setContextChain] = useState<string[]>([]);
  const [selectedBaseContext, setSelectedBaseContext] = useState<string>("");
  const [contextName, setContextName] = useState<string>("");
  const [shortName, setShortName] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");
  const [shortNameError, setShortNameError] = useState<string>("");
  const [showExistingAlert, setShowExistingAlert] = useState<boolean>(false);

  // Convert existing contexts to the format needed for the context builder
  const availableContexts = useMemo(() => convertContextsForBuilder(existingContexts), [existingContexts]);

  // Determine the context type
  const isRootContext = selectedContext?.cssSelector === ":root";

  // Generate CSS selector from chain
  const cssSelector = useMemo(() => {
    if (contextChain.length === 0) return ":root";

    const selectors = contextChain.map((contextId) => {
      const context = availableContexts.find((c) => c.id === contextId);
      return context?.selector || `.${contextId}`;
    });

    return selectors.join(" ");
  }, [contextChain, availableContexts]);

  // Auto-populate name and shortName from context chain
  const suggestedName = useMemo(() => {
    if (contextChain.length === 0) return "";

    const labels = contextChain.map((contextId) => {
      const context = availableContexts.find((c) => c.id === contextId);
      return context?.label || contextId;
    });

    return labels.join(" / ");
  }, [contextChain, availableContexts]);

  const suggestedShortName = useMemo(() => {
    if (contextChain.length === 0) return "";

    const shortNames = contextChain.map((contextId, index) => {
      const context = availableContexts.find((c) => c.id === contextId);
      const shortName = context?.shortName || contextId;

      // First context stays lowercase, subsequent ones get capitalized
      return index === 0 ? shortName : shortName.charAt(0).toUpperCase() + shortName.slice(1);
    });

    return shortNames.join("");
  }, [contextChain, availableContexts]);

  // Check for duplicates (exclude root context)
  const existingContext = useMemo(() => {
    if (!contextName && !shortName && !cssSelector) return null;

    // Don't check for duplicates if we're creating from root context (generating new contexts)
    if (cssSelector === ":root") return null;

    // Check for name conflict
    const nameConflict = existingContexts.find(ctx =>
      ctx.name.toLowerCase() === contextName.toLowerCase()
    );
    if (nameConflict) return nameConflict;

    // Check for short name conflict
    const shortNameConflict = existingContexts.find(ctx =>
      ctx.shortName.toLowerCase() === shortName.toLowerCase()
    );
    if (shortNameConflict) return shortNameConflict;

    // Check for CSS selector conflict (identical context chains)
    const cssSelectorConflict = existingContexts.find(ctx =>
      ctx.cssSelector === cssSelector
    );
    if (cssSelectorConflict) return cssSelectorConflict;

    return null;
  }, [contextName, shortName, cssSelector, existingContexts]);

  // Auto-populate fields when context chain changes
  React.useEffect(() => {
    if (suggestedName) {
      setContextName(suggestedName);
    }
    if (suggestedShortName) {
      setShortName(suggestedShortName);
    }
    // Clear errors when auto-populating
    setNameError("");
    setShortNameError("");
  }, [suggestedName, suggestedShortName]);

  // Validation functions (only called on button click)
  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError("Name is required");
      return false;
    }
    if (existingContexts.some(ctx => ctx.name.toLowerCase() === name.toLowerCase())) {
      setNameError("Name already exists");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateShortName = (shortName: string) => {
    if (!shortName.trim()) {
      setShortNameError("Short name is required");
      return false;
    }
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(shortName)) {
      setShortNameError("Short name must start with a letter and contain only letters and numbers");
      return false;
    }
    if (existingContexts.some(ctx => ctx.shortName.toLowerCase() === shortName.toLowerCase())) {
      setShortNameError("Short name already exists");
      return false;
    }
    setShortNameError("");
    return true;
  };

  // Handle input changes without validation
  const handleNameChange = (newName: string) => {
    setContextName(newName);
    // Clear error and alert when user starts typing
    if (nameError) setNameError("");
    if (showExistingAlert) setShowExistingAlert(false);
  };

  const handleShortNameChange = (newShortName: string) => {
    setShortName(newShortName);
    // Clear error and alert when user starts typing
    if (shortNameError) setShortNameError("");
    if (showExistingAlert) setShowExistingAlert(false);
  };

  const handleAddContext = () => {
    if (selectedBaseContext && !contextChain.includes(selectedBaseContext)) {
      setContextChain([...contextChain, selectedBaseContext]);
      setSelectedBaseContext("");
      // Clear alert when context chain changes
      if (showExistingAlert) setShowExistingAlert(false);
    }
  };

  const handleRemoveContext = (index: number) => {
    setContextChain(contextChain.filter((_, i) => i !== index));
    // Clear alert when context chain changes
    if (showExistingAlert) setShowExistingAlert(false);
  };

  const handleGenerateContext = () => {
    const isNameValid = validateName(contextName);
    const isShortNameValid = validateShortName(shortName);

    if (existingContext) {
      // Show alert when user tries to save duplicate
      setShowExistingAlert(true);
      return;
    }

    if (isNameValid && isShortNameValid && contextName && shortName && cssSelector) {
      onContextGenerated?.(contextName, shortName, cssSelector);
      // Reset form after successful generation
      setContextChain([]);
      setContextName("");
      setShortName("");
      setNameError("");
      setShortNameError("");
      setShowExistingAlert(false);
    }
  };

  return (
    <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
      {isRootContext ? (
        <>
          {/* Context Generator - Root context */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Generate New Context
            </Typography>

            <Stack spacing={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Context Name"
                value={contextName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Modal with Header"
                error={!!nameError}
                helperText={nameError || "Display name for this context"}
              />

              <TextField
                fullWidth
                size="small"
                label="Short Name"
                value={shortName}
                onChange={(e) => handleShortNameChange(e.target.value)}
                placeholder="e.g., modalheader"
                error={!!shortNameError}
                helperText={shortNameError || "Used as key in JSON structure (letters and numbers only)"}
              />
            </Stack>

            {/* Existing Context Alert - only shown after save attempt */}
            {showExistingAlert && existingContext && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Context "{existingContext.name}" already exists with this configuration.
              </Alert>
            )}
          </Paper>

          {/* Context Chain Builder */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Build Context Chain
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Add Context</InputLabel>
                <Select
                  value={selectedBaseContext}
                  onChange={(e) => setSelectedBaseContext(e.target.value)}
                  label="Add Context"
                >
                  {availableContexts.filter((c) => !contextChain.includes(c.id)).map(
                    (context) => (
                      <MenuItem key={context.id} value={context.id}>
                        {context.label}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>

              <IconButton
                onClick={handleAddContext}
                disabled={!selectedBaseContext}
                color="primary"
              >
                <AddIcon />
              </IconButton>
            </Stack>

            {/* Context Chain Display */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
              {contextChain.map((contextId, index) => {
                const context = availableContexts.find((c) => c.id === contextId);
                return (
                  <Chip
                    key={index}
                    label={context?.label || contextId}
                    onDelete={() => handleRemoveContext(index)}
                    deleteIcon={<RemoveIcon />}
                    variant="outlined"
                    size="small"
                  />
                );
              })}
              {contextChain.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontStyle="italic"
                >
                  No contexts added (will use root)
                </Typography>
              )}
            </Stack>

            {/* Generated CSS Selector Preview */}
            <Box
              sx={{ mt: 2, p: 2, bgcolor: "background.default", borderRadius: 1 }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  CSS Selector:
                </Typography>
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {cssSelector}
                </Typography>
              </Stack>
            </Box>

            <Button
              variant="contained"
              onClick={handleGenerateContext}
              sx={{ mt: 2 }}
              disabled={!contextName || !shortName || !!existingContext}
            >
              {existingContext ? `Context "${existingContext.name}" Exists` : "Generate Context"}
            </Button>
          </Paper>
        </>
      ) : (
        <>
          {/* Generated Context Editor */}
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                size="small"
                label="Context Name"
                value={selectedContext?.name || ""}
                placeholder="e.g., Modal Header"
                helperText="Display name for this context"
              />

              <TextField
                fullWidth
                size="small"
                label="Short Name"
                value={selectedContext?.shortName || ""}
                placeholder="e.g., modalheader"
                helperText="Used as key in JSON structure (letters and numbers only)"
              />

              <Box sx={{ pl: 0, pt: 0.5 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  CSS Selector
                </Typography>
                <Typography variant="body1" fontFamily="monospace" sx={{ pl: 0, color: "text.primary" }}>
                  {selectedContext?.cssSelector}
                </Typography>
              </Box>

              <Box sx={{ pl: 0, pt: 0.5 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Token Usage
                </Typography>
                {(() => {
                  const usage = selectedContext ? getTokenUsage(selectedContext.shortName) : [];

                  if (usage.length === 0) {
                    return (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontStyle="italic"
                      >
                        No tokens currently using this context
                      </Typography>
                    );
                  }

                  return (
                    <Stack spacing={1}>
                      {usage.map((item, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 1,
                            bgcolor: "background.default",
                            borderRadius: 1,
                            border: 1,
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="body2" fontWeight="medium">
                            {item.component}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.property}
                          </Typography>
                        </Box>
                      ))}
                      <Typography variant="caption" color="text.secondary">
                        {usage.length} token override{usage.length !== 1 ? "s" : ""} defined
                      </Typography>
                    </Stack>
                  );
                })()}
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" disabled>
                Save Changes
              </Button>
              {(() => {
                const usage = selectedContext ? getTokenUsage(selectedContext.shortName) : [];
                const hasUsage = usage.length > 0;

                return (
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={hasUsage}
                    title={hasUsage ? `Cannot delete: ${usage.length} token override${usage.length !== 1 ? "s" : ""} using this context` : "Delete this context"}
                  >
                    Delete Context
                  </Button>
                );
              })()}
            </Stack>
          </Paper>
        </>
      )}
    </Box>
  );
};
