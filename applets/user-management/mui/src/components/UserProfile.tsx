import { FC } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Chip } from '@mui/material';

export const UserProfile: FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mr: 2 }}>
              JD
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                John Doe
              </Typography>
              <Typography variant="body1" color="text.secondary">
                john.doe@example.com
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Role
            </Typography>
            <Chip label="Administrator" color="primary" />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Department
            </Typography>
            <Typography variant="body1">
              Engineering
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="h6" gutterBottom>
              Last Login
            </Typography>
            <Typography variant="body1">
              2 hours ago
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};