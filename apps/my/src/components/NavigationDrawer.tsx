import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
} from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";
import { useHashNavigation } from "@smbc/applet-core";
import { HOST, APPLETS } from "../app.config";

export function NavigationDrawer() {
  const { currentPath } = useHashNavigation();

  const handleNavigate = (path: string) => {
    window.location.hash = path;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: HOST.drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: HOST.drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              selected={currentPath === '' || currentPath === '/'}
              onClick={() => handleNavigate('/')}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <Divider />
          {APPLETS.map((applet) => (
            applet.routes.map((route) => {
              const Icon = route.icon;
              const isActive = currentPath.startsWith(route.path);
              
              return (
                <ListItem key={`${applet.id}-${route.path}`} disablePadding>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => handleNavigate(route.path)}
                  >
                    <ListItemIcon>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText primary={route.label} />
                  </ListItemButton>
                </ListItem>
              );
            })
          ))}
        </List>
      </Box>
    </Drawer>
  );
}