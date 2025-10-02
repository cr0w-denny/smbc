# Context-Aware MUI Tokenization Strategy

## Executive Summary

This document outlines a context-driven approach to tokenizing MUI components for EWI applications, leveraging our existing token editor and context system. By thinking in terms of **primitive components** (that get styled) and **layout contexts** (that provide styling), we can reduce cognitive burden and achieve comprehensive theme customization with significantly fewer tokens.

## Core Philosophy: Primitives + Contexts

### Mental Model Shift
**Traditional Approach** (Complex):
- `mui.button.primary.background`
- `mui.button.secondary.background`
- `mui.card.button.primary.background`
- `mui.modal.button.primary.background`

**Context-Aware Approach** (Simple):
- `ui.button.background` (primitive)
- Styled automatically in `.card` context
- Styled automatically in `.modal` context
- One token, infinite contexts

### Benefits for EWI Applications
1. **Reduced Cognitive Load**: Think "How should buttons look in modals?" instead of managing modal-specific button tokens
2. **Token Reduction**: ~70% fewer tokens to manage
3. **Automatic Adaptation**: Components automatically adapt to their container context
4. **Easier Maintenance**: Change one context, update all components within it
5. **Portal Support**: Modals, tooltips, and popovers inherit context correctly

## MUI Component Classification

### 🎯 Primitive Components (Get Styled)
These map directly to our existing `ui.*` token system:

#### **Foundation Primitives**
- **Button** → `ui.button.*`
  - All MUI Button variants (contained, outlined, text)
  - IconButton (uses same button tokens with size modifiers)
  - Automatically styled per context

- **Typography** → `ui.text.*`
  - All MUI Typography variants (h1-h6, body1, body2, caption)
  - Context-aware sizing and coloring

- **Input** → `ui.input.*`
  - TextField, Select, Input components
  - Consistent styling across all contexts

#### **Interactive Primitives**
- **Chip** → `ui.chip.*`
  - Status chips, filter chips, selection chips
  - Context-aware colors and sizing

- **Link** → `ui.link.*`
  - Link component with hover states
  - Context-aware coloring

- **Progress** → `ui.progress.*` (using track/fill system)
  - LinearProgress → uses `ui.track.*` + `ui.fill.*`
  - Context-aware height and colors

#### **Navigation Primitives**
- **Menu Item** → `ui.menuItem.*`
  - MenuItem, ListItemText, ListItemIcon
  - Context-aware spacing and colors

### 🏗️ Layout Contexts (Provide Styling)
These become CSS contexts that style primitives within them:

#### **Application Contexts**
- **App Header** (`.app-header`)
  - Contains: navigation buttons, search inputs, user menus
  - Tokens: compact sizing, header-appropriate colors

- **App Content** (`.app-content`)
  - Contains: main application content, data tables, forms
  - Tokens: standard sizing, content-appropriate colors

- **App Toolbar** (`.app-toolbar`)
  - Contains: action buttons, filters, tools
  - Tokens: dense sizing, toolbar-appropriate colors

#### **Component Contexts**
- **Modal** (`.modal`)
  - Contains: forms, buttons, content within modal dialogs
  - Tokens: high-contrast colors, modal-appropriate sizing

- **Card** (`.card`)
  - Contains: content within card containers
  - Tokens: card-appropriate backgrounds, spacing

- **Table** (`.table`)
  - Contains: table cells, action buttons, input controls
  - Tokens: dense sizing, table-appropriate styling

#### **Portal Contexts** (via data attributes)
- `[data-context="appHeader"]` - For tooltips/menus from header
- `[data-context="modal"]` - For nested modals, tooltips within modals
- `[data-context="card"]` - For popovers from cards

### ❌ Components to Deprecate
These MUI components become pure containers with no tokens:

- **Box** - Pure layout container
- **Menu/MenuList** - Container for MenuItems (which ARE primitives)
- **Popover** - Portal container for other primitives
- **ThemeProvider** - System-level container

## EWI Application Context Hierarchy

### Context Mapping for EWI Apps

#### **Primary Contexts**
```typescript
// Context definitions for EWI applications
const EWI_CONTEXTS = {
  // Application level
  app: { shortName: "app", cssSelector: ".app" },
  appHeader: { shortName: "hd", cssSelector: "#app-header" },
  appToolbar: { shortName: "tb", cssSelector: ".app-toolbar" },
  appContent: { shortName: "content", cssSelector: "#app-content" },

  // Component level
  modal: { shortName: "modal", cssSelector: ".modal" },
  card: { shortName: "card", cssSelector: ".card" },
  table: { shortName: "tbl", cssSelector: ".table" },

  // EWI-specific contexts
  eventDetail: { shortName: "evnt", cssSelector: ".event-detail" },
  obligorView: { shortName: "oblg", cssSelector: ".obligor-view" },
  workflowPanel: { shortName: "wf", cssSelector: ".workflow-panel" }
};
```

