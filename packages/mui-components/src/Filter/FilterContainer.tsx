import React from "react";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Collapse,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";

export interface FilterContainerProps {
  title?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  showClearButton?: boolean;
  showFilterCount?: boolean;
  activeFilterCount?: number;
  onClearFilters?: () => void;
  sx?: any;
}

export const FilterContainer: React.FC<FilterContainerProps> = ({
  title,
  children,
  collapsible = false,
  defaultCollapsed = false,
  showClearButton = true,
  showFilterCount = true,
  activeFilterCount = 0,
  onClearFilters,
  sx,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => !prev);
  };

  // If no title, render just the children without header
  if (!title) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          ...sx,
        }}
      >
        {children}
      </Paper>
    );
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 2,
        ...sx,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TuneIcon color="action" />
          <Typography variant="subtitle1" fontWeight="medium">
            {title}
          </Typography>
          {showFilterCount && activeFilterCount > 0 && (
            <Typography
              variant="caption"
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                px: 1,
                py: 0.25,
                borderRadius: 1,
                fontWeight: "medium",
              }}
            >
              {activeFilterCount}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {showClearButton && onClearFilters && (
            <Tooltip title="Clear all filters">
              <IconButton
                onClick={onClearFilters}
                sx={{
                  visibility: activeFilterCount > 0 ? "visible" : "hidden",
                  p: "0 !important",
                }}
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )}

          {collapsible && (
            <Tooltip title={isCollapsed ? "Show filters" : "Hide filters"}>
              <IconButton
                size="small"
                onClick={toggleCollapsed}
                sx={{ p: "0 !important" }}
              >
                {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Filter Fields */}
      <Collapse in={!isCollapsed} timeout={200}>
        <Box>
          <Divider sx={{ mt: 1, mb: 2 }} />
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
};
