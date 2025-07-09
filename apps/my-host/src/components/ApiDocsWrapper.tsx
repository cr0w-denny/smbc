import { ApiDocsModal } from "@smbc/mui-applet-devtools";
// Import swagger-ui CSS statically in dev template
import "swagger-ui-react/swagger-ui.css";

interface ApiDocsWrapperProps {
  open: boolean;
  onClose: () => void;
  appletName: string;
  apiSpec: any;
  isDarkMode: boolean;
}

/**
 * Wrapper for ApiDocsModal using static imports.
 * In production templates, this component and its imports will be excluded.
 */
export function ApiDocsWrapper({
  open,
  onClose,
  appletName,
  apiSpec,
  isDarkMode,
}: ApiDocsWrapperProps) {
  // Don't render anything if not open
  if (!open) {
    return null;
  }

  // Render the statically imported component
  return (
    <ApiDocsModal
      open={open}
      onClose={onClose}
      appletName={appletName}
      apiSpec={apiSpec}
      isDarkMode={isDarkMode}
    />
  );
}