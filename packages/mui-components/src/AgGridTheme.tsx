import React from "react";
import { Box, useTheme } from "@mui/material";
import {
  TableHeaderBackgroundDark,
  TableHeaderBackgroundLight,
  TableRowBackgroundLight,
  TableRowBackgroundDark,
  TableRowBackgroundAltDark,
  TableHeaderTextLight,
  TableHeaderTextDark,
  TableBorderLight,
  TableBorderDark,
  TableRowHoverLight,
  TableRowHoverDark,
  TableRowSelectedLight,
  TableRowSelectedDark,
  InputBorderLight,
  InputBorderDark,
  InputBackgroundLight,
  InputBackgroundDark,
  InputActiveLight,
  InputActiveDark,
  InputDisabledLight,
  InputDisabledDark,
  ChipDefaultBackgroundLight,
  ChipDefaultBackgroundDark
} from "@smbc/ui-core";

// Import AG Grid styles
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";

interface AgGridThemeProps {
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

  const noBorderOutline = {
    border: "none !important",
    outline: "none !important",
  };

  const transparentBorder = {
    border: "1px solid transparent !important",
    backgroundColor: "transparent !important",
  };

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
          // Theme colors using semantic tokens
          "--ag-background-color": isDarkMode ? TableRowBackgroundDark : TableRowBackgroundLight,
          "--ag-odd-row-background-color": isDarkMode ? TableRowBackgroundAltDark : TableRowBackgroundLight,
          "--ag-foreground-color": theme.palette.text.primary,
          "--ag-header-background-color": isDarkMode ? TableHeaderBackgroundDark : TableHeaderBackgroundLight,
          "--ag-header-foreground-color": isDarkMode ? TableHeaderTextDark : TableHeaderTextLight,
          "--ag-border-color": isDarkMode ? TableBorderDark : TableBorderLight,
          "--ag-row-hover-color": isDarkMode ? TableRowHoverDark : TableRowHoverLight,
          "--ag-selected-row-background-color": isDarkMode ? TableRowSelectedDark : TableRowSelectedLight,
          "--ag-header-row-border-style": "none",
          "--ag-borders-critical": "none",
          // Additional AG Grid theme variables
          "--ag-input-border-color": isDarkMode ? InputBorderDark : InputBorderLight,
          "--ag-input-background-color": isDarkMode ? InputBackgroundDark : InputBackgroundLight,
          "--ag-input-focus-border-color": isDarkMode ? InputActiveDark : InputActiveLight,
          "--ag-input-disabled-background-color": isDarkMode ? InputDisabledDark : InputDisabledLight,
          "--ag-chip-background-color": isDarkMode ? ChipDefaultBackgroundDark : ChipDefaultBackgroundLight,
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
          // Remove all cell focus styling
          "& .ag-cell:focus, & .ag-cell:focus-within, & .ag-cell-focus:not(.ag-cell-range-selected):focus-within":
            noBorderOutline,
          "& .ag-cell.ag-cell-focus": {
            border: "1px solid transparent !important",
            outline: "none !important",
          },
          // Special cells without focus
          "& .actions-cell, & .expand-cell": {
            ...noBorderOutline,
            display: "flex !important",
            alignItems: "center !important",
            justifyContent: "center !important",
            "&:focus, &:focus-within, &.ag-cell-focus": {
              ...noBorderOutline,
              ...transparentBorder,
            },
            "&.ag-cell-focus:not(.ag-cell-range-selected)": transparentBorder,
            "&.ag-cell-range-single-cell, &.ag-cell-range-selected-1":
              transparentBorder,
            "&.ag-cell-range-selected-1:not(.ag-cell-focus)": {
              backgroundColor: "transparent !important",
            },
          },
          // Remove range selection styling from pinned columns
          "& .ag-pinned-left-cols-container .ag-cell-range-single-cell, & .ag-pinned-left-cols-container .ag-cell-range-selected-1":
            transparentBorder,
          // Force background colors in dark mode
          ...(isDarkMode && {
            "& .ag-row, & .ag-row-even, & .ag-row-odd": {
              backgroundColor: "#121B2C !important",
            },
            "& .ag-center-cols-container, & .ag-center-cols-clipper": {
              backgroundColor: "#121B2C !important",
            },
          }),
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
