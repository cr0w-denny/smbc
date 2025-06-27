import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import {
  Filter,
  type FilterSpec,
  type FilterValues,
} from "@smbc/mui-components";
import { useHashQueryParams } from "@smbc/applet-core";
import { apiClient, type components } from "@smbc/user-management-client";
import { USER_MANAGEMENT_PERMISSIONS } from "../permissions";
import { usePermissions } from "@smbc/applet-core";

type User = components["schemas"]["User"];

interface FilterData {
  search: string;
  email?: string;
  status?: "active" | "inactive";
  sortBy: "name" | "email" | "createdAt";
  sortOrder: "asc" | "desc";
}

const defaultFilterState: FilterData = {
  search: "",
  email: undefined,
  status: undefined,
  sortBy: "name",
  sortOrder: "asc",
};

// Filter configuration using the existing Filter component
const userFilterSpec: FilterSpec = {
  fields: [
    {
      name: "search",
      type: "search",
      label: "Search users...",
      placeholder: "Search users...",
      fullWidth: true,
    },
    {
      name: "email",
      type: "text",
      label: "Email Filter",
      placeholder: "Filter by email...",
    },
    {
      name: "status",
      type: "select",
      label: "Status",
      options: [
        { label: "All Statuses", value: "" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      name: "sortBy",
      type: "select",
      label: "Sort By",
      options: [
        { label: "Name", value: "name" },
        { label: "Email", value: "email" },
        { label: "Created Date", value: "createdAt" },
      ],
      defaultValue: "name",
    },
    {
      name: "sortOrder",
      type: "select",
      label: "Sort Order",
      options: [
        { label: "Ascending", value: "asc" },
        { label: "Descending", value: "desc" },
      ],
      defaultValue: "asc",
    },
  ],
  initialValues: defaultFilterState,
  title: "User Filters",
  collapsible: true,
  defaultCollapsed: false,
  showClearButton: true,
  showFilterCount: true,
  debounceMs: 300,
};

export interface UserTableProps {
  /** Type of users to display */
  userType?: "all" | "admins" | "non-admins";
  /** Permission context for role-based access control */
  permissionContext?: string;
}

export function UserTable({
  userType = "all",
  permissionContext = "user-management",
}: UserTableProps) {
  // Filter state managed via URL params
  const [filters, setFilters] = useHashQueryParams(defaultFilterState);

  // Component state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editUserStatus, setEditUserStatus] = useState<boolean>(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Permission-based access control
  const { hasPermission } = usePermissions();

  // API queries and mutations
  const {
    data: usersData,
    isLoading,
    error,
  } = apiClient.useQuery("get", "/users", {
    params: {
      query: {
        page: page + 1,
        pageSize,
        ...(filters.search && { search: filters.search }),
        ...(userType === "admins" && { isAdmin: "true" }),
        ...(userType === "non-admins" && { isAdmin: "false" }),
      },
    },
  });

  const createUserMutation = apiClient.useMutation("post", "/users");
  const updateUserMutation = apiClient.useMutation("patch", "/users/{id}");
  const deleteUserMutation = apiClient.useMutation("delete", "/users/{id}");

  // Permission checks
  const canCreateUsers = hasPermission(
    permissionContext,
    USER_MANAGEMENT_PERMISSIONS.CREATE_USERS,
  );
  const canEditUsers = hasPermission(
    permissionContext,
    USER_MANAGEMENT_PERMISSIONS.EDIT_USERS,
  );
  const canDeleteUsers = hasPermission(
    permissionContext,
    USER_MANAGEMENT_PERMISSIONS.DELETE_USERS,
  );

  // Apply client-side filtering and sorting
  const filteredUsers = React.useMemo(() => {
    let users: User[] = usersData?.users || [];

    // Apply email filter
    if (filters.email) {
      users = users.filter((user) =>
        user.email.toLowerCase().includes(filters.email!.toLowerCase()),
      );
    }

    // Apply status filter
    if (filters.status) {
      users = users.filter((user) => {
        if (filters.status === "active") return user.isActive;
        if (filters.status === "inactive") return !user.isActive;
        return true;
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      users = [...users].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filters.sortBy) {
          case "name":
            aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
            bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
            break;
          case "email":
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
          case "createdAt":
            aValue = new Date(a.createdAt || 0);
            bValue = new Date(b.createdAt || 0);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return filters.sortOrder === "desc" ? 1 : -1;
        if (aValue > bValue) return filters.sortOrder === "desc" ? -1 : 1;
        return 0;
      });
    }

    return users;
  }, [
    usersData?.users,
    filters.email,
    filters.status,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const users = filteredUsers;
  const totalCount = usersData?.total || 0;

  // Calculate dynamic column count for loading/empty states
  const hasActionColumn = canEditUsers || canDeleteUsers;
  const columnCount = hasActionColumn ? 6 : 5;

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterValues) => {
    const filterData: FilterData = {
      search: newFilters.search || "",
      email: newFilters.email || undefined,
      status: newFilters.status as "active" | "inactive" | undefined,
      sortBy: newFilters.sortBy || "name",
      sortOrder: newFilters.sortOrder || "asc",
    };
    setFilters(filterData);
  };

  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle actions
  const handleEdit = (user: User) => {
    setUserToEdit(user);
    setEditUserStatus(user.isActive);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUserMutation.mutate({
        params: { path: { id: userToDelete } },
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCreate = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    createUserMutation.mutate({
      body: {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
      },
    });

    setCreateDialogOpen(false);
  };

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userToEdit) return;

    const formData = new FormData(event.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    updateUserMutation.mutate({
      params: { path: { id: userToEdit.id } },
      body: { firstName, lastName, isActive: editUserStatus },
    });

    setEditDialogOpen(false);
    setUserToEdit(null);
  };

  if (error) {
    return (
      <Alert severity="error">Failed to load users: {error.message}</Alert>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Filter
        spec={userFilterSpec}
        values={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Action Bar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" gap={2} alignItems="center">
          {canCreateUsers && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
              disabled={isLoading || createUserMutation.isPending}
            >
              Add User
            </Button>
          )}
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Is Admin</TableCell>
              {hasActionColumn && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columnCount} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? "Active" : "Inactive"}
                      color={user.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isAdmin ? "Yes" : "No"}
                      color={user.isAdmin ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  {hasActionColumn && (
                    <TableCell align="right">
                      {canEditUsers && (
                        <IconButton
                          onClick={() => handleEdit(user)}
                          disabled={isLoading || updateUserMutation.isPending}
                          size="small"
                          title="Edit User"
                        >
                          <Edit />
                        </IconButton>
                      )}
                      {canDeleteUsers && (
                        <IconButton
                          onClick={() => handleDeleteClick(user.id)}
                          disabled={isLoading || deleteUserMutation.isPending}
                          size="small"
                          color="error"
                          title="Delete User"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Create User Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      >
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle>Create New User</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="firstName"
              label="First Name"
              fullWidth
              variant="outlined"
              required
            />
            <TextField
              margin="dense"
              name="lastName"
              label="Last Name"
              fullWidth
              variant="outlined"
              required
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleEditSubmit}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="firstName"
              label="First Name"
              fullWidth
              variant="outlined"
              required
              defaultValue={userToEdit?.firstName || ""}
            />
            <TextField
              margin="dense"
              name="lastName"
              label="Last Name"
              fullWidth
              variant="outlined"
              required
              defaultValue={userToEdit?.lastName || ""}
            />
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              variant="outlined"
              disabled
              value={userToEdit?.email || ""}
              helperText="Email cannot be changed"
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Status
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  type="button"
                  variant={editUserStatus ? "contained" : "outlined"}
                  color="success"
                  size="small"
                  onClick={() => setEditUserStatus(true)}
                >
                  Active
                </Button>
                <Button
                  type="button"
                  variant={!editUserStatus ? "contained" : "outlined"}
                  color="error"
                  size="small"
                  onClick={() => setEditUserStatus(false)}
                >
                  Inactive
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
