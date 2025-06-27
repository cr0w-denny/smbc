import React from 'react';

/**
 * Props for the usePersistedRoles hook
 */
export interface UsePersistedRolesProps {
  /** Current user roles */
  userRoles: string[];
  /** Available roles to validate against */
  availableRoles: string[];
  /** localStorage key for persistence */
  storageKey?: string;
  /** Function to update user roles */
  onRolesChange: (roles: string[]) => void;
}

/**
 * Return type for the usePersistedRoles hook
 */
export interface UsePersistedRolesReturn {
  /** Currently selected roles */
  selectedRoles: string[];
  /** Function to toggle a role */
  toggleRole: (role: string) => void;
  /** Function to set multiple roles */
  setSelectedRoles: React.Dispatch<React.SetStateAction<string[]>>;
}

/**
 * A hook that manages role selection with localStorage persistence
 * and automatic synchronization with user roles.
 * 
 * @example
 * ```tsx
 * const { selectedRoles, toggleRole } = usePersistedRoles({
 *   userRoles,
 *   availableRoles,
 *   storageKey: 'myApp-selectedRoles',
 *   onRolesChange: setRoles,
 * });
 * ```
 */
export function usePersistedRoles({
  userRoles,
  availableRoles,
  storageKey = 'selectedRoles',
  onRolesChange,
}: UsePersistedRolesProps): UsePersistedRolesReturn {
  // State for managing selected roles (allowing multiple selection)
  // Initialize from localStorage or default to current userRoles
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedRoles = JSON.parse(saved) as string[];
        // Validate that saved roles are still valid
        const validRoles = parsedRoles.filter((role) =>
          availableRoles.includes(role),
        );
        if (validRoles.length > 0) {
          // Ensure current userRoles are included in the saved selection
          const allCurrentRoles = [...userRoles];
          const missingRoles = allCurrentRoles.filter(
            (role) => !validRoles.includes(role),
          );
          return missingRoles.length > 0
            ? [...validRoles, ...missingRoles]
            : validRoles;
        }
      }
    } catch (error) {
      console.warn(`Failed to load selected roles from localStorage (${storageKey}):`, error);
    }
    return [...userRoles];
  });

  // Sync selectedRoles when userRoles changes
  React.useEffect(() => {
    const missingRoles = userRoles.filter(
      (role) => !selectedRoles.includes(role),
    );
    if (missingRoles.length > 0) {
      setSelectedRoles((prev) => [...prev, ...missingRoles]);
    }
  }, [userRoles, selectedRoles]);

  // Save selected roles to localStorage whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(selectedRoles));
    } catch (error) {
      console.warn(`Failed to save selected roles to localStorage (${storageKey}):`, error);
    }
  }, [selectedRoles, storageKey]);

  const toggleRole = React.useCallback((role: string) => {
    setSelectedRoles((prev) => {
      const newRoles = prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role];

      // Update the user's roles immediately
      onRolesChange(newRoles);

      return newRoles;
    });
  }, [onRolesChange]);

  return {
    selectedRoles,
    toggleRole,
    setSelectedRoles,
  };
}