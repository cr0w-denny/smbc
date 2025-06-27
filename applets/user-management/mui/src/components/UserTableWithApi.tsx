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
import { Edit, Delete, Add, Search } from "@mui/icons-material";
import { apiClient, type components } from "@smbc/user-management-client";
import { USER_MANAGEMENT_PERMISSIONS } from "../permissions";
import { usePermissions } from "@smbc/applet-core";

type User = components["schemas"]["User"];

export interface UserTableWithApiProps {
  /** Whether to show the create button */
  showCreate?: boolean;
  /** Whether to show edit/delete actions */
  showActions?: boolean;
  /** Whether to show search */
  showSearch?: boolean;
  /** Whether to show pagination */
  showPagination?: boolean;
  /** Initial page size */
  initialPageSize?: number;
  /** Custom handlers - if provided, will override default API calls */
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  onCreate?: () => void;
  /** Filter parameters for external filtering */
  searchQuery?: string;
  emailFilter?: string;
  statusFilter?: "active" | "inactive" | "pending";
  departmentFilter?: string;
  userType?: "all" | "admins" | "non-admins";
  /** Permission context for role-based access control */
  permissionContext?: string;
  sortBy?: "name" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export function UserTableWithApi({
  showCreate = true,
  showActions = true,
  showSearch = true,
  showPagination = true,
  initialPageSize = 10,
  onEdit,
  onDelete,
  onCreate,
  searchQuery,
  emailFilter,
  statusFilter,
  departmentFilter,
  userType = "all",
  permissionContext = "user-management",
  sortBy: externalSortBy,
  sortOrder: externalSortOrder,
}: UserTableWithApiProps) {
  // Permission-based access control - roles are not used for access decisions
  const { hasPermission } = usePermissions();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [internalSearch, setInternalSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editUserStatus, setEditUserStatus] = useState<boolean>(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Use external search query if provided, otherwise use internal search
  const effectiveSearch =
    searchQuery !== undefined ? searchQuery : internalSearch;

  // API config is handled by the host app
  // API queries and mutations using openapi-react-query
  const {
    data: usersData,
    isLoading,
    error,
  } = apiClient.useQuery("get", "/users", {
    params: {
      query: {
        page: page + 1,
        pageSize,
        ...(effectiveSearch && { search: effectiveSearch }),
        ...(userType === "admins" && { isAdmin: "true" }),
        ...(userType === "non-admins" && { isAdmin: "false" }),
      },
    },
  });

  const createUserMutation = apiClient.useMutation("post", "/users");
  const updateUserMutation = apiClient.useMutation("patch", "/users/{id}");
  const deleteUserMutation = apiClient.useMutation("delete", "/users/{id}");

  // Permission checks for dynamic UI - applet only cares about permissions, not roles
  const canCreateUsers = hasPermission(
    permissionContext,
    USER_MANAGEMENT_PERMISSIONS.CREATE_USERS.id,
  );
  const canEditUsers = hasPermission(
    permissionContext,
    USER_MANAGEMENT_PERMISSIONS.EDIT_USERS.id,
  );
  const canDeleteUsers = hasPermission(
    permissionContext,
    USER_MANAGEMENT_PERMISSIONS.DELETE_USERS.id,
  );

  // Apply client-side filtering for unsupported API filters
  const filteredUsers = React.useMemo(() => {
    let users: User[] = usersData?.users || [];

    // Apply email filter
    if (emailFilter) {
      users = users.filter((user) =>
        user.email.toLowerCase().includes(emailFilter.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter) {
      users = users.filter((user) => {
        if (statusFilter === "active") return user.isActive;
        if (statusFilter === "inactive") return !user.isActive;
        // For 'pending', we could check a field if it existed
        return true;
      });
    }

    // Apply department filter (Note: User type doesn't have department field)
    if (departmentFilter) {
      // For demo, we'll filter based on lastName as a proxy for department
      users = users.filter((user) =>
        user.lastName.toLowerCase().includes(departmentFilter.toLowerCase()),
      );
    }

    // Apply sorting
    if (externalSortBy) {
      users = [...users].sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let aValue: any, bValue: any;

        switch (externalSortBy) {
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

        if (aValue < bValue) return externalSortOrder === "desc" ? 1 : -1;
        if (aValue > bValue) return externalSortOrder === "desc" ? -1 : 1;
        return 0;
      });
    }

    return users;
  }, [
    usersData?.users,
    emailFilter,
    statusFilter,
    departmentFilter,
    externalSortBy,
    externalSortOrder,
  ]);

  const users = filteredUsers;
  const totalCount = usersData?.total || 0;

  // Access control is purely permission-based
  // Roles are an implementation detail for permission assignment

  // Calculate dynamic column count for loading/empty states
  const hasActionColumn = showActions && (canEditUsers || canDeleteUsers);
  const columnCount = hasActionColumn ? 5 : 4;

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
    if (onEdit) {
      onEdit(user);
    } else {
      // Default behavior: open edit dialog
      setUserToEdit(user);
      setEditUserStatus(user.isActive);
      setEditDialogOpen(true);
    }
  };

  const handleDeleteClick = (userId: string) => {
    if (onDelete) {
      onDelete(userId);
    } else {
      setUserToDelete(userId);
      setDeleteDialogOpen(true);
    }
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
    if (onCreate) {
      onCreate();
    } else {
      setCreateDialogOpen(true);
    }
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" gap={2} alignItems="center">
          {showSearch && (
            <TextField
              size="small"
              placeholder="Search users..."
              value={effectiveSearch}
              onChange={(e) => {
                if (searchQuery === undefined) {
                  setInternalSearch(e.target.value);
                }
              }}
              disabled={searchQuery !== undefined} // Disable if controlled externally
              InputProps={{
                startAdornment: (
                  <Search sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
            />
          )}
          {showCreate && canCreateUsers && (
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Is Admin</TableCell>
              {showActions && (canEditUsers || canDeleteUsers) && (
                <TableCell align="right">Actions</TableCell>
              )}
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
                  {showActions && (canEditUsers || canDeleteUsers) && (
                    <TableCell align="right">
                      {canEditUsers && (
                        <IconButton
                          onClick={() => handleEdit(user)}
                          disabled={isLoading || updateUserMutation.isPending}
                          size="small"
                          title={onEdit ? "Edit" : "Toggle Status"}
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

      {showPagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

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