#### **Composite Context Examples**
```css
/* App Header + Modal */
.app-header .modal,
[data-context="hdModal"] {
  --ui-button-background: rgba(255, 255, 255, 0.95);
  --ui-input-borderColor: #ffffff;
}

/* Card + Event Detail */
.card .event-detail,
[data-context="cardEvnt"] {
  --ui-text-fontSize: 0.875rem;
  --ui-button-padding: 6px 12px;
}

/* Table + Modal (edit forms) */
.table .modal,
[data-context="tblModal"] {
  --ui-input-background: #ffffff;
  --ui-button-background: var(--color-primary);
}
```

## Implementation Phases

### Phase 1: Foundation Setup (Week 1)
**Goal**: Establish primitive token system for core MUI components

#### 1.1 Core Primitive Tokens (2-3 days)
```typescript
// Essential primitives for MUI components
const muiPrimitives = {
  ui: {
    button: {
      background: { light: "#1976d2", dark: "#90caf9" },
      color: { light: "#ffffff", dark: "#000000" },
      borderColor: { light: "#1976d2", dark: "#90caf9" },
      borderRadius: "4px",
      padding: "8px 16px",
      fontSize: "0.875rem",
      fontWeight: "500",
      on: {
        hover: {
          background: { light: "#1565c0", dark: "#81b4e6" }
        },
        disabled: {
          background: { light: "#e0e0e0", dark: "#424242" },
          color: { light: "#9e9e9e", dark: "#757575" }
        }
      }
    },
    text: {
      color: { light: "#000000", dark: "#ffffff" },
      fontSize: "1rem",
      fontFamily: "'Roboto', sans-serif",
      lineHeight: "1.5"
    },
    input: {
      background: { light: "#ffffff", dark: "#121212" },
      borderColor: { light: "#c4c4c4", dark: "#424242" },
      borderWidth: "1px",
      borderRadius: "4px",
      padding: "8px 12px",
      color: { light: "#000000", dark: "#ffffff" },
      on: {
        focus: {
          borderColor: { light: "#1976d2", dark: "#90caf9" },
          ring: { color: { light: "rgba(25, 118, 210, 0.2)", dark: "rgba(144, 202, 249, 0.2)" } }
        }
      }
    }
  }
};
```

#### 1.2 Context System Integration (2 days)
- Extend existing token editor to support MUI primitives
- Add MUI primitive sections to token editor UI
- Ensure context inheritance works for MUI components

### Phase 2: Component Context Styling (Week 2-3)
**Goal**: Implement context-specific overrides for EWI applications

#### 2.1 Application Context Overrides (4-5 days)
```css
/* App Header Context */
#app-header {
  --ui-button-background: transparent;
  --ui-button-color: #ffffff;
  --ui-button-borderColor: rgba(255, 255, 255, 0.3);
  --ui-button-padding: 6px 12px;
  --ui-input-background: rgba(255, 255, 255, 0.1);
  --ui-input-borderColor: rgba(255, 255, 255, 0.3);
  --ui-text-color: #ffffff;
}

/* App Content Context */
#app-content {
  --ui-button-borderRadius: 6px;
  --ui-input-borderColor: #d1d5db;
  --ui-text-color: #374151;
}

/* Modal Context */
.modal {
  --ui-button-background: var(--color-primary);
  --ui-input-borderColor: var(--color-primary);
  --ui-button-fontSize: 0.875rem;
}

/* Card Context */
.card {
  --ui-button-padding: 6px 12px;
  --ui-input-background: #f9fafb;
  --ui-text-fontSize: 0.875rem;
}
```

#### 2.2 EWI-Specific Context Styling (3-4 days)
```css
/* Event Detail Context */
.event-detail {
  --ui-chip-background: #eff6ff;
  --ui-chip-color: #1d4ed8;
  --ui-text-fontSize: 0.8125rem;
  --ui-button-padding: 4px 8px;
}

/* Obligor View Context */
.obligor-view {
  --ui-input-borderRadius: 8px;
  --ui-button-borderRadius: 8px;
  --ui-text-lineHeight: 1.4;
}

/* Workflow Panel Context */
.workflow-panel {
  --ui-button-background: #10b981;
  --ui-button-on-hover-background: #059669;
  --ui-input-background: #ffffff;
  --ui-input-borderColor: #d1fae5;
}
```

