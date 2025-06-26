import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';

export interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    disabled?: boolean;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    disabled?: boolean;
  };
  /** Predefined empty state type */
  type?: 'search' | 'create' | 'error' | 'custom';
  /** Custom styles */
  sx?: any;
}

/**
 * A reusable empty state component for tables, lists, and search results
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  type = 'custom',
  sx = {},
}) => {
  // Default icons based on type
  const getDefaultIcon = () => {
    switch (type) {
      case 'search':
        return <SearchIcon sx={{ fontSize: 64, color: 'text.secondary' }} />;
      case 'create':
        return <AddIcon sx={{ fontSize: 64, color: 'text.secondary' }} />;
      case 'error':
        return <RefreshIcon sx={{ fontSize: 64, color: 'text.secondary' }} />;
      default:
        return null;
    }
  };

  const displayIcon = icon || getDefaultIcon();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        textAlign: 'center',
        py: 4,
        px: 2,
        ...sx,
      }}
    >
      {displayIcon && (
        <Box sx={{ mb: 2 }}>
          {displayIcon}
        </Box>
      )}
      
      <Typography variant="h6" component="h3" gutterBottom color="text.primary">
        {title}
      </Typography>
      
      {description && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ maxWidth: 400, mb: 3 }}
        >
          {description}
        </Typography>
      )}
      
      {(primaryAction || secondaryAction) && (
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || 'outlined'}
              color={secondaryAction.color || 'primary'}
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'contained'}
              color={primaryAction.color || 'primary'}
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
            >
              {primaryAction.label}
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
};
