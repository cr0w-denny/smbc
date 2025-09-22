import { useHashNavigationWithApply } from "@smbc/applet-core";
import { useMemo, useCallback } from "react";

// Define the filter types properly
interface EventsFilterParams {
  dateFrom: string;
  dateTo: string;
  status: string;
  workflow: string;
  types: string[];
  category: string;
  plo: string[];
  my: boolean;
}

// Default values
const DEFAULT_FILTERS: EventsFilterParams = {
  dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  dateTo: new Date().toISOString().split("T")[0],
  status: "",
  workflow: "",
  types: [],
  category: "",
  plo: [],
  my: false,
};

// URL serialization helpers
const serializeForUrl = (params: EventsFilterParams): Record<string, string> => {
  const urlParams: Record<string, string> = {};

  // Strings stay as strings
  if (params.dateFrom) urlParams.dateFrom = params.dateFrom;
  if (params.dateTo) urlParams.dateTo = params.dateTo;
  if (params.status) urlParams.status = params.status;
  if (params.workflow) urlParams.workflow = params.workflow;
  if (params.category) urlParams.category = params.category;

  // Arrays become CSV
  if (params.types?.length) urlParams.types = params.types.join(",");
  if (params.plo?.length) urlParams.plo = params.plo.join(",");

  // Boolean becomes string
  if (params.my) urlParams.my = "true";

  return urlParams;
};

const deserializeFromUrl = (urlParams: Record<string, any>): EventsFilterParams => {
  return {
    dateFrom: urlParams.dateFrom || DEFAULT_FILTERS.dateFrom,
    dateTo: urlParams.dateTo || DEFAULT_FILTERS.dateTo,
    status: urlParams.status || "",
    workflow: urlParams.workflow || "",
    category: urlParams.category || "",
    types: urlParams.types ? urlParams.types.split(",") : [],
    plo: urlParams.plo ? urlParams.plo.split(",") : [],
    my: urlParams.my === "true",
  };
};

/**
 * Clean hook for managing events filter state with URL sync
 */
export function useEventsFilters() {
  const {
    params: rawUrlParams,
    setParams: setRawParams,
    appliedParams: rawAppliedParams,
    applyParams,
    hasChanges,
    navigate,
  } = useHashNavigationWithApply({
    defaultParams: serializeForUrl(DEFAULT_FILTERS),
  });

  // Current filter values (for UI)
  const filterValues = useMemo(
    () => deserializeFromUrl(rawUrlParams),
    [rawUrlParams]
  );

  // Applied filter values (for data fetching)
  const appliedFilters = useMemo(
    () => deserializeFromUrl(rawAppliedParams),
    [rawAppliedParams]
  );

  // Update filters (local state)
  const setFilterValues = useCallback(
    (updates: Partial<EventsFilterParams>) => {
      const newFilters = { ...filterValues, ...updates };
      setRawParams(serializeForUrl(newFilters));
    },
    [filterValues, setRawParams]
  );

  // Apply filters (sync to URL)
  const applyFilters = useCallback(() => {
    applyParams();
  }, [applyParams]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setRawParams(serializeForUrl(DEFAULT_FILTERS));
    applyParams();
  }, [setRawParams, applyParams]);

  // Get server params for API calls
  const serverParams = useMemo(() => {
    const params: Record<string, any> = {};

    if (appliedFilters.dateFrom) params.start_date = appliedFilters.dateFrom;
    if (appliedFilters.dateTo) params.end_date = appliedFilters.dateTo;
    if (appliedFilters.status) params.status = appliedFilters.status;
    if (appliedFilters.types.length) params.types = appliedFilters.types.join(",");

    return params;
  }, [appliedFilters]);

  return {
    // Current filter values
    filterValues,
    setFilterValues,

    // Applied filters (in URL)
    appliedFilters,
    applyFilters,

    // Utilities
    hasChanges,
    resetFilters,
    navigate,
    serverParams,
  };
}