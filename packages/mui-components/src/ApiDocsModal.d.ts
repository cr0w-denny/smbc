export interface ApiDocsModalProps {
    /** Controls whether the modal is open */
    open: boolean;
    /** Function called when the modal should be closed */
    onClose: () => void;
    /** Name of the applet/service for display */
    appletName: string;
    /** OpenAPI/Swagger specification object */
    apiSpec: any;
    /** Whether to apply dark mode styling to Swagger UI */
    isDarkMode?: boolean;
}
/**
 * A modal component for displaying API documentation using Swagger UI.
 *
 * Features:
 * - Full-screen responsive modal layout
 * - Dark mode support with custom styling
 * - Error handling for missing API specs
 * - Optimized Swagger UI configuration
 * - Debug logging for development
 */
export declare function ApiDocsModal({ open, onClose, appletName, apiSpec, isDarkMode, }: ApiDocsModalProps): import("react/jsx-runtime").JSX.Element;
