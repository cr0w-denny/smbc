import type { ValueFormatterParams } from 'ag-grid-community';

/**
 * Formats a date value by extracting just the date part (YYYY-MM-DD)
 * from an ISO string. Returns placeholder if value is null/undefined.
 */
export function formatIsoDate(
  params: ValueFormatterParams,
  placeholder = '---'
): string {
  return params.value ? params.value.split('T')[0] : placeholder;
}

/**
 * Formats a date value using toLocaleDateString().
 * Returns placeholder if value is null/undefined.
 */
export function formatLocalDate(
  params: ValueFormatterParams,
  placeholder = '---',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!params.value) return placeholder;
  try {
    const date = new Date(params.value);
    return date.toLocaleDateString(undefined, options);
  } catch {
    return placeholder;
  }
}

/**
 * Formats a currency value with proper locale and currency symbol.
 */
export function formatCurrency(
  params: ValueFormatterParams,
  currency = 'USD',
  locale = 'en-US'
): string {
  if (params.value == null) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(params.value);
}

/**
 * Formats a number with thousand separators.
 */
export function formatNumber(
  params: ValueFormatterParams,
  locale = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  if (params.value == null) return '';
  return new Intl.NumberFormat(locale, options).format(params.value);
}
