import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
import { TransactionRegistry } from "./TransactionRegistry";
const TransactionContext = createContext(null);
export function TransactionProvider({ children, }) {
    const [summary, setSummary] = useState(() => TransactionRegistry.getCombinedSummary());
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
        getAllManagers: TransactionRegistry.getAllManagers.bind(TransactionRegistry),
        combinedSummary: summary,
    };
    return (_jsx(TransactionContext.Provider, { value: contextValue, children: children }));
}
export function useTransactionContext() {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error("useTransactionContext must be used within a TransactionProvider");
    }
    return context;
}
