import { describe, it, expect } from "vitest";
import {
  toggleSort,
  getNextSortDirection,
  isColumnSorted,
  getColumnSortDirection,
  createSortParams,
  parseSortParams,
} from "../sortingUtils";
import type { SortState } from "../types";

describe("sortingUtils", () => {
  describe("toggleSort", () => {
    it("should start with ascending sort for new column", () => {
      const result = toggleSort(null, "name");
      expect(result).toEqual({ column: "name", direction: "asc" });
    });

    it("should start with ascending sort when switching to different column", () => {
      const currentSort: SortState = { column: "email", direction: "asc" };
      const result = toggleSort(currentSort, "name");
      expect(result).toEqual({ column: "name", direction: "asc" });
    });

    it("should switch from ascending to descending for same column", () => {
      const currentSort: SortState = { column: "name", direction: "asc" };
      const result = toggleSort(currentSort, "name");
      expect(result).toEqual({ column: "name", direction: "desc" });
    });

    it("should clear sort when switching from descending", () => {
      const currentSort: SortState = { column: "name", direction: "desc" };
      const result = toggleSort(currentSort, "name");
      expect(result).toBeNull();
    });
  });

  describe("getNextSortDirection", () => {
    it("should return asc for new column", () => {
      const result = getNextSortDirection(null, "name");
      expect(result).toBe("asc");
    });

    it("should return asc when switching to different column", () => {
      const currentSort: SortState = { column: "email", direction: "desc" };
      const result = getNextSortDirection(currentSort, "name");
      expect(result).toBe("asc");
    });

    it("should return desc when column is currently asc", () => {
      const currentSort: SortState = { column: "name", direction: "asc" };
      const result = getNextSortDirection(currentSort, "name");
      expect(result).toBe("desc");
    });

    it("should return null when column is currently desc", () => {
      const currentSort: SortState = { column: "name", direction: "desc" };
      const result = getNextSortDirection(currentSort, "name");
      expect(result).toBeNull();
    });
  });

  describe("isColumnSorted", () => {
    it("should return false when no sort is active", () => {
      const result = isColumnSorted(null, "name");
      expect(result).toBe(false);
    });

    it("should return true when column is sorted", () => {
      const currentSort: SortState = { column: "name", direction: "asc" };
      const result = isColumnSorted(currentSort, "name");
      expect(result).toBe(true);
    });

    it("should return false when different column is sorted", () => {
      const currentSort: SortState = { column: "email", direction: "asc" };
      const result = isColumnSorted(currentSort, "name");
      expect(result).toBe(false);
    });
  });

  describe("getColumnSortDirection", () => {
    it("should return null when no sort is active", () => {
      const result = getColumnSortDirection(null, "name");
      expect(result).toBeNull();
    });

    it("should return direction when column is sorted", () => {
      const currentSort: SortState = { column: "name", direction: "desc" };
      const result = getColumnSortDirection(currentSort, "name");
      expect(result).toBe("desc");
    });

    it("should return null when different column is sorted", () => {
      const currentSort: SortState = { column: "email", direction: "asc" };
      const result = getColumnSortDirection(currentSort, "name");
      expect(result).toBeNull();
    });
  });

  describe("createSortParams", () => {
    it("should return empty object when no sort is active", () => {
      const result = createSortParams(null);
      expect(result).toEqual({});
    });

    it("should return sort parameters when sort is active", () => {
      const sort: SortState = { column: "name", direction: "asc" };
      const result = createSortParams(sort);
      expect(result).toEqual({
        sortBy: "name",
        sortDirection: "asc",
      });
    });

    it("should handle descending sort direction", () => {
      const sort: SortState = { column: "email", direction: "desc" };
      const result = createSortParams(sort);
      expect(result).toEqual({
        sortBy: "email",
        sortDirection: "desc",
      });
    });
  });

  describe("parseSortParams", () => {
    it("should return null when no sort parameters", () => {
      const result = parseSortParams({});
      expect(result).toBeNull();
    });

    it("should return null when missing sortBy", () => {
      const result = parseSortParams({ sortDirection: "asc" });
      expect(result).toBeNull();
    });

    it("should return null when missing sortDirection", () => {
      const result = parseSortParams({ sortBy: "name" });
      expect(result).toBeNull();
    });

    it("should return null when invalid sortDirection", () => {
      const result = parseSortParams({ 
        sortBy: "name", 
        sortDirection: "invalid" 
      });
      expect(result).toBeNull();
    });

    it("should parse valid ascending sort parameters", () => {
      const result = parseSortParams({
        sortBy: "name",
        sortDirection: "asc",
      });
      expect(result).toEqual({
        column: "name",
        direction: "asc",
      });
    });

    it("should parse valid descending sort parameters", () => {
      const result = parseSortParams({
        sortBy: "email",
        sortDirection: "desc",
      });
      expect(result).toEqual({
        column: "email",
        direction: "desc",
      });
    });
  });
});