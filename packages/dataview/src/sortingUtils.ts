import type { SortState, SortDirection } from "./types";

/**
 * Toggle sort direction for a column
 * If the column is not currently sorted, set to ascending
 * If the column is currently sorted ascending, set to descending
 * If the column is currently sorted descending, clear sorting
 */
export function toggleSort(
  currentSort: SortState | null,
  columnKey: string,
): SortState | null {
  if (!currentSort || currentSort.column !== columnKey) {
    // Start with ascending sort for new column
    return { column: columnKey, direction: "asc" };
  }

  if (currentSort.direction === "asc") {
    // Switch to descending
    return { column: columnKey, direction: "desc" };
  }

  // Clear sorting (was descending)
  return null;
}

/**
 * Get the next sort direction for a column
 * Used for UI indicators (e.g., showing what will happen on next click)
 */
export function getNextSortDirection(
  currentSort: SortState | null,
  columnKey: string,
): SortDirection | null {
  if (!currentSort || currentSort.column !== columnKey) {
    return "asc";
  }

  if (currentSort.direction === "asc") {
    return "desc";
  }

  return null; // Will clear sorting
}

/**
 * Check if a column is currently sorted
 */
export function isColumnSorted(
  currentSort: SortState | null,
  columnKey: string,
): boolean {
  return currentSort?.column === columnKey;
}

/**
 * Get sort direction for a column (null if not sorted)
 */
export function getColumnSortDirection(
  currentSort: SortState | null,
  columnKey: string,
): SortDirection | null {
  return currentSort?.column === columnKey ? currentSort.direction : null;
}

/**
 * Create sort parameters for API calls
 */
export function createSortParams(sort: SortState | null): Record<string, any> {
  if (!sort) {
    return {};
  }

  return {
    sortBy: sort.column,
    sortDirection: sort.direction,
  };
}

/**
 * Parse sort parameters from URL/API response back to SortState
 */
export function parseSortParams(params: {
  sortBy?: string;
  sortDirection?: string;
}): SortState | null {
  if (!params.sortBy || !params.sortDirection) {
    return null;
  }

  if (params.sortDirection !== "asc" && params.sortDirection !== "desc") {
    return null;
  }

  return {
    column: params.sortBy,
    direction: params.sortDirection as SortDirection,
  };
}