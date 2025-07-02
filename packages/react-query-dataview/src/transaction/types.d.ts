export interface TransactionConfig {
    enabled: boolean;
    requireConfirmation: boolean;
    allowPartialSuccess?: boolean;
    emitActivities?: boolean;
    maxPendingOperations?: number;
    timeoutMs?: number;
}
export type OperationTrigger = "user-edit" | "bulk-action" | "row-action";
export interface TransactionOperation<T = any> {
    id: string;
    type: "create" | "update" | "delete";
    trigger: OperationTrigger;
    entity: T;
    entityId: string | number;
    originalData?: T;
    changedFields?: string[];
    label: string;
    timestamp: Date;
    mutation: () => Promise<any>;
    icon?: React.ComponentType;
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
}
export interface TransactionResult<T = any> {
    success: boolean;
    operation: TransactionOperation<T>;
    result?: any;
    error?: Error;
    duration?: number;
}
export interface Transaction<T = any> {
    id: string;
    operations: TransactionOperation<T>[];
    status: "pending" | "reviewing" | "executing" | "completed" | "failed" | "rolledback" | "cancelled";
    results: TransactionResult<T>[];
    createdAt: Date;
    executedAt?: Date;
    completedAt?: Date;
    config: TransactionConfig;
    totalOperations: number;
    estimatedDuration?: number;
}
export interface TransactionSummary {
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
}
export interface TransactionEvents<T = any> {
    onOperationAdded?: (operation: TransactionOperation<T>) => void;
    onOperationRemoved?: (operationId: string) => void;
    onTransactionStart?: (transaction: Transaction<T>) => void;
    onOperationComplete?: (result: TransactionResult<T>) => void;
    onTransactionComplete?: (results: TransactionResult<T>[]) => void;
    onTransactionError?: (error: Error, transaction: Transaction<T>) => void;
    onRollbackComplete?: (transaction: Transaction<T>) => void;
    onTransactionCancelled?: (transaction: Transaction<T>) => void;
}
export interface TransactionManager<T = any> {
    begin(config?: Partial<TransactionConfig>): string;
    addOperation(operation: Omit<TransactionOperation<T>, "id" | "timestamp">): string;
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
}
export interface TransactionIndicatorProps {
    transactionManager: TransactionManager;
    onClick?: () => void;
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}
export interface TransactionReviewProps<T = any> {
    transactionManager: TransactionManager<T>;
    open: boolean;
    onClose: () => void;
    onCommit: () => void;
    onCancel: () => void;
    onRemoveOperation: (operationId: string) => void;
}
//# sourceMappingURL=types.d.ts.map