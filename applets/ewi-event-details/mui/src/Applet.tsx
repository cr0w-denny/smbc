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
import { useHashNavigation } from "@smbc/applet-core";
import { TabBar, AppShell, Width } from "@smbc/mui-components";
import { shadow } from "@smbc/ui-core";
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

  // Extract event ID from URL parameters - only accept id param, ignore others
  const { params } = useHashNavigation<{}, { id: string }>(
    {},
    { id: "" },
    { mountPath },
  );
  const eventId = params.id;

  // Debug logging
  useEffect(() => {
    console.log("EventDetails: params =", params, "eventId =", eventId);
  }, [params, eventId]);

  // Fetch event data at the top level
  useEffect(() => {
    if (eventId) {
      console.log("EventDetails: Fetching data for event ID:", eventId);
      fetchEventData(eventId).then((data) => {
        console.log("EventDetails: Data loaded:", data);
        setEventData(data);
      });
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
    if (!eventData) {
      return (
        <Box sx={{ p: 3 }}>
          {eventId ? "Loading event data..." : "No event ID provided"}
        </Box>
      );
    }

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
    <AppShell.Page>
      <AppShell.Toolbar>
        <Width>
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
                    boxShadow: shadow.md,
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
                <MenuItem
                  onClick={() => handleWorkflowAction("reassign-owner")}
                >
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
        </Width>
      </AppShell.Toolbar>

      <AppShell.Content>
        <Width>
          <Box
            sx={{
              display: "flex",
              minHeight: "100vh",
              position: "relative",
              gap: "30px",
            }}
          >
            {!isEditorMaximized && (
              <Box
                sx={{
                  flex: { xs: 1.2, sm: 1.2, md: 1, lg: 1, xl: 1 },
                  minWidth: { xs: "400px", sm: "500px", md: "600px" },
                  pb: 2,
                }}
              >
                {renderTabContent()}
              </Box>
            )}

            <Box
              sx={{
                flex: isEditorMaximized
                  ? 1
                  : { xs: 0.8, sm: 0.8, md: 1, lg: 1, xl: 1 },
                minWidth: isEditorMaximized
                  ? "100%"
                  : { xs: "280px", sm: "320px", md: "400px" },
                width: isEditorMaximized ? "100%" : "auto",
                position: "sticky",
                top: "calc(var(--appshell-header-height, 104px) + var(--appshell-toolbar-height, 80px) + 16px)",
                height:
                  "calc(100vh - var(--appshell-header-height, 104px) - var(--appshell-toolbar-height, 80px) - 32px)",
              }}
            >
              <EditorPanel
                isMaximized={isEditorMaximized}
                onToggleMaximize={() =>
                  setIsEditorMaximized(!isEditorMaximized)
                }
              />
            </Box>
          </Box>
        </Width>
      </AppShell.Content>
    </AppShell.Page>
  );
};

export default Applet;
