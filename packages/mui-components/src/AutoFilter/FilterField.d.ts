/**
 * Individual filter field components that map to different input types
 */
import React from 'react';
import { FilterFieldConfig, FilterValues } from './types';
interface FilterFieldProps {
    field: FilterFieldConfig;
    value: any;
    onChange: (name: string, value: any) => void;
    error?: string;
}
export declare const FilterField: React.FC<FilterFieldProps>;
/**
 * Multi-field component for rendering multiple fields in a row
 */
interface FilterFieldGroupProps {
    fields: FilterFieldConfig[];
    values: FilterValues;
    onChange: (name: string, value: any) => void;
    errors: Record<string, string>;
    spacing?: number;
    direction?: 'row' | 'column';
    wrap?: boolean;
}
export declare const FilterFieldGroup: React.FC<FilterFieldGroupProps>;
export {};
