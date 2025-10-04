import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Style object that supports both CSS properties and MUI sx syntax
 */
export type StyleProps = SxProps<Theme>;

/**
 * Comprehensive style specification for form inputs
 */
export interface InputStyleSpec {
  label?: {
    base?: StyleProps;
    hover?: StyleProps;
    focus?: StyleProps;
    disabled?: StyleProps;
  };

  icon?: {
    base?: StyleProps;
    hover?: StyleProps;
    focus?: StyleProps;
    disabled?: StyleProps;
  };

  border?: {
    base?: StyleProps;
    hover?: StyleProps;
    focus?: StyleProps;
    disabled?: StyleProps;
  };

  background?: {
    base?: StyleProps;
    hover?: StyleProps;
    focus?: StyleProps;
    disabled?: StyleProps;
  };

  text?: {
    base?: StyleProps;
    hover?: StyleProps;
    focus?: StyleProps;
    disabled?: StyleProps;
  };

  menu?: {
    border?: StyleProps;
    background?: StyleProps;
    text?: StyleProps;
    item?: {
      base?: StyleProps;
      hover?: StyleProps;
      selected?: StyleProps;
      focus?: StyleProps;
    };
  };
}
