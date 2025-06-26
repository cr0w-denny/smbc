import React from 'react';
interface NavigationDrawerProps {
    open: boolean;
    onClose: () => void;
    width: number;
    variant?: 'permanent' | 'persistent' | 'temporary';
}
export declare const NavigationDrawer: React.FC<NavigationDrawerProps>;
export {};
