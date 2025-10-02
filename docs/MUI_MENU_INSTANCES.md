# MUI Menu Component Instances Analysis

This document catalogs all Material-UI Menu component instances found in the codebase to analyze patterns and determine if a centralized reusable menu component would be beneficial.

## Summary

Total Menu instances found: **7 unique implementations**

**Locations:**
- `/packages/mui-components`: 5 implementations (4 reusable components, 1 inline)
- `/packages/dataview-mui`: 1 implementation (reusable component)
- `/applets/ewi-events/mui`: 1 implementation (inline)

## 1. UserMenu Component

**File:** `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/UserMenu.tsx`

**Purpose:** User profile menu with dark mode toggle, persona management, and logout functionality

**Pattern:** Standalone reusable component

**Key Features:**
- Avatar header with user name
- Profile/Settings links
- Dashboard section with Quick Guide
- Collapsible Personas section with role toggles
- Dark mode toggle switch
- Logout button

**Code:**
```tsx
<Menu
  open={open}
  anchorEl={anchorEl}
  onClose={onClose}
  transformOrigin={{ horizontal: "right", vertical: "top" }}
  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
  slotProps={{
    paper: {
      elevation: 2,
      sx: {
        width: 283,
        borderRadius: `${size.borderRadius.base}px`,
        overflow: "visible",
        mt: 1.5,
        ml: 0.125,
        p: 2,
        backgroundColor: `${ui.color.background.secondary(darkMode)} !important`,
        border: `1px solid ${ui.color.border.primary(darkMode)}`,
        "&.MuiPaper-root": {
          backgroundImage: "none",
        },
      },
    },
    list: { dense: true, sx: { p: 0 } },
  }}
>
  {/* Header with avatar and name */}
  {/* Profile/Settings MenuItems */}
  {/* Dashboard section */}
  {/* Collapsible Personas section */}
  {/* Dark mode toggle */}
  {/* Logout button */}
</Menu>
```

**Trigger:** IconButton with Avatar or AccountCircleOutlined icon (managed by parent - TopNav)

**Notes:**
- Highly specialized menu with complex custom content
- Fixed width (283px)
- Uses custom padding and styling
- Contains non-MenuItem elements (Box, Collapse, Button)
- Not a good candidate for generalization

---

## 2. ActionMenu Component

**File:** `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/ActionMenu.tsx`

**Purpose:** Generic action menu with configurable menu items and icons

**Pattern:** Reusable component with menu + trigger

**Key Features:**
- MoreVert icon trigger button (built-in)
- Configurable menu items with icons
- Divider support
- Disabled state support
- Internal state management for anchor element

**Code:**
```tsx
export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  divider?: boolean;
  disabled?: boolean;
}

<IconButton
  size="small"
  onClick={handleMenuClick}
  aria-label="more options"
  sx={{ mr: "-8px", ...sx }}
>
  <MoreVertIcon fontSize="small" />
</IconButton>
<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleMenuClose}
  transformOrigin={{ horizontal: "right", vertical: "top" }}
  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
  slotProps={{
    paper: {
      sx: {
        minWidth: 200,
        boxShadow: "0px 2px 4px rgba(0,0,0,0.1), 0px 4px 8px rgba(0,0,0,0.08)",
      },
    },
  }}
>
  {menuItems.map((item, index) => (
    <React.Fragment key={index}>
      {item.divider && index > 0 && <Divider />}
      <MenuItem onClick={() => handleMenuItemClick(item)} disabled={item.disabled}>
        {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
        <ListItemText>{item.label}</ListItemText>
      </MenuItem>
    </React.Fragment>
  ))}
</Menu>
```

**Trigger:** Built-in IconButton with MoreVertIcon

**Notes:**
- Good candidate as a base pattern for action menus
- Self-contained with trigger + menu
- Simple, declarative API
- Could be enhanced to support custom triggers

---

## 3. TreeDropdownMenu Component

**File:** `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/AppShell/components/TreeDropdownMenu.tsx`

**Purpose:** Hierarchical navigation menu with collapsible tree structure

**Pattern:** Menu-only component (trigger managed by parent)

