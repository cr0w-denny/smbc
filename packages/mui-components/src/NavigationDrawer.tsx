import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Toolbar,
  Typography,
  Badge,
  Box,
  useTheme,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  ChevronRight,
  Home as HomeIcon,
} from '@mui/icons-material';
import { type NavigationItem } from '@smbc/mui-applet-core';
import { useNavigation, useRoleManagement } from '@smbc/mui-applet-core/host';

interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  width: number;
  variant?: 'permanent' | 'persistent' | 'temporary';
}

interface NavigationTreeItemProps {
  item: NavigationItem;
  level?: number;
  onNavigate?: (path: string) => void;
}

const NavigationTreeItem: React.FC<NavigationTreeItemProps> = ({
  item,
  level = 0,
  onNavigate,
}) => {
  const theme = useTheme();
  const { hasPermission } = useRoleManagement();
  const [expanded, setExpanded] = React.useState(false);

  // Get current path from URL hash for active state
  const currentPath = React.useMemo(() => {
    const hash = window.location.hash;
    if (!hash || hash === '#') return '/';
    const hashContent = hash.slice(1);
    const queryIndex = hashContent.indexOf('?');
    return queryIndex >= 0 ? hashContent.slice(0, queryIndex) : hashContent;
  }, []);

  // Check if user has required permissions
  if (item.requiredPermissions && item.appletId && 
      !item.requiredPermissions.some(permission => hasPermission(item.appletId!, permission))) {
    return null;
  }

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.path === currentPath;
  const isParentOfActive = item.children?.some(child => 
    child.path === currentPath || 
    child.children?.some(grandchild => grandchild.path === currentPath)
  );

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    } else if (item.path) {
      if (item.external) {
        window.open(item.path, '_blank', 'noopener,noreferrer');
      } else {
        onNavigate?.(item.path);
      }
    }
  };

  const IndentLevel = level * 16;

  return (
    <>
      {item.divider && <Divider sx={{ my: 1 }} />}
      
      <ListItem disablePadding>
        <ListItemButton
          onClick={handleClick}
          selected={isActive}
          sx={{
            pl: 2 + IndentLevel / 8,
            backgroundColor: isActive ? 'action.selected' : 'transparent',
            borderLeft: isActive || isParentOfActive ? `3px solid ${theme.palette.primary.main}` : 'none',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {item.icon ? (
              <item.icon />
            ) : hasChildren ? (
              expanded ? <ExpandLess /> : <ExpandMore />
            ) : (
              <ChevronRight />
            )}
          </ListItemIcon>
          
          <ListItemText 
            primary={item.label}
            primaryTypographyProps={{
              variant: level === 0 ? 'body1' : 'body2',
              fontWeight: isActive ? 'medium' : 'regular',
            }}
          />
          
          {item.badge && (
            <Badge
              badgeContent={item.badge}
              color="primary"
              sx={{ mr: 1 }}
            />
          )}
          
          {hasChildren && (
            <Box sx={{ ml: 1 }}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </Box>
          )}
        </ListItemButton>
      </ListItem>

      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children?.map((child) => (
              <NavigationTreeItem
                key={child.id}
                item={child}
                level={level + 1}
                onNavigate={onNavigate}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  open,
  onClose,
  width,
  variant = 'temporary',
}) => {
  const { navigation } = useNavigation();

  const handleNavigate = (path: string) => {
    // In a real app, this would use react-router or similar
    console.log('Navigate to:', path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Navigation
        </Typography>
      </Toolbar>
      
      <Divider />

      {/* Navigation List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {/* Default Home Item */}
          <NavigationTreeItem
            item={{
              id: 'home',
              label: 'Dashboard',
              icon: HomeIcon,
              path: '/',
            }}
            onNavigate={handleNavigate}
          />
          
          {navigation.length > 0 && <Divider sx={{ my: 1 }} />}
          
          {/* Dynamic Navigation Items */}
          {navigation.map((item: NavigationItem) => (
            <NavigationTreeItem
              key={item.id}
              item={item}
              onNavigate={handleNavigate}
            />
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
