/**
 * Debug utilities for troubleshooting component behavior
 * Outputs structured logs that can be easily inspected
 */

/**
 * Generate a session ID with unique suffix for better filtering
 * Format: description-1234
 */
export function createSessionId(description: string): string {
  const counter = Date.now() % 10000; // Last 4 digits of timestamp
  return `${description}-${counter}`;
}

interface DebugEntry {
  id: string;
  timestamp: string;
  component: string;
  event: string;
  category:
    | "user-action"
    | "component-render"
    | "state-change"
    | "api-call"
    | "navigation"
    | "error"
    | "performance"
    | "debug";
  level: "trace" | "debug" | "info" | "warn" | "error";
  data: any;
  context?: {
    userId?: string;
    userRoles?: string[];
    currentPath?: string;
    currentApplet?: string;
    renderCount?: number;
    componentStack?: string[];
    actionId?: string; // Links related events together
  };
  timing?: {
    duration?: number;
    startTime?: number;
    endTime?: number;
  };
  stack?: string;
}

class DebugLogger {
  private logs: DebugEntry[] = [];
  private isEnabled = process.env.NODE_ENV === "development";
  private componentRenderCounts = new Map<string, number>();
  private currentActionId: string | null = null;
  private actionStartTime: number | null = null;

  log(
    id: string,
    component: string,
    event: string,
    data: any = {},
    options: {
      category?: DebugEntry["category"];
      level?: DebugEntry["level"];
      context?: DebugEntry["context"];
      timing?: DebugEntry["timing"];
    } = {},
  ) {
    if (!this.isEnabled) return;

    // Prevent debug system from tracking itself to avoid infinite loops
    if (
      component.includes("Debug") ||
      component.includes("DevConsole") ||
      component.includes("Profiler") ||
      component === "DebugLogger" ||
      component === "ComponentTracker" ||
      component === "DOMEventTracker"
    ) {
      return;
    }

    const {
      category = this.inferCategory(event),
      level = this.inferLevel(event, category),
      context = this.getDefaultContext(),
      timing,
    } = options;

    const entry: DebugEntry = {
      id,
      timestamp: new Date().toISOString(),
      component,
      event,
      category,
      level,
      data: JSON.parse(JSON.stringify(data)), // Deep clone to avoid reference issues
      context: {
        ...context,
        actionId: this.currentActionId || undefined,
        renderCount: this.componentRenderCounts.get(component) || 0,
      },
      timing,
      stack:
        level === "error"
          ? new Error().stack?.split("\n").slice(2, 8).join("\n")
          : undefined,
    };

    // Track component renders
    if (category === "component-render") {
      this.trackComponentRender(component);
    }

    this.logs.push(entry);

    // Send to Vite plugin for file logging
    this.sendToVite(entry);

    // Enhanced console output
    this.logToConsole(entry);

    // Keep only last 200 entries to prevent memory issues
    if (this.logs.length > 200) {
      this.logs = this.logs.slice(-200);
    }

    // Write to window for inspection
    (window as any).__debugLogs = this.logs;

    // Check for render loops
    this.checkRenderLoop(component, category);
  }

  // Start tracking a user action
  startAction(actionId: string, component: string, description: string) {
    this.currentActionId = actionId;
    this.actionStartTime = Date.now();

    this.log(
      actionId,
      component,
      "action-start",
      { description },
      {
        category: "user-action",
        level: "info",
      },
    );
  }

  // End tracking a user action
  endAction() {
    if (this.currentActionId && this.actionStartTime) {
      const duration = Date.now() - this.actionStartTime;

      this.log(
        this.currentActionId,
        "ActionTracker",
        "action-end",
        {
          actionId: this.currentActionId,
          duration,
        },
        {
          category: "user-action",
          level: "info",
          timing: {
            duration,
            startTime: this.actionStartTime,
            endTime: Date.now(),
          },
        },
      );
    }

    this.currentActionId = null;
    this.actionStartTime = null;
  }

  private trackComponentRender(component: string) {
    const count = (this.componentRenderCounts.get(component) || 0) + 1;
    this.componentRenderCounts.set(component, count);
  }