**Key Features:**
- Recursive tree structure support
- Collapsible sections with expand/collapse icons
- Nested ListItemButtons
- Scoped item ID tracking per menu instance

**Code:**
```tsx
interface TreeNavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  children?: TreeNavigationItem[];
  isCollapsible?: boolean;
}

<Menu
  anchorEl={anchorEl}
  open={open}
  onClose={onClose}
  PaperProps={{
    sx: {
      maxHeight: 400,
      minWidth: 200,
      '& .MuiList-root': {
        py: 0,
      },
    },
  }}
  transformOrigin={{ horizontal: 'left', vertical: 'top' }}
  anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
>
  <List component="div" dense>
    {items.map(item => renderTreeItem(item))}
  </List>
</Menu>
```

**Trigger:** External Button component (in TopNav)

**Notes:**
- Specialized for tree navigation
- Complex internal state for expanded items
- Not suitable for general-purpose menu
- Already well-abstracted for its use case

---

## 4. TopNav Dropdown Menu

**File:** `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/AppShell/components/TopNav.tsx`

**Purpose:** Navigation dropdown in top navigation bar

**Pattern:** Inline Menu within component

**Key Features:**
- Simple flat list of navigation items
- Icon + label support
- Integrated with navigation system
- Active state tracking

**Code:**
```tsx
<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl) && activeMenu === item.label}
  onClose={handleMenuClose}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
  transformOrigin={{ vertical: "top", horizontal: "center" }}
  slotProps={{
    paper: {
      sx: {
        minWidth: 150,
        mt: "15px",
        "& .MuiMenuItem-root": { minHeight: "auto" },
      },
    },
  }}
>
  {item.items?.map((subItem, subIndex) => (
    <MenuItem
      key={subIndex}
      onClick={() => {
        if (subItem.onClick) subItem.onClick();
        handleNavigation(subItem.href);
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      {subItem.icon && (
        <Box sx={{ display: "flex", alignItems: "center", fontSize: "1.25rem" }}>
          {subItem.icon}
        </Box>
      )}
      {subItem.label}
    </MenuItem>
  ))}
</Menu>
```

**Trigger:** Button with ArrowDropDownIcon

**Notes:**
- Simple navigation dropdown
- Could potentially use a centralized component
- Minor styling differences (centered anchor origin)

---

## 5. Card Menu

**File:** `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/Card.tsx`

**Purpose:** Optional menu in Card component header

**Pattern:** Inline Menu within Card component

**Key Features:**
- MoreVert icon trigger
- Identical API to ActionMenu (CardMenuItem = ActionMenuItem)
- Integrated into Card header layout
- Divider support

**Code:**
```tsx
export interface CardMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  divider?: boolean;
  disabled?: boolean;
}

<IconButton
  size="small"
  onClick={handleMenuClick}
  aria-label="more options"
  sx={{ mr: "-20px", mt: -0.5 }}
>
  <MoreVertIcon fontSize="small" />
</IconButton>
<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleMenuClose}
  transformOrigin={{ horizontal: "right", vertical: "top" }}
  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
  slotProps={{
    paper: {
      sx: {
        minWidth: 200,
        boxShadow: "0px 2px 4px rgba(0,0,0,0.1), 0px 4px 8px rgba(0,0,0,0.08)",
      },
    },
  }}
>
  {menuItems.map((item, index) => (
    <React.Fragment key={index}>
      {item.divider && index > 0 && <Divider />}
      <MenuItem onClick={() => handleMenuItemClick(item)} disabled={item.disabled}>
        {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
        <ListItemText>{item.label}</ListItemText>
      </MenuItem>
    </React.Fragment>
  ))}
</Menu>
```

**Trigger:** Built-in IconButton with MoreVertIcon

**Notes:**
- Nearly identical to ActionMenu implementation
- Could be refactored to use ActionMenu component
- Minor styling differences for positioning in Card header

---

## 6. RowActionsMenu Component

**File:** `/Users/developer/ws-cr0w/zzz/packages/dataview-mui/src/RowActionsMenu.tsx`

**Purpose:** Row-level actions menu for data grid rows

**Pattern:** Reusable component with menu + trigger

