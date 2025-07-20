// employee-directory/src/Applet.tsx
import { MuiDataViewApplet } from "@smbc/mui-applet-core";
import { usePermissions, useFeatureFlag, type Environment } from "@smbc/applet-core";
import { useAppletConfig } from "./config";
import permissions from "./permissions";

export interface AppletProps {
  mountPath: string;
}

export const Applet: React.FC<AppletProps> = ({ mountPath: _mountPath }) => {
  console.log('🚨 FOCUS_DEBUG EmployeeDirectory render:', {
    mountPath: _mountPath,
    timestamp: Date.now()
  });
  
  // Get current environment to force remount when it changes
  const environment = useFeatureFlag<Environment>("environment") || "mock";
  
  // Get permissions for the current context
  const { hasPermission } = usePermissions();

  // Create the configuration
  const config = useAppletConfig({
    permissions: {
      canCreate: hasPermission("employee-directory", permissions.MANAGE_EMPLOYEES),
      canEdit: hasPermission("employee-directory", permissions.EDIT_EMPLOYEES),
      canDelete: hasPermission("employee-directory", permissions.MANAGE_EMPLOYEES),
    },
  });
  
  console.log('🔍 EmployeeDirectory config created:', {
    config: !!config,
    timestamp: Date.now()
  });

  // Event handlers
  const handleSuccess = (
    _action: "create" | "edit" | "delete",
    _item?: any,
  ) => {
    console.log('🔍 EmployeeDirectory handleSuccess:', {
      action: _action,
      item: _item,
      timestamp: Date.now()
    });
    // TODO: Add toast notification or snackbar
  };

  const handleError = (
    action: "create" | "edit" | "delete",
    error: any,
    item?: any,
  ) => {
    console.log('🔍 EmployeeDirectory handleError:', {
      action,
      error,
      item,
      timestamp: Date.now()
    });
    console.error(`Error: ${action}`, error, item);
    // TODO: Add error notification
  };

  console.log('🔍 EmployeeDirectory rendering MuiDataViewApplet:', {
    timestamp: Date.now()
  });

  return (
    <MuiDataViewApplet
      key={`employee-directory-${environment}`}
      config={config}
      permissionContext="employee-directory"
      onSuccess={handleSuccess}
      onError={handleError}
      options={{
        transaction: {
          enabled: true,
          requireConfirmation: true,
          allowPartialSuccess: true,
          emitActivities: true,
        },
      }}
    />
  );
};