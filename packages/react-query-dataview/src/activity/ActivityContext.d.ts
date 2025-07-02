import React from "react";
import type { ActivityConfig, ActivityContextValue } from "./types";
export interface ActivityProviderProps {
    children: React.ReactNode;
    config?: ActivityConfig;
}
export declare function ActivityProvider({ children, config, }: ActivityProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useActivity(): ActivityContextValue;
//# sourceMappingURL=ActivityContext.d.ts.map