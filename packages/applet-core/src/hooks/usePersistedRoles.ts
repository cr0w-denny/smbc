import React from "react";

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
 * A hook that manages role selection with localStorage persistence.
 * Simplified to avoid loops - just manages local state and persistence.
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
  storageKey = "selectedRoles",
  onRolesChange,
}: UsePersistedRolesProps): UsePersistedRolesReturn {
  const isInternalUpdate = React.useRef(false);

  // Initialize from localStorage or userRoles
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedRoles = JSON.parse(saved) as string[];
        const validRoles = parsedRoles.filter((role) =>
          availableRoles.includes(role),
        );
        if (validRoles.length > 0) {
          return validRoles;
        }
      }
    } catch (error) {}
    return [...userRoles];
  });

  // Save to localStorage when selectedRoles changes (but only if not internal update)
  React.useEffect(() => {
    if (!isInternalUpdate.current) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(selectedRoles));
        // Fire custom event for same-tab communication
        window.dispatchEvent(new CustomEvent(`roles-changed-${storageKey}`, {
          detail: { roles: selectedRoles }
        }));
      } catch (error) {}
    }
    isInternalUpdate.current = false;
  }, [selectedRoles, storageKey]);

  // Listen for role changes from other instances (both storage events and custom events)
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const newRoles = JSON.parse(e.newValue) as string[];
          const validRoles = newRoles.filter((role) =>
            availableRoles.includes(role),
          );
          if (JSON.stringify(validRoles) !== JSON.stringify(selectedRoles)) {
            isInternalUpdate.current = true;
            setSelectedRoles(validRoles);
            onRolesChange(validRoles);
          }
        } catch (error) {}
      }
    };

    const handleCustomEvent = (e: CustomEvent) => {
      const newRoles = e.detail.roles as string[];
      const validRoles = newRoles.filter((role) =>
        availableRoles.includes(role),
      );
      if (JSON.stringify(validRoles) !== JSON.stringify(selectedRoles)) {
        isInternalUpdate.current = true;
        setSelectedRoles(validRoles);
        onRolesChange(validRoles);
      }
    };

    // Listen for both storage events (cross-tab) and custom events (same-tab)
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(`roles-changed-${storageKey}`, handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(`roles-changed-${storageKey}`, handleCustomEvent as EventListener);
    };
  }, [storageKey, availableRoles, selectedRoles, onRolesChange]);

  const toggleRole = React.useCallback(
    (role: string) => {
      setSelectedRoles((prev) => {
        const newRoles = prev.includes(role)
          ? prev.filter((r) => r !== role)
          : [...prev, role];

        // Update the user's roles immediately
        onRolesChange(newRoles);

        return newRoles;
      });
    },
    [onRolesChange],
  );

  return {
    selectedRoles,
    toggleRole,
    setSelectedRoles,
  };
}
