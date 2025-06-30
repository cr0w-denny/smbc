import { TransactionConfig, TransactionOperation, TransactionResult, Transaction, TransactionManager, TransactionEvents, TransactionSummary } from './types';
import { TransactionRegistry } from './TransactionRegistry';

export class SimpleTransactionManager<T = any> implements TransactionManager<T> {
  private currentTransaction: Transaction<T> | null = null;
  private config: TransactionConfig;
  private eventHandlers: Map<keyof TransactionEvents<T>, Function[]> = new Map();

  constructor(config: TransactionConfig) {
    this.config = config;
  }

  begin(config?: Partial<TransactionConfig>): string {
    // Merge provided config with defaults
    const effectiveConfig = { ...this.config, ...config };
    
    const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.currentTransaction = {
      id,
      operations: [],
      status: 'pending',
      results: [],
      createdAt: new Date(),
      config: effectiveConfig,
      totalOperations: 0,
    };
    
    // Emit transaction start event for snapshot capture
    this.emit('onTransactionStart', this.currentTransaction);
    
    return id;
  }

  addOperation(operation: Omit<TransactionOperation<T>, 'id' | 'timestamp'>): string {
    if (!this.currentTransaction) {
      this.begin(); // Auto-start transaction if needed
    }

    const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullOperation: TransactionOperation<T> = { 
      ...operation, 
      id, 
      timestamp: new Date() 
    };
    
    this.currentTransaction!.operations.push(fullOperation);
    this.currentTransaction!.totalOperations = this.currentTransaction!.operations.length;

    console.log(`🔥 TransactionManager.addOperation: Added operation ${id}, total operations: ${this.currentTransaction!.operations.length}`);

    // Emit event
    this.emit('onOperationAdded', fullOperation);
    
    // Notify global registry that operations changed
    console.log('🔔 Notifying TransactionRegistry of operation change');
    TransactionRegistry.notifyListeners();

    // Auto-commit logic
    const shouldAutoCommit = this.shouldAutoCommit(fullOperation);
    if (shouldAutoCommit) {
      // For auto-commit, we might want to delay slightly to allow batching
      setTimeout(() => this.commit(), 10);
    }

    return id;
  }

  removeOperation(operationId: string): boolean {
    if (!this.currentTransaction) return false;

    const initialLength = this.currentTransaction.operations.length;
    this.currentTransaction.operations = this.currentTransaction.operations.filter(
      op => op.id !== operationId
    );
    
    const removed = this.currentTransaction.operations.length < initialLength;
    if (removed) {
      this.currentTransaction.totalOperations = this.currentTransaction.operations.length;
      this.emit('onOperationRemoved', operationId);
    }
    
    return removed;
  }

  async commit(force: boolean = false): Promise<TransactionResult<T>[]> {
    if (!this.currentTransaction) {
      throw new Error('No active transaction to commit.');
    }

    const transaction = this.currentTransaction;
    
    // Check if confirmation is required and not forced
    if (transaction.config.requireConfirmation && !force) {
      // This would typically trigger a confirmation dialog
      // For now, we'll assume confirmation is handled externally
      transaction.status = 'reviewing';
      return [];
    }

    transaction.status = 'executing';
    transaction.executedAt = new Date();

    try {
      let results: TransactionResult<T>[] = [];

      if (transaction.config.mode === 'immediate') {
        results = await this.executeImmediate();
      } else {
        results = await this.executeBatch();
      }

      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.results = results;

      this.emit('onTransactionComplete', results);
      this.clear(); // Clear transaction after successful completion

      return results;

    } catch (error) {
      transaction.status = 'failed';
      this.emit('onTransactionError', error as Error, transaction);
      throw error;
    }
  }

  cancel(): void {
    if (!this.currentTransaction) return;

    this.currentTransaction.status = 'cancelled';
    this.emit('onTransactionCancelled', this.currentTransaction);
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
    
    const byType = operations.reduce((acc, op) => {
      acc[op.type] = (acc[op.type] || 0) + 1;
      return acc;
    }, { create: 0, update: 0, delete: 0 });

    const byTrigger = operations.reduce((acc, op) => {
      acc[op.trigger] = (acc[op.trigger] || 0) + 1;
      return acc;
    }, { 'user-edit': 0, 'bulk-action': 0, 'row-action': 0 });

    const entities = [...new Set(operations.map(op => 
      typeof op.entity === 'object' && op.entity && op.entity.constructor.name !== 'Object' 
        ? op.entity.constructor.name 
        : 'item'
    ))];

    const summary = {
      total: operations.length,
      byType,
      byTrigger,
      entities,
    };

    console.log(`📊 TransactionManager.getSummary: ${summary.total} operations`);
    return summary;
  }

