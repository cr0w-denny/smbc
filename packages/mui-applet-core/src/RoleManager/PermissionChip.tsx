import { Chip, styled } from "@mui/material";
import type { Permission } from "./types";

const StyledPermissionChip = styled(Chip)`
  font-weight: bold;
`;

interface PermissionChipProps {
  permission: Permission;
}

export function PermissionChip({ permission }: PermissionChipProps) {
  const isNoPermissions = permission.key === 'no-permissions';
  
  return (
    <StyledPermissionChip
      label={permission.label}
      color={permission.hasAccess ? "success" : "default"}
      variant={permission.hasAccess ? "filled" : "outlined"}
      size="small"
      sx={{
        justifyContent: "center",
        width: "100%",
        fontStyle: isNoPermissions ? "italic" : "normal",
        opacity: isNoPermissions ? 0.7 : 1,
        "& .MuiChip-label": {
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
        },
      }}
    />
  );
}