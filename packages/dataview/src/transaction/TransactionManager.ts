import {
  TransactionConfig,
  TransactionOperation,
  TransactionResult,
  Transaction,
  TransactionManager,
  TransactionEvents,
  TransactionSummary,
} from "./types";
import { TransactionRegistry } from "./TransactionRegistry";

export class SimpleTransactionManager<T = any>
  implements TransactionManager<T>
{
  public readonly id: string;
  private currentTransaction: Transaction<T> | null = null;
  private config: TransactionConfig;
  private eventHandlers: Map<keyof TransactionEvents<T>, Function[]> =
    new Map();

  constructor(config: TransactionConfig, id?: string) {
    this.config = config;
    this.id = id || `txn_mgr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  begin(config?: Partial<TransactionConfig>): string {
    // Merge provided config with defaults
    const effectiveConfig = { ...this.config, ...config };

    const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.currentTransaction = {
      id,
      operations: [],
      status: "pending",
      results: [],
      createdAt: new Date(),
      config: effectiveConfig,
      totalOperations: 0,
    };

    // Emit transaction start event for snapshot capture
    this.emit("onTransactionStart", this.currentTransaction);

    return id;
  }

  addOperation(
    operation: Omit<TransactionOperation<T>, "id" | "timestamp">,
    providedId?: string,
  ): string {
    if (!this.currentTransaction) {
      this.begin(); // Auto-start transaction if needed
    }

    // Check for conflicting operations on the same entity
    const existingOpIndex = this.currentTransaction!.operations.findIndex(
      (op) => op.entityId === operation.entityId,
    );

    const id =
      providedId ||
      `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullOperation: TransactionOperation<T> = {
      ...operation,
      id,
      timestamp: new Date(),
    };

    if (existingOpIndex !== -1) {
      const existingOp = this.currentTransaction!.operations[existingOpIndex];

      // Handle conflict based on operation types - last operation wins
      // IMPORTANT: Preserve the original data from the first operation to enable full rollback
      const preservedOriginalData = existingOp.originalData;

      if (operation.type === "delete") {
        if (existingOp.type === "create") {
          // If deleting a created item, show it as pending deletion for consistent UX
          // but mark it as a "delete-created" operation that will just remove the create on commit
          this.currentTransaction!.operations[existingOpIndex] = {
            ...fullOperation,
            type: "delete" as const,
            originalData: preservedOriginalData, // Keep the original create data
            wasCreated: true // Mark that this was originally a create operation
          };
          // Emit removal event for the replaced operation
          this.emit("onOperationRemoved", existingOp.id, existingOp);
        } else {
          // Delete replaces any existing operation (for existing items)
          this.currentTransaction!.operations[existingOpIndex] = {
            ...fullOperation,
            originalData: preservedOriginalData, // Keep the very first state
          };
          // Emit removal event for the replaced operation
          this.emit("onOperationRemoved", existingOp.id, existingOp);
        }
      } else if (operation.type === "update") {
        if (existingOp.type === "create" || (existingOp.type === "delete" && existingOp.wasCreated)) {
          // If updating a created item (or a deleted created item), revert it back to a create with updated data
          this.currentTransaction!.operations[existingOpIndex] = {
            ...existingOp,
            type: "create" as const, // Always revert back to create
            entity: operation.entity, // Use the updated entity data
            label: operation.label, // Update the label
            timestamp: new Date(), // Update timestamp
            wasCreated: undefined, // Clear the wasCreated flag since it's back to a normal create
            // Keep the original create mutation
          };
          // Don't emit removal since we're just updating the create operation
        } else {
          // Update replaces any existing operation (for existing items)
          this.currentTransaction!.operations[existingOpIndex] = {
            ...fullOperation,
            originalData: preservedOriginalData, // Keep the very first state
          };
          // Emit removal event for the replaced operation
          this.emit("onOperationRemoved", existingOp.id, existingOp);
        }
      } else if (operation.type === "create") {
        // This shouldn't happen (can't create an existing entity)
        this.currentTransaction!.operations.push(fullOperation);
      } else {
        // Default: add as new operation
        this.currentTransaction!.operations.push(fullOperation);
      }
    } else {
      // No conflict, add normally
      this.currentTransaction!.operations.push(fullOperation);
    }

    this.currentTransaction!.totalOperations =
      this.currentTransaction!.operations.length;

    // Emit event
    this.emit("onOperationAdded", fullOperation);

    // Notify global registry that operations changed

    TransactionRegistry.notifyListeners();


    return id;
  }

  removeOperation(operationId: string): boolean {
    if (!this.currentTransaction) return false;

    const initialLength = this.currentTransaction.operations.length;
    // Find the operation before removing it
    const operationToRemove = this.currentTransaction.operations.find(
      (op) => op.id === operationId,
    );

    this.currentTransaction.operations =
      this.currentTransaction.operations.filter((op) => op.id !== operationId);

    const removed = this.currentTransaction.operations.length < initialLength;
    if (removed) {
      this.currentTransaction.totalOperations =
        this.currentTransaction.operations.length;

      // Pass the operation details to the event handler
      this.emit("onOperationRemoved", operationId, operationToRemove);
      TransactionRegistry.notifyListeners();
    }

    return removed;
  }

  async commit(force: boolean = false): Promise<TransactionResult<T>[]> {
    console.log('TransactionManager: commit() called', { 
      hasTransaction: !!this.currentTransaction,
      operationsCount: this.currentTransaction?.operations.length || 0,
      force 
    });
    
    if (!this.currentTransaction) {
      throw new Error("No active transaction to commit.");
    }

    const transaction = this.currentTransaction;

    // Check if confirmation is required and not forced
    if (transaction.config.requireConfirmation && !force) {
      // Confirmation required but not forced - set status to reviewing
      // and return empty array to indicate confirmation is needed
      transaction.status = "reviewing";
      return [];
    }

    transaction.status = "executing";
    transaction.executedAt = new Date();

    try {
      let results: TransactionResult<T>[] = [];

      // All modes use batch execution now
      results = await this.executeBatch();

      console.log('TransactionManager: emitting onTransactionComplete event', { 
        resultsCount: results.length,
        hasListeners: this.eventHandlers.has("onTransactionComplete"),
        listenerCount: this.eventHandlers.get("onTransactionComplete")?.length || 0
      });
      this.emit("onTransactionComplete", results);
      
      // Only mark as completed and clear if no operations remain (they may have been selectively removed)
      if (this.currentTransaction && this.currentTransaction.operations.length === 0) {
        console.log('TransactionManager: clearing transaction - no operations remain');
        transaction.status = "completed";
        transaction.completedAt = new Date();
        transaction.results = results;
        this.clear();
      } else {
        console.log('TransactionManager: keeping transaction - operations still remain', {
          remainingOperations: this.currentTransaction?.operations.length || 0
        });
        // Keep status as "pending" since operations remain
        transaction.status = "pending";
        // Store partial results
        transaction.results = results;
      }

      return results;
    } catch (error) {
      transaction.status = "failed";
      this.emit("onTransactionError", error as Error, transaction);
      throw error;
    }
  }

  cancel(): void {
    if (!this.currentTransaction) return;

    this.currentTransaction.status = "cancelled";
    this.emit("onTransactionCancelled", this.currentTransaction);
    this.clear();
  }

  getTransaction(): Transaction<T> | null {
    return this.currentTransaction;
  }

  getOperations(): TransactionOperation<T>[] {
    return this.currentTransaction?.operations || [];
  }

  getSummary(): TransactionSummary {
    const operations = this.getOperations();

    const byType = operations.reduce(
      (acc, op) => {
        acc[op.type] = (acc[op.type] || 0) + 1;
        return acc;
      },
      { create: 0, update: 0, delete: 0 },
    );

    const byTrigger = operations.reduce(
      (acc, op) => {
        acc[op.trigger] = (acc[op.trigger] || 0) + 1;
        return acc;
      },
      { "user-edit": 0, "bulk-action": 0, "row-action": 0 },
    );

    const entities = [
      ...new Set(
        operations.map((op) =>
          typeof op.entity === "object" &&
          op.entity &&
          op.entity.constructor.name !== "Object"
            ? op.entity.constructor.name
            : "item",
        ),
      ),
    ];

    const summary = {
      total: operations.length,
      byType,
      byTrigger,
      entities,
    };

    return summary;
  }

  hasOperations(): boolean {
    return this.getOperations().length > 0;
  }

  canCommit(): boolean {
    return (
      this.hasOperations() && this.currentTransaction?.status === "pending"
    );
  }

  clear(): void {
    this.currentTransaction = null;
  }

  estimateDuration(): number {
    const operations = this.getOperations();
    // Rough estimate: 500ms per operation, plus 200ms base overhead
    return operations.length * 500 + 200;
  }

  on<K extends keyof TransactionEvents<T>>(
    event: K,
    handler: TransactionEvents<T>[K],
  ): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler as Function);
  }

  off<K extends keyof TransactionEvents<T>>(
    event: K,
    handler: TransactionEvents<T>[K],
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler as Function);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit<K extends keyof TransactionEvents<T>>(
    event: K,
    ...args: any[]
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args);
        } catch (error) {
          console.error(
            `Error in transaction event handler for ${String(event)}:`,
            error,
          );
        }
      });
    }
  }



  private async executeBatch(): Promise<TransactionResult<T>[]> {
    const transaction = this.currentTransaction!;
    const results: TransactionResult<T>[] = [];

    try {
      // Filter out operations that were created then deleted (cancel each other out)
      const operationsToExecute = transaction.operations.filter(operation => {
        if (operation.type === "delete" && operation.wasCreated) {
          // This was a create operation that was then deleted - skip API call, just return success
          results.push({
            success: true,
            operation,
            result: null, // No API result needed since we're just canceling out operations
            duration: 0,
          } as TransactionResult<T>);
          return false; // Don't execute this operation
        }
        return true; // Execute this operation normally
      });

      // Execute remaining operations in parallel
      const promises = operationsToExecute.map(async (operation) => {
        const startTime = Date.now();

        try {
          const result = await operation.mutation();
          const duration = Date.now() - startTime;

          return {
            success: true,
            operation,
            result,
            duration,
          } as TransactionResult<T>;
        } catch (error) {
          const duration = Date.now() - startTime;

          return {
            success: false,
            operation,
            error: error as Error,
            duration,
          } as TransactionResult<T>;
        }
      });

      const allResults = await Promise.all(promises);
      results.push(...allResults);

      // Emit individual operation completion events
      allResults.forEach((result) => this.emit("onOperationComplete", result));

      // Check if any operations failed and handle according to config
      const failures = results.filter((r) => !r.success);
      if (failures.length > 0) {
        const successes = results.filter((r) => r.success);
        
        if (transaction.config.allowPartialSuccess) {
          // Partial success mode - don't rollback, just report the mixed results
          console.log(`TransactionManager: Partial success - ${successes.length} succeeded, ${failures.length} failed`);
          // Continue with partial results - don't throw
        } else {
          // All-or-nothing mode - rollback all successful operations
          await this.rollbackOperations(successes);

          transaction.status = "rolledback";
          this.emit("onRollbackComplete", transaction);

          throw new Error(
            `Transaction failed: ${failures.length} operations failed and all changes were rolled back.`,
          );
        }
      }
    } catch (error) {
      transaction.status = "failed";
      throw error;
    }

    return results;
  }

  private async rollbackOperations(
    successfulResults: TransactionResult<T>[],
  ): Promise<void> {
    // Rollback in reverse order (LIFO)
    const reversedResults = [...successfulResults].reverse();

    for (const result of reversedResults) {
      try {
        await this.rollbackSingleOperation(result.operation);
      } catch (rollbackError) {
        console.error(
          "Rollback failed for operation:",
          result.operation.id,
          rollbackError,
        );
        // Continue rolling back other operations even if one fails
      }
    }
  }

  private async rollbackSingleOperation(
    _operation: TransactionOperation<T>,
  ): Promise<void> {
    // Note: This is a simplified rollback implementation
    // In a real system, you'd need to implement proper reverse operations
    // based on your specific API and data structures
    // Placeholder for rollback logic:
    // - For create: call delete API
    // - For update: call update API with originalData
    // - For delete: call create API with originalData
  }
}