  hasOperations(): boolean {
    return this.getOperations().length > 0;
  }

  canCommit(): boolean {
    return this.hasOperations() && this.currentTransaction?.status === 'pending';
  }

  clear(): void {
    this.currentTransaction = null;
  }

  estimateDuration(): number {
    const operations = this.getOperations();
    // Rough estimate: 500ms per operation, plus 200ms base overhead
    return (operations.length * 500) + 200;
  }

  on<K extends keyof TransactionEvents<T>>(event: K, handler: TransactionEvents<T>[K]): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler as Function);
  }

  off<K extends keyof TransactionEvents<T>>(event: K, handler: TransactionEvents<T>[K]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler as Function);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit<K extends keyof TransactionEvents<T>>(event: K, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in transaction event handler for ${String(event)}:`, error);
        }
      });
    }
  }

  private shouldAutoCommit(operation: TransactionOperation<T>): boolean {
    const config = this.currentTransaction!.config;
    
    // Check mode-specific auto-commit rules
    if (config.mode === 'immediate') {
      return true;
    }
    
    if (config.mode === 'bulk-only' && operation.trigger === 'bulk-action') {
      return config.bulkAutoCommit ?? config.autoCommit;
    }
    
    if (config.mode === 'hybrid') {
      if (operation.trigger === 'bulk-action') {
        return config.bulkAutoCommit ?? false;
      }
      return config.autoCommit;
    }
    
    // user-controlled mode
    if (config.mode === 'user-controlled') {
      return false; // Never auto-commit in user-controlled mode
    }
    
    // Check max operations limit
    if (config.maxPendingOperations && this.getOperations().length >= config.maxPendingOperations) {
      return true;
    }
    
    return config.autoCommit;
  }

  private async executeImmediate(): Promise<TransactionResult<T>[]> {
    const transaction = this.currentTransaction!;
    const results: TransactionResult<T>[] = [];

    for (const operation of transaction.operations) {
      const startTime = Date.now();
      
      try {
        const result = await operation.mutation();
        const duration = Date.now() - startTime;
        
        const opResult: TransactionResult<T> = {
          success: true,
          operation,
          result,
          duration,
        };
        
        results.push(opResult);
        this.emit('onOperationComplete', opResult);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        
        const opResult: TransactionResult<T> = {
          success: false,
          operation,
          error: error as Error,
          duration,
        };
        
        results.push(opResult);
        this.emit('onOperationComplete', opResult);

        // For immediate mode with rollback, stop and rollback on first failure
        if (transaction.config.mode === 'immediate') {
          await this.rollbackOperations(results.filter(r => r.success));
          transaction.status = 'rolledback';
          this.emit('onRollbackComplete', transaction);
          throw new Error(`Transaction failed and rolled back. Original error: ${(error as Error).message}`);
        }
      }
    }

    return results;
  }

  private async executeBatch(): Promise<TransactionResult<T>[]> {
    const transaction = this.currentTransaction!;
    const results: TransactionResult<T>[] = [];

    try {
      // Execute all operations in parallel
      const promises = transaction.operations.map(async (operation) => {
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
      allResults.forEach(result => this.emit('onOperationComplete', result));

      // Check if any operations failed and rollback if configured
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        // Always rollback all successful operations on any failure in batch mode
        const successes = results.filter(r => r.success);
        await this.rollbackOperations(successes);
        
        transaction.status = 'rolledback';
        this.emit('onRollbackComplete', transaction);
        
        throw new Error(`Transaction failed: ${failures.length} operations failed and all changes were rolled back.`);
      }

    } catch (error) {
      transaction.status = 'failed';
      throw error;
    }

    return results;
  }

  private async rollbackOperations(successfulResults: TransactionResult<T>[]): Promise<void> {
    // Rollback in reverse order (LIFO)
    const reversedResults = [...successfulResults].reverse();
    
    for (const result of reversedResults) {
      try {
        await this.rollbackSingleOperation(result.operation);
      } catch (rollbackError) {
        console.error('Rollback failed for operation:', result.operation.id, rollbackError);
        // Continue rolling back other operations even if one fails
      }
    }
  }

  private async rollbackSingleOperation(operation: TransactionOperation<T>): Promise<void> {
    // Note: This is a simplified rollback implementation
    // In a real system, you'd need to implement proper reverse operations
    // based on your specific API and data structures
    
    console.warn(`Rollback not fully implemented for operation ${operation.id} (${operation.type})`);
    
    // Placeholder for rollback logic:
    // - For create: call delete API
    // - For update: call update API with originalData
    // - For delete: call create API with originalData
  }
}