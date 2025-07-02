import type { TransactionManager } from "./types";
declare class TransactionRegistryClass {
    private managers;
    private listeners;
    register(id: string, manager: TransactionManager<any>): void;
    unregister(id: string): void;
    getAllManagers(): TransactionManager<any>[];
    getCombinedSummary(): {
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
    addListener(listener: () => void): () => boolean;
    notifyListeners(): void;
    commitAll(): Promise<void>;
    cancelAll(): void;
}
export declare const TransactionRegistry: TransactionRegistryClass;
export {};
//# sourceMappingURL=TransactionRegistry.d.ts.map