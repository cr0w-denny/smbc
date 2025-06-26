import React from 'react';
import {
  Paper,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useHashQueryParams } from '@smbc/mui-applet-core';

interface FilterData {
  search: string;
  email?: string;
  status?: 'active' | 'inactive';
  sortBy: 'name' | 'email' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

const defaultFilterState: FilterData = {
  search: '',
  email: undefined,
  status: undefined,
  sortBy: 'name',
  sortOrder: 'asc'
};

interface UserFilterBarProps {
  onFiltersChange: (filters: FilterData) => void;
  className?: string;
}

export function UserFilterBar({ onFiltersChange, className }: UserFilterBarProps) {
  const [formState, setFormState] = React.useState<FilterData>(defaultFilterState);
  const [appliedState, setAppliedState] = useHashQueryParams<FilterData>(defaultFilterState);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Initialize form state from URL on mount
  React.useEffect(() => {
    setFormState(appliedState);
  }, []);

  // Sync applied filters with parent component
  React.useEffect(() => {
    onFiltersChange(appliedState);
  }, [appliedState, onFiltersChange]);

  // Apply filters and update URL
  const applyFilters = React.useCallback((newFilters: FilterData) => {
    setAppliedState(newFilters);
  }, [setAppliedState]);

  // Update search immediately (live filter)
  const handleSearchChange = (value: string) => {
    const newFormState = { ...formState, search: value };
    setFormState(newFormState);
    applyFilters(newFormState);
  };

  // Handle form submission for other filters
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    applyFilters(formState);
  };

  // Clear all filters
  const handleClear = () => {
    setFormState(defaultFilterState);
    applyFilters(defaultFilterState);
  };

  // Toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Get active filter count
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (appliedState.search) count++;
    if (appliedState.email) count++;
    if (appliedState.status) count++;
    return count;
  }, [appliedState.search, appliedState.email, appliedState.status]);
  
  return (
    <Paper className={className} elevation={1} sx={{ p: 2, mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        {/* Search and toggle */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' }, minWidth: 300 }}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={formState.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: formState.search && (
                  <IconButton
                    size="small"
                    onClick={() => handleSearchChange('')}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )
              }}
              variant="outlined"
              size="small"
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
              {activeFilterCount > 0 && (
                <Chip 
                  label={`${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              
              <Button
                onClick={toggleExpanded}
                startIcon={<FilterIcon />}
                endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                variant="outlined"
                size="small"
              >
                Filters
              </Button>
            </Box>
          </Box>
        </Box>
        
        {/* Advanced filters */}       
        <Collapse in={isExpanded}>
          <Box mt={2}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px' }}>
                <TextField
                  size="small"
                  fullWidth
                  label="Email Filter"
                  value={formState.email || ''}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value || undefined })}
                  placeholder="Filter by email..."
                />
              </Box>
              
              <Box sx={{ flex: '1 1 200px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formState.status || ''}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as 'active' | 'inactive' || undefined })}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '1 1 200px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={formState.sortBy || 'name'}
                    onChange={(e) => setFormState({ ...formState, sortBy: e.target.value as 'name' | 'email' | 'createdAt' })}
                    label="Sort By"
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="createdAt">Created Date</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            {/* Action buttons */}
            <Box mt={2} display="flex" gap={1}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<FilterIcon />}
                size="small"
              >
                Apply
              </Button>
              
              <Button
                onClick={handleClear}
                variant="outlined"
                startIcon={<ClearIcon />}
                size="small"
              >
                Clear
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
}
