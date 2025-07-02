import {
  CircularProgress,
  Typography,
  Backdrop,
  Paper,
} from "@mui/material";

export interface TransactionProgressOverlayProps {
  /** Whether the overlay is visible */
  open: boolean;
  /** Number of operations being processed */
  operationCount?: number;
  /** Current operation being processed (1-based) */
  currentOperation?: number;
  /** Custom message to display */
  message?: string;
}

/**
 * Overlay that blocks the table during transaction commit
 * Shows progress indicator and operation count
 */
export function TransactionProgressOverlay({
  open,
  operationCount = 0,
  currentOperation = 0,
  message,
}: TransactionProgressOverlayProps) {
  const defaultMessage = operationCount > 1 
    ? `Processing ${currentOperation} of ${operationCount} operations...`
    : "Committing changes...";

  return (
    <Backdrop
      open={open}
      sx={{
        position: "absolute",
        zIndex: (theme) => theme.zIndex.modal,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(2px)",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          minWidth: 200,
        }}
      >
        <CircularProgress size={40} thickness={4} />
        
        <Typography variant="body1" fontWeight={500}>
          {message || defaultMessage}
        </Typography>
        
        {operationCount > 1 && (
          <Typography variant="body2" color="text.secondary">
            {Math.round((currentOperation / operationCount) * 100)}% complete
          </Typography>
        )}
      </Paper>
    </Backdrop>
  );
}