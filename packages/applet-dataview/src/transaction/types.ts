// Flexible transaction system for react-dataview

export interface TransactionConfig {
  enabled: boolean;

  // Commit behavior
  autoCommit: boolean; // Auto-commit operations

  // User interaction
  requireConfirmation: boolean; // Show confirmation before commit

  // Failure handling
  allowPartialSuccess?: boolean; // Allow partial success instead of rolling back on any failure (default: false)

  // Activity behavior
  emitActivities?: boolean; // Emit activities for individual operations (default: false when transactions enabled)

  // Advanced options
  maxPendingOperations?: number; // Auto-commit after X operations
  timeoutMs?: number; // Auto-commit after timeout
}

export type OperationTrigger = "user-edit" | "bulk-action" | "row-action";

export interface TransactionOperation<T = any> {
  id: string;
  type: "create" | "update" | "delete";
  trigger: OperationTrigger;
  entity: T;
  entityId: string | number;
  originalData?: T; // For rollback and review UI
  changedFields?: string[]; // Which fields were modified

  // Operation metadata
  label: string; // Human readable description
  timestamp: Date;
  mutation: () => Promise<any>; // The actual mutation to execute

  // UI metadata
  icon?: React.ComponentType;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
}

export interface TransactionResult<T = any> {
  success: boolean;
  operation: TransactionOperation<T>;
  result?: any;
  error?: Error;
  duration?: number; // Execution time in ms
}

export interface Transaction<T = any> {
  id: string;
  operations: TransactionOperation<T>[];
  status:
    | "pending"
    | "reviewing"
    | "executing"
    | "completed"
    | "failed"
    | "rolledback"
    | "cancelled";
  results: TransactionResult<T>[];
  createdAt: Date;
  executedAt?: Date;
  completedAt?: Date;
  config: TransactionConfig;

  // Metadata for UI
  totalOperations: number;
  estimatedDuration?: number; // For progress indication
}

export interface TransactionSummary {
  total: number;
  byType: { create: number; update: number; delete: number };
  byTrigger: {
    "user-edit": number;
    "bulk-action": number;
    "row-action": number;
  };
  entities: string[]; // List of affected entity types
}

// Events for transaction lifecycle
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

// Main transaction manager interface
export interface TransactionManager<T = any> {
  // Transaction lifecycle
  begin(config?: Partial<TransactionConfig>): string;
  addOperation(
    operation: Omit<TransactionOperation<T>, "id" | "timestamp">,
  ): string;
  removeOperation(operationId: string): boolean;
  commit(force?: boolean): Promise<TransactionResult<T>[]>;
  cancel(): void;

  // State queries
  getTransaction(): Transaction<T> | null;
  getOperations(): TransactionOperation<T>[];
  getSummary(): TransactionSummary;
  hasOperations(): boolean;
  canCommit(): boolean;

  // Utilities
  clear(): void;
  estimateDuration(): number; // Estimate execution time

  // Events
  on<K extends keyof TransactionEvents<T>>(
    event: K,
    handler: TransactionEvents<T>[K],
  ): void;
  off<K extends keyof TransactionEvents<T>>(
    event: K,
    handler: TransactionEvents<T>[K],
  ): void;
}

// UI Component Props
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
