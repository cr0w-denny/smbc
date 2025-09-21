import React from "react";
import { Box, IconButton, Link } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { Card } from "@smbc/mui-components";
import type { CardMenuItem } from "@smbc/mui-components";
import { Table } from "@smbc/mui-components";

export type AttachmentRow = {
  fileName: string;
  href?: string;
  comments?: string;
  onRemove?: () => void;
};

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <PictureAsPdfOutlinedIcon color="error" fontSize="small" />;
    default:
      return <DescriptionOutlinedIcon color="action" fontSize="small" />;
  }
};

export const AttachmentsCard: React.FC<{
  rows: AttachmentRow[];
  menuItems?: CardMenuItem[];
}> = ({ rows, menuItems }) => (
  <Card title="Event Attachments" menuItems={menuItems}>
    <Table
      columns={[
        {
          header: "File Name",
          render: (r: AttachmentRow) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {getFileIcon(r.fileName)}
              {r.href ? (
                <Link href={r.href} underline="hover">
                  {r.fileName}
                </Link>
              ) : (
                <Link
                  href="#"
                  underline="hover"
                  onClick={(e) => e.preventDefault()}
                >
                  {r.fileName}
                </Link>
              )}
            </Box>
          ),
        },
        { header: "Comments", render: (r) => r.comments ?? "—" },
        {
          header: "",
          width: 56,
          align: "right",
          render: (r) =>
            r.onRemove ? (
              <IconButton
                size="small"
                aria-label="Remove attachment"
                onClick={r.onRemove}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            ) : null,
        },
      ]}
      rows={rows}
    />
  </Card>
);
