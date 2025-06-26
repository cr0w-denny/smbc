import React from 'react';
import { Box } from '@mui/material';
import { UserFilterBar } from './UserFilterBar';
import { UserTableWithApi } from './UserTableWithApi';

interface FilterData {
  search: string;
  email?: string;
  status?: 'active' | 'inactive';
  sortBy: 'name' | 'email' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

interface FilterableUserTableProps {
  /** Type of users to display */
  userType?: 'all' | 'admins' | 'non-admins';
  /** Permission context for role-based access control */
  permissionContext?: string;
}

export function FilterableUserTable({ userType = 'all', permissionContext = "user-management" }: FilterableUserTableProps = {}) {
  const [filters, setFilters] = React.useState<FilterData>({
    search: '',
    email: undefined,
    status: undefined,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const handleFiltersChange = (newFilters: FilterData) => {
    setFilters(newFilters);
  };

  return (
    <Box>
      <UserFilterBar onFiltersChange={handleFiltersChange} />

      <UserTableWithApi
        showSearch={false}
        showCreate={true}
        showActions={true}
        showPagination={true}
        initialPageSize={10}
        searchQuery={filters.search}
        emailFilter={filters.email}
        statusFilter={filters.status}
        userType={userType}
        permissionContext={permissionContext}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
      />
    </Box>
  );
}
