import { Box, Typography } from "@mui/material";

interface MarkdownRendererProps {
  html: string;
  title?: string;
  maxHeight?: number;
  showBorder?: boolean;
}

export function MarkdownRenderer({
  html,
  title = "README.md",
  maxHeight = 400,
  showBorder = true,
}: MarkdownRendererProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box
        className="markdown-body"
        sx={{
          backgroundColor: "transparent !important",
          p: showBorder ? 2 : 0,
          ...(showBorder && {
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
          }),
          maxHeight,
          overflow: "auto",
          "& pre": {
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "grey.900" : "grey.50",
          },
          "& code": {
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "grey.800" : "grey.100",
          },
          "& h1, & h2, & h3, & h4, & h5, & h6": {
            color: (theme) => theme.palette.text.primary,
          },
          "& p, & li": {
            color: (theme) => theme.palette.text.secondary,
          },
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Box>
  );
}