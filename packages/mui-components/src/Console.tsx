import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Paper,
  IconButton,
  Portal,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  CropSquare as MaximizeIcon,
  FilterNone as RestoreIcon
} from "@mui/icons-material";

export interface ConsoleProps {
  open: boolean;
  onClose: () => void;
  header?: React.ReactNode;
  children: React.ReactNode;
  defaultHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  storageKey?: string;
}

export const Console: React.FC<ConsoleProps> = ({
  open,
  onClose,
  header,
  children,
  defaultHeight = 400,
  minHeight = 200,
  maxHeight,
  storageKey,
}) => {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`resizable-modal-${storageKey}`);
      if (saved) {
        const parsedHeight = parseInt(saved, 10);
        return Math.min(maxHeight || window.innerHeight * 0.8, Math.max(minHeight, parsedHeight));
      }
    }
    return defaultHeight;
  });
  const [lastUserHeight, setLastUserHeight] = useState(currentHeight);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [minimizedHeight] = useState(81); // Actual visual height when minimized (from logs)
  const paperRef = useRef<HTMLDivElement>(null);

  // Calculate effective max height
  const effectiveMaxHeight = maxHeight || window.innerHeight * 0.8;

  // Persist height changes
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`resizable-modal-${storageKey}`, currentHeight.toString());
    }
  }, [currentHeight, storageKey]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newMaxHeight = maxHeight || window.innerHeight * 0.8;
      if (currentHeight > newMaxHeight) {
        setCurrentHeight(newMaxHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentHeight, maxHeight]);

  // Double click to toggle maximize
  const handleTitleDoubleClick = useCallback(() => {
    if (isMinimized) {
      // Restore from minimized
      setCurrentHeight(lastUserHeight);
      setIsMinimized(false);
    } else if (isMaximized) {
      // Restore to last user height
      setCurrentHeight(lastUserHeight);
      setIsMaximized(false);
    } else {
      // Save current height and maximize
      setLastUserHeight(currentHeight);
      setCurrentHeight(effectiveMaxHeight);
      setIsMaximized(true);
    }
  }, [isMaximized, isMinimized, lastUserHeight, currentHeight, effectiveMaxHeight]);

  // Simple minimize - always minimizes to title bar
  const handleMinimizeClick = useCallback(() => {
    if (!isMinimized) {
      setLastUserHeight(currentHeight);
      setIsMinimized(true);
      setIsMaximized(false);
      setCurrentHeight(minimizedHeight); // Set to minimized height
    } else {
      // Restore from minimized
      setCurrentHeight(lastUserHeight);
      setIsMinimized(false);
    }
  }, [isMinimized, currentHeight, lastUserHeight, minimizedHeight]);

  // Simple maximize/restore toggle
  const handleMaximizeClick = useCallback(() => {
    if (isMinimized) {
      // If minimized, maximize directly
      setCurrentHeight(effectiveMaxHeight);
      setIsMinimized(false);
      setIsMaximized(true);
    } else if (isMaximized) {
      // Restore to user height
      setCurrentHeight(lastUserHeight);
      setIsMaximized(false);
    } else {
      // Maximize
      setLastUserHeight(currentHeight);
      setCurrentHeight(effectiveMaxHeight);
      setIsMaximized(true);
    }
  }, [isMinimized, isMaximized, currentHeight, lastUserHeight, effectiveMaxHeight]);

  // Drag handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startY = e.clientY;
    const actualDOMHeight = paperRef.current?.offsetHeight || currentHeight;
    // Always use the actual DOM height as the starting point - this is what the user sees
    const startHeight = actualDOMHeight;

    // Debug logging for drag start
    if ((window as any).__debug?.component) {
      const debugConsole = (window as any).__debug.component('Console');
      debugConsole.log('drag-start', {
        isMinimized,
        currentHeight,
        minimizedHeight,
        actualDOMHeight,
        startHeight,
        startY,
        paperRefExists: !!paperRef.current
      });
    }

    let firstMove = true;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY; // Inverted for bottom-up resize
      const newHeight = startHeight + deltaY;

      // Debug logging for first move only
      if (firstMove && (window as any).__debug?.component) {
        const debugConsole = (window as any).__debug.component('Console');
        debugConsole.log('drag-first-move', {
          deltaY,
          newHeight,
          startHeight,
          wasMinimized: isMinimized,
          willUnminimize: isMinimized && newHeight > minimizedHeight
        });
        firstMove = false;
      }

      // Check if we've hit a limit BEFORE clamping
      const hitLimit = newHeight <= minimizedHeight || newHeight >= effectiveMaxHeight;

      // Clamp the height within valid bounds - this prevents going below minimizedHeight
      const clampedHeight = Math.min(effectiveMaxHeight, Math.max(minimizedHeight, newHeight));
      setCurrentHeight(clampedHeight);

      // Determine minimized state based on clamped height
      if (clampedHeight <= minimizedHeight) {
        if (!isMinimized) {
          setIsMinimized(true);
          // When minimizing, set currentHeight to minimizedHeight
          setCurrentHeight(minimizedHeight);
        }
      } else if (clampedHeight >= minHeight) {
        if (isMinimized) {
          setIsMinimized(false);
        }
        // Update last user height when in normal range
        if (!isMaximized) {
          setLastUserHeight(clampedHeight);
        }
      }
      // Between minimizedHeight and minHeight: transitional state, keep current minimize state
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // If user manually resized while maximized, exit maximized state
      if (isMaximized && currentHeight !== effectiveMaxHeight) {
        setIsMaximized(false);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [currentHeight, lastUserHeight, minHeight, effectiveMaxHeight, isMaximized, isMinimized]);

  if (!open) return null;

  return (
    <Portal>
      <Paper
        ref={paperRef}
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: isMinimized && !isDragging ? 'auto' : currentHeight,
          zIndex: theme.zIndex.modal,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          maxHeight: effectiveMaxHeight,
          overflow: 'hidden',
        }}
      >
        {/* Resize Handle */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            height: 8,
            cursor: 'ns-resize',
            backgroundColor: isDragging
              ? theme.palette.primary.main
              : theme.palette.divider,
            transition: isDragging ? 'none' : 'background-color 0.2s',
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
            },
            userSelect: 'none',
            borderRadius: 0,
          }}
        />

        {/* Header */}
        <Box
          onDoubleClick={handleTitleDoubleClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: header ? 3 : 1,
            py: header ? 2 : 1,
            borderBottom: '1px solid',
            borderColor: theme.palette.divider,
            backgroundColor: theme.palette.background.paper,
            cursor: 'pointer',
            userSelect: 'none',
            minHeight: 48,
          }}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            {header}
          </Box>
          <IconButton
            onClick={handleMinimizeClick}
            size="small"
            title={isMinimized ? "Restore" : "Minimize"}
          >
            {isMinimized ? <RestoreIcon /> : <MinimizeIcon />}
          </IconButton>
          <IconButton
            onClick={handleMaximizeClick}
            size="small"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
          </IconButton>
          <IconButton onClick={onClose} size="small" title="Close">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        {!isMinimized && (
          <Box
            sx={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              zIndex: 0, // Create stacking context for internal elements
            }}
          >
            {children}
          </Box>
        )}
      </Paper>
      {/* Portal container for dropdowns within this console */}
      <div
        id="console-portal"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: theme.zIndex.modal + 1,
        }}
      />
    </Portal>
  );
};

export default Console;