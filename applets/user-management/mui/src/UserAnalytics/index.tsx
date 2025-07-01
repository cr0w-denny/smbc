import { Box, Grid, Paper, Typography, Card, CardContent } from "@mui/material";
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";

/**
 * UserAnalytics component - Dashboard view for user management metrics
 *
 * Displays key statistics and trends for user management
 */
export function UserAnalytics() {
  // In a real app, these would come from API calls
  const stats = {
    totalUsers: 1234,
    activeUsers: 987,
    newUsersThisMonth: 45,
    adminUsers: 12,
    growthRate: "+12%",
    activeRate: "80%",
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Total Users */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flex={1}
              >
                <Box>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalUsers.toLocaleString()}
                  </Typography>
                  <Box sx={{ height: "20px" }} />{" "}
                  {/* Spacer for uniform height */}
                </Box>
                <PeopleIcon
                  sx={{ fontSize: 40, color: "primary.main", opacity: 0.3 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Users */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flex={1}
              >
                <Box>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    Active Users
                  </Typography>
                  <Typography variant="h4">{stats.activeUsers}</Typography>
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{ height: "20px", display: "block" }}
                  >
                    {stats.activeRate} of total
                  </Typography>
                </Box>
                <TrendingUpIcon
                  sx={{ fontSize: 40, color: "success.main", opacity: 0.3 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* New Users */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flex={1}
              >
                <Box>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    New This Month
                  </Typography>
                  <Typography variant="h4">
                    {stats.newUsersThisMonth}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="info.main"
                    sx={{ height: "20px", display: "block" }}
                  >
                    {stats.growthRate} growth
                  </Typography>
                </Box>
                <PersonAddIcon
                  sx={{ fontSize: 40, color: "info.main", opacity: 0.3 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Admin Users */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flex={1}
              >
                <Box>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    Admin Users
                  </Typography>
                  <Typography variant="h4">{stats.adminUsers}</Typography>
                  <Box sx={{ height: "20px" }} />{" "}
                  {/* Spacer for uniform height */}
                </Box>
                <AdminIcon
                  sx={{ fontSize: 40, color: "warning.main", opacity: 0.3 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Typography color="textSecondary">
            Activity tracking and charts would go here...
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
