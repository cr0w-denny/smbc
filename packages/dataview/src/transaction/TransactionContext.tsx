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

  // Clear all transactions when navigating away
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasActiveTransactions = TransactionRegistry.getAllManagers().some(
        manager => manager.getOperations().length > 0
      );
      
      if (hasActiveTransactions) {
        // Cancel all pending transactions
        TransactionRegistry.cancelAll();
        
        // Show browser confirmation dialog
        const message = "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = message;
        return message;
      }
    };

    const handleHashChange = () => {
      const hasActiveTransactions = TransactionRegistry.getAllManagers().some(
        manager => manager.getOperations().length > 0
      );
      
      if (hasActiveTransactions) {
        // Cancel all pending transactions on hash navigation
        TransactionRegistry.cancelAll();
        console.log("Cancelled all transactions due to navigation");
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('hashchange', handleHashChange);
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
