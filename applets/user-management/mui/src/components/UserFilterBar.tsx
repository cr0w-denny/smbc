import React from "react";
import { Filter, type FilterSpec, type FilterValues } from "@smbc/mui-components";
import { useHashQueryParams } from "@smbc/applet-core";

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

interface UserFilterBarProps {
  onFiltersChange: (filters: FilterData) => void;
  className?: string;
}

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

export function UserFilterBar({
  onFiltersChange,
  className,
}: UserFilterBarProps) {
  const [urlFilters, setUrlFilters] =
    useHashQueryParams<FilterData>(defaultFilterState);

  // Sync URL filters with parent component
  React.useEffect(() => {
    onFiltersChange(urlFilters);
  }, [urlFilters, onFiltersChange]);

  const handleFiltersChange = (filters: FilterValues) => {
    // Clean and type the filter values
    const cleanedFilters: FilterData = {
      search: filters.search || "",
      email: filters.email || undefined,
      status: filters.status as "active" | "inactive" | undefined,
      sortBy: (filters.sortBy as "name" | "email" | "createdAt") || "name",
      sortOrder: (filters.sortOrder as "asc" | "desc") || "asc",
    };
    
    setUrlFilters(cleanedFilters);
  };

  return (
    <Filter
      spec={userFilterSpec}
      values={urlFilters}
      onFiltersChange={handleFiltersChange}
      sx={{ className }}
    />
  );
}
