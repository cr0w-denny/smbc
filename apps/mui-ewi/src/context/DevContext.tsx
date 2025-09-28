import React, { createContext, useContext } from "react";
import { useUser, usePersistedRoles } from "@smbc/applet-core";
import { HOST_ROLES } from "../applet.config";

interface DevContextType {
  debug: {
    log: (
      sessionId: string,
      component: string,
      event: string,
      data: any,
    ) => void;
  };
  createSessionId: (description: string) => string;
  DevConsoleToggle: React.ComponentType<any>;
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
  requestHeaders: Record<string, string>;
}

const DevContext = createContext<DevContextType | null>(null);

export const DevProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [devToolsImports, setDevToolsImports] = React.useState<any>(null);

  // Use the fixed usePersistedRoles hook - same as DevConsole
  const { user, setRoles, availableRoles } = useUser();
  const { selectedRoles, toggleRole } = usePersistedRoles({
    userRoles: user?.roles || ['Analyst'],
    availableRoles,
    storageKey: "dev-console-roles", // Same key as DevConsole for sync
    onRolesChange: setRoles,
  });

  // Convert to selectedRoleIds for compatibility
  const selectedRoleIds = selectedRoles;

  // Impersonation state (dev-time only)
  const [impersonateEmail, setImpersonateEmail] = React.useState<string>(() => {
    try {
      const saved = localStorage.getItem("dev-console-impersonate-email");
      return saved || "";
    } catch (error) {
      console.error("Failed to load impersonate email from localStorage:", error);
    }
    return "";
  });

  // Use HOST_ROLES for role selection
  const hostRoles = [...HOST_ROLES]; // Convert readonly array to mutable array

  // Convert HOST_ROLES to UserRole format (memoized to prevent render loops)
  const userRoles = React.useMemo(
    () =>
      hostRoles.map((role) => ({
        id: role,
        label: role,
        enabled: selectedRoleIds.includes(role),
      })),
    [hostRoles, selectedRoleIds],
  );

  const handleRoleToggle = React.useCallback(
    (roleId: string, enabled: boolean) => {
      console.log(`Role ${roleId} toggled to:`, enabled);
      toggleRole(roleId);
    },
    [toggleRole],
  );

  const handleImpersonateEmailChange = React.useCallback((email: string) => {
    setImpersonateEmail(email);
    localStorage.setItem("dev-console-impersonate-email", email);
    // Set global variable for API clients to use
    (window as any).__devImpersonateEmail = email || null;

    // Debug log the impersonation change
    if (devToolsImports?.debug) {
      devToolsImports.debug.log(
        devToolsImports.createSessionId('impersonation-change'),
        'DevContext',
        'impersonation-changed',
        {
          email,
          isImpersonating: Boolean(email)
        }
      );
    }
  }, [devToolsImports]);


  // Initialize global impersonate email
  React.useEffect(() => {
    (window as any).__devImpersonateEmail = impersonateEmail || null;
  }, [impersonateEmail]);


  // Listen for impersonation changes from DevConsole
  React.useEffect(() => {
    const handleImpersonationChange = (event: CustomEvent) => {
      const { email } = event.detail;
      if (email !== impersonateEmail) {
        setImpersonateEmail(email);
      }
    };

    window.addEventListener('impersonation-changed', handleImpersonationChange as EventListener);
    return () => window.removeEventListener('impersonation-changed', handleImpersonationChange as EventListener);
  }, [impersonateEmail]);

  // Memoize roleSelection object to prevent recreating on every render
  const roleSelection = React.useMemo(
    () => ({
      selectedRoleIds,
      userRoles,
      handleRoleToggle,
    }),
    [selectedRoleIds, userRoles, handleRoleToggle],
  );

  // Memoize impersonation object
  const impersonation = React.useMemo(
    () => ({
      email: impersonateEmail,
      setEmail: handleImpersonateEmailChange,
      isImpersonating: Boolean(impersonateEmail),
    }),
    [impersonateEmail, handleImpersonateEmailChange],
  );

  // Memoize request headers object with stable reference
  const requestHeaders = React.useMemo(() => {
    const headers: Record<string, string> = {};

    // Add impersonation header if impersonating
    if (impersonateEmail) {
      headers['X-Impersonate'] = impersonateEmail;
    }

    // Future headers can be added here (auth tokens, correlation IDs, etc.)

    // Return empty object if no headers to prevent unnecessary re-renders
    return Object.keys(headers).length > 0 ? headers : {};
  }, [impersonateEmail]);

  // Load dev tools once
  React.useEffect(() => {
    import("@smbc/mui-applet-devtools").then((imports) => {
      setDevToolsImports(imports);
    });
  }, []);

  // Memoize the final context value to prevent recreating on every render
  const contextValue = React.useMemo(() => {
    if (!devToolsImports) return null;

    return {
      debug: devToolsImports.debug,
      createSessionId: devToolsImports.createSessionId,
      DevConsoleToggle: devToolsImports.DevConsoleToggle,
      roleSelection,
      impersonation,
      requestHeaders,
    };
  }, [devToolsImports, roleSelection, impersonation, requestHeaders]);

  return <DevContext.Provider value={contextValue}>{children}</DevContext.Provider>;
};

export const useDevTools = () => {
  const context = useContext(DevContext);
  if (!context) {
    // Return no-op functions for production
    return {
      debug: { log: () => {} },
      createSessionId: () => "disabled",
      DevConsoleToggle: () => null,
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
      requestHeaders: {},
    };
  }
  return context;
};

export const useDebug = () => {
  const context = useContext(DevContext);
  if (!context) {
    // Return no-op functions for production
    return {
      debug: { log: () => {} },
      createSessionId: () => "disabled",
    };
  }
  return {
    debug: context.debug,
    createSessionId: context.createSessionId,
  };
};
