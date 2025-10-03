import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import {
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Send as SendIcon,
  CancelScheduleSend as CancelScheduleSendIcon,
  AssignmentAdd as AssignmentAddIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
} from "@mui/icons-material";
import { useHashNavigation, useFeatureFlag } from "@smbc/applet-core";
import {
  TabBar,
  AppShell,
  Width,
  ActionMenu,
  ActionMenuItem,
  Button,
} from "@smbc/mui-components";
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
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const [activeTab, setActiveTab] = useState("event");
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [workflowMenuOpen, setWorkflowMenuOpen] = useState(false);
  const [eventData, setEventData] = useState<EventData | null>(null);

  // Extract event ID from URL parameters - only accept id param, ignore others
  const { params } = useHashNavigation<{}, { id: string }>({
    draftParams: { id: "" },
    mountPath,
  });
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

  const handleWorkflowAction = (action: string) => {
    console.log("Workflow action:", action, "for event:", eventId);
    // TODO: Implement workflow actions
  };

  const workflowMenuItems: ActionMenuItem[] = [
    {
      label: "Submit for Review",
      icon: <SendIcon fontSize="small" />,
      onClick: () => handleWorkflowAction("submit-review"),
    },
    {
      label: "Revoke Review Request",
      icon: <CancelScheduleSendIcon fontSize="small" />,
      onClick: () => handleWorkflowAction("revoke-review"),
    },
    {
      label: "Reassign Event Owner",
      icon: <AssignmentAddIcon fontSize="small" />,
      onClick: () => handleWorkflowAction("reassign-owner"),
    },
    {
      label: "Reassign Event Approvers",
      icon: <AssignmentTurnedInIcon fontSize="small" />,
      onClick: () => handleWorkflowAction("reassign-approvers"),
    },
  ];

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
      <AppShell.Toolbar darkMode={isDarkMode} variant="extended">
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

              <ActionMenu
                trigger={
                  <Button
                    variant="contained"
                    endIcon={
                      workflowMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                  >
                    Workflow
                  </Button>
                }
                menuItems={workflowMenuItems}
                onMenuOpen={() => setWorkflowMenuOpen(true)}
                onMenuClose={() => setWorkflowMenuOpen(false)}
              />
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
