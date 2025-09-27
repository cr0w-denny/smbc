import { createContext, useContext } from "react";

// Type definition for the dev context - matches what mui-ewi provides
interface DevContextType {
  debug: {
    log: (sessionId: string, component: string, event: string, data: any) => void;
  };
  createSessionId: (description: string) => string;
  DevToolsMenu: React.ComponentType<any>;
  roleSelection: {
    selectedRoleIds: string[];
    setSelectedRoleIds: (roles: string[]) => void;
    userRoles: Array<{ id: string; label: string; enabled: boolean }>;
    handleRoleToggle: (roleId: string, enabled: boolean) => void;
  };
  impersonation: {
    email: string;
    setEmail: (email: string) => void;
    isImpersonating: boolean;
  };
}

// Create a context with the same name as the one used by apps
// This allows DevConsole to access the context provided by the app
const DevContext = createContext<DevContextType | null>(null);

export const useDevTools = () => {
  const context = useContext(DevContext);
  if (!context) {
    // Return no-op functions for production or when context not available
    return {
      debug: { log: () => {} },
      createSessionId: () => "disabled",
      DevToolsMenu: () => null,
      roleSelection: {
        selectedRoleIds: ["User"],
        setSelectedRoleIds: () => {},
        userRoles: [],
        handleRoleToggle: () => {},
      },
      impersonation: {
        email: "",
        setEmail: () => {},
        isImpersonating: false,
      },
    };
  }
  return context;
};