**Key Features:**
- MoreVert icon trigger
- Filters visible actions based on item data
- Stop propagation to prevent row selection
- Generic type support for item data
- Icon + label support

**Code:**
```tsx
interface RowActionsMenuProps<T> {
  actions: RowAction<T>[];
  item: T;
}

<IconButton
  size="small"
  onClick={handleClick}
  aria-label="more actions"
  aria-controls={open ? "row-actions-menu" : undefined}
  aria-haspopup="true"
  aria-expanded={open ? "true" : undefined}
>
  <MoreVertIcon />
</IconButton>
<Menu
  id="row-actions-menu"
  anchorEl={anchorEl}
  open={open}
  onClose={handleClose}
  anchorOrigin={{
    vertical: "bottom",
    horizontal: "right",
  }}
  transformOrigin={{
    vertical: "top",
    horizontal: "right",
  }}
  sx={{
    '& .MuiPaper-root': {
      boxShadow: '0px 2px 4px rgba(0,0,0,0.1), 0px 4px 8px rgba(0,0,0,0.08)',
    }
  }}
>
  {visibleActions.map((action) => (
    <MenuItem
      key={action.key}
      onClick={(e) => {
        e.stopPropagation();
        handleClose();
        action.onClick?.(item);
      }}
      disabled={action.disabled?.(item)}
    >
      {action.icon && (
        <ListItemIcon sx={{ minWidth: 36, fontSize: 20 }}>
          {React.createElement(action.icon)}
        </ListItemIcon>
      )}
      <ListItemText>{action.label || action.key}</ListItemText>
    </MenuItem>
  ))}
</Menu>
```

**Trigger:** Built-in IconButton with MoreVertIcon

**Notes:**
- Very similar to ActionMenu but with data-driven visibility
- Handles stopPropagation for grid row context
- Could potentially be unified with ActionMenu

---

## 7. Inline Row Actions Menu (Events Grid)

**File:** `/Users/developer/ws-cr0w/zzz/applets/ewi-events/mui/src/components/Events.tsx`

**Purpose:** Action menu for individual event rows in the events grid

**Pattern:** Inline Menu in cell renderer

**Key Features:**
- MoreVert icon trigger
- Hard-coded menu items specific to events
- Link MenuItem for navigation
- Cmd/Ctrl+Click support for new tab

**Code:**
```tsx
// Inside cell renderer function
const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
const open = Boolean(anchorEl);

<IconButton
  size="small"
  color="inherit"
  onClick={handleMenuClick}
  title="More Actions"
  aria-controls={open ? "row-actions-menu" : undefined}
  aria-haspopup="true"
  aria-expanded={open ? "true" : undefined}
>
  <MoreIcon fontSize="small" />
</IconButton>
<Menu
  id="row-actions-menu"
  anchorEl={anchorEl}
  open={open}
  onClose={handleMenuClose}
  slotProps={{
    paper: {
      "aria-labelledby": "row-actions-button",
      sx: {
        boxShadow: shadow.md,
      },
    },
  }}
  transformOrigin={{ horizontal: "right", vertical: "top" }}
  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
>
  <MenuItem
    component="a"
    href={`#/events/detail?id=${params.data.id}`}
    onClick={(e) => {
      if (!e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleAction("view", e);
      }
    }}
  >
    <ListIcon fontSize="small" sx={{ mr: 1 }} />
    Show Details
  </MenuItem>
  <MenuItem onClick={(e) => handleAction("add-1lod-analyst", e)}>
    <PersonAddIcon fontSize="small" sx={{ mr: 1 }} />
    Add 1 LOD Analyst(s)
  </MenuItem>
  <MenuItem onClick={(e) => handleAction("add-1lod-management", e)}>
    <SupervisorAccountIcon fontSize="small" sx={{ mr: 1 }} />
    Add 1 LOD Management Reviewer(s)
  </MenuItem>
  <MenuItem onClick={(e) => handleAction("add-gbr-number", e)}>
    <AddCircleIcon fontSize="small" sx={{ mr: 1 }} />
    Add GBR Application Number
  </MenuItem>
