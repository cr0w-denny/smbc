import { setupWorker } from "msw/browser";
import type { SetupWorker } from "msw/browser";

let worker: SetupWorker | null = null;
let isStarting = false;
let startPromise: Promise<void> | null = null;

/**
 * Service Worker Manager with auto-recovery capabilities
 * Handles service worker lifecycle and recovery from stale states
 */
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private retryCount = 0;
  private readonly maxRetries = 3;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.setupVisibilityHandler();
    this.setupHealthCheck();
  }

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  /**
   * Initialize the service worker with handlers
   */
  async initialize(handlers: any[]) {
    if (worker || isStarting) {
      console.log("🎭 MSW already initialized or starting");
      return startPromise;
    }

    isStarting = true;
    startPromise = this.startWorker(handlers);
    
    try {
      await startPromise;
    } finally {
      isStarting = false;
    }
    
    return startPromise;
  }

  /**
   * Start the service worker with error recovery
   */
  private async startWorker(handlers: any[]): Promise<void> {
    try {
      worker = setupWorker(...handlers);
      
      // Get base path from environment or default to /
      const basePath = import.meta.env.BASE_URL || '/';
      const serviceWorkerUrl = `${basePath}mockServiceWorker.js`;
      
      await worker.start({
        onUnhandledRequest: "bypass",
        // Force update the service worker to prevent stale states
        serviceWorker: {
          url: serviceWorkerUrl,
          options: {
            // Force update on every page load
            updateViaCache: "none"
          }
        },
        // Reduce delay for faster startup
        waitUntilReady: true
      });

      console.log("🎭 MSW started successfully with", handlers.length, "handlers");
      this.retryCount = 0;
      
      // Reset retry count on successful start
      this.setupRequestInterceptor();
      
    } catch (error) {
      console.error("🎭 MSW failed to start:", error);
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🎭 Retrying MSW start (attempt ${this.retryCount}/${this.maxRetries})...`);
        
        // Clean up and retry
        await this.cleanup();
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
        return this.startWorker(handlers);
      }
      
      throw error;
    }
  }

  /**
   * Setup visibility change handler to refresh service worker
   */
  private setupVisibilityHandler() {
    document.addEventListener("visibilitychange", async () => {
      if (document.visibilityState === "visible" && worker) {
        console.log("🎭 Page became visible, checking MSW health...");
        await this.checkAndRecover();
      }
    });

    // Also handle window focus
    window.addEventListener("focus", async () => {
      if (worker) {
        console.log("🎭 Window focused, checking MSW health...");
        await this.checkAndRecover();
      }
    });
  }

  /**
   * Setup periodic health checks
   */
  private setupHealthCheck() {
    // Clear any existing interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Check every 30 seconds when page is visible
    this.healthCheckInterval = setInterval(async () => {
      if (document.visibilityState === "visible" && worker) {
        await this.checkAndRecover();
      }
    }, 30000);
  }

  /**
   * Setup request interceptor to detect and recover from failures
   */
  private setupRequestInterceptor() {
    // Intercept fetch failures that might indicate service worker issues
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Check if we got an HTML response when expecting JSON
        const url = args[0]?.toString() || "";
        if (url.includes("/api/") && response.headers.get("content-type")?.includes("text/html")) {
          console.warn("🎭 Detected HTML response for API call, attempting recovery...");
          await this.recover();
          // Retry the request
          return originalFetch(...args);
        }
        
        return response;
      } catch (error) {
        // If fetch fails with network error, try recovery
        if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
          console.warn("🎭 Network error detected, attempting recovery...");
          await this.recover();
          // Retry the request once
          return originalFetch(...args);
        }
        throw error;
      }
    };
  }

  /**
   * Check service worker health and recover if needed
   */
  private async checkAndRecover() {
    try {
      // Try a simple health check request
      const response = await fetch("/api/health", { 
        method: "GET",
        // Short timeout to detect issues quickly
        signal: AbortSignal.timeout(5000)
      }).catch(() => null);
      
      // If we get an HTML response or no response, recover
      if (!response || response.headers.get("content-type")?.includes("text/html")) {
        console.warn("🎭 MSW health check failed, recovering...");
        await this.recover();
      }
    } catch (error) {
      console.warn("🎭 MSW health check error:", error);
      await this.recover();
    }
  }

  /**
   * Recover the service worker
   */
  private async recover() {
    if (isStarting) {
      console.log("🎭 Recovery already in progress");
      return startPromise;
    }

    console.log("🎭 Recovering MSW...");
    
    try {
      // Get current handlers before cleanup
      const { handlers } = await import("./generated/mocks");
      
      // Clean up existing worker
      await this.cleanup();
      
      // Reinitialize
      await this.initialize(handlers);
      
      console.log("🎭 MSW recovered successfully");
    } catch (error) {
      console.error("🎭 MSW recovery failed:", error);
    }
  }

  /**
   * Clean up the service worker
   */
  private async cleanup() {
    if (worker) {
      try {
        await worker.stop();
      } catch (error) {
        console.warn("🎭 Error stopping MSW:", error);
      }
      worker = null;
    }
    
    // Also unregister any stale service workers
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        if (registration.scope.includes("mockServiceWorker")) {
          try {
            await registration.unregister();
          } catch (error) {
            console.warn("Failed to unregister service worker:", error);
          }
        }
      }
    }
  }

  /**
   * Get the current worker instance
   */
  getWorker(): SetupWorker | null {
    return worker;
  }

  /**
   * Check if service worker is running
   */
  isRunning(): boolean {
    return worker !== null && !isStarting;
  }
}

export const serviceWorkerManager = ServiceWorkerManager.getInstance();