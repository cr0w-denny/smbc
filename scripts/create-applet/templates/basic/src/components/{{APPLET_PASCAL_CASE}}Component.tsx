import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export interface {{APPLET_PASCAL_CASE}}ComponentProps {
  // Add your props here
}

export const {{APPLET_PASCAL_CASE}}Component: React.FC<{{APPLET_PASCAL_CASE}}ComponentProps> = () => {
  const handleCreate = () => {
    // TODO: Implement create functionality

  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            {{APPLET_DISPLAY_NAME}}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Create New
          </Button>
        </Box>

        {/* Main Content */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Welcome to {{APPLET_DISPLAY_NAME}}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              This is your new SMBC applet. Start building your functionality here!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Next steps:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <Typography component="li" variant="body2">
                Add your business logic to this component
              </Typography>
              <Typography component="li" variant="body2">
                Create additional components as needed
              </Typography>
              <Typography component="li" variant="body2">
                Set up API integration if using an API package
              </Typography>
              <Typography component="li" variant="body2">
                Configure permissions for your use case
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};