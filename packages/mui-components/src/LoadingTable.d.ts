import React from 'react';
export interface LoadingTableProps {
    /** Number of rows to show while loading */
    rows?: number;
    /** Number of columns to show while loading */
    columns?: number;
    /** Height of each skeleton row */
    rowHeight?: number;
}
/**
 * A reusable loading table skeleton component that shows
 * placeholder content while data is being fetched
 */
export declare const LoadingTable: React.FC<LoadingTableProps>;
