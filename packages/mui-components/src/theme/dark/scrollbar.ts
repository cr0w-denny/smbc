import { ui } from "@smbc/ui-core";
import { token } from "../../utils/tokens";

/**
 * Creates scrollbar styles with the given selector prefix
 * @param selector - The selector prefix to use (e.g., '&' for styled components, '' for global)
 */
export const getScrollbarStyles = (isDark: boolean, selector = '&') => ({
  // Firefox
  scrollbarWidth: 'thin' as const,
  scrollbarColor: `${token(isDark, ui.color.scrollbar.thumb)} ${token(isDark, ui.color.scrollbar.track)}`,

  // Webkit browsers (Chrome, Safari, Edge)
  [`${selector}::-webkit-scrollbar`]: {
    width: '12px',
    height: '12px',
  },
  [`${selector}::-webkit-scrollbar-track`]: {
    background: token(isDark, ui.color.scrollbar.track),
    borderRadius: '6px',
  },
  [`${selector}::-webkit-scrollbar-thumb`]: {
    background: token(isDark, ui.color.scrollbar.thumb),
    borderRadius: '6px',
    border: `2px solid ${token(isDark, ui.color.scrollbar.track)}`,
  },
  [`${selector}::-webkit-scrollbar-thumb:hover`]: {
    background: token(isDark, ui.color.scrollbar.thumbHover),
  },
  [`${selector}::-webkit-scrollbar-thumb:active`]: {
    background: token(isDark, ui.color.scrollbar.thumbActive),
  },
  [`${selector}::-webkit-scrollbar-corner`]: {
    background: token(isDark, ui.color.scrollbar.track),
  },
});

// Convenience exports for common use cases
export const darkScrollbarStyles = getScrollbarStyles(true, '&');
export const lightScrollbarStyles = getScrollbarStyles(false, '&');

