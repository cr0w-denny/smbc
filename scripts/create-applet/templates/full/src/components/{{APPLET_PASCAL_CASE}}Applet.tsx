import React from 'react';
import { Box, Typography } from '@mui/material';
import { useHashNavigation } from '@smbc/mui-applet-core';
import { {{APPLET_PASCAL_CASE}}List } from './{{APPLET_PASCAL_CASE}}List';
import { {{APPLET_PASCAL_CASE}}Detail } from './{{APPLET_PASCAL_CASE}}Detail';

export interface {{APPLET_PASCAL_CASE}}AppletProps {
  mountPath?: string;
}

export const {{APPLET_PASCAL_CASE}}Applet: React.FC<{{APPLET_PASCAL_CASE}}AppletProps> = ({ 
  mountPath = '/{{APPLET_NAME}}' 
}) => {
  const { currentPath } = useHashNavigation();
  
  // Simple routing based on path
  const getComponent = () => {
    // Remove the mount path to get the relative path
    const relativePath = currentPath.replace(mountPath, '') || '/';
    
    switch (relativePath) {
      case '/':
        return <{{APPLET_PASCAL_CASE}}List />;
      case '/detail':
        return <{{APPLET_PASCAL_CASE}}Detail />;
      default:
        // For any sub-paths under /detail, show detail view
        if (relativePath.startsWith('/detail')) {
          return <{{APPLET_PASCAL_CASE}}Detail />;
        }
        return <{{APPLET_PASCAL_CASE}}List />;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {getComponent()}
    </Box>
  );
};