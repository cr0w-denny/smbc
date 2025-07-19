import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { RowAction } from '@smbc/dataview';

interface ActionsRendererProps extends ICellRendererParams {
  actions: RowAction<any>[];
  onRowClick?: (item: any) => void;
}

export function ActionsRenderer({ data, actions, onRowClick }: ActionsRendererProps) {
  if (!data || !actions?.length) {
    return null;
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {actions.map((action) => {
        // Check if action should be hidden
        if (action.hidden && action.hidden(data)) {
          return null;
        }

        // Check if action should be disabled
        const isDisabled = action.disabled && action.disabled(data);

        const IconComponent = action.icon;
        
        return (
          <button
            key={action.key}
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              if (!isDisabled && action.onClick) {
                action.onClick(data);
              }
            }}
            disabled={isDisabled}
            title={action.label}
            style={{
              border: 'none',
              background: 'none',
              cursor: isDisabled ? 'default' : 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isDisabled ? 0.5 : 1,
              color: getActionColor(action.color),
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {IconComponent && <IconComponent />}
            {!IconComponent && action.label}
          </button>
        );
      })}
    </div>
  );
}

function getActionColor(color?: string): string {
  switch (color) {
    case 'primary':
      return '#1976d2';
    case 'secondary':
      return '#dc004e';
    case 'error':
      return '#d32f2f';
    case 'warning':
      return '#ed6c02';
    case 'info':
      return '#0288d1';
    case 'success':
      return '#2e7d32';
    default:
      return '#666';
  }
}