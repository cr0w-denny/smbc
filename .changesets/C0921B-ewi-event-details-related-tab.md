# C0921B: EWI Event Details Related Tab Enhancement

## Summary
Completely redesigned the Related Tab in EWI Event Details to include both Related Events grid and Related News feed, replacing the placeholder content.

## Changes

### Related Tab Overhaul
- **File**: `applets/ewi-event-details/mui/src/components/RelatedTab.tsx`
- **Before**: Simple placeholder text "Related Items..."
- **After**: Comprehensive dual-card layout with AG Grid and news feed

### Related Events Card
- **AG Grid Integration**:
  - Abbreviated column set: Event Date, Category, Obligor, Exposure, Status
  - StatusChip integration with proper variant mapping
  - Mixed case status labels (e.g., "Almost Due", "Needs Attention")
  - 300px height with proper popup parent handling
- **Mock Data**: 3 sample events with varied statuses and financial context
- **Configuration**: Legacy menu settings matching ewi-events dashboard

### Related News Card
- **RelatedNews Component**: Full integration with 4 contextual news items
- **Financial Context**: Risk management, compliance, credit, and market analysis topics
- **Mock Data**: Relevant to EWI context with proper progress indicators

### Layout Structure
- **Consistent Styling**: Matches other tabs with 30px gap, flex layout
- **Dual Card Layout**: Related Events above, Related News below
- **Proper Refs**: Grid and popup parent refs for menu positioning

### Technical Implementation
- AG Grid with full ewi-events configuration parity
- Proper popup parent handling to prevent height collapse
- StatusChip cell renderer with theme awareness
- Legacy column menu and filter settings
- React refs and useEffect for popup parent setup