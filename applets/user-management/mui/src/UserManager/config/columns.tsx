import { Chip } from "@mui/material";
import type { components } from "@smbc/user-management-api/generated/types";

type User = components["schemas"]["User"];

/**
 * Extended user type with optional fields
 */
type UserWithOptionalFields = User & {
  fullName?: string;
  memberSince?: string;
};

/**
 * Creates column definitions for the UserManager component
 *
 * Defines how each user field should be displayed in the table,
 * including custom renderers for status chips and formatted dates.
 *
 * @returns Array of column configuration objects
 */
export const createColumnsConfig = () => [
  {
    key: "username",
    label: "Username",
    sortable: true,
  },
  {
    key: "firstName",
    label: "First Name",
    sortable: true,
  },
  {
    key: "lastName",
    label: "Last Name",
    sortable: true,
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
  },
  {
    key: "isActive",
    label: "Status",
    render: (user: User) => (
      <Chip
        label={user.isActive ? "Active" : "Inactive"}
        color={user.isActive ? "success" : "default"}
        size="small"
      />
    ),
  },
  {
    key: "createdAt",
    label: "Created",
    render: (user: User) => new Date(user.createdAt).toLocaleDateString(),
  },
  {
    key: "isAdmin",
    label: "Is Admin",
    render: (user: User) => (
      <Chip
        label={user.isAdmin ? "Yes" : "No"}
        color={user.isAdmin ? "primary" : "default"}
        size="small"
      />
    ),
  },
  // Additional columns for detailed view
  {
    key: "updatedAt",
    label: "Last Updated",
    render: (user: User) => new Date(user.updatedAt).toLocaleDateString(),
  },
  {
    key: "fullName",
    label: "Full Name",
    render: (user: UserWithOptionalFields) =>
      user.fullName ?? `${user.firstName} ${user.lastName}`,
  },
  {
    key: "memberSince",
    label: "Member Since",
    render: (user: UserWithOptionalFields) =>
      user.memberSince ??
      new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      }),
  },
];

/**
 * Filter state interface
 */
interface FilterState {
  format?: boolean;
  [key: string]: unknown;
}

/**
 * Determines which columns to show based on current filters
 *
 * @param columns - All available column definitions
 * @param filters - Current filter state including format preference
 * @returns Filtered array of columns to display
 */
export const getActiveColumns = (
  columns: ReturnType<typeof createColumnsConfig>,
  filters: FilterState,
) => {
  // Default columns (summary view)
  const defaultColumns = [
    "username",
    "firstName",
    "lastName",
    "email",
    "isActive",
    "createdAt",
    "isAdmin",
  ];

  // Additional columns for detailed view
  const detailedColumns = [
    "username",
    "firstName",
    "lastName",
    "email",
    "isActive",
    "createdAt",
    "isAdmin",
    "updatedAt",
    "fullName",
    "memberSince",
  ];

  // Show detailed columns when format filter is true (which gets transformed to "detailed")
  const showDetailed = filters.format === true;
  const activeColumnKeys = showDetailed ? detailedColumns : defaultColumns;

  return columns.filter((col) => activeColumnKeys.includes(col.key));
};
