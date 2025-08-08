import React, { useState } from 'react';
import {
  Menu,
  ListItemText,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  Box,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { TreeNavigationItem } from '../types';

interface TreeDropdownMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  items: TreeNavigationItem[];
  menuId?: string; // Unique identifier for this menu instance
}

export const TreeDropdownMenu: React.FC<TreeDropdownMenuProps> = ({
  anchorEl,
  open,
  onClose,
  items,
  menuId = 'default',
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const scopedItemId = `${menuId}-${itemId}`;
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(scopedItemId)) {
      newExpanded.delete(scopedItemId);
    } else {
      newExpanded.add(scopedItemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderTreeItem = (item: TreeNavigationItem, level: number = 0): React.ReactNode => {
    const scopedItemId = `${menuId}-${item.id}`;
    const isExpanded = expandedItems.has(scopedItemId);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren && item.isCollapsible) {
      // Collapsible item with children
      return (
        <Box key={item.id}>
          <ListItemButton
            onClick={() => toggleExpanded(item.id)}
            sx={{ 
              pl: 2 + level * 2,
              py: 0.5,
              minHeight: 36,
            }}
          >
            {item.icon && (
              <ListItemIcon sx={{ minWidth: 32 }}>
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText 
              primary={item.label} 
              primaryTypographyProps={{ fontSize: '0.875rem' }}
            />
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map(child => renderTreeItem(child, level + 1))}
            </List>
          </Collapse>
        </Box>
      );
    } else {
      // Regular clickable item
      return (
        <ListItemButton
          key={item.id}
          onClick={() => {
            if (item.onClick) item.onClick();
            onClose();
          }}
          sx={{ 
            pl: 2 + level * 2,
            py: 0.5,
            minHeight: 36,
          }}
        >
          {item.icon && (
            <ListItemIcon sx={{ minWidth: 32 }}>
              {item.icon}
            </ListItemIcon>
          )}
          <ListItemText 
            primary={item.label}
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
        </ListItemButton>
      );
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxHeight: 400,
          minWidth: 200,
          '& .MuiList-root': {
            py: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: 'left', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
    >
      <List component="div" dense>
        {items.map(item => renderTreeItem(item))}
      </List>
    </Menu>
  );
};