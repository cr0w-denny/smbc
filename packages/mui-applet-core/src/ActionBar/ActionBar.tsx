import {
  Box,
  Button,
  Toolbar,
  Typography,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import { BulkAction, GlobalAction } from "@smbc/react-query-dataview";

export interface ActionBarProps<T> {
  /** Global actions (right side) */
  globalActions: GlobalAction[];
  /** Bulk actions (left side when rows selected) */
  bulkActions: BulkAction<T>[];
  /** Currently selected items */
  selectedItems: T[];
  /** Total number of items */
  totalItems: number;
  /** Callback when selection is cleared */
  onClearSelection: () => void;
  /** Transaction state for bulk action visibility calculations */
  transactionState?: {
    hasActiveTransaction: boolean;
    pendingStates: Map<string | number, {
      state: "added" | "edited" | "deleted";
      operationId: string;
      data?: Partial<T>;
    }>;
    pendingStatesVersion: number;
  };
  /** Primary key field name for transaction state lookups */
  primaryKey?: keyof T;
}

/**
 * ActionBar component with left/right sections for actions
 *
 * Left side: Bulk actions (when rows selected) + selection info
 * Right side: Global actions (always visible)
 */
export function ActionBar<T>({
  globalActions,
  bulkActions,
  selectedItems,
  totalItems,
  onClearSelection,
  transactionState,
  primaryKey = 'id' as keyof T,
}: ActionBarProps<T>) {
  const theme = useTheme();
  const hasSelection = selectedItems.length > 0;

  // Helper function to get effective item state for visibility calculations
  const getEffectiveItem = (item: T) => {
    if (!transactionState?.hasActiveTransaction || !transactionState.pendingStates.size) {
      return item;
    }
    
    const entityId = item[primaryKey] as string | number;
    const pendingState = transactionState.pendingStates.get(entityId);
    
    if (pendingState?.state === "edited" && pendingState.data) {
      // Merge pending changes for visibility calculations only
      return { ...item, ...pendingState.data };
    } else if (pendingState?.state === "deleted") {
      // Mark item as having pending delete state
      return { ...item, __pendingDelete: true } as T;
    }
    
    return item;
  };

  // Filter bulk actions based on selection and applicability
  const availableBulkActions = bulkActions.filter((action) => {
    // Get effective items that include pending transaction state for visibility calculations
    const effectiveItems = selectedItems.map(getEffectiveItem);

    if (action.hidden?.(effectiveItems)) return false;

    if (action.appliesTo) {
      if (action.requiresAllRows) {
        // Only show if action applies to ALL selected items (using effective state)
        return effectiveItems.every((item) => action.appliesTo!(item));
      } else {
        // Show if action applies to ANY selected items (using effective state)
        return effectiveItems.some((item) => action.appliesTo!(item));
      }
    }

    return true;
  });

  // Filter global actions
  const availableGlobalActions = globalActions.filter(
    (action) => !action.hidden?.(),
  );

  return (
    <Toolbar
      sx={{
        px: { sm: 2 },
        py: 1,
        backgroundColor:
          theme.palette.mode === "light" ? "#fff7" : "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      {/* Left Section - Bulk Actions & Selection Info */}
      <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
        {hasSelection ? (
          <>
            {/* Selection Info */}
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              <Chip
                label={`${selectedItems.length} of ${totalItems} selected`}
                variant="outlined"
                size="small"
                onDelete={onClearSelection}
                sx={{ mr: 1 }}
              />
            </Box>

            {/* Divider */}
            {availableBulkActions.length > 0 && (
              <Divider orientation="vertical" flexItem sx={{ mr: 2 }} />
            )}

            {/* Bulk Actions */}
            <Box sx={{ display: "flex", gap: 1 }}>
              {availableBulkActions.map((action) => (
                <Button
                  key={action.key}
                  variant="outlined"
                  size="small"
                  color={action.color}
                  startIcon={action.icon ? <action.icon /> : undefined}
                  onClick={() => {
                    try {
                      action.onClick?.(selectedItems);
                      // Don't automatically clear selections - let users manage their selections
                    } catch (error) {
                      console.error("Bulk action failed:", error);
                      // Don't clear selection on error so user can retry
                    }
                  }}
                  disabled={action.disabled?.(selectedItems)}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          </>
        ) : (
          <Typography variant="h6" component="div">
            {/* Could show table title or other info here */}
          </Typography>
        )}
      </Box>

      {/* Right Section - Global Actions */}
      <Box sx={{ display: "flex", gap: 1 }}>
        {availableGlobalActions.map((action) => (
          <Button
            key={action.key}
            variant="contained"
            color={action.color}
            startIcon={action.icon ? <action.icon /> : undefined}
            onClick={() => action.onClick?.()}
            disabled={action.disabled?.()}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    </Toolbar>
  );
}
