import React from "react";
import { ActivityProvider } from "./activity/ActivityContext";
import { TransactionProvider } from "./transaction/TransactionContext";

interface DataViewProviderProps {
  children: React.ReactNode;
}

export function DataViewProvider({ children }: DataViewProviderProps) {
  return (
    <ActivityProvider>
      <TransactionProvider>
        {children}
      </TransactionProvider>
    </ActivityProvider>
  );
}