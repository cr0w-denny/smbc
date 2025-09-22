import React from "react";
import { Box, useTheme } from "@mui/material";
import * as ui from "@smbc/ui-core";

// Import AG Grid styles
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";

export interface AgGridThemeProps {
  height?: string | number;
  mx?: number;
  wrapHeaders?: boolean;
  children: React.ReactNode;
  popupParentRef?: React.MutableRefObject<HTMLDivElement | null>;
}

export const AgGridTheme: React.FC<AgGridThemeProps> = ({
  height = "100%",
  mx = 0,
  wrapHeaders = false,
  children,
  popupParentRef,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const agGridThemeClass = isDarkMode
    ? "ag-theme-quartz-dark"
    : "ag-theme-quartz";

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
          "--ag-background-color": isDarkMode
            ? ui.TableRowBackgroundDark
            : ui.TableRowBackgroundLight,
          "--ag-odd-row-background-color": isDarkMode
            ? ui.TableRowBackgroundAltDark
            : ui.TableRowBackgroundLight,
          "--ag-foreground-color": theme.palette.text.primary,
          "--ag-header-background-color": isDarkMode
            ? ui.TableHeaderBackgroundDark
            : ui.TableHeaderBackgroundLight,
          "--ag-header-foreground-color": isDarkMode
            ? ui.TableHeaderTextDark
            : ui.TableHeaderTextLight,
          "--ag-border-color": isDarkMode
            ? ui.TableBorderDark
            : ui.TableBorderLight,
          "--ag-row-hover-color": isDarkMode
            ? ui.TableRowHoverDark
            : ui.TableRowHoverLight,
          "--ag-selected-row-background-color": isDarkMode
            ? ui.TableRowSelectedDark
            : ui.TableRowSelectedLight,
          "--ag-header-row-border-style": "none",
          "--ag-borders-critical": "none",
          // Additional AG Grid theme variables
          "--ag-input-border-color": isDarkMode
            ? ui.InputBorderDark
            : ui.InputBorderLight,
          "--ag-input-background-color": isDarkMode
            ? ui.InputBackgroundDark
            : ui.InputBackgroundLight,
          "--ag-input-focus-border-color": isDarkMode
            ? ui.InputActiveDark
            : ui.InputActiveLight,
          "--ag-input-disabled-background-color": isDarkMode
            ? ui.InputDisabledDark
            : ui.InputDisabledLight,
          "--ag-chip-background-color": isDarkMode
            ? ui.ChipDefaultBackgroundDark
            : ui.ChipDefaultBackgroundLight,
          "--ag-modal-overlay-background-color": "rgba(0, 0, 0, 0.4)",
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
        {children}
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
