import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Stack,
  Paper,
  Tooltip,
  Button,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";

// Base contexts with their display names and short names
const BASE_CONTEXTS = [
  {
    id: "app-header",
    label: "App Header",
    shortName: "hd",
    selector: "#app-header",
  },
  { id: "modal", label: "Modal", shortName: "modal", selector: ".modal" },
  { id: "card", label: "Card", shortName: "card", selector: ".card" },
  { id: "drawer", label: "Drawer", shortName: "drawer", selector: ".drawer" },
  { id: "tooltip", label: "Tooltip", shortName: "tip", selector: ".tooltip" },
  {
    id: "toolbar",
    label: "Toolbar",
    shortName: "toolbar",
    selector: ".AppShell-toolbar",
  },
  {
    id: "content",
    label: "Content Area",
    shortName: "content",
    selector: "#app-content",
  },
];

interface ContextEditorProps {
  onContextGenerated?: (contextName: string, cssSelector: string) => void;
}

export const ContextEditor: React.FC<ContextEditorProps> = ({
  onContextGenerated,
}) => {
  const [contextChain, setContextChain] = useState<string[]>([]);
  const [selectedContext, setSelectedContext] = useState<string>("");
  const [copiedItem, setCopiedItem] = useState<string>("");

  // Generate context name from chain using short names
  const contextName = useMemo(() => {
    if (contextChain.length === 0) return "default";

    const shortNames = contextChain.map((contextId) => {
      const context = BASE_CONTEXTS.find((c) => c.id === contextId);
      return context?.shortName || contextId;
    });

    return shortNames.join("");
  }, [contextChain]);

  // Generate CSS selector from chain
  const cssSelector = useMemo(() => {
    if (contextChain.length === 0) return ":root";

    const selectors = contextChain.map((contextId) => {
      const context = BASE_CONTEXTS.find((c) => c.id === contextId);
      return context?.selector || `.${contextId}`;
    });

    return selectors.join(" ");
  }, [contextChain]);

  const handleAddContext = () => {
    if (selectedContext && !contextChain.includes(selectedContext)) {
      setContextChain([...contextChain, selectedContext]);
      setSelectedContext("");
    }
  };

  const handleRemoveContext = (index: number) => {
    setContextChain(contextChain.filter((_, i) => i !== index));
  };

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleGenerateContext = () => {
    onContextGenerated?.(contextName, cssSelector);
  };

  return (
    <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
      {/* Context Chain Builder */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Build Context Chain
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Add Context</InputLabel>
            <Select
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value)}
              label="Add Context"
            >
              {BASE_CONTEXTS.filter((c) => !contextChain.includes(c.id)).map(
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
            disabled={!selectedContext}
            color="primary"
          >
            <AddIcon />
          </IconButton>
        </Stack>

        {/* Context Chain Display */}
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
          {contextChain.map((contextId, index) => {
            const context = BASE_CONTEXTS.find((c) => c.id === contextId);
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
              No contexts added (will use default)
            </Typography>
          )}
        </Stack>

        {/* Generated Names Preview */}
        <Box
          sx={{ mt: 2, p: 2, bgcolor: "background.default", borderRadius: 1 }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Context Name:
            </Typography>
            <Typography
              variant="body2"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {contextName}
            </Typography>
            <Tooltip
              title={
                copiedItem === "contextName" ? "Copied!" : "Copy context name"
              }
            >
              <IconButton
                size="small"
                onClick={() =>
                  handleCopyToClipboard(contextName, "contextName")
                }
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

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
            <Tooltip
              title={
                copiedItem === "cssSelector" ? "Copied!" : "Copy CSS selector"
              }
            >
              <IconButton
                size="small"
                onClick={() =>
                  handleCopyToClipboard(cssSelector, "cssSelector")
                }
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Button
          variant="contained"
          onClick={handleGenerateContext}
          sx={{ mt: 2 }}
          disabled={contextChain.length === 0}
        >
          Generate Context
        </Button>
      </Paper>
    </Box>
  );
};
