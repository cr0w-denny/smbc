/**
 * Debug utilities for troubleshooting component behavior
 * Outputs structured logs that can be easily inspected
 */

/**
 * Generate a session ID with timestamp prefix for better filtering
 * Format: HH:MM:SS-description
 */
export function createSessionId(description: string): string {
  const now = new Date();
  const timePrefix = now.toTimeString().slice(0, 8); // HH:MM:SS
  return `${timePrefix}-${description}`;
}

interface DebugEntry {
  id: string;
  timestamp: string;
  component: string;
  event: string;
  data: any;
  stack?: string;
}

class DebugLogger {
  private logs: DebugEntry[] = [];
  private isEnabled = process.env.NODE_ENV === 'development';

  log(id: string, component: string, event: string, data: any = {}) {
    if (!this.isEnabled) return;

    const entry: DebugEntry = {
      id,
      timestamp: new Date().toISOString(),
      component,
      event,
      data: JSON.parse(JSON.stringify(data)), // Deep clone to avoid reference issues
      stack: new Error().stack?.split('\n').slice(2, 5).join('\n') // Get call stack
    };

    this.logs.push(entry);

    // Send to Vite plugin for file logging using dev-tools specific endpoint
    this.sendToVite(id, component, event, data);

    // Console output for immediate viewing (minimal)
    console.log(`🐛 ${component}:${event} [${id}]`, data);

    // Keep only last 100 entries to prevent memory issues
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    // Write to window for inspection
    (window as any).__debugLogs = this.logs;
  }

  private async sendToVite(sessionId: string, component: string, event: string, data: any) {
    try {
      await fetch('/__devtools/debug-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          component,
          event,
          data
        })
      });
    } catch (error) {
      // Fail silently - debug logging shouldn't break the app
      console.warn('Debug log failed to send:', error);
    }
  }

  getLogs(id?: string, component?: string): DebugEntry[] {
    let filtered = this.logs;

    if (id) {
      filtered = filtered.filter(log => log.id === id);
    }

    if (component) {
      filtered = filtered.filter(log => log.component === component);
    }

    return filtered;
  }

  getSequence(id: string): DebugEntry[] {
    return this.logs.filter(log => log.id === id).sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  exportLogs(id?: string): string {
    const logs = id ? this.getSequence(id) : this.logs;
    return JSON.stringify(logs, null, 2);
  }

  clear() {
    this.logs = [];
    delete (window as any).__debugLogs;
  }
}

export const debug = new DebugLogger();
export const debugLogger = debug; // Alias for backwards compatibility

// Helper function for common debug patterns
export function debugComponent(component: string, id?: string) {
  const debugId = id || `${component}-${Date.now()}`;

  return {
    id: debugId,
    log: (event: string, data?: any) => debug.log(debugId, component, event, data),
    sequence: () => debug.getSequence(debugId),
    export: () => debug.exportLogs(debugId)
  };
}

// Global debug helpers available in console
(window as any).__debug = {
  logs: () => debug.getLogs(),
  sequence: (id: string) => debug.getSequence(id),
  export: (id?: string) => debug.exportLogs(id),
  clear: () => debug.clear(),
  component: (name: string) => debugComponent(name)
};

// Export for inspection
export { DebugLogger };
export type { DebugEntry };