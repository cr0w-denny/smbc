import { QueryClient } from '@tanstack/react-query';
declare class QueryClientManager {
    private static instance;
    private queryClient;
    private isExternalClient;
    private constructor();
    static getInstance(): QueryClientManager;
    getQueryClient(): QueryClient;
    setQueryClient(client: QueryClient): void;
    isUsingExternalClient(): boolean;
    resetToDefault(): void;
    private createDefaultQueryClient;
}
export default QueryClientManager;
//# sourceMappingURL=QueryClientManager.d.ts.map