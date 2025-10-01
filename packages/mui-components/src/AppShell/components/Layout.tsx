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
  isImpersonating,
}) => {
  return (
    <div id="app" style={{ height: '100%' }}>
      <div id="app-header">
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
        isImpersonating={isImpersonating}
        />
      </div>
      <div id="app-content" style={{ height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;