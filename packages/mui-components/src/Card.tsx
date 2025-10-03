import React from "react";
import { Card as MuiCard, CardContent, Box, Typography } from "@mui/material";
import { ui } from "@smbc/ui-core";
import { ActionMenu, ActionMenuItem } from "./ActionMenu";

// Re-export for backwards compatibility
export type CardMenuItem = ActionMenuItem;

export interface CardProps {
  title?: string | React.ReactNode;
  subtitle?: string;
  menuItems?: CardMenuItem[];
  children: React.ReactNode;
  elevation?: number;
  sx?: any;
  headerSx?: any;
  contentSx?: any;
  showMenu?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  toolbar?: React.ReactNode;
  header?: React.ReactNode; // Full custom header - overrides title/subtitle/toolbar/menu
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  menuItems = [],
  children,
  elevation = 1,
  sx,
  headerSx,
  contentSx,
  showMenu = true,
  onMenuOpen,
  onMenuClose,
  toolbar,
  header,
}) => {
  // Get the padding value based on size
  const headerPadding = ui.cardHeader.padding;

  return (
    <MuiCard
      elevation={elevation}
      sx={{
        backgroundImage: "none !important",
        backgroundColor: ui.card.background,
        border: `1px solid ${ui.card.borderColor}`,
        borderRadius: ui.card.borderRadius,
        "&:hover": {
          boxShadow: elevation,
          backgroundColor: ui.card.background,
          backgroundImage: "none !important",
          transform: "none",
        },
        transition: "none",
        ...sx,
      }}
    >
      {/* Custom header - render directly without wrapper */}
      {header
        ? header
        : /* Default header layout - only render if there's content */
          (title ||
            subtitle ||
            toolbar ||
            (showMenu && menuItems.length > 0)) && (
            <Box
              sx={{
                px: 3,
                pt: headerPadding,
                ...headerSx,
              }}
            >
              {/* Top row: title, toolbar, and menu */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  mb: subtitle ? 0.5 : 0,
                  pt: "24px",
                }}
              >
                {/* Title - only render if provided */}
                {title && (
                  <Typography
                    component="div"
                    sx={{
                      fontSize: ui.cardHeader.fontSize,
                      fontWeight: ui.cardHeader.fontWeight,
                      fontFamily: ui.cardHeader.fontFamily,
                      color: ui.cardHeader.color,
                      lineHeight: 1.2,
                    }}
                  >
                    {title}
                  </Typography>
                )}

                {/* Toolbar - expands to fill space when no title */}
                {toolbar && (
                  <Box
                    sx={{
                      mt: -1,
                      display: "flex",
                      alignItems: "center",
                      flex: title ? "initial" : 1,
                      mr: showMenu && menuItems.length > 0 ? 1 : 0,
                    }}
                  >
                    {toolbar}
                  </Box>
                )}

                {/* Menu button on the right */}
                {showMenu && menuItems.length > 0 && (
                  <ActionMenu
                    menuItems={menuItems}
                    onMenuOpen={onMenuOpen}
                    onMenuClose={onMenuClose}
                    sx={{ mr: "-10px", mt: -0.5 }}
                  />
                )}
              </Box>

              {/* Subtitle */}
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          )}
      <CardContent
        sx={{
          p: 2,
          pr: 3,
          pb: 4,
          height: "100%",
          "&:last-child": {
            pb: 4,
          },
          ...contentSx,
        }}
      >
        {children}
      </CardContent>
    </MuiCard>
  );
};

export default Card;
