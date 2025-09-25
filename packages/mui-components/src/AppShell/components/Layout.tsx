import React from "react";
import TopNav from "./TopNav";
import { AppShellProps } from "../types";

export const Layout: React.FC<AppShellProps> = ({
  logo,
  hamburgerMenu,
  navigation,
  children,
  onNavigate,
  currentPath,
  isDarkMode,
  onDarkModeToggle,
  username,
  avatarUrl,
  right,
  activeColor,
  maxWidth,
  userRoles,
  onToggleRole,
  onProfile,
  onSettings,
  onQuickGuide,
  onLogout,
}) => {
  return (
    <>
      <TopNav
        logo={logo}
        hamburgerMenu={hamburgerMenu}
        navigation={navigation}
        onNavigate={onNavigate}
        currentPath={currentPath}
        isDarkMode={isDarkMode}
        onDarkModeToggle={onDarkModeToggle}
        username={username}
        avatarUrl={avatarUrl}
        right={right}
        activeColor={activeColor}
        maxWidth={maxWidth}
        userRoles={userRoles}
        onToggleRole={onToggleRole}
        onProfile={onProfile}
        onSettings={onSettings}
        onQuickGuide={onQuickGuide}
        onLogout={onLogout}
      />
      {children}
    </>
  );
};

export default Layout;