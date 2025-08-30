import React from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

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
  height = "70vh",
  mx = 2,
  wrapHeaders = false,
  children,
  popupParentRef,
}) => {
  const theme = useTheme();

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
        "& .ag-theme-quartz": {
          height: "100%",
          "& .ag-root-wrapper": {
            borderRadius: "0 !important",
            border: "none !important",
          },
          // Theme colors
          "--ag-background-color": theme.palette.background.paper,
          "--ag-odd-row-background-color": theme.palette.background.default,
          "--ag-foreground-color": theme.palette.text.primary,
          "--ag-header-background-color": theme.palette.background.default,
          "--ag-header-foreground-color": theme.palette.text.primary,
          "--ag-border-color": theme.palette.divider,
          "--ag-row-hover-color": theme.palette.action.hover,
          "--ag-selected-row-background-color": theme.palette.action.selected,
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
          // Header wrapping styles
          ...headerWrapStyles,
        },
      }}
    >
      <div
        className="ag-theme-quartz"
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
              .ag-popup-parent > * {
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
