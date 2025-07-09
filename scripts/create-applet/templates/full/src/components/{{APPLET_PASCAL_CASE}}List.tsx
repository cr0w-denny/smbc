import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useHashNavigation, usePermissions } from '@smbc/mui-applet-core';
import { {{APPLET_UPPER_CASE}}_PERMISSIONS } from '../permissions';

// Mock data - replace with real data from your API
const mockData = [
  { id: 1, name: 'Sample Item 1', status: 'Active', createdAt: '2024-01-15' },
  { id: 2, name: 'Sample Item 2', status: 'Inactive', createdAt: '2024-01-14' },
  { id: 3, name: 'Sample Item 3', status: 'Active', createdAt: '2024-01-13' },
];

export interface {{APPLET_PASCAL_CASE}}ListProps {
  // Add your props here
}

export const {{APPLET_PASCAL_CASE}}List: React.FC<{{APPLET_PASCAL_CASE}}ListProps> = () => {
  const { navigateTo } = useHashNavigation();
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Permission-based access control - roles are not used for access decisions
  const canCreate = hasPermission('{{APPLET_NAME}}', {{APPLET_UPPER_CASE}}_PERMISSIONS.CREATE.id);
  const canEdit = hasPermission('{{APPLET_NAME}}', {{APPLET_UPPER_CASE}}_PERMISSIONS.EDIT.id);
  const canDelete = hasPermission('{{APPLET_NAME}}', {{APPLET_UPPER_CASE}}_PERMISSIONS.DELETE.id);
  
  // Filter data based on search term
  const filteredData = mockData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    // TODO: Implement create functionality

  };

  const handleEdit = (id: number) => {
    // TODO: Implement edit functionality

  };

  const handleDelete = (id: number) => {
    // TODO: Implement delete functionality

  };

  const handleView = (id: number) => {
    navigateTo(`/{{APPLET_NAME}}/detail?id=${id}`);
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'success' : 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            {{APPLET_DISPLAY_NAME}}
          </Typography>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Create New
            </Button>
          )}
        </Box>

        {/* Search */}
        <TextField
          placeholder="Search {{APPLET_NAME}}..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />

        {/* Data Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={item.status} 
                      color={getStatusColor(item.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{item.createdAt}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleView(item.id)}
                      title="View details"
                    >
                      <ViewIcon />
                    </IconButton>
                    {canEdit && (
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(item.id)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      No {{APPLET_NAME}} items found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Getting Started Info */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Getting Started
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This is your {{APPLET_DISPLAY_NAME}} list component. Next steps:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <Typography component="li" variant="body2">
                Replace mock data with real API calls
              </Typography>
              <Typography component="li" variant="body2">
                Implement create, edit, and delete functionality
              </Typography>
              <Typography component="li" variant="body2">
                Add filtering, sorting, and pagination
              </Typography>
              <Typography component="li" variant="body2">
                Configure permissions (access control is already permission-based)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};