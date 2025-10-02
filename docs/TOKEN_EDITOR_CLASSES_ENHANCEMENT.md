# Token Editor Classes Enhancement

## Current Limitation

The token editor currently only supports editing "base" properties of tokens (e.g., `ui.button.background`, `ui.button.color`). It cannot edit or manage token classes (e.g., `ui.button.classes.contained`, `ui.button.classes.secondary`).

## Proposed Enhancement

### UI Changes

**Replace "Properties" Header with Tabs:**
- **Base Tab**: Current functionality - edit base token properties
- **Class Tabs**: One tab per existing class (e.g., "contained", "secondary", "ghost")
- **Plus Icon**: Add new class names dynamically

### Functionality

#### 1. Class Navigation
- Detect existing classes in token structure (e.g., `ui.button.classes.*`)
- Generate tabs automatically for each class
- Allow switching between base properties and class-specific properties

#### 2. Class Creation
- Plus icon opens "Add Class" dialog
- User enters class name (e.g., "outlined", "large", "small")
- Creates new class structure: `ui.button.classes.{className}`
- Adds tab for the new class

#### 3. Property Management within Classes
- Each class tab shows properties specific to that class
- Same property editing interface as base properties
- Support nested properties within classes
- Handle light/dark theme variants within classes

### Implementation Phases

#### Phase 1: Read-Only Class Support (Current Priority)
- Display existing classes as tabs
- Allow editing of pre-existing class properties
- No creation or deletion of classes

#### Phase 2: Class Management
- Add class creation (plus icon)
- Delete empty classes
- Rename existing classes

#### Phase 3: Property Management
- Add properties to existing classes
- Delete properties from classes
- Copy properties between base and classes

## Technical Implementation

### Token Structure Support
```typescript
// Current: Only base properties editable
ui.button.background
ui.button.color
ui.button.borderRadius

// Enhanced: Classes also editable
ui.button.classes.contained.background
ui.button.classes.contained.color
ui.button.classes.secondary.background
ui.button.classes.ghost.background
```

### Component Architecture
```typescript
interface TokenEditorProps {
  selectedToken: string; // e.g., "ui.button"
  selectedClass?: string; // e.g., "contained" | "secondary" | null (base)
}

interface TokenClassTab {
  name: string; // "base" | class name
  isBase: boolean;
  properties: TokenProperty[];
}
```

### UI Layout
```
┌─────────────────────────────────────┐
│ Token: ui.button                    │
├─────────────────────────────────────┤
│ [Base] [contained] [secondary] [+]  │ ← Tabs
├─────────────────────────────────────┤
│ Properties for selected tab:        │
│ ☑ background                        │
│ ☑ color                             │
│ ☑ borderRadius                      │
│ ☑ padding                           │
└─────────────────────────────────────┘
```

## Use Cases

### MUI Integration
- Edit `ui.button.classes.contained` for MUI contained variant
- Edit `ui.button.classes.outlined` for MUI outlined variant
- Create custom classes for component variations

### Component Variants
- Different button sizes: `ui.button.classes.small`, `ui.button.classes.large`
- Different input states: `ui.input.classes.error`, `ui.input.classes.success`
- Theme variations: `ui.card.classes.elevated`, `ui.card.classes.outlined`

## Benefits

1. **Complete Token Control**: Edit all aspects of component tokens
2. **MUI Variant Support**: Properly handle MUI's variant system
3. **Design System Flexibility**: Create and manage component variations
4. **Context-Aware Styling**: Different styles for different contexts
5. **Reduced Manual Editing**: Less need to manually edit tokens.ts

## Migration Path

### Phase 1 (Immediate)
- Users can manually add classes to tokens.ts
- Token editor can navigate to and edit existing classes
- No UI changes needed initially

### Phase 2 (Future Enhancement)
- Implement tab-based UI
- Add class creation functionality
- Full property management within classes

## Current Workaround

For now, developers can:
1. Manually add classes to `tokens.ts`
2. Use token editor to navigate to class properties
3. Edit class-specific properties through existing interface

Example manual addition:
```typescript
ui: {
  button: {
    // base properties
    background: { light: "...", dark: "..." },
    color: { light: "...", dark: "..." },

    // classes (manually added)
    classes: {
      contained: {
        background: { light: "...", dark: "..." },
        color: { light: "...", dark: "..." }
      },
      outlined: {
        background: { light: "transparent", dark: "transparent" },
        borderColor: { light: "...", dark: "..." }
      }
    }
  }
}
```

---

*This enhancement will significantly improve the token editor's capability to handle complex component styling systems like MUI's variant-based approach.*