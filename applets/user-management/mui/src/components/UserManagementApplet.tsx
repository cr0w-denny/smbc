import { FC } from 'react';
import { Box } from '@mui/material';
import { AppletNavigation } from '@smbc/mui-components';
import { useHashNavigation } from '@smbc/applet-core';
import { FilterableUserTable } from './FilterableUserTable';
import { UserProfile } from './UserProfile';

export interface UserManagementAppletProps {
  mountPath: string;
  /** Type of users to display */
  userType?: 'all' | 'admins' | 'non-admins';
  /** Permission context for role-based access control */
  permissionContext?: string;
}

// Navigation configuration - no icons needed for tabs mode
const navigationRoutes = [
  {
    path: '/',
    label: 'User Management',
  },
  {
    path: '/profile',
    label: 'User Profile',
  },
];

export const UserManagementApplet: FC<UserManagementAppletProps> = ({ 
  mountPath,
  userType = 'all', 
  permissionContext = "user-management" 
}) => {
  const { currentPath, navigateTo } = useHashNavigation(mountPath);
  
  // Simple route rendering
  const renderCurrentRoute = () => {
    switch (currentPath) {
      case '/profile':
        return <UserProfile />;
      case '/':
      default:
        return <FilterableUserTable userType={userType} permissionContext={permissionContext} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Navigation - using tabs mode */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <AppletNavigation
          currentPath={currentPath}
          onNavigate={navigateTo}
          routes={navigationRoutes}
          mode="tabs"
        />
      </Box>
      
      {/* Route content */}
      <Box sx={{ flex: 1 }}>
        {renderCurrentRoute()}
      </Box>
    </Box>
  );
};