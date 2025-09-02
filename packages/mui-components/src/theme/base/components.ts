import { Components, Theme } from "@mui/material/styles";
import { getSemanticColor, getSemanticShadow } from "@smbc/ui-core";

export const createBaseComponents = (
  theme: Theme,
): Components<Omit<Theme, "components">> => {
  const mode = theme.palette.mode as "light" | "dark";

  return {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: theme.spacing(3),
          padding: "6px 16px",
          fontSize: "0.875rem",
          fontWeight: 500,
          textTransform: "none",
          boxShadow: "none",
          "&:hover": {
            boxShadow:
              getSemanticShadow("sm", mode) || "0 2px 4px rgba(0,0,0,0.1)",
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent !important",
            color:
              mode === "dark"
                ? "rgba(255, 255, 255, 0.3) !important"
                : "rgba(0, 0, 0, 0.26) !important",
          },
        },
        contained: {
          background: `linear-gradient(160deg, #024fb0 0%, #2c88f3 100%)`,
          border: "1px solid #2c88f3",
          color: "#ffffff",
          "&:hover": {
            background: `linear-gradient(160deg, #2c88f3 0%, #024fb0 100%)`,
            border: "1px solid #2c88f3",
            boxShadow:
              getSemanticShadow("md", mode) || "0 4px 8px rgba(0,0,0,0.15)",
          },
          "&.MuiButton-containedSecondary": {
            background:
              getSemanticColor("gradient.secondary", mode) ||
              `linear-gradient(180deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
            "&:hover": {
              background:
                getSemanticColor("gradient.secondary.hover", mode) ||
                `linear-gradient(180deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
            },
          },
          "&.Mui-disabled": {
            background:
              mode === "dark"
                ? "rgba(255, 255, 255, 0.12) !important"
                : "rgba(0, 0, 0, 0.12) !important",
            color:
              mode === "dark"
                ? "rgba(255, 255, 255, 0.3) !important"
                : "rgba(0, 0, 0, 0.26) !important",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: theme.palette.mode === "dark" ? theme.spacing(3) : 8,
            fontSize: "0.875rem",
            ...(theme.palette.mode === "dark" && {
              backgroundColor: "#141b1d",
            }),
            "& fieldset": {
              borderColor:
                getSemanticColor("border.secondary", mode) ||
                (theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.23)"
                  : "rgba(0, 0, 0, 0.23)"),
              ...(theme.palette.mode === "dark" && {
                borderRadius: theme.spacing(3),
              }),
            },
            "&:hover fieldset": {
              borderColor:
                getSemanticColor("border.focus", mode) ||
                theme.palette.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor:
                getSemanticColor("border.focus", mode) ||
                theme.palette.primary.main,
              borderWidth: 2,
            },
          },
          "& .MuiInputBase-input": {
            padding: "9px 12px",
          },
          ...(theme.palette.mode === "dark" && {
            "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
              backgroundColor: "#141b1d",
              borderRadius: theme.spacing(3),
            },
          }),
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          ...(theme.palette.mode === "dark" && {
            backgroundColor: "#141b1d",
            borderRadius: theme.spacing(3),
          }),
          "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: theme.palette.mode === "dark" ? theme.spacing(3) : 8,
            borderColor:
              getSemanticColor("border.secondary", mode) ||
              (theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.23)"
                : "rgba(0, 0, 0, 0.23)"),
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor:
              getSemanticColor("border.focus", mode) ||
              theme.palette.primary.main,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor:
              getSemanticColor("border.focus", mode) ||
              theme.palette.primary.main,
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: theme.spacing(3),
          background:
            getSemanticColor("gradient.surface", mode) ||
            (theme.palette.mode === "dark"
              ? `linear-gradient(145deg, ${
                  getSemanticColor("background.tertiary", mode) || "#2a2a2a"
                } 0%, ${
                  getSemanticColor("background.secondary", mode) || "#1f1f1f"
                } 100%)`
              : `linear-gradient(145deg, ${
                  getSemanticColor("background.secondary", mode) || "#ffffff"
                } 0%, ${
                  getSemanticColor("background.primary", mode) || "#f8f9fa"
                } 100%)`),
          boxShadow:
            getSemanticShadow("base", mode) ||
            (theme.palette.mode === "dark"
              ? "0 1px 3px rgba(0,0,0,0.3)"
              : "0 1px 3px rgba(0,0,0,0.1)"),
          "&:hover": {
            background:
              getSemanticColor("gradient.surface.hover", mode) ||
              (theme.palette.mode === "dark"
                ? `linear-gradient(145deg, ${
                    getSemanticColor("background.secondary", mode) || "#1f1f1f"
                  } 0%, ${
                    getSemanticColor("background.tertiary", mode) || "#2a2a2a"
                  } 100%)`
                : `linear-gradient(145deg, ${
                    getSemanticColor("background.primary", mode) || "#f8f9fa"
                  } 0%, ${
                    getSemanticColor("background.secondary", mode) || "#ffffff"
                  } 100%)`),
            boxShadow:
              getSemanticShadow("lg", mode) ||
              (theme.palette.mode === "dark"
                ? "0 4px 12px rgba(0,0,0,0.4)"
                : "0 4px 12px rgba(0,0,0,0.15)"),
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: theme.spacing(3),
          // Less border radius for dropdown menus
          "&.MuiMenu-paper, &.MuiPopover-paper": {
            borderRadius: 8,
          },
        },
        elevation1: {
          boxShadow:
            getSemanticShadow("base", mode) ||
            (theme.palette.mode === "dark"
              ? "0 1px 3px rgba(0,0,0,0.3)"
              : "0 1px 3px rgba(0,0,0,0.1)"),
        },
        elevation2: {
          boxShadow:
            getSemanticShadow("md", mode) ||
            (theme.palette.mode === "dark"
              ? "0 2px 6px rgba(0,0,0,0.3)"
              : "0 2px 6px rgba(0,0,0,0.1)"),
        },
        elevation3: {
          boxShadow:
            getSemanticShadow("lg", mode) ||
            (theme.palette.mode === "dark"
              ? "0 4px 12px rgba(0,0,0,0.4)"
              : "0 4px 12px rgba(0,0,0,0.15)"),
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: theme.spacing(3),
          fontSize: "0.75rem",
          height: 24,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: `${
            getSemanticColor("surface.header", mode) || "#141b1d"
          } !important`,
          color: `${
            getSemanticColor("brand.primaryContrast", mode) || "#ffffff"
          } !important`,
          boxShadow:
            getSemanticShadow("base", mode) ||
            (mode === "dark"
              ? "0 1px 3px rgba(0,0,0,0.3)"
              : "0 1px 3px rgba(0,0,0,0.1)"),
          borderRadius: 0,
          borderBottom: "3px solid #02080b",
          // Remove MUI's default overlay
          "&::before": {
            display: "none",
          },
          // Override CSS custom properties that add overlays
          "--Paper-overlay": "none !important",
          "--Paper-elevation": "none !important",
          // Navigation dropdown underline styles
          "& [role='button'][aria-haspopup='true']": {
            "& .nav-underline, & .active-indicator, &::after": {
              right: "20px !important", // Shift underline left to exclude arrow
              width: "calc(100% - 24px) !important",
            },
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 70,
          backgroundColor:
            mode === "dark"
              ? getSemanticColor("surface.header", mode)
              : "inherit",
          color: mode === "dark" ? "#ffffff" : "inherit",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.mode === "dark" ? "#222" : "#f5f5f5",
        },
        indicator: {
          backgroundColor: theme.palette.primary.main,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: theme.palette.mode === "dark" ? "#ccc" : "#666",
          "&.Mui-selected": {
            color: theme.palette.mode === "dark" ? "#fff" : "#000",
            backgroundColor: theme.palette.mode === "dark" ? "#333" : "#e0e0e0",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${
            getSemanticColor("border.primary", mode) ||
            (theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.12)"
              : "#e0e0e0")
          }`,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: 6,
          paddingBottom: 6,
          "&:hover": {
            backgroundColor:
              getSemanticColor("action.hover", mode) ||
              (theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(51, 85, 0, 0.04)"),
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "0 8px",
          "&:hover": {
            backgroundColor:
              getSemanticColor("action.hover", mode) ||
              (theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(51, 85, 0, 0.04)"),
          },
          "&.Mui-selected": {
            backgroundColor:
              getSemanticColor("action.selected", mode) ||
              (theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(51, 85, 0, 0.08)"),
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.16)"
                  : "rgba(51, 85, 0, 0.12)",
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 16px",
          fontSize: "0.875rem",
        },
        head: {
          fontWeight: 500,
          backgroundColor:
            getSemanticColor("background.tertiary", mode) ||
            (theme.palette.mode === "dark" ? "#2a2a2a" : "#fafafa"),
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: 8,
          "&:hover": {
            backgroundColor:
              getSemanticColor("action.hover", mode) ||
              (theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(51, 85, 0, 0.04)"),
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor:
            getSemanticColor("text.inverse", mode) ||
            (theme.palette.mode === "dark" ? "#fff" : "#333"),
          color:
            getSemanticColor("background.primary", mode) ||
            (theme.palette.mode === "dark" ? "#333" : "#fff"),
          fontSize: "0.75rem",
          borderRadius: 6,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: getSemanticColor("text.primary", mode) ||
            (mode === "dark" ? "rgba(255, 255, 255, 0.87)" : "#212121"),
        },
      },
    },
    // EWI-specific input styling for dark themes
    MuiInputBase: {
      styleOverrides: {
        root: {
          ...(theme.palette.mode === "dark" && {
            backgroundColor: "#141b1d",
            borderRadius: theme.spacing(3),
          }),
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          ...(theme.palette.mode === "dark" && {
            "&.MuiPickersTextField-root": {
              "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
                backgroundColor: "#141b1d",
                borderRadius: theme.spacing(3),
              },
            },
          }),
        },
      },
    },
    // Date picker specific styling
    // @ts-ignore - MuiPickersInputBase may not be in types but is used by MUI X Date Pickers
    MuiPickersInputBase: {
      styleOverrides: {
        root: {
          ...(theme.palette.mode === "dark" && {
            backgroundColor: "#141b1d",
            borderRadius: theme.spacing(3),
            "&.MuiPickersOutlinedInput-root": {
              backgroundColor: "#141b1d",
              borderRadius: theme.spacing(3),
            },
            "& .MuiIconButton-root": {
              color:
                getSemanticColor("brand.primary", mode) ||
                theme.palette.primary.main,
            },
          }),
        },
      },
    },
    // Global body and navigation styling
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor:
            getSemanticColor("surface.body", mode) ||
            (mode === "dark" ? "#242b2f" : "#fafafa"),
          color: getSemanticColor("text.primary", mode) ||
            (mode === "dark" ? "rgba(255, 255, 255, 0.87)" : "#212121"),
        },
        ...(mode === "dark" && {
          // Scrollbar styling for dark mode
          "body, .ag-theme-quartz, .ag-body-viewport, .MuiPaper-root": {
            scrollbarColor: "#555 #2a2a2a",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              width: "10px",
              height: "10px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#2a2a2a",
              borderRadius: "5px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#555",
              borderRadius: "5px",
              border: "1px solid #2a2a2a",
              "&:hover": {
                backgroundColor: "#666",
              },
            },
            "&::-webkit-scrollbar-corner": {
              backgroundColor: "#2a2a2a",
            },
          },
        }),
      },
    },
  };
};
