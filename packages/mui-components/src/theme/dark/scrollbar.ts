import * as ui from "@smbc/ui-core";

/**
 * Dark theme scrollbar styles
 * Provides custom scrollbar styling for webkit browsers and Firefox
 */
export const darkScrollbarStyles = {
  // Webkit browsers (Chrome, Safari, Edge)
  '&::-webkit-scrollbar': {
    width: '12px',
    height: '12px',
  },
  '&::-webkit-scrollbar-track': {
    background: ui.ScrollbarTrackDark,
    borderRadius: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: ui.ScrollbarThumbDark,
    borderRadius: '6px',
    border: `2px solid ${ui.ScrollbarTrackDark}`,
    '&:hover': {
      background: ui.ScrollbarThumbHoverDark,
    },
    '&:active': {
      background: ui.ScrollbarThumbActiveDark,
    },
  },
  '&::-webkit-scrollbar-corner': {
    background: ui.ScrollbarTrackDark,
  },

  // Firefox
  scrollbarWidth: 'thin' as const,
  scrollbarColor: `${ui.ScrollbarThumbDark} ${ui.ScrollbarTrackDark}`,
};

export const lightScrollbarStyles = {
  // Webkit browsers (Chrome, Safari, Edge)
  '&::-webkit-scrollbar': {
    width: '12px',
    height: '12px',
  },
  '&::-webkit-scrollbar-track': {
    background: ui.ScrollbarTrackLight,
    borderRadius: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: ui.ScrollbarThumbLight,
    borderRadius: '6px',
    border: `2px solid ${ui.ScrollbarTrackLight}`,
    '&:hover': {
      background: ui.ScrollbarThumbHoverLight,
    },
    '&:active': {
      background: ui.ScrollbarThumbActiveLight,
    },
  },
  '&::-webkit-scrollbar-corner': {
    background: ui.ScrollbarTrackLight,
  },

  // Firefox
  scrollbarWidth: 'thin' as const,
  scrollbarColor: `${ui.ScrollbarThumbLight} ${ui.ScrollbarTrackLight}`,
};

