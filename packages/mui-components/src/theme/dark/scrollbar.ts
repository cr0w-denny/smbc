import * as ui from "@smbc/ui-core";

/**
 * Creates scrollbar styles with the given selector prefix
 * @param selector - The selector prefix to use (e.g., '&' for styled components, '' for global)
 */
export const getScrollbarStyles = (isDark: boolean, selector = '&') => ({
  // Firefox
  scrollbarWidth: 'thin' as const,
  scrollbarColor: isDark
    ? `${ui.ScrollbarThumbDark} ${ui.ScrollbarTrackDark}`
    : `${ui.ScrollbarThumbLight} ${ui.ScrollbarTrackLight}`,

  // Webkit browsers (Chrome, Safari, Edge)
  [`${selector}::-webkit-scrollbar`]: {
    width: '12px',
    height: '12px',
  },
  [`${selector}::-webkit-scrollbar-track`]: {
    background: isDark ? ui.ScrollbarTrackDark : ui.ScrollbarTrackLight,
    borderRadius: '6px',
  },
  [`${selector}::-webkit-scrollbar-thumb`]: {
    background: isDark ? ui.ScrollbarThumbDark : ui.ScrollbarThumbLight,
    borderRadius: '6px',
    border: `2px solid ${isDark ? ui.ScrollbarTrackDark : ui.ScrollbarTrackLight}`,
  },
  [`${selector}::-webkit-scrollbar-thumb:hover`]: {
    background: isDark ? ui.ScrollbarThumbHoverDark : ui.ScrollbarThumbHoverLight,
  },
  [`${selector}::-webkit-scrollbar-thumb:active`]: {
    background: isDark ? ui.ScrollbarThumbActiveDark : ui.ScrollbarThumbActiveLight,
  },
  [`${selector}::-webkit-scrollbar-corner`]: {
    background: isDark ? ui.ScrollbarTrackDark : ui.ScrollbarTrackLight,
  },
});

// Convenience exports for common use cases
export const darkScrollbarStyles = getScrollbarStyles(true, '&');
export const lightScrollbarStyles = getScrollbarStyles(false, '&');