</Menu>
```

**Trigger:** IconButton with MoreIcon

**Notes:**
- Good candidate for refactoring to use RowActionsMenu or ActionMenu
- Duplicates functionality that already exists in RowActionsMenu
- Hard-coded menu items reduce reusability

---

## Common Patterns Analysis

### Anchor Origins & Transforms
Most menus use:
- `transformOrigin: { horizontal: "right", vertical: "top" }`
- `anchorOrigin: { horizontal: "right", vertical: "bottom" }`

Exception: TopNav uses centered anchoring

### Styling
Common patterns:
- `minWidth: 200` (most menus)
- `boxShadow: "0px 2px 4px rgba(0,0,0,0.1), 0px 4px 8px rgba(0,0,0,0.08)"` (shared shadow)
- Consistent use of `ListItemIcon` and `ListItemText` for menu items

### Trigger Patterns
- **MoreVert Icon**: Most common (ActionMenu, Card, RowActionsMenu, Events inline)
- **Custom Button**: TopNav dropdown, TreeDropdownMenu
- **Avatar/Icon**: UserMenu (in TopNav)

### State Management
All implementations manage:
- `anchorEl` state
- `open` boolean derived from `anchorEl`
- `handleClick`/`handleClose` handlers

---

## Recommendations

### 1. Create a Unified Menu Component

A base `ContextMenu` component could handle:
- Anchor element state management
- Common positioning/styling
- MenuItem rendering from config
- Optional built-in trigger (IconButton with configurable icon)

**Proposed API:**
```tsx
interface ContextMenuProps {
  // Menu configuration
  items: MenuItem[];

  // Trigger options
  trigger?: "icon-button" | "custom" | "none";
  triggerIcon?: React.ComponentType;
  triggerProps?: IconButtonProps;

  // Menu positioning
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;

  // Custom trigger (when trigger="custom")
  renderTrigger?: (props: { onClick: (e: React.MouseEvent) => void }) => React.ReactNode;

  // External control (when trigger="none")
  anchorEl?: HTMLElement | null;
  open?: boolean;
  onClose?: () => void;

  // Styling
  menuProps?: Partial<MenuProps>;
  minWidth?: number;
}
```

### 2. Refactoring Candidates

**High Priority:**
1. **Card menu** → Use ActionMenu component (nearly identical)
2. **Events inline menu** → Use RowActionsMenu or create config-based version

**Medium Priority:**
3. **TopNav dropdown** → Could use new ContextMenu with custom trigger

**Low Priority (keep as-is):**
4. **UserMenu** → Too specialized, complex custom content
5. **TreeDropdownMenu** → Specialized tree navigation, already well-abstracted
6. **ActionMenu** → Already reusable, could become basis for ContextMenu
7. **RowActionsMenu** → Already reusable, good pattern

### 3. Benefits of Centralization

**Pros:**
- Consistent positioning and styling across all menus
- Reduced code duplication (especially Card vs ActionMenu)
- Easier to maintain and update menu behavior globally
- Consistent accessibility attributes

**Cons:**
- May be over-engineering for simple cases
- Some menus have unique requirements (UserMenu, TreeDropdownMenu)
- Risk of creating a component that tries to do too much

### 4. Recommended Approach

**Phase 1: Low-Hanging Fruit**
- Refactor Card to use ActionMenu component
- Refactor Events inline menu to use RowActionsMenu

**Phase 2: Optional Enhancement**
- Consider creating a base ContextMenu component if more menu variations emerge
- Keep specialized menus (UserMenu, TreeDropdownMenu) as-is

**Phase 3: Documentation**
- Document when to use which menu component
- Create examples/stories for each menu type

---

## Conclusion

While there is some duplication (particularly Card vs ActionMenu), the existing menu implementations are generally well-organized. Most are already abstracted into reusable components. The primary opportunities for improvement are:

1. **Immediate win**: Refactor Card to use ActionMenu (identical functionality)
2. **Quick improvement**: Refactor Events inline menu to use RowActionsMenu
3. **Future consideration**: Create a base ContextMenu if more menu types emerge

Creating a highly generalized menu component now may be premature. The current pattern of having specialized components (ActionMenu, RowActionsMenu, TreeDropdownMenu, UserMenu) with clear use cases is actually quite maintainable and doesn't represent significant churn risk.
