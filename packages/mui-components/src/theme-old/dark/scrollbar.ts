import { tokens } from "@smbc/ui-core";
import { token } from "../../utils/tokens";

/**
 * Creates scrollbar styles with the given selector prefix
 * @param selector - The selector prefix to use (e.g., '&' for styled components, '' for global)
 */
export const getScrollbarStyles = (isDark: boolean, selector = '&') => ({
  // Firefox
  scrollbarWidth: 'thin' as const,
  scrollbarColor: `${token(isDark, (tokens as any).ui.scrollbarThumb.base.default.background)} ${token(isDark, (tokens as any).ui.scrollbarTrack.base.default.background)}`,

  // Webkit browsers (Chrome, Safari, Edge)
  [`${selector}::-webkit-scrollbar`]: {
    width: '12px',
    height: '12px',
  },
  [`${selector}::-webkit-scrollbar-track`]: {
    background: token(isDark, (tokens as any).ui.scrollbarTrack.base.default.background),
    borderRadius: '6px',
  },
  [`${selector}::-webkit-scrollbar-thumb`]: {
    background: token(isDark, (tokens as any).ui.scrollbarThumb.base.default.background),
    borderRadius: '6px',
    border: `2px solid ${token(isDark, (tokens as any).ui.scrollbarTrack.base.default.background)}`,
  },
  [`${selector}::-webkit-scrollbar-thumb:hover`]: {
    background: token(isDark, (tokens as any).ui.scrollbarThumb.base.hover.background),
  },
  [`${selector}::-webkit-scrollbar-thumb:active`]: {
    background: token(isDark, (tokens as any).ui.scrollbarThumb.base.active.background),
  },
  [`${selector}::-webkit-scrollbar-corner`]: {
    background: token(isDark, (tokens as any).ui.scrollbarTrack.base.default.background),
  },
});

// Convenience exports for common use cases
export const darkScrollbarStyles = getScrollbarStyles(true, '&');
export const lightScrollbarStyles = getScrollbarStyles(false, '&');

