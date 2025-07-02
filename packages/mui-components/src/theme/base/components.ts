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
          borderRadius: 8,
          padding: "6px 16px",
          fontSize: "0.875rem",
          fontWeight: 500,
          textTransform: "none",
          boxShadow: "none",
          "&:hover": {
            boxShadow:
              getSemanticShadow("sm", mode) || "0 2px 4px rgba(0,0,0,0.1)",
          },
        },
        contained: {
          background:
            getSemanticColor("gradient.primary", mode) ||
            `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          "&:hover": {
            background:
              getSemanticColor("gradient.primary.hover", mode) ||
              `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
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
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            fontSize: "0.875rem",
            "& fieldset": {
              borderColor:
                getSemanticColor("border.secondary", mode) ||
                (theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.23)"
                  : "rgba(0, 0, 0, 0.23)"),
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
            padding: "10px 12px",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: 8,
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
          borderRadius: 12,
          background:
            getSemanticColor("gradient.surface", mode) ||
            (theme.palette.mode === "dark"
              ? `linear-gradient(145deg, ${getSemanticColor("background.tertiary", mode) || "#2a2a2a"} 0%, ${getSemanticColor("background.secondary", mode) || "#1f1f1f"} 100%)`
              : `linear-gradient(145deg, ${getSemanticColor("background.secondary", mode) || "#ffffff"} 0%, ${getSemanticColor("background.primary", mode) || "#f8f9fa"} 100%)`),
          boxShadow:
            getSemanticShadow("base", mode) ||
            (theme.palette.mode === "dark"
              ? "0 1px 3px rgba(0,0,0,0.3)"
              : "0 1px 3px rgba(0,0,0,0.1)"),
          "&:hover": {
            background:
              getSemanticColor("gradient.surface.hover", mode) ||
              (theme.palette.mode === "dark"
                ? `linear-gradient(145deg, ${getSemanticColor("background.secondary", mode) || "#1f1f1f"} 0%, ${getSemanticColor("background.tertiary", mode) || "#2a2a2a"} 100%)`
                : `linear-gradient(145deg, ${getSemanticColor("background.primary", mode) || "#f8f9fa"} 0%, ${getSemanticColor("background.secondary", mode) || "#ffffff"} 100%)`),
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
          borderRadius: 8,
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
          borderRadius: 16,
          fontSize: "0.75rem",
          height: 28,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background:
            getSemanticColor("gradient.primary", mode) ||
            `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow:
            getSemanticShadow("base", mode) ||
            (theme.palette.mode === "dark"
              ? "0 1px 3px rgba(0,0,0,0.3)"
              : "0 1px 3px rgba(0,0,0,0.1)"),
          borderRadius: 0,
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
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontSize: "0.875rem",
          fontWeight: 500,
          minHeight: 44,
          padding: "8px 16px",
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
  };
};
