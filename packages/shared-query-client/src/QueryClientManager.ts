import { QueryClient } from "@tanstack/react-query";

// Singleton QueryClient manager
class QueryClientManager {
  private static instance: QueryClientManager;
  private queryClient: QueryClient | null = null;
  private isExternalClient = false;

  private constructor() {}

  static getInstance(): QueryClientManager {
    if (!QueryClientManager.instance) {
      QueryClientManager.instance = new QueryClientManager();
    }
    return QueryClientManager.instance;
  }

  // Get or create the QueryClient
  getQueryClient(): QueryClient {
    if (!this.queryClient) {
      this.queryClient = this.createDefaultQueryClient();
      this.isExternalClient = false;
    }
    return this.queryClient;
  }

  // Set an external QueryClient (from host app)
  setQueryClient(client: QueryClient): void {
    this.queryClient = client;
    this.isExternalClient = true;
  }

  // Check if using external client
  isUsingExternalClient(): boolean {
    return this.isExternalClient;
  }

  // Reset to default client (useful for testing)
  resetToDefault(): void {
    if (!this.isExternalClient) {
      this.queryClient = this.createDefaultQueryClient();
    }
  }

  private createDefaultQueryClient(): QueryClient {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          retry: (failureCount, error: any) => {
            // Don't retry on 4xx errors (client errors)
            if (error?.status >= 400 && error?.status < 500) {
              return false;
            }
            // Retry up to 3 times for other errors
            return failureCount < 3;
          },
          retryDelay: (attemptIndex) =>
            Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
          retry: (failureCount, error: any) => {
            // Don't retry mutations on 4xx errors
            if (error?.status >= 400 && error?.status < 500) {
              return false;
            }
            // Retry once for network errors
            return failureCount < 1;
          },
        },
      },
    });
  }
}

export default QueryClientManager;
