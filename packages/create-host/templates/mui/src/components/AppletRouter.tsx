import { Box, Typography } from "@mui/material";
import { useHashNavigation, AppletMount } from "@smbc/applet-core";
import { APPLETS } from "../app.config";

export function AppletRouter() {
  const { currentPath } = useHashNavigation();

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        marginTop: "64px", // AppBar height
      }}
    >
      {/* Render current applet based on path */}
      {APPLETS.map((applet: AppletMount) => {
        const matchingRoute = applet.routes.find(route => 
          currentPath.startsWith(route.path)
        );
        
        if (matchingRoute) {
          const Component = matchingRoute.component;
          return <Component key={applet.id} />;
        }
        
        return null;
      })}
      
      {/* Default content when no applet matches */}
      {!APPLETS.some((applet: AppletMount) => 
        applet.routes.some(route => currentPath.startsWith(route.path))
      ) && (
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to SMBC Applet Host
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is a minimal production-ready host for SMBC applets.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
            Add your applets to the APPLETS array in app.config.ts to get started.
          </Typography>
        </Box>
      )}
    </Box>
  );
}