import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@mui/material/styles";
import { Paper, Box, IconButton, Tooltip } from "@mui/material";
import { ContentCopy as CopyIcon } from "@mui/icons-material";

interface CodeHighlightProps {
  code: string;
  language?: string;
  showCopyButton?: boolean;
}

export const CodeHighlight: React.FC<CodeHighlightProps> = ({
  code,
  language = "typescript",
  showCopyButton = true,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  return (
    <Paper
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: isDark ? "grey.900" : "grey.50",
        border: "1px solid",
        borderColor: isDark ? "grey.700" : "grey.300",
      }}
    >
      {showCopyButton && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
          }}
        >
          <Tooltip title="Copy code">
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{
                bgcolor: isDark ? "grey.800" : "grey.200",
                color: isDark ? "grey.300" : "grey.700",
                "&:hover": {
                  bgcolor: isDark ? "grey.700" : "grey.300",
                },
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
      <SyntaxHighlighter
        language={language}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: "16px",
          fontSize: "0.875rem",
          fontFamily: 'Monaco, "Lucida Console", monospace',
          backgroundColor: "transparent",
        }}
        showLineNumbers={false}
        wrapLines={true}
        wrapLongLines={true}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </Paper>
  );
};