import { useAppletCore } from "../AppContext";

/**
 * Hook for user management
 */
export const useUser = () => {
  const { state, actions, roleUtils } = useAppletCore();

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    setUser: actions.setUser,
    setRoles: actions.setUserRoles,
    availableRoles: roleUtils.roles,
  };
};