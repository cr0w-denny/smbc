import React from "react";
import { Box, useTheme } from "@mui/material";
import { ui } from "@smbc/ui-core";

// Import AG Grid styles
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";

interface AgGridThemeProps {
  height?: string | number;
  mx?: number;
  wrapHeaders?: boolean;
  children:
    | React.ReactNode
    | ((popupParent: HTMLElement | null) => React.ReactNode);
}

export const AgGridTheme: React.FC<AgGridThemeProps> = ({
  height = "100%",
  mx = 0,
  wrapHeaders = false,
  children,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const agGridThemeClass = isDarkMode
    ? "ag-theme-quartz-dark"
    : "ag-theme-quartz";

  // Debug logging to check dark mode changes
  React.useEffect(() => {
    console.log(
      "AgGridTheme - theme mode:",
      theme.palette.mode,
      "isDarkMode:",
      isDarkMode,
      "theme class:",
      agGridThemeClass,
    );
  }, [theme.palette.mode, isDarkMode, agGridThemeClass]);

  // Internal popup parent management
  const popupParentRef = React.useRef<HTMLDivElement>(null);
  const [popupParent, setPopupParent] = React.useState<HTMLElement | null>(
    null,
  );

  // Set popup parent after component mounts
  React.useEffect(() => {
    if (popupParentRef.current) {
      setPopupParent(popupParentRef.current);
    }
  }, []);

  const headerWrapStyles = wrapHeaders
    ? {
        "& .ag-header-cell-label": {
          whiteSpace: "normal !important",
          wordBreak: "keep-all !important",
          overflowWrap: "normal !important",
          hyphens: "manual !important",
          lineHeight: 1.2,
          textAlign: "center",
          padding: "4px",
        },
      }
    : {};

  return (
    <Box
      sx={{
        height,
        mx,
        position: "relative",
        "& .ag-theme-quartz, & .ag-theme-quartz-dark": {
          height: "100%",
          "& .ag-root-wrapper": {
            borderRadius: "0px !important",
            border: "none !important",
          },
          "--ag-background-color": ui.tableRow.background(isDarkMode),
          // "--ag-odd-row-background-color": ui.tableRow.background,
          // "--ag-foreground-color": theme.palette.text.primary,
          "--ag-header-background-color": ui.tableHeader.background(isDarkMode),
          // "--ag-header-foreground-color": ui.tableHeader.color,
          "--ag-border-color": ui.tableRow.borderColor(isDarkMode),
          "--ag-row-hover-color": ui.tableRow.on.hover.background,
          "--ag-selected-row-background-color":
            ui.tableRow.on.selected.background,
          // "--ag-header-row-border-style": "none",
          // "--ag-borders-critical": "none",
          // Additional AG Grid theme variables
          // "--ag-input-border-color": ui.input.borderColor,
          // "--ag-input-background-color": ui.input.background,
          // "--ag-input-focus-border-color": ui.input.focus.borderColor,
          // "--ag-input-disabled-background-color": ui.input.disabled.background,
          // "--ag-chip-background-color": ui.chip.background,
          // "--ag-modal-overlay-background-color": "rgba(0, 0, 0, 0.4)",
          // Row heights
          "--ag-header-height": "42px",
          "--ag-row-height": "54px",
          // Remove pinned column borders
          "& .ag-pinned-left-header, & .ag-cell.ag-cell-last-left-pinned": {
            borderRight: "none !important",
          },
          "& .ag-pinned-right-header, & .ag-cell.ag-cell-first-right-pinned": {
            borderLeft: "none !important",
          },
          // Special cells styling for actions and expand
          "& .actions-cell, & .expand-cell": {
            display: "flex !important",
            alignItems: "center !important",
            justifyContent: "center !important",
          },
          // Remove detail grid padding/margin
          "& .ag-full-width-row .ag-cell-wrapper": {
            margin: "0 !important",
            padding: "0 !important",
          },
          "& .ag-details-row": {
            padding: "0 !important",
            margin: "0 !important",
          },
          "& .ag-details-grid": {
            padding: "0 !important",
            margin: "0 !important",
          },
          // Header wrapping styles
          ...headerWrapStyles,
        },
      }}
    >
      <div
        className={agGridThemeClass}
        style={{ height: "100%", width: "100%", position: "relative" }}
      >
        {typeof children === "function" ? children(popupParent) : children}
        {/* Popup container that inherits the theme */}
        <div
          ref={popupParentRef}
          className="ag-popup-parent"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <style>
            {`
              .ag-popup-parent > .ag-popup,
              .ag-popup-parent > .ag-menu,
              .ag-popup-parent > .ag-dialog,
              .ag-popup-parent > .ag-tooltip {
                pointer-events: auto;
              }
            `}
          </style>
        </div>
      </div>
    </Box>
  );
};

export default AgGridTheme;
