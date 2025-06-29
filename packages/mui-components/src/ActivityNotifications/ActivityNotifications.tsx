import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useActivity } from '@smbc/react-dataview';
import type { ActivityItem } from '@smbc/react-dataview';

const ActivityTypeIcons = {
  create: AddIcon,
  update: EditIcon,
  delete: DeleteIcon,
} as const;

const ActivityTypeColors = {
  create: 'success' as const,
  update: 'primary' as const, 
  delete: 'error' as const,
} as const;

interface ActivityListItemProps {
  activity: ActivityItem;
  onView?: (url: string) => void;
}

function ActivityListItem({ activity, onView }: ActivityListItemProps) {
  const Icon = ActivityTypeIcons[activity.type as keyof typeof ActivityTypeIcons];
  const color = ActivityTypeColors[activity.type as keyof typeof ActivityTypeColors];
  
  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getActionText = (type: string) => {
    switch (type) {
      case 'create': return 'Created';
      case 'update': return 'Updated';
      case 'delete': return 'Deleted';
      default: return 'Modified';
    }
  };

  return (
    <ListItem>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
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
  /** Maximum height of the notifications dropdown */
  maxHeight?: number;
}

export function ActivityNotifications({ 
  onNavigate, 
  maxHeight = 400 
}: ActivityNotificationsProps) {
  const { activities, unviewedCount, markAsViewed, clearAll } = useActivity();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // Mark all activities as viewed when opened
    activities.forEach((activity: ActivityItem) => markAsViewed(activity.id));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleView = (url: string) => {
    onNavigate?.(url);
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="Activity notifications"
      >
        <Badge badgeContent={unviewedCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 360, maxHeight }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Recent Activity</Typography>
            {activities.length > 0 && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearAll}
                color="inherit"
              >
                Clear All
              </Button>
            )}
          </Box>
        </Box>

        {activities.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No recent activity
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: maxHeight - 80, overflow: 'auto', p: 0 }}>
            {activities.map((activity: ActivityItem, index: number) => (
              <React.Fragment key={activity.id}>
                <ActivityListItem
                  activity={activity}
                  onView={handleView}
                />
                {index < activities.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}