import React from "react";
import { Box } from "@mui/material";

export interface BackgroundEffectProps {
  /** Blur intensity in pixels (0 or undefined = no blur) */
  blur?: number;
  /** Width of the effect area */
  width?: string;
  /** Height of the effect area */
  height?: string;
  /** Edges to fade out (e.g., ['right'], ['right', 'bottom']) */
  fadeEdges?: ("right" | "left" | "top" | "bottom")[];
  /** Percentage where fade starts (0-100, default 85) */
  fadeStart?: number;
  /** Percentage where fade ends (0-100, default 95) */
  fadeEnd?: number;
  /** Show red debug box */
  debug?: boolean;
  /** Additional styles (backgroundColor, etc) */
  sx?: any;
}

export const BackgroundEffect: React.FC<BackgroundEffectProps> = ({
  blur,
  width = "60vw",
  height = "54px",
  fadeEdges,
  fadeStart = 90,
  fadeEnd = 100,
  debug = false,
  sx,
}) => {
  const hasBlur = blur && blur > 0;

  // Generate gradient for each fade edge
  const generateMaskGradient = () => {
    return fadeEdges
      ?.map(
        (edge) =>
          `linear-gradient(to ${edge}, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${fadeStart}%, rgba(0,0,0,0) ${fadeEnd}%)`,
      )
      .join(", ");
  };

  const maskGradient = generateMaskGradient();

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width,
        height,
        backdropFilter: hasBlur ? `blur(${blur}px)` : undefined,
        WebkitBackdropFilter: hasBlur ? `blur(${blur}px)` : undefined,
        backgroundColor: debug ? "red" : undefined,
        WebkitMaskImage: maskGradient ? maskGradient : undefined,
        maskImage: maskGradient ? maskGradient : undefined,
        zIndex: -1,
        pointerEvents: "none",
        ...sx,
      }}
    />
  );
};
