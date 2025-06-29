import {
  Box,
  Button,
  Toolbar,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import { BulkAction, GlobalAction } from "@smbc/react-dataview";

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
}: ActionBarProps<T>) {
  const hasSelection = selectedItems.length > 0;

  // Filter bulk actions based on selection and applicability
  const availableBulkActions = bulkActions.filter((action) => {
    if (action.hidden?.(selectedItems)) return false;
    
    if (action.appliesTo) {
      if (action.requiresAllRows) {
        // Only show if action applies to ALL selected items
        return selectedItems.every((item) => action.appliesTo!(item));
      } else {
        // Show if action applies to ANY selected items
        return selectedItems.some((item) => action.appliesTo!(item));
      }
    }
    
    return true;
  });

  // Filter global actions
  const availableGlobalActions = globalActions.filter(
    (action) => !action.hidden?.()
  );

  return (
    <Toolbar
      sx={{
        px: { sm: 2 },
        py: 1,
        backgroundColor: hasSelection ? "action.selected" : "background.paper",
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
                  onClick={() => action.onClick?.(selectedItems)}
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