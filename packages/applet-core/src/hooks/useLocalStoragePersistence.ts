import { useEffect } from "react";

interface UseLocalStoragePersistenceProps {
  selectedRoles: string[];
  persistRoles: boolean;
  localStorageKey: string;
}

export function useLocalStoragePersistence({
  selectedRoles,
  persistRoles,
  localStorageKey,
}: UseLocalStoragePersistenceProps) {
  // Save selected roles to localStorage whenever they change
  useEffect(() => {
    if (!persistRoles) return;

    try {
      localStorage.setItem(localStorageKey, JSON.stringify(selectedRoles));
    } catch (error) {}
  }, [selectedRoles, persistRoles, localStorageKey]);
}
