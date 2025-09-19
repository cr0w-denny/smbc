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
  AppletMount,
  createRoleUtilities,
} from "./types";

interface AppContextValue {
  state: AppState;
  roleUtils: ReturnType<typeof createRoleUtilities>;
  applets: AppletMount[];
  maxWidth?: Record<string, string>; // Responsive maxWidth settings
  toolbarOffset?: number; // Top offset for sticky toolbar in pixels
  actions: {
    setUser: (user: User | null) => void;
    setNavigation: (navigation: NavigationItem[]) => void;
    setUserRoles: (roles: string[]) => void;
    setMswStatus: (status: MswStatus) => void;
  };
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppletProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
  initialNavigation?: NavigationItem[];
  initialRoleConfig?: RoleConfig;
  appletRegistry?: Record<string, any>;
  applets?: AppletMount[];
  maxWidth?: Record<string, string>; // Responsive maxWidth settings
  toolbarOffset?: number; // Top offset for sticky toolbar in pixels
}

export const AppletProvider: React.FC<AppletProviderProps> = ({
  children,
  initialUser = null,
  initialNavigation = [],
  initialRoleConfig = { roles: ["Guest", "User"], permissionMappings: {} },
  appletRegistry = {},
  applets = [],
  maxWidth,
  toolbarOffset,
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
    applets,
    maxWidth,
    toolbarOffset,
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
export const useAppletCore = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppletCore must be used within an AppletProvider");
  }
  return context;
};

// Hook to get applets
export const useApplets = (): AppletMount[] => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApplets must be used within an AppletProvider");
  }
  return context.applets;
};