### Phase 3: Advanced MUI Integration (Week 4-5)
**Goal**: Handle complex MUI components and theme integration

#### 3.1 Menu System Integration (3 days)
```typescript
// Menu primitives
const menuPrimitives = {
  ui: {
    menuItem: {
      background: { light: "transparent", dark: "transparent" },
      color: { light: "#000000", dark: "#ffffff" },
      padding: "8px 16px",
      borderRadius: "0px",
      on: {
        hover: {
          background: { light: "#f5f5f5", dark: "#2a2a2a" }
        },
        selected: {
          background: { light: "#e3f2fd", dark: "#1565c0" }
        }
      }
    },
    menu: {
      background: { light: "#ffffff", dark: "#1e1e1e" },
      borderRadius: "4px",
      shadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      borderColor: { light: "#e0e0e0", dark: "#424242" }
    }
  }
};
```

#### 3.2 Theme Provider Integration (4 days)
```typescript
// Generate complete MUI theme from tokens
const generateMuiTheme = (tokens: TokenSystem, context: string = 'default') => {
  return createTheme({
    palette: {
      primary: {
        main: tokens[context]?.button?.background || tokens.ui.button.background,
      },
      background: {
        default: tokens[context]?.surface?.background || tokens.ui.surface.background,
      }
    },
    typography: {
      fontFamily: tokens.ui.text.fontFamily,
      fontSize: tokens.ui.text.fontSize,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            backgroundColor: `var(--ui-button-background)`,
            color: `var(--ui-button-color)`,
            borderRadius: `var(--ui-button-borderRadius)`,
            padding: `var(--ui-button-padding)`,
            '&:hover': {
              backgroundColor: `var(--ui-button-on-hover-background)`,
            }
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              backgroundColor: `var(--ui-input-background)`,
              borderColor: `var(--ui-input-borderColor)`,
            }
          }
        }
      }
    }
  });
};
```

### Phase 4: Portal Context Support (Week 6)
**Goal**: Ensure portaled components (modals, tooltips, popovers) inherit context

#### 4.1 Portal Context Inheritance (3-4 days)
```typescript
// Enhanced context detection for portals
const usePortalContext = (portalContainer?: HTMLElement) => {
  const [portalContext, setPortalContext] = useState<string>('default');

  useEffect(() => {
    if (portalContainer) {
      // Detect context from portal trigger element
      const triggerElement = document.querySelector('[aria-describedby], [aria-controls]');
      const contextElement = triggerElement?.closest('[data-context], .card, .modal, #app-header');

      if (contextElement) {
        const context = contextElement.getAttribute('data-context') ||
                       contextElement.className ||
                       contextElement.id;
        setPortalContext(context);
      }
    }
  }, [portalContainer]);

  return portalContext;
};

// Usage in MUI components
const ContextAwareModal = ({ children, ...props }) => {
  const parentContext = useContextDetection();

  return (
    <Modal {...props}>
      <div data-context={`${parentContext}Modal`}>
        {children}
      </div>
    </Modal>
  );
};
```

#### 4.2 Context-Aware Component Wrappers (2-3 days)
```typescript
// Wrapper components that automatically apply context
export const EwiButton = ({ variant = 'contained', ...props }) => {
  return (
    <Button
      variant={variant}
      sx={{
        backgroundColor: 'var(--ui-button-background)',
        color: 'var(--ui-button-color)',
        borderRadius: 'var(--ui-button-borderRadius)',
        padding: 'var(--ui-button-padding)',
        '&:hover': {
          backgroundColor: 'var(--ui-button-on-hover-background)',
        }
      }}
      {...props}
    />
  );
};

export const EwiTextField = (props) => {
  return (
    <TextField
      sx={{
        '& .MuiInputBase-root': {
          backgroundColor: 'var(--ui-input-background)',
          borderColor: 'var(--ui-input-borderColor)',
          borderRadius: 'var(--ui-input-borderRadius)',
        }
      }}
      {...props}
    />
  );
};
```

## Token Count Reduction Analysis

