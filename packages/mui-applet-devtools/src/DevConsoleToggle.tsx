import React, { useState, useMemo } from "react";
import {
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  BuildCircle as BuildCircleIcon,
} from "@mui/icons-material";
import type { CurrentAppletInfo } from "./HostAppBar";
import { useHashNavigation } from "@smbc/applet-core";
import { getCurrentApplet } from "@smbc/applet-host";
import { DevConsole } from "./DevConsole";
import { debug, createSessionId } from "./utils/debug";
import { color, ui } from "@smbc/ui-core";

export interface DevConsoleToggleProps {
  /** Array of applet configurations */
  applets: any[];
  /** Impersonation email for dev mode */
  impersonationEmail?: string;
  /** Callback when impersonation email changes */
  onImpersonationEmailChange?: (email: string) => void;
}

/**
 * Development console toggle button.
 * Only shown in development mode.
 */
export const DevConsoleToggle: React.FC<DevConsoleToggleProps> = ({
  applets,
  impersonationEmail,
  onImpersonationEmailChange
}) => {
  const [devConsoleOpen, setDevConsoleOpen] = useState(false);
  const isDevelopment = process.env.NODE_ENV === "development";
  const { path } = useHashNavigation();


  // Determine current applet based on the actual window hash
  const currentAppletInfo = useMemo((): CurrentAppletInfo | null => {
    // Use window.location.hash directly since useHashNavigation path can be stale
    const actualPath = window.location.hash.slice(1) || "/";
    const pathWithoutQuery = actualPath.split("?")[0];
    const currentApplet = getCurrentApplet(pathWithoutQuery, applets);

    if (!currentApplet) {
      return null;
    }

    return {
      id: currentApplet.id,
      label: currentApplet.label || currentApplet.id,
      packageName:
        typeof currentApplet.packageName === "string"
          ? currentApplet.packageName
          : false,
      apiSpec: currentApplet.apiSpec,
    };
  }, [path, applets]);

  // Log path changes outside of useMemo to prevent render loops
  React.useEffect(() => {
    const actualPath = window.location.hash.slice(1) || "/";
    const pathWithoutQuery = actualPath.split("?")[0];

    debug.log(createSessionId('applet-detection'), 'DevToolsMenu', 'path-changed', {
      hookPath: path,
      actualPath,
      pathWithoutQuery,
      foundApplet: currentAppletInfo?.id || null,
      allApplets: applets.map(a => ({ id: a.id, routes: a.routes.map((r: any) => r.path) }))
    });
  }, [path, currentAppletInfo?.id, applets]);

  if (!isDevelopment) {
    return null;
  }

  const handleToggleConsole = () => {
    const newState = !devConsoleOpen;
    setDevConsoleOpen(newState);

    debug.log(createSessionId(newState ? 'console-open' : 'console-close'), 'DevToolsMenu', newState ? 'console-opened' : 'console-closed', {
      currentApplet: currentAppletInfo?.id || 'none',
      hasApiSpec: !!currentAppletInfo?.apiSpec?.spec
    });
  };

  // Determine icon color based on state
  const getIconColor = () => {
    if (devConsoleOpen) {
      return ui.color.input.active.dark;
    }
    return "inherit"; // Default color
  };

  return (
    <>
      <Tooltip title="Developer Console">
        <IconButton
          onClick={handleToggleConsole}
          sx={{
            color: getIconColor(),
            "& svg": { fontSize: 28 },
          }}
        >
          <BuildCircleIcon />
        </IconButton>
      </Tooltip>

      <DevConsole
        open={devConsoleOpen}
        onClose={() => setDevConsoleOpen(false)}
        currentAppletInfo={currentAppletInfo}
        impersonationEmail={impersonationEmail}
        onImpersonationEmailChange={onImpersonationEmailChange}
      />
    </>
  );
};