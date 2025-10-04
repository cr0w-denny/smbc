import type { InputStyleSpec } from "../types";

/**
 * Base input styles - sensible defaults for all input types
 * These styles apply universally across TextField, Select, DatePicker, etc.
 */
export const base: Partial<InputStyleSpec> = {
  label: {
    base: {
      fontSize: "0.875rem",
      transition: "color 200ms cubic-bezier(0.0, 0, 0.2, 1)",
    },
  },

  icon: {
    base: {
      transition: "color 200ms cubic-bezier(0.0, 0, 0.2, 1)",
    },
  },

  border: {
    base: {
      borderRadius: "24px",
      borderWidth: "0px",
      borderStyle: "solid",
      transition: "border-color 200ms cubic-bezier(0.0, 0, 0.2, 1)",
    },
    focus: {
      borderWidth: "2px",
    },
  },

  background: {
    base: {
      transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1)",
    },
  },

  text: {
    base: {
      fontSize: "0.875rem",
      transition: "color 200ms cubic-bezier(0.0, 0, 0.2, 1)",
    },
  },

  menu: {
    border: {
      borderRadius: "8px",
      borderWidth: "1px",
      borderStyle: "solid",
    },
    background: {
      mt: 1,
      "--Paper-overlay": "none !important",
    },
    item: {
      base: {
        transition: "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        borderRadius: "4px",
        mx: 1,
        my: 0.25,
      },
    },
  },
};

/**
 * Light mode base styles for all inputs
 */
export const lightMode: Partial<InputStyleSpec> = {
  label: {
    base: { color: "#525252" },
    focus: { color: "#1976D2" },
    disabled: { color: "#a3a3a3" },
  },

  icon: {
    base: { color: "#1976D2" },
    focus: { color: "#1976D2" },
    disabled: { color: "#a3a3a3" },
  },

  border: {
    base: { borderColor: "#d4d4d4" },
    hover: { borderColor: "#a3a3a3" },
    focus: { borderColor: "#1976D2" },
    disabled: { borderColor: "#e5e5e5" },
  },

  background: {
    base: { backgroundColor: "#ffffff" },
    hover: { backgroundColor: "#fafafa" },
    focus: { backgroundColor: "#ffffff" },
    disabled: { backgroundColor: "#f5f5f5" },
  },

  text: {
    base: { color: "#171717" },
    hover: { color: "#171717" },
    focus: { color: "#171717" },
    disabled: { color: "#a3a3a3" },
  },

  menu: {
    border: {
      borderColor: "#d4d4d4",
    },
    background: {
      backgroundColor: "#ffffff",
    },
    item: {
      base: { color: "#1A1A1A" },
      hover: { backgroundColor: "#E8E6E6" },
      selected: { backgroundColor: "#d4d4d4" },
    },
  },
};

/**
 * Dark mode common styles - shared between DK and TDK
 */
export const darkCommon: Partial<InputStyleSpec> = {
  menu: {
    border: {
      borderColor: "#1F3359",
    },
    background: {
      backgroundColor: "#0A111B",
    },
    item: {
      base: { color: "#E6E7E8" },
      hover: { backgroundColor: "#524747" },
      selected: { backgroundColor: "#1F3359CC" },
    },
  },
};