### Before: Component-Specific Approach
```typescript
// Traditional approach - 156+ tokens
const traditionalTokens = {
  mui: {
    button: {
      primary: { background: '...', color: '...', border: '...' }, // 15 tokens
      secondary: { background: '...', color: '...', border: '...' }, // 15 tokens
      text: { background: '...', color: '...', border: '...' }, // 15 tokens
    },
    cardButton: {
      primary: { background: '...', color: '...', border: '...' }, // 15 tokens
      secondary: { background: '...', color: '...', border: '...' }, // 15 tokens
    },
    modalButton: {
      primary: { background: '...', color: '...', border: '...' }, // 15 tokens
      secondary: { background: '...', color: '...', border: '...' }, // 15 tokens
    },
    headerButton: {
      primary: { background: '...', color: '...', border: '...' }, // 15 tokens
      secondary: { background: '...', color: '...', border: '...' }, // 15 tokens
    },
    textField: { /* 20+ tokens */ },
    cardTextField: { /* 20+ tokens */ },
    modalTextField: { /* 20+ tokens */ },
    // ... many more
  }
};
```

### After: Context-Aware Approach
```typescript
// Context-aware approach - 45 tokens
const contextAwareTokens = {
  ui: {
    button: {
      background: '...', color: '...', borderColor: '...', // 15 tokens total
      borderRadius: '...', padding: '...', fontSize: '...',
      on: { hover: '...', disabled: '...', focus: '...' }
    },
    input: {
      background: '...', borderColor: '...', color: '...', // 15 tokens total
      borderRadius: '...', padding: '...', fontSize: '...',
      on: { focus: '...', error: '...', disabled: '...' }
    },
    text: {
      color: '...', fontSize: '...', fontFamily: '...', // 8 tokens total
      lineHeight: '...', fontWeight: '...'
    },
    menuItem: {
      background: '...', color: '...', padding: '...', // 7 tokens total
      on: { hover: '...', selected: '...' }
    }
  }
};

// Contexts provide overrides automatically
const contexts = {
  '.card': { '--ui-button-padding': '6px 12px' },
  '.modal': { '--ui-button-background': 'var(--color-primary)' },
  '#app-header': { '--ui-button-background': 'transparent' }
};
```

**Token Reduction**: 156 → 45 tokens (**71% reduction**)

## Integration with Existing Token Editor

### Enhanced Context UI
The existing token editor context system perfectly supports this approach:

1. **Context Selection**: Use existing context dropdown
2. **Primitive Editing**: Edit `ui.button.*` tokens in context
3. **Live Preview**: See changes applied in context immediately
4. **Context Generation**: Use existing context generator for new contexts

### Token Editor Enhancements
```typescript
// Add MUI primitive sections to token editor
const MUI_PRIMITIVE_SECTIONS = {
  'MUI Components': {
    'ui.button': 'Button styling for all MUI Button variants',
    'ui.input': 'Input styling for TextField, Select, etc.',
    'ui.text': 'Typography for all MUI Typography variants',
    'ui.menuItem': 'Menu item styling for Menu components',
    'ui.chip': 'Chip styling for all MUI Chip variants',
    'ui.link': 'Link styling for MUI Link components'
  }
};
```

## Migration Strategy

### Week 1: Foundation
- [ ] Add MUI primitive tokens to ui-core
- [ ] Extend token editor with MUI sections
- [ ] Create basic context overrides for app, modal, card

### Week 2-3: Component Integration
- [ ] Implement context-aware MUI Button wrapper
- [ ] Implement context-aware MUI TextField wrapper
- [ ] Create EWI-specific context overrides
- [ ] Test in one EWI applet (ewi-events)

### Week 4-5: Advanced Features
- [ ] Implement MUI theme generation from tokens
- [ ] Add portal context inheritance
- [ ] Create context-aware wrappers for all MUI components
- [ ] Test across all EWI applets

### Week 6: Polish & Documentation
- [ ] Performance optimization
- [ ] Complete documentation
- [ ] Developer training materials
- [ ] Migration guides for existing components

## Success Metrics

### Token Reduction
- [ ] 70%+ reduction in MUI-related tokens
- [ ] Single source of truth for component styling
- [ ] Automatic context adaptation working

### Developer Experience
- [ ] Context-aware components work automatically
- [ ] Token editor supports MUI components
- [ ] Clear mental model: primitives + contexts

### User Experience
- [ ] Consistent styling across all EWI applications
- [ ] Perfect light/dark mode support
- [ ] Context-appropriate component appearance

## Risk Mitigation

1. **Backward Compatibility**: Maintain existing component APIs
2. **Gradual Migration**: Start with one applet, expand gradually
3. **Performance Monitoring**: Ensure CSS custom property performance
4. **Developer Training**: Workshop on new mental model
5. **Documentation**: Comprehensive guides and examples

---

*This context-aware approach transforms MUI theming from component-centric complexity to context-driven simplicity, leveraging our existing token editor infrastructure while dramatically reducing cognitive burden for developers and designers.*