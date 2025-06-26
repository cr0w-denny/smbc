// Import themes
import { lightTheme } from "./theme/light";
import { darkTheme } from "./theme/dark";
// Export individual themes
export { lightTheme } from "./theme/light";
export { darkTheme } from "./theme/dark";
// Export the light theme as the default smbcTheme for backward compatibility
export { lightTheme as smbcTheme } from "./theme/light";
// Utility function to get theme by mode
export const getTheme = (mode = "light") => {
    switch (mode) {
        case "dark":
            return darkTheme;
        case "light":
        default:
            return lightTheme;
    }
};
// Re-export from theme subdirectories for convenience
export * from "./theme/base";
export * from "./theme/light";
export * from "./theme/dark";
