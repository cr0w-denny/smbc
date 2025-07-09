import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tab,
  Tabs,
  Box,
  Typography,
  IconButton,
  Paper,
  Divider,
  Alert,
} from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import type { CurrentAppletInfo } from "@smbc/mui-applet-core";
import {
  CORE_PEER_DEPS,
  getAppletDocs,
  hasBackendDocs,
} from "@smbc/shared-deps";
import "github-markdown-css/github-markdown-light.css";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface InstallationModalProps {
  open: boolean;
  onClose: () => void;
  appletInfo: CurrentAppletInfo;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`installation-tabpanel-${index}`}
      aria-labelledby={`installation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error("Failed to copy text: ", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        my: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "grey.900" : "grey.50",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <IconButton
          onClick={handleCopy}
          size="small"
          color={copied ? "success" : "default"}
          sx={{ ml: 1 }}
        >
          {copied ? (
            <CheckIcon fontSize="small" />
          ) : (
            <ContentCopyIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
      <Typography
        component="pre"
        variant="body2"
        sx={{
          fontFamily: "monospace",
          fontSize: "0.85rem",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "grey.800" : "white",
          p: 1.5,
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          overflow: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {text}
      </Typography>
    </Paper>
  );
}

const APPLET_PACKAGE_MAP: Record<string, string> = {
  hello: "@smbc/hello-mui",
  "user-management": "@smbc/user-management-mui",
  "admin-users": "@smbc/user-management-mui",
  "product-catalog": "@smbc/product-catalog-mui",
};

export function InstallationModal({
  open,
  onClose,
  appletInfo,
}: InstallationModalProps) {
  const [tabValue, setTabValue] = useState(0);

  // Reset to first tab when modal opens
  useEffect(() => {
    if (open) {
      setTabValue(0);
    }
  }, [open]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const packageName = APPLET_PACKAGE_MAP[appletInfo.id];
  const appletDocs = getAppletDocs(appletInfo.id);
  const hasBackend = hasBackendDocs(appletInfo.id);

  // Generate installation commands
  const peerDepsCommand = Object.entries(CORE_PEER_DEPS)
    .map(([pkg, version]) => `${pkg}@${version.replace("^", "")}`)
    .join(" ");

  const prerequisites = `npm install ${peerDepsCommand}`;
  const appletInstall = `npm install ${packageName}`;
  const combined = `npm install ${packageName} ${peerDepsCommand}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: { sx: { minHeight: "60vh" } },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Install {appletInfo.label}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This applet requires specific peer dependencies to function
            correctly. Follow the installation steps below to integrate it into
            your project.
          </Typography>
        </Alert>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="installation tabs"
          >
            <Tab label="Frontend (React + MUI)" id="installation-tab-0" />
            {hasBackend && (
              <Tab label="Backend (Django)" id="installation-tab-1" />
            )}
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            React + MUI Installation
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Install the required peer dependencies first, then add the applet
            package.
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Option 1: Install Everything at Once
          </Typography>
          <CopyButton text={combined} label="Complete installation command" />

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Option 2: Step by Step
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            1. Install peer dependencies:
          </Typography>
          <CopyButton text={prerequisites} label="Prerequisites" />

          <Typography variant="body2" color="text.secondary" gutterBottom>
            2. Install the applet:
          </Typography>
          <CopyButton text={appletInstall} label="Applet package" />

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Usage Example
          </Typography>
          <CopyButton
            text={`import { ${appletInfo.label.replace(/\s+/g, "")}Applet } from '${packageName}';

function App() {
  return (
    <div>
      <${appletInfo.label.replace(/\s+/g, "")}Applet mountPath="/my-app" />
    </div>
  );
}`}
            label="Basic integration"
          />

          {appletDocs?.frontend && (
            <Box sx={{ mt: 4 }}>
              <MarkdownRenderer html={appletDocs.frontend.html} />
            </Box>
          )}
        </TabPanel>

        {hasBackend && (
          <TabPanel value={tabValue} index={1}>
            {appletDocs?.backend ? (
              <MarkdownRenderer
                html={appletDocs.backend.html}
                showBorder={false}
              />
            ) : (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Django backend packages are currently in development. Basic
                    installation commands are shown below.
                  </Typography>
                </Alert>

                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Package Installation
                </Typography>
                <CopyButton
                  text={`pip install @smbc/${appletInfo.id}-django`}
                  label="Django package (when available)"
                />

                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                  Django Settings Configuration
                </Typography>
                <CopyButton
                  text={`# settings.py
INSTALLED_APPS = [
    # ... your other apps
    'smbc.${appletInfo.id.replace("-", "_")}',
]

# API Configuration
SMBC_${appletInfo.id.toUpperCase().replace("-", "_")}_CONFIG = {
    'BASE_URL': '/api/v1/${appletInfo.id}/',
    'ENABLE_MOCK_DATA': DEBUG,
}`}
                  label="Django configuration"
                />
              </>
            )}
          </TabPanel>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
