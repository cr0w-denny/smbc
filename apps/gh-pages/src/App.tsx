import React from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  GridLegacy as Grid,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Warning as WarningIcon,
  Book as BookIcon,
} from "@mui/icons-material";
import { darkTheme, Logo } from "@smbc/mui-components";

interface AppLink {
  name: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "success" | "info" | "warning" | "error";
}

const apps: AppLink[] = [
  {
    name: "MUI Host Dev",
    description: "Development host application with component showcase",
    path: "./mui-host-dev/",
    icon: <DashboardIcon />,
    color: "primary",
  },
  {
    name: "EWI (Early Warning Indicators)",
    description: "Early Warning Indicators application for risk management",
    path: "./ewi/",
    icon: <WarningIcon />,
    color: "warning",
  },
  {
    name: "Storybook",
    description: "Component library documentation and playground",
    path: "./storybook/",
    icon: <BookIcon />,
    color: "info",
  },
];

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Logo height={80} style={{ maxWidth: "100%" }} />
          </Box>
        </Box>

        <Grid container spacing={3}>
          {apps.map((app) => (
            <Grid item xs={12} md={4} key={app.name}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition:
                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: (theme) => theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box sx={{ color: "#BED630", mr: 1 }}>{app.icon}</Box>
                    <Typography variant="h6" component="h2">
                      {app.name}
                    </Typography>
                  </Box>

                  <Typography color="text.secondary" paragraph>
                    {app.description}
                  </Typography>

                  <Button
                    variant="contained"
                    color={app.color}
                    fullWidth
                    href={app.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: "auto" }}
                  >
                    Open Application
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
