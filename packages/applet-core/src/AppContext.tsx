import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  AppState,
  User,
  NavigationItem,
  RoleConfig,
  MswStatus,
  createRoleUtilities,
} from "./types";

interface AppContextValue {
  state: AppState;
  roleUtils: ReturnType<typeof createRoleUtilities>;
  actions: {
    setUser: (user: User | null) => void;
    setNavigation: (navigation: NavigationItem[]) => void;
    setUserRoles: (roles: string[]) => void;
    setMswStatus: (status: MswStatus) => void;
  };
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
  initialNavigation?: NavigationItem[];
  initialRoleConfig?: RoleConfig;
  appletRegistry?: Record<string, any>;
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  initialUser = null,
  initialNavigation = [],
  initialRoleConfig = { roles: ["Guest", "User"], permissionMappings: {} },
  appletRegistry = {},
}) => {
  const [state, setState] = useState<AppState>({
    user: initialUser,
    isAuthenticated: initialUser !== null,
    navigation: initialNavigation,
    appletRegistry,
    mswStatus: {
      isEnabled: false,
      isReady: true,
      isInitializing: false,
    },
  });

  const roleConfig = useMemo(
    () => initialRoleConfig,
    [
      JSON.stringify(initialRoleConfig.roles),
      JSON.stringify(initialRoleConfig.permissionMappings),
    ],
  );

  const roleUtils = useMemo(
    () => createRoleUtilities(roleConfig.roles, roleConfig.permissionMappings),
    [roleConfig],
  );

  const setUser = useCallback((user: User | null) => {
    setState((prev: AppState) => ({
      ...prev,
      user,
      isAuthenticated: user !== null,
    }));
  }, []);

  const setNavigation = useCallback((navigation: NavigationItem[]) => {
    setState((prev: AppState) => ({ ...prev, navigation }));
  }, []);

  const setUserRoles = useCallback((roles: string[]) => {
    setState((prev: AppState) => ({
      ...prev,
      user: prev.user ? { ...prev.user, roles } : null,
    }));
  }, []);

  const setMswStatus = useCallback((mswStatus: MswStatus) => {
    setState((prev: AppState) => ({ ...prev, mswStatus }));
  }, []);

  const contextValue: AppContextValue = {
    state,
    roleUtils,
    actions: {
      setUser,
      setNavigation,
      setUserRoles,
      setMswStatus,
    },
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// Hook to use the context
export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
