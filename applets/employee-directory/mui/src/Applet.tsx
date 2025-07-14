// employee-directory/src/Applet.tsx
import { MuiDataViewApplet } from "@smbc/mui-applet-core";
import { usePermissions } from "@smbc/applet-core";
import { createAppletConfig } from "./config";
import permissions from "./permissions";

export interface AppletProps {
  mountPath: string;
}

export const Applet: React.FC<AppletProps> = ({ mountPath: _mountPath }) => {
  // Get permissions for the current context
  const { hasPermission } = usePermissions();

  // Create the configuration
  const config = createAppletConfig({
    permissions: {
      canCreate: hasPermission("employee-directory", permissions.MANAGE_EMPLOYEES),
      canEdit: hasPermission("employee-directory", permissions.EDIT_EMPLOYEES),
      canDelete: hasPermission("employee-directory", permissions.MANAGE_EMPLOYEES),
    },
  });

  // Event handlers
  const handleSuccess = (
    _action: "create" | "edit" | "delete",
    _item?: any,
  ) => {
    // TODO: Add toast notification or snackbar
  };

  const handleError = (
    action: "create" | "edit" | "delete",
    error: any,
    item?: any,
  ) => {
    console.error(`Error: ${action}`, error, item);
    // TODO: Add error notification
  };

  return (
    <MuiDataViewApplet
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