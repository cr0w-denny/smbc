import React, { useState } from "react";
import {
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemSecondaryAction,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useTheme,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
  Check as CommitIcon,
  Close as CancelIcon,
} from "@mui/icons-material";
import {
  useActivity,
  useTransactionContext,
  TransactionRegistry,
} from "@smbc/dataview";
import type { ActivityItem } from "@smbc/dataview";

const ActivityTypeIcons = {
  create: AddIcon,
  update: EditIcon,
  delete: DeleteIcon,
} as const;

const ActivityTypeColors = {
  create: "success" as const,
  update: "primary" as const,
  delete: "error" as const,
} as const;

interface ActivityListItemProps {
  activity: ActivityItem;
  onView?: (url: string) => void;
}

function ActivityListItem({ activity, onView }: ActivityListItemProps) {
  const Icon =
    ActivityTypeIcons[activity.type as keyof typeof ActivityTypeIcons];
  const color =
    ActivityTypeColors[activity.type as keyof typeof ActivityTypeColors];

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const getActionText = (type: string) => {
    switch (type) {
      case "create":
        return "Created";
      case "update":
        return "Updated";
      case "delete":
        return "Deleted";
      default:
        return "Modified";
    }
  };

  return (
    <ListItem>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
        <Chip
          icon={<Icon />}
          label={getActionText(activity.type)}
          color={color}
          size="small"
          variant="outlined"
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {activity.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {activity.entityType} • {formatTimeAgo(activity.timestamp)}
          </Typography>
        </Box>
      </Box>
      {activity.url && onView && (
        <ListItemSecondaryAction>
          <IconButton
            size="small"
            onClick={() => onView(activity.url!)}
            aria-label="View item"
          >
            <ViewIcon fontSize="small" />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
}

export interface ActivityNotificationsProps {
  /** Called when user clicks to view an item */
  onNavigate?: (url: string) => void;
  /** Whether to show transaction-related features. Defaults to false. */
  enableTransactions?: boolean;
}

export function ActivityNotifications({
  onNavigate,
  enableTransactions = false,
}: ActivityNotificationsProps) {
  const theme = useTheme();
  const { activities, unviewedCount, markAsViewed, clearAll } = useActivity();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [commitDialogOpen, setCommitDialogOpen] = useState(false);

  // Get transaction context (optional)
  let transactionContext = null;
  if (enableTransactions) {
    try {
      transactionContext = useTransactionContext();
    } catch {
      // TransactionProvider not found, transactions disabled
      transactionContext = null;
    }
  }

  // Get pending operations count from transaction context
  const pendingCount = transactionContext
    ? transactionContext.combinedSummary.total
    : 0;
  const totalBadgeCount = unviewedCount + pendingCount;


  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);

    // Auto-focus tab with items: pending changes first, then recent activity
    if (pendingCount > 0) {
      setActiveTab(1); // Pending changes tab
    } else if (unviewedCount > 0 || activities.length > 0) {
      setActiveTab(0); // Recent activity tab
      // Only mark activities as viewed if we're showing the recent activity tab
      activities.forEach((activity: ActivityItem) => markAsViewed(activity.id));
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Mark activities as viewed when user switches to Recent Activity tab
    if (newValue === 0) {
      activities.forEach((activity: ActivityItem) => markAsViewed(activity.id));
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleView = (url: string) => {
    onNavigate?.(url);
    handleClose();
  };

  const handleCommitClick = async () => {
    // Check if any transaction manager requires confirmation
    const managers = TransactionRegistry.getAllManagers();
    const requiresConfirmation = managers.some(manager => {
      const transaction = manager.getTransaction();
      return transaction?.config.requireConfirmation === true;
    });

    if (requiresConfirmation) {
      // Show confirmation dialog
      setCommitDialogOpen(true);
    } else {
      // Close popover immediately and commit directly without confirmation
      handleClose();
      await TransactionRegistry.commitAll();
    }
  };

  const handleCommitConfirm = async () => {
    setCommitDialogOpen(false);
    handleClose(); // Close the popover immediately
    await TransactionRegistry.commitAll();
  };

  const handleCommitCancel = () => {
    setCommitDialogOpen(false);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-label="Activity notifications"
        sx={{ color: theme.palette.mode === "dark" ? "#98A4B9" : "#D0D1D2" }}
      >
        <Badge badgeContent={totalBadgeCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            width: 420,
            maxHeight: "80vh", // Allow it to grow up to 80% of viewport height
            boxShadow:
              "0px 4px 16px rgba(0, 0, 0, 0.2), 0px 2px 8px rgba(0, 0, 0, 0.1)",
          },
          elevation: 16,
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ minHeight: 48 }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Recent Activity
                  {unviewedCount > 0 && (
                    <Chip size="small" label={unviewedCount} color="error" />
                  )}
                </Box>
              }
            />
            {transactionContext && (
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    Pending Changes
                    {pendingCount > 0 && (
                      <Chip size="small" label={pendingCount} color="primary" />
                    )}
                  </Box>
                }
              />
            )}
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <>
            {/* Recent Activity Tab */}
            {activities.length > 0 && (
              <Box
                sx={{
                  p: 2,
                  borderBottom: 1,
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={() => {
                    clearAll();
                    handleClose();
                  }}
                  color="inherit"
                >
                  Clear All
                </Button>
              </Box>
            )}

            {activities.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No recent activity
                </Typography>
              </Box>
            ) : (
              <List
                sx={{
                  maxHeight: "60vh", // Allow list to grow significantly
                  overflow: "auto",
                  p: 0,
                }}
              >
                {activities.map((activity: ActivityItem, index: number) => (
                  <React.Fragment key={activity.id}>
                    <ActivityListItem activity={activity} onView={handleView} />
                    {index < activities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </>
        )}

        {activeTab === 1 && transactionContext && (
          <>
            {/* Pending Changes Tab */}
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {pendingCount} pending operations
              </Typography>
              {pendingCount > 0 && (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={handleCommitClick}
                    color="primary"
                    title="Commit all changes"
                  >
                    <CommitIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      TransactionRegistry.cancelAll();
                      handleClose();
                    }}
                    color="inherit"
                    title="Cancel all changes"
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
              )}
            </Box>

            {pendingCount === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No pending changes
                </Typography>
              </Box>
            ) : (
              <List
                sx={{
                  maxHeight: "60vh", // Allow list to grow significantly
                  overflow: "auto",
                  p: 0,
                }}
              >
                {transactionContext
                  .getAllManagers()
                  .flatMap((manager) => manager.getOperations())
                  .map((operation: any, index: number) => (
                    <React.Fragment key={operation.id}>
                      <ListItem>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flex: 1,
                          }}
                        >
                          <Chip
                            icon={
                              operation.type === "create" ? (
                                <AddIcon />
                              ) : operation.type === "update" ? (
                                <EditIcon />
                              ) : (
                                <DeleteIcon />
                              )
                            }
                            label={operation.type}
                            color={
                              operation.type === "create"
                                ? "success"
                                : operation.type === "update"
                                  ? "primary"
                                  : "error"
                            }
                            size="small"
                            variant="outlined"
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {operation.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {operation.trigger.replace("-", " ")} •{" "}
                              {operation.timestamp.toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={() => {
                              // Find the manager that contains this operation and remove it
                              for (const manager of transactionContext.getAllManagers()) {
                                if (
                                  manager
                                    .getOperations()
                                    .some((op: any) => op.id === operation.id)
                                ) {
                                  manager.removeOperation(
                                    operation.id,
                                  );

                                  // Close popover if no more operations exist
                                  const totalOperations = transactionContext
                                    .getAllManagers()
                                    .reduce(
                                      (total, mgr) =>
                                        total + mgr.getOperations().length,
                                      0,
                                    );
                                  if (totalOperations === 0) {
                                    handleClose();
                                  }
                                  break;
                                }
                              }
                            }}
                            aria-label="Remove operation"
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index <
                        transactionContext
                          .getAllManagers()
                          .flatMap((manager) => manager.getOperations())
                          .length -
                          1 && <Divider />}
                    </React.Fragment>
                  ))}
              </List>
            )}
          </>
        )}
      </Popover>

      {/* Commit Confirmation Dialog */}
      <Dialog
        open={commitDialogOpen}
        onClose={handleCommitCancel}
        aria-labelledby="commit-dialog-title"
        aria-describedby="commit-dialog-description"
      >
        <DialogTitle id="commit-dialog-title">Confirm Commit</DialogTitle>
        <DialogContent>
          <DialogContentText id="commit-dialog-description">
            Are you sure you want to commit all {pendingCount} pending changes?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCommitCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCommitConfirm}
            color="primary"
            variant="contained"
          >
            Commit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
