/**
 * Date utilities for filter components
 */

import { format, parse, isValid, startOfDay, endOfDay } from "date-fns";

export const DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
export const DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

/**
 * Parse a date string or Date object to a Date instance
 */
export function parseDate(
  value: string | Date | null | undefined,
  dateFormat: string = DEFAULT_DATE_FORMAT
): Date | null {
  if (!value) return null;
  
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  
  if (typeof value === "string") {
    const parsed = parse(value, dateFormat, new Date());
    return isValid(parsed) ? parsed : null;
  }
  
  return null;
}

/**
 * Format a Date object to a string
 */
export function formatDate(
  date: Date | null | undefined,
  dateFormat: string = DEFAULT_DATE_FORMAT
): string | null {
  if (!date || !isValid(date)) return null;
  
  try {
    return format(date, dateFormat);
  } catch {
    return null;
  }
}

/**
 * Validate a date value against min/max constraints
 */
export function validateDate(
  value: string | Date | null | undefined,
  options: {
    minDate?: Date | string;
    maxDate?: Date | string;
    required?: boolean;
    dateFormat?: string;
  } = {}
): string | null {
  const { minDate, maxDate, required = false, dateFormat = DEFAULT_DATE_FORMAT } = options;
  
  if (!value) {
    return required ? "Date is required" : null;
  }
  
  const date = parseDate(value, dateFormat);
  if (!date) {
    return "Invalid date format";
  }
  
  if (minDate) {
    const min = parseDate(minDate, dateFormat);
    if (min && date < min) {
      return `Date must be after ${formatDate(min, dateFormat)}`;
    }
  }
  
  if (maxDate) {
    const max = parseDate(maxDate, dateFormat);
    if (max && date > max) {
      return `Date must be before ${formatDate(max, dateFormat)}`;
    }
  }
  
  return null;
}

/**
 * Validate a date range value
 */
export function validateDateRange(
  value: { from?: string | Date | null; to?: string | Date | null } | null | undefined,
  options: {
    minDate?: Date | string;
    maxDate?: Date | string;
    required?: boolean;
    dateFormat?: string;
  } = {}
): string | null {
  const { minDate, maxDate, required = false, dateFormat = DEFAULT_DATE_FORMAT } = options;
  
  if (!value || (!value.from && !value.to)) {
    return required ? "Date range is required" : null;
  }
  
  const fromDate = parseDate(value.from, dateFormat);
  const toDate = parseDate(value.to, dateFormat);
  
  // Validate individual dates
  if (value.from) {
    const fromError = validateDate(value.from, { minDate, maxDate, dateFormat });
    if (fromError) return fromError;
  }
  
  if (value.to) {
    const toError = validateDate(value.to, { minDate, maxDate, dateFormat });
    if (toError) return toError;
  }
  
  // Validate range logic
  if (fromDate && toDate && fromDate > toDate) {
    return "Start date must be before end date";
  }
  
  return null;
}

/**
 * Get today's date at start of day
 */
export function getTodayStart(): Date {
  return startOfDay(new Date());
}

/**
 * Get today's date at end of day
 */
export function getTodayEnd(): Date {
  return endOfDay(new Date());
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  
  const parsed = parseDate(date);
  if (!parsed) return false;
  
  const today = new Date();
  return (
    parsed.getFullYear() === today.getFullYear() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getDate() === today.getDate()
  );
}

/**
 * Convert date range to API format (typically ISO strings or formatted strings)
 */
export function formatDateRangeForAPI(
  value: { from?: string | Date | null; to?: string | Date | null } | null | undefined,
  apiFormat: string = DEFAULT_DATE_FORMAT
): { from?: string; to?: string } | null {
  if (!value || (!value.from && !value.to)) return null;
  
  const result: { from?: string; to?: string } = {};
  
  if (value.from) {
    const formatted = formatDate(parseDate(value.from), apiFormat);
    if (formatted) result.from = formatted;
  }
  
  if (value.to) {
    const formatted = formatDate(parseDate(value.to), apiFormat);
    if (formatted) result.to = formatted;
  }
  
  return Object.keys(result).length > 0 ? result : null;
}