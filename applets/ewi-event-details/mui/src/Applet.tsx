import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Send as SendIcon,
  CancelScheduleSend as CancelScheduleSendIcon,
  AssignmentAdd as AssignmentAddIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
} from "@mui/icons-material";
import { AppletPage } from "@smbc/mui-applet-core";
import { useHashNavigation } from "@smbc/applet-core";
import { TabBar } from "@smbc/mui-components";
import type { TabBarItem } from "@smbc/mui-components";
import { EventTab } from "./components/EventTab";
import { TriggerTab } from "./components/TriggerTab";
import { ObligorTab } from "./components/ObligorTab";
import { ActivityTab } from "./components/ActivityTab";
import { RelatedTab } from "./components/RelatedTab";
import { EditorPanel } from "./components/EditorPanel";
import { fetchEventData, type EventData } from "./data";

export interface AppletProps {
  mountPath: string;
  children?: React.ReactNode;
}

const tabs: TabBarItem[] = [
  { value: "event", label: "Event" },
  { value: "trigger", label: "Trigger" },
  { value: "obligor", label: "Obligor" },
  { value: "activity", label: "Activity" },
  { value: "related", label: "Related" },
];

export const Applet: React.FC<AppletProps> = ({ mountPath }) => {
  const [activeTab, setActiveTab] = useState("event");
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [workflowMenuAnchorEl, setWorkflowMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);

  // Extract event ID from URL parameters
  const { params } = useHashNavigation({ mountPath });
  const eventId = params.id;

  // Fetch event data at the top level
  useEffect(() => {
    if (eventId) {
      fetchEventData(eventId).then(setEventData);
    }
  }, [eventId]);

  const handleWorkflowMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setWorkflowMenuAnchorEl(event.currentTarget);
  };

  const handleWorkflowMenuClose = () => {
    setWorkflowMenuAnchorEl(null);
  };

  const handleWorkflowAction = (action: string) => {
    console.log("Workflow action:", action, "for event:", eventId);
    handleWorkflowMenuClose();
    // TODO: Implement workflow actions
  };

  const handleSave = () => {
    console.log("Save event:", eventId);
    // TODO: Implement save functionality
  };

  const renderTabContent = () => {
    if (!eventData) return null;

    switch (activeTab) {
      case "event":
        return <EventTab data={eventData} />;
      case "trigger":
        return <TriggerTab data={eventData} />;
      case "obligor":
        return <ObligorTab data={eventData} />;
      case "activity":
        return <ActivityTab data={eventData} />;
      case "related":
        return <RelatedTab />;
      default:
        return <EventTab data={eventData} />;
    }
  };

  return (
    <AppletPage
      maxWidth={{ xs: "96%", sm: "96%", md: "88%", lg: "88%", xl: "92%" }}
      bgExtended
      toolbarHeight={78}
      toolbar={
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Left-aligned tabs */}
          <TabBar
            items={tabs}
            value={activeTab}
            onChange={setActiveTab}
            size="medium"
          />

          {/* Right-aligned buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Save
            </Button>

            <Button
              variant="contained"
              endIcon={
                Boolean(workflowMenuAnchorEl) ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )
              }
              onClick={handleWorkflowMenuOpen}
            >
              Workflow
            </Button>

            <Menu
              anchorEl={workflowMenuAnchorEl}
              open={Boolean(workflowMenuAnchorEl)}
              onClose={handleWorkflowMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              sx={{
                mt: 1,
                "& .MuiPaper-root": {
                  boxShadow:
                    "0px 2px 4px rgba(0,0,0,0.1), 0px 4px 8px rgba(0,0,0,0.08)",
                },
              }}
            >
              <MenuItem onClick={() => handleWorkflowAction("submit-review")}>
                <ListItemIcon>
                  <SendIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Submit for Review</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleWorkflowAction("revoke-review")}>
                <ListItemIcon>
                  <CancelScheduleSendIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Revoke Review Request</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleWorkflowAction("reassign-owner")}>
                <ListItemIcon>
                  <AssignmentAddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Reassign Event Owner</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => handleWorkflowAction("reassign-approvers")}
              >
                <ListItemIcon>
                  <AssignmentTurnedInIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Reassign Event Approvers</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      }
    >
      <Box
        sx={{
          display: "flex",
          height: "100%",
          minHeight: "calc(100vh - 350px)",
          position: "relative",
          gap: "30px",
        }}
      >
        {!isEditorMaximized && renderTabContent()}

        <Box
          sx={{
            flex: 1,
            position: "sticky",
            top: "184px", // TopNav (104px) + Fixed Toolbar (80px)
            height: "calc(100vh - 210px)",
          }}
        >
          <EditorPanel
            isMaximized={isEditorMaximized}
            onToggleMaximize={() => setIsEditorMaximized(!isEditorMaximized)}
          />
        </Box>
      </Box>
    </AppletPage>
  );
};

export default Applet;
