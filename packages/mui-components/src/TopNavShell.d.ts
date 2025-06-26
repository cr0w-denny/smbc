import React from 'react';
export interface TopNavShellProps {
    children?: React.ReactNode;
    logo?: React.ReactNode;
    appName?: string;
    hideNavigation?: boolean;
    elevation?: number;
}
export declare const TopNavShell: React.FC<TopNavShellProps>;
