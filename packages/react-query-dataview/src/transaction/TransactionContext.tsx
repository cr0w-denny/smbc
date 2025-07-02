import React, { createContext, useContext, useState, useEffect } from "react";
import { TransactionRegistry } from "./TransactionRegistry";
import type { TransactionManager } from "./types";

interface TransactionContextValue {
  managers: Map<string, TransactionManager<any>>;
  registerManager: (id: string, manager: TransactionManager<any>) => void;
  unregisterManager: (id: string) => void;
  getAllManagers: () => TransactionManager<any>[];
  combinedSummary: {
    total: number;
    byType: { create: number; update: number; delete: number };
    byTrigger: {
      "user-edit": number;
      "bulk-action": number;
      "row-action": number;
    };
    entities: string[];
  };
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [summary, setSummary] = useState(() =>
    TransactionRegistry.getCombinedSummary(),
  );

  // Listen for changes in the global registry
  useEffect(() => {
    const unsubscribe = TransactionRegistry.addListener(() => {
      setSummary(TransactionRegistry.getCombinedSummary());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const contextValue = {
    managers: new Map(), // Not used with global registry
    registerManager: TransactionRegistry.register.bind(TransactionRegistry),
    unregisterManager: TransactionRegistry.unregister.bind(TransactionRegistry),
    getAllManagers:
      TransactionRegistry.getAllManagers.bind(TransactionRegistry),
    combinedSummary: summary,
  };

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionContext() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactionContext must be used within a TransactionProvider",
    );
  }
  return context;
}
