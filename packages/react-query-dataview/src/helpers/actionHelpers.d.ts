import type { BulkAction, RowAction } from "../types";
/**
 * Helper function to create a bulk delete action
 */
export declare function createBulkDeleteAction<T extends {
    id: string | number;
}>(deleteAPI: (id: string | number) => Promise<any>, options?: {
    key?: string;
    label?: string;
    icon?: React.ComponentType;
}): BulkAction<T>;
/**
 * Helper function to create a bulk update action
 */
export declare function createBulkUpdateAction<T extends {
    id: string | number;
}>(updateAPI: (id: string | number, data: Partial<T>) => Promise<any>, updateData: Partial<T>, options?: {
    key?: string;
    label?: string;
    icon?: React.ComponentType;
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
}): BulkAction<T>;
/**
 * Helper function to create a row update action
 */
export declare function createRowUpdateAction<T extends {
    id: string | number;
}>(updateAPI: (id: string | number, data: Partial<T>) => Promise<any>, getUpdateData: (item: T) => Partial<T>, options: {
    key: string;
    label: string;
    icon?: React.ComponentType;
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
    disabled?: (item: T) => boolean;
    hidden?: (item: T) => boolean;
}): RowAction<T>;
/**
 * Helper function to create a row delete action
 */
export declare function createRowDeleteAction<T extends {
    id: string | number;
}>(deleteAPI: (id: string | number) => Promise<any>, options?: {
    key?: string;
    label?: string;
    icon?: React.ComponentType;
    disabled?: (item: T) => boolean;
    hidden?: (item: T) => boolean;
}): RowAction<T>;
/**
 * Helper function to create a toggle status action
 */
export declare function createToggleStatusAction<T extends {
    id: string | number;
}>(updateAPI: (id: string | number, data: Partial<T>) => Promise<any>, statusField: keyof T, statusValues: [any, any], // [activeValue, inactiveValue]
options: {
    key: string;
    label: string;
    icon?: React.ComponentType;
    getLabel?: (item: T) => string;
    disabled?: (item: T) => boolean;
    hidden?: (item: T) => boolean;
}): RowAction<T>;
//# sourceMappingURL=actionHelpers.d.ts.map