  private checkRenderLoop(component: string, category: DebugEntry["category"]) {
    if (category !== "component-render") return;
    const recentRenders = this.logs.filter(
      (log) =>
        log.component === component &&
        log.category === "component-render" &&
        Date.now() - new Date(log.timestamp).getTime() < 2000, // Last 2 seconds
    );

    if (recentRenders.length > 15) {
      this.log(
        `${component}-render-loop`,
        "RenderLoopDetector",
        "render-loop-detected",
        {
          component,
          renderCount: recentRenders.length,
          recentRenders: recentRenders.slice(-5), // Last 5 renders
        },
        {
          category: "error",
          level: "error",
        },
      );

      // Also log to console prominently
      console.error(`RENDER LOOP DETECTED: ${component}`, {
        renderCount: recentRenders.length,
        component,
      });
    }
  }

  private inferCategory(event: string): DebugEntry["category"] {
    if (
      event.includes("render") ||
      event.includes("mount") ||
      event.includes("update")
    ) {
      return "component-render";
    }
    if (
      event.includes("click") ||
      event.includes("submit") ||
      event.includes("change")
    ) {
      return "user-action";
    }
    if (
      event.includes("api") ||
      event.includes("fetch") ||
      event.includes("request")
    ) {
      return "api-call";
    }
    if (
      event.includes("navigate") ||
      event.includes("route") ||
      event.includes("path")
    ) {
      return "navigation";
    }
    if (
      event.includes("state") ||
      event.includes("store") ||
      event.includes("context")
    ) {
      return "state-change";
    }
    if (
      event.includes("error") ||
      event.includes("fail") ||
      event.includes("exception")
    ) {
      return "error";
    }
    if (
      event.includes("performance") ||
      event.includes("timing") ||
      event.includes("memory")
    ) {
      return "performance";
    }
    return "debug";
  }

  private inferLevel(
    event: string,
    category: DebugEntry["category"],
  ): DebugEntry["level"] {
    if (
      category === "error" ||
      event.includes("error") ||
      event.includes("fail")
    ) {
      return "error";
    }
    if (
      event.includes("warn") ||
      event.includes("slow") ||
      event.includes("deprecated")
    ) {
      return "warn";
    }
    if (category === "user-action" || category === "navigation") {
      return "info";
    }
    return "debug";
  }

  private getDefaultContext(): DebugEntry["context"] {
    try {
      // Try to get context from various sources
      const currentPath = window.location.pathname;
      const userContext = (window as any).__userContext;

      return {
        currentPath,
        userId: userContext?.id,
        userRoles: userContext?.roles,
        currentApplet: this.getCurrentApplet(currentPath),
      };
    } catch {
      return {};
    }
  }

  private getCurrentApplet(path: string): string | undefined {
    if (path.startsWith("/events")) return "ewi-events";
    if (path.startsWith("/obligor-dashboard")) return "ewi-obligor";
    if (path.startsWith("/usage-stats")) return "usage-stats";
    return undefined;
  }

  private logToConsole(entry: DebugEntry) {
    const message = `${entry.component}:${entry.event}`;
    const details = {
      id: entry.id,
      category: entry.category,
      level: entry.level,
      data: entry.data,
      context: entry.context,
    };

    if (entry.level === "error") {
      console.error(message, details);
    } else if (entry.level === "warn") {
      console.warn(message, details);
    } else {
      console.log(message, details);
    }
  }

  private async sendToVite(entry: DebugEntry) {
    try {
      await fetch("/__devtools/debug-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fail silently - debug logging shouldn't break the app
      console.warn("Debug log failed to send:", error);
    }
  }

  getLogs(id?: string, component?: string): DebugEntry[] {
    let filtered = this.logs;

    if (id) {
      filtered = filtered.filter((log) => log.id === id);
    }

    if (component) {
      filtered = filtered.filter((log) => log.component === component);
    }

    return filtered;
  }

  getSequence(id: string): DebugEntry[] {
    return this.logs
      .filter((log) => log.id === id)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
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
    log: (event: string, data?: any) =>
      debug.log(debugId, component, event, data),
    sequence: () => debug.getSequence(debugId),
    export: () => debug.exportLogs(debugId),
  };
}

// Global debug helpers available in console
(window as any).__debug = {
  logs: () => debug.getLogs(),
  sequence: (id: string) => debug.getSequence(id),
  export: (id?: string) => debug.exportLogs(id),
  clear: () => debug.clear(),
  component: (name: string) => debugComponent(name),
};

// Export for inspection
export { DebugLogger };
export type { DebugEntry };
