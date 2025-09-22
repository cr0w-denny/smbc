# C0921B: EWI Obligor Dashboard RelatedNews Integration

## Summary
Integrated the new RelatedNews component into the EWI Obligor Dashboard, replacing placeholder content with functional news feed.

## Changes

### Dashboard Update
- **File**: `applets/ewi-obligor/mui/src/components/Dashboard.tsx`
- **Changes**:
  - Added RelatedNews import from @smbc/mui-components
  - Created mock news data with 5 sample items
  - Replaced "INSERT NEWS FEED" placeholder with RelatedNews component
  - Added contextual news titles relevant to San Francisco/financial topics

### Mock Data
- News items include titles like "Sandy Tong: S.F.'s first Asian fire chief"
- Progress indicators ranging from 25% to 90%
- Proper date formatting (06-Sep, 05-Sep, etc.)
- Author and source information
- External link URLs for all items

### Layout Integration
- RelatedNews positioned in bottom-right card (Position 2,2)
- Maintains existing Card wrapper with "Related News" title
- Preserves existing menu items and card structure
- Seamless integration with dashboard's flexbox layout