/**
 * AppShell state management provider
 */

import React, { createContext, useContext, useState, useCallback } from "react";

export interface AppShellContextValue {
  // Drawer state
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // User menu state
  userMenuAnchor: HTMLElement | null;
  openUserMenu: (event: React.MouseEvent<HTMLElement>) => void;
  closeUserMenu: () => void;

  // Notification menu state
  notificationMenuAnchor: HTMLElement | null;
  openNotificationMenu: (event: React.MouseEvent<HTMLElement>) => void;
  closeNotificationMenu: () => void;
  notificationCount: number;
  setNotificationCount: (count: number) => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export interface AppShellProviderProps {
  children: React.ReactNode;
  initialDrawerOpen?: boolean;
  initialNotificationCount?: number;
}

export const AppShellProvider: React.FC<AppShellProviderProps> = ({
  children,
  initialDrawerOpen = false,
  initialNotificationCount = 0,
}) => {
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(initialDrawerOpen);

  // Menu anchor states
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [notificationMenuAnchor, setNotificationMenuAnchor] =
    useState<HTMLElement | null>(null);

  // Notification state
  const [notificationCount, setNotificationCount] = useState(
    initialNotificationCount,
  );

  // Drawer actions
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((prev) => !prev), []);

  // User menu actions
  const openUserMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  }, []);

  const closeUserMenu = useCallback(() => {
    setUserMenuAnchor(null);
  }, []);

  // Notification menu actions
  const openNotificationMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setNotificationMenuAnchor(event.currentTarget);
    },
    [],
  );

  const closeNotificationMenu = useCallback(() => {
    setNotificationMenuAnchor(null);
  }, []);

  const contextValue: AppShellContextValue = {
    // Drawer
    drawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,

    // User menu
    userMenuAnchor,
    openUserMenu,
    closeUserMenu,

    // Notification menu
    notificationMenuAnchor,
    openNotificationMenu,
    closeNotificationMenu,
    notificationCount,
    setNotificationCount,
  };

  return (
    <AppShellContext.Provider value={contextValue}>
      {children}
    </AppShellContext.Provider>
  );
};

export const useAppShell = (): AppShellContextValue => {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used within an AppShellProvider");
  }
  return context;
};
