import React from 'react';
/**
 * Represents current applet information for API documentation
 */
export interface CurrentAppletInfo {
    hostApplet: {
        label: string;
    };
    originalApplet: {
        apiSpec: {
            spec: any;
        };
    };
}
/**
 * Props for the HostAppBar component
 */
export interface HostAppBarProps {
    /** Current applet information for API docs button */
    currentAppletInfo?: CurrentAppletInfo | null;
    /** Whether dark mode is enabled */
    isDarkMode: boolean;
    /** Function to toggle dark mode */
    onDarkModeToggle: () => void;
    /** Whether mock data is enabled */
    mockEnabled: boolean;
    /** Function to toggle mock data */
    onMockToggle: (enabled: boolean) => void;
    /** Function to handle API docs opening */
    onApiDocsOpen?: () => void;
    /** Width of the drawer for calculating AppBar width */
    drawerWidth?: number;
    /** Additional content to render in the toolbar */
    children?: React.ReactNode;
    /** Custom styling for the AppBar */
    sx?: any;
}
/**
 * A reusable host application bar component that provides common navigation controls
 * including dark mode toggle, mock data toggle, and API documentation access.
 *
 * @example
 * ```tsx
 * <HostAppBar
 *   currentAppletInfo={currentAppletInfo}
 *   isDarkMode={isDarkMode}
 *   onDarkModeToggle={toggleDarkMode}
 *   mockEnabled={mockEnabled}
 *   onMockToggle={setMockEnabled}
 *   onApiDocsOpen={handleApiDocsOpen}
 *   drawerWidth={240}
 * />
 * ```
 */
export declare function HostAppBar({ currentAppletInfo, isDarkMode, onDarkModeToggle, mockEnabled, onMockToggle, onApiDocsOpen, drawerWidth, children, sx, }: HostAppBarProps): import("react/jsx-runtime").JSX.Element;
