import type { TransactionManager } from './types';

// Global transaction manager registry - avoids React re-render loops
class TransactionRegistryClass {
  private managers = new Map<string, TransactionManager<any>>();
  private listeners = new Set<() => void>();

  register(id: string, manager: TransactionManager<any>) {
    if (this.managers.has(id)) return; // Already registered
    
    this.managers.set(id, manager);
    console.log(`📝 Registered transaction manager: ${id}`);
    this.notifyListeners();
  }

  unregister(id: string) {
    if (!this.managers.has(id)) return; // Not registered
    
    this.managers.delete(id);
    console.log(`🗑️ Unregistered transaction manager: ${id}`);
    this.notifyListeners();
  }

  getAllManagers(): TransactionManager<any>[] {
    return Array.from(this.managers.values());
  }

  getCombinedSummary() {
    const combined = { 
      total: 0, 
      byType: { create: 0, update: 0, delete: 0 }, 
      byTrigger: { 'user-edit': 0, 'bulk-action': 0, 'row-action': 0 }, 
      entities: [] as string[]
    };
    
    for (const manager of this.managers.values()) {
      const summary = manager.getSummary();
      combined.total += summary.total;
      combined.byType.create += summary.byType.create || 0;
      combined.byType.update += summary.byType.update || 0;
      combined.byType.delete += summary.byType.delete || 0;
      combined.byTrigger['user-edit'] += summary.byTrigger['user-edit'] || 0;
      combined.byTrigger['bulk-action'] += summary.byTrigger['bulk-action'] || 0;
      combined.byTrigger['row-action'] += summary.byTrigger['row-action'] || 0;
      combined.entities.push(...summary.entities);
    }
    
    return combined;
  }

  // Add listener for changes
  addListener(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Commit all transactions
  async commitAll() {
    const managers = this.getAllManagers();
    console.log(`🚀 Committing ${managers.length} transactions`);
    
    for (const manager of managers) {
      const operationCount = manager.getOperations().length;
      console.log(`📋 Manager has ${operationCount} operations, canCommit: ${manager.canCommit()}`);
      
      if (manager.canCommit()) {
        try {
          console.log(`✅ Committing manager with ${operationCount} operations`);
          await manager.commit(true); // Force commit
          console.log(`✅ Committed successfully`);
        } catch (error) {
          console.error('❌ Failed to commit transaction:', error);
        }
      }
    }
    
    // Notify listeners after commit
    this.notifyListeners();
  }

  // Cancel all transactions
  cancelAll() {
    const managers = this.getAllManagers();
    console.log(`❌ Cancelling ${managers.length} transactions`);
    
    for (const manager of managers) {
      const operationCount = manager.getOperations().length;
      console.log(`📋 Manager has ${operationCount} operations, hasOperations: ${manager.hasOperations()}`);
      
      if (manager.hasOperations()) {
        console.log(`❌ Cancelling manager with ${operationCount} operations`);
        manager.cancel();
        console.log(`❌ Cancelled successfully`);
      }
    }
    
    // Notify listeners after cancel
    this.notifyListeners();
  }
}

// Global singleton instance
export const TransactionRegistry = new TransactionRegistryClass();