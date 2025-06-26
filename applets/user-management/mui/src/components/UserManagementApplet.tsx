import { FC, useState, useEffect, useCallback } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { FilterableUserTable } from './FilterableUserTable';
import { UserProfile } from './UserProfile';

interface Route {
  path: string;
  label: string;
  component: FC<any>;
}

const routes: Route[] = [
  {
    path: '/',
    label: 'User Management',
    component: FilterableUserTable,
  },
  {
    path: '/profile',
    label: 'User Profile',
    component: UserProfile,
  },
];

export interface UserManagementAppletProps {
  mountPath: string;
  /** Type of users to display */
  userType?: 'all' | 'admins' | 'non-admins';
  /** Permission context for role-based access control */
  permissionContext?: string;
}

function useAppletNavigation(mountPath: string) {
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

  const navigateToRoute = useCallback((route: string) => {
    const newHash = '#' + mountPath + (route === '/' ? '' : route);
    window.location.hash = newHash;
  }, [mountPath]);

  // Listen for hash changes that affect this applet
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#' + mountPath)) {
        return; // This hash change doesn't affect this applet
      }
      
      const subPath = hash.substring(('#' + mountPath).length);
      const queryIndex = subPath.indexOf('?');
      const path = queryIndex >= 0 ? subPath.slice(0, queryIndex) : subPath;
      setCurrentRoute(path || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [mountPath]);

  return { currentRoute, navigateToRoute };
}

export const UserManagementApplet: FC<UserManagementAppletProps> = ({ mountPath, userType = 'all', permissionContext = "user-management" }) => {
  const { currentRoute, navigateToRoute } = useAppletNavigation(mountPath);
  
  const currentRouteConfig = routes.find(route => route.path === currentRoute) || routes[0];
  const CurrentComponent = currentRouteConfig.component;
  
  const currentIndex = routes.findIndex(route => route.path === currentRoute);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const selectedRoute = routes[newValue];
    if (selectedRoute) {
      navigateToRoute(selectedRoute.path);
    }
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={currentIndex === -1 ? 0 : currentIndex} 
          onChange={handleTabChange}
          aria-label="user management navigation"
        >
          {routes.map((route, index) => (
            <Tab 
              key={route.path} 
              label={route.label} 
              id={`user-mgmt-tab-${index}`}
              aria-controls={`user-mgmt-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>
      <CurrentComponent 
        {...(currentRouteConfig.component === FilterableUserTable && { userType, permissionContext })}
      />
    </Box>
  );
};