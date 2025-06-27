import { FC, useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { AppletNavigation } from '@smbc/mui-components';
import { FilterableUserTable } from './FilterableUserTable';
import { UserProfile } from './UserProfile';
import { People as PeopleIcon, Person as PersonIcon } from '@mui/icons-material';

export interface UserManagementAppletProps {
  mountPath: string;
  /** Type of users to display */
  userType?: 'all' | 'admins' | 'non-admins';
  /** Permission context for role-based access control */
  permissionContext?: string;
}

// Navigation configuration
const navigationRoutes = [
  {
    path: '/',
    label: 'User Management',
    icon: PeopleIcon,
  },
  {
    path: '/profile',
    label: 'User Profile', 
    icon: PersonIcon,
  },
];

// Simple hook for standalone navigation (no complex context dependencies)
function useStandaloneNavigation(mountPath: string) {
  const [currentRoute, setCurrentRoute] = useState(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#' + mountPath)) {
      return '/';
    }
    
    const subPath = hash.substring(('#' + mountPath).length);
    const queryIndex = subPath.indexOf('?');
    const path = queryIndex >= 0 ? subPath.slice(0, queryIndex) : subPath;
    return path || '/';
  });

  const navigate = useCallback((route: string) => {
    const newHash = '#' + mountPath + (route === '/' ? '' : route);
    window.location.hash = newHash;
  }, [mountPath]);

  // Listen for hash changes that affect this applet
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#' + mountPath)) {
        return;
      }
      
      const subPath = hash.substring(('#' + mountPath).length);
      const queryIndex = subPath.indexOf('?');
      const path = queryIndex >= 0 ? subPath.slice(0, queryIndex) : subPath;
      setCurrentRoute(path || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [mountPath]);

  return { currentRoute, navigate };
}

export const UserManagementApplet: FC<UserManagementAppletProps> = ({ 
  mountPath,
  userType = 'all', 
  permissionContext = "user-management" 
}) => {
  const { currentRoute, navigate } = useStandaloneNavigation(mountPath);
  
  // Simple route rendering
  const renderCurrentRoute = () => {
    switch (currentRoute) {
      case '/profile':
        return <UserProfile />;
      case '/':
      default:
        return <FilterableUserTable userType={userType} permissionContext={permissionContext} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <AppletNavigation
          currentPath={currentRoute}
          onNavigate={navigate}
          routes={navigationRoutes}
        />
      </Box>
      
      {/* Route content */}
      <Box sx={{ flex: 1 }}>
        {renderCurrentRoute()}
      </Box>
    </Box>
  );
};