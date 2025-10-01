import { Box, BoxProps } from "@mui/material";

export interface DividerProps extends Omit<BoxProps, 'sx'> {
  /** Custom spacing override */
  spacing?: number;
  /** Custom sx prop that gets merged with divider styles */
  sx?: BoxProps['sx'];
}

/**
 * A fancy divider with gradient fade-out effect on both sides
 * Automatically adjusts height and colors based on theme mode
 */
export function Divider({ spacing = 2, sx, ...boxProps }: DividerProps) {
  return (
    <Box
      {...boxProps}
      sx={{
        my: spacing,
        border: "none",
        height: (theme: any) => theme.palette.mode === "dark" ? "1.7px" : "1px",
        background: (theme: any) => theme.palette.mode === "dark"
          ? "linear-gradient(90deg, transparent 0%, #4A5971 50%, transparent 100%)"
          : "linear-gradient(90deg, transparent 0%, #00000080 50%, transparent 100%)",
        ...sx,
      }}
    />
  );
}

export default Divider;