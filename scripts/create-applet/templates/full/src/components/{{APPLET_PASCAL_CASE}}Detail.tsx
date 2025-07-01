import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useHashNavigation } from '@smbc/mui-applet-core';

// Mock data - replace with real data from your API
const mockDetailData = {
  id: 1,
  name: 'Sample Item 1',
  status: 'Active',
  createdAt: '2024-01-15',
  updatedAt: '2024-01-20',
  description: 'This is a detailed description of the {{APPLET_NAME}} item.',
  category: 'Category A',
  tags: ['tag1', 'tag2', 'tag3']
};

export interface {{APPLET_PASCAL_CASE}}DetailProps {
  // Add your props here
  id?: string;
}

export const {{APPLET_PASCAL_CASE}}Detail: React.FC<{{APPLET_PASCAL_CASE}}DetailProps> = ({ id }) => {
  const { navigateTo } = useHashNavigation();
  
  // In a real app, you would fetch data based on the ID
  const data = mockDetailData;

  const handleBack = () => {
    navigateTo('/{{APPLET_NAME}}');
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality

  };

  const handleDelete = () => {
    // TODO: Implement delete functionality

  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'success' : 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header with back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleBack} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            {data.name}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>

        {/* Main Details Card */}
        <Card>
          <CardContent>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip 
                  label={data.status} 
                  color={getStatusColor(data.status) as any}
                  size="small"
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  ID
                </Typography>
                <Typography variant="body1">
                  {data.id}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Category
                </Typography>
                <Typography variant="body1">
                  {data.category}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Created
                </Typography>
                <Typography variant="body1">
                  {data.createdAt}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {data.updatedAt}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {data.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>

              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1">
                  {data.description}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add more detailed information about this {{APPLET_NAME}} item here.
              This could include:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2">
                Related items or associations
              </Typography>
              <Typography component="li" variant="body2">
                Activity history or audit log
              </Typography>
              <Typography component="li" variant="body2">
                Files or attachments
              </Typography>
              <Typography component="li" variant="body2">
                Custom fields specific to your domain
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Development Info */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Development Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This detail view shows how to:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <Typography component="li" variant="body2">
                Navigate back to the list view
              </Typography>
              <Typography component="li" variant="body2">
                Display detailed information in a structured layout
              </Typography>
              <Typography component="li" variant="body2">
                Provide edit and delete actions
              </Typography>
              <Typography component="li" variant="body2">
                Use proper TypeScript types for your data
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};