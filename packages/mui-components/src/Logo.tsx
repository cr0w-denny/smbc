import React from "react";
import { useTheme } from "@mui/material";
const logoLight = "/assets/logo.png";
const logoDark = "/assets/logo-dark.png";

export interface LogoProps {
  /** Height of the logo in pixels */
  height?: number;
  /** Alternative text for the logo */
  alt?: string;
  /** Custom styling */
  style?: React.CSSProperties;
  /** Force a specific variant regardless of theme */
  variant?: "light" | "dark" | "auto";
}

/**
 * SMBC Logo component that automatically switches between light and dark variants
 * based on the current theme, or can be forced to a specific variant.
 */
export function Logo({
  height = 32,
  alt = "SMBC Logo",
  style,
  variant = "auto",
}: LogoProps) {
  const theme = useTheme();

  // Determine which logo to use
  const logoSrc = React.useMemo(() => {
    if (variant === "light") return logoLight;
    if (variant === "dark") return logoDark;

    // Auto mode: use dark logo for dark theme, light logo for light theme
    return theme.palette.mode === "dark" ? logoDark : logoLight;
  }, [theme.palette.mode, variant]);

  return (
    <img
      src={logoSrc}
      alt={alt}
      style={{
        height,
        objectFit: "contain",
        ...style,
      }}
    />
  );
}
