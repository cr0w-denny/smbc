import React from "react";
import type { TransactionManager } from "./types";
interface TransactionContextValue {
    managers: Map<string, TransactionManager<any>>;
    registerManager: (id: string, manager: TransactionManager<any>) => void;
    unregisterManager: (id: string) => void;
    getAllManagers: () => TransactionManager<any>[];
    combinedSummary: {
        total: number;
        byType: {
            create: number;
            update: number;
            delete: number;
        };
        byTrigger: {
            "user-edit": number;
            "bulk-action": number;
            "row-action": number;
        };
        entities: string[];
    };
}
export declare function TransactionProvider({ children, }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useTransactionContext(): TransactionContextValue;
export {};
//# sourceMappingURL=TransactionContext.d.ts.map