import React from "react";
import { ActivityProvider } from "./activity/ActivityContext";
import { TransactionProvider } from "./transaction/TransactionContext";

interface DataViewProviderProps {
  children: React.ReactNode;
  /** Whether to enable transaction support. Defaults to false. */
  enableTransactions?: boolean;
}

export function DataViewProvider({ 
  children, 
  enableTransactions = false 
}: DataViewProviderProps) {
  if (enableTransactions) {
    return (
      <ActivityProvider>
        <TransactionProvider>
          {children}
        </TransactionProvider>
      </ActivityProvider>
    );
  }
  
  return (
    <ActivityProvider>
      {children}
    </ActivityProvider>
  );
}