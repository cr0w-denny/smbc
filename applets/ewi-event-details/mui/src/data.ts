import type { KV } from "@smbc/mui-components";
import type { TriggerValueRow } from "./components/TriggerValuesCard";
import type { AttachmentRow } from "./components/AttachmentsCard";
import type { ActivityRow } from "./components/ActivityCard";

export interface EventData {
  eventDetails: KV[];
  triggerDetails: KV[];
  triggerValues: TriggerValueRow[];
  obligorDetails: KV[];
  attachments: AttachmentRow[];
  activity: ActivityRow[];
}

// This will be replaced with API calls from typespec-generated client
export const fetchEventData = async (_eventId: string): Promise<EventData> => {
  // TODO: Replace with actual API call
  // const response = await apiClient.get(`/events/${eventId}`);
  // return response.data;

  // Temporary data until API is connected
  await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate network delay

  return {
    eventDetails: [
      { label: "Obligor Name", value: "COTY Inc" },
      { label: "Obligor SUN ID", value: "123455" },
      { label: "Internal Grade", value: "G3A" },
      { label: "Exposure Amount", value: "$140MM" },
      { label: "Date", value: "12-Jan-2025" },
      { label: "Category", value: "Mandatory" },
      { label: "Workflow Status", value: "1 LOD Review" },
      { label: "Lifecycle Status", value: "Past Due" },
      { label: "Trigger Rules Desc.", value: "Ratings Down…" },
      { label: "Trigger Rule Type", value: "ExRatings" },
      { label: "Reference #", value: "EVNT1234" },
      { label: "Adhoc Monitoring", value: "Yes" },
      { label: "Credit Implication", value: "Negative" },
      { label: "GBR Application #", value: "GBR3456" },
      { label: "Resolution Date", value: "16-Mar-2025" },
      { label: "Deadline Extension", value: "Yes" },
      { label: "Reviewer Comments", value: "Negative" },
      { label: "2 LOD Reviewer…", value: "Monitoring…" },
    ],

    triggerDetails: [
      {
        label: "Event Trigger Rule Description",
        value: "Ratings Downgrade by 1 Notch",
      },
      { label: "Event Trigger Rule Shortname", value: "RTNG_DOWN_1NOTCH" },
      { label: "Event Trigger Rule Type", value: "ExRatings" },
      { label: "Event Trigger Reference Number", value: "TRIG3456" },
      {
        label: "Event Trigger Condition",
        value:
          "Moody LT Rating Current - Moody LT Rating 1Day > 1 OR S&P LT Rating Current - S&P LT Rating 1Day > 1 OR Fitch LT Rating Current - Fitch LT Rating 1Day > 1",
      },
    ],

    triggerValues: [
      { attribute: "Moody LT Rating Current", value: "AA" },
      { attribute: "Moody LT Rating 1Day", value: "A" },
      { attribute: "S&P LT Rating Current", value: "AA" },
      { attribute: "S&P LT Rating 1Day", value: "A" },
      { attribute: "Fitch LT Rating Current", value: "AA" },
      { attribute: "Fitch LT Rating 1Day", value: "A" },
    ],

    obligorDetails: [
      { label: "Obligor Name", value: "COTY INC" },
      { label: "Obligor SUN ID", value: "126522" },
      { label: "Internal Grade", value: "G3A" },
      { label: "External Rating", value: "AA" },
      { label: "Industry Group", value: "DIA" },
      { label: "Sector", value: "Technology" },
      { label: "Country", value: "US" },
      { label: "Relationship Manager", value: "Rob Lynn" },
      { label: "Primary Lending Office", value: "CIBC" },
      { label: "Primary Booking Office", value: "FSAD" },
      { label: "Credit Officer", value: "Bob Ramos" },
      { label: "1 LOD Analyst", value: "Rob Lynn" },
      { label: "1 LOD Reviewer", value: "John Costos" },
      { label: "2 LOD Reviewer", value: "Bob Ramos" },
      { label: "Exposure Amount", value: "$140MM" },
    ],

    attachments: [
      { fileName: "File_doc_001.docx", comments: "A document that has info…" },
      {
        fileName: "File_doc_002.pdf",
        comments: "Sample word doc can also export as .PDF",
      },
    ],

    activity: [
      {
        when: "15-Feb-2025 10:00 AM",
        by: "Rob Lynn",
        comments: "Added commentary and changed status",
      },
      {
        when: "12-Feb-2025 1:15 PM",
        by: "System",
        comments: "Notifications sent to Stakeholders",
      },
      {
        when: "11-Feb-2025 9:00 AM",
        by: "Rob Lynn",
        comments:
          "Added more commentary and changed status for Reviewer to go in and…",
      },
      {
        when: "09-Feb-2025 6:24 PM",
        by: "System",
        comments: "Notifications sent and New Events Identified.",
      },
      {
        when: "08-Feb-2025 10:00 AM",
        by: "Rob Lynn",
        comments: "Added commentary and changed status",
      },
      {
        when: "07-Feb-2025 1:15 PM",
        by: "System",
        comments: "Notifications sent to Stakeholders",
      },
      {
        when: "04-Feb-2025 2:22 PM",
        by: "System",
        comments: "Notifications sent and New Events Identified.",
      },
    ],
  };
};
