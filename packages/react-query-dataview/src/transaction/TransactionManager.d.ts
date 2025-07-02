import { TransactionConfig, TransactionOperation, TransactionResult, Transaction, TransactionManager, TransactionEvents, TransactionSummary } from "./types";
export declare class SimpleTransactionManager<T = any> implements TransactionManager<T> {
    private currentTransaction;
    private config;
    private eventHandlers;
    constructor(config: TransactionConfig);
    begin(config?: Partial<TransactionConfig>): string;
    addOperation(operation: Omit<TransactionOperation<T>, "id" | "timestamp">, providedId?: string): string;
    removeOperation(operationId: string): boolean;
    commit(force?: boolean): Promise<TransactionResult<T>[]>;
    cancel(): void;
    getTransaction(): Transaction<T> | null;
    getOperations(): TransactionOperation<T>[];
    getSummary(): TransactionSummary;
    hasOperations(): boolean;
    canCommit(): boolean;
    clear(): void;
    estimateDuration(): number;
    on<K extends keyof TransactionEvents<T>>(event: K, handler: TransactionEvents<T>[K]): void;
    off<K extends keyof TransactionEvents<T>>(event: K, handler: TransactionEvents<T>[K]): void;
    private emit;
    private executeBatch;
    private rollbackOperations;
    private rollbackSingleOperation;
}
//# sourceMappingURL=TransactionManager.d.ts.map