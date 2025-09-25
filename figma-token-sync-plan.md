# Design Token Sync System Plan - v1 (ARCHIVED)

## ⚠️ DEPRECATED APPROACH

This document represents the original Figma-centric approach. We've moved to a g4ldr-centric architecture in v2.

**Why we changed:**
- Figma sync is complex and fragile
- Git-first workflow is more reliable
- g4ldr should be primary tool, not secondary
- One-way export is simpler than bidirectional sync

**See:** [g4ldr-system-plan-v2.md](./g4ldr-system-plan-v2.md) for current architecture.

---

## Original Overview (v1)

Create a platform-agnostic design token synchronization system with adapters for multiple design tools, enabling seamless collaboration between designers and developers. Core functionality should be decoupled from any specific design tool.

## Architecture

### 1. Token Generation Pipeline (ui-core)

```
Source Definition → Multi-Format Build → Output Formats
                                      ├── TypeScript (.ts)
                                      ├── JSON (.json)
                                      ├── CSS Variables (.css)
                                      └── Documentation (.md)
```

#### Build Script Enhancement

```javascript
// packages/ui-core/scripts/build-tokens.js
const tokenSource = loadTokenDefinitions("./src/tokens/definitions");

const outputs = {
  typescript: generateTypeScript(tokenSource), // Existing
  json: generateJSON(tokenSource), // For Figma
  css: generateCSSVariables(tokenSource), // For runtime
  docs: generateDocumentation(tokenSource), // For reference
};

writeOutputs(outputs, "./dist/tokens/");
```

### 2. Core Token Engine (Rust)

#### Core Modules

- **Token Manager**: Handles token CRUD operations (Rust)
- **Resolver Engine**: Resolves token references and functions (Rust)
- **Mixer Engine**: Blends multiple token sets (Rust performance-critical)
- **Git Integration**: Handles version control operations (git2-rs)
- **Import/Export**: Multi-format processing (Rust for speed)
- **CLI Interface**: Command-line tool (clap-rs)

#### Library Structure

```
g4ldr-core/
├── src/
│   ├── token/
│   │   ├── mod.rs           # Token module
│   │   ├── manager.rs       # CRUD operations
│   │   ├── resolver.rs      # Reference resolution
│   │   ├── mixer.rs         # Token blending engine
│   │   └── functions.rs     # Standard function library
│   ├── git/
│   │   ├── mod.rs           # Git module
│   │   ├── sync.rs          # Sync operations
│   │   └── diff.rs          # Change detection
│   ├── import/
│   │   ├── mod.rs           # Import module
│   │   ├── tailwind.rs      # Tailwind importer
│   │   ├── mui.rs           # MUI importer
│   │   └── figma.rs         # Figma API integration
│   ├── export/
│   │   ├── mod.rs           # Export module
│   │   ├── css.rs           # CSS variables
│   │   ├── typescript.rs    # TypeScript tokens
│   │   └── swift.rs         # iOS tokens
│   └── cli/
│       ├── mod.rs           # CLI module
│       ├── commands.rs      # Command implementations
│       └── preview.rs       # Terminal preview
├── bindings/
│   ├── node/               # Node.js bindings (napi-rs)
│   ├── python/             # Python bindings (PyO3)
│   └── wasm/               # WASM bindings
└── Cargo.toml
```

### 3. g4ldr - Standalone Design Token System

#### Concept
A badass, free, open-source design token system that provides professional-grade token management without expensive tool subscriptions. Git-first workflow with both CLI and desktop UI. Named after Galdr - Norse runic magic that shapes reality through incantations.

#### Core Philosophy
- **Massive Token Library**: Ships with hundreds of pre-built, mixable token sets
- **Free UI Kit Support**: First-class support for all major open-source UI kits
- **Mix & Match**: Combine tokens from different sets to create unique designs
- **CLI-First**: Powerful CLI with optional GUI for visual editing
- **Git Native**: Every operation is git-friendly

#### Token Library
Ships with extensive token collections:
- **Base Sets**: Material, Tailwind, Bootstrap, Ant Design, Carbon
- **Color Palettes**: Nord, Dracula, Solarized, Monokai, One Dark, Catppuccin
- **Type Scales**: Modular scales, fluid typography, system fonts
- **Spacing Systems**: 8pt grid, golden ratio, fibonacci
- **Shadow Collections**: Material elevation, Tailwind shadows, custom depth
- **Animation Presets**: Spring physics, ease curves, duration scales

#### CLI Power Features
```bash
# Mix multiple token sets
g4ldr mix nord-colors material-shadows tailwind-spacing

# Generate variations
g4ldr forge primary --variations 10 --method "tint-shade"

# Import from any UI framework
g4ldr import @mui/material --extract-tokens
g4ldr import tailwindcss --map-to-tokens

# Live preview in terminal
g4ldr preview button --theme dark --colorscheme nord

# Export to any format
g4ldr export --format [css|scss|less|stylus|swift|kotlin|json]
```

#### Free UI Kit Integration
Native support for open-source design systems:
- **MUI/Material-UI**: Full token extraction and sync
- **Ant Design**: Complete design language support
- **Chakra UI**: Theme and component tokens
- **Tailwind UI**: Utility class mapping
- **Bootstrap**: Variable extraction
- **Semantic UI**: Theme configuration sync
- **Bulma**: Sass variable integration
- **Foundation**: Settings sync
- **Carbon Design**: Full IBM system support
- **Primer**: GitHub's design system

#### Advanced Features
- **Token Mixing Engine**: Blend multiple token sets with conflict resolution
- **AI Suggestions**: "Make this more cyberpunk" → adjusts tokens
- **Physics-Based Tokens**: Spring animations, fluid dynamics
- **Procedural Generation**: Generate color palettes, type scales algorithmically
- **Token DNA**: Each token set has a "DNA" string for sharing/reproducing
- **Community Marketplace**: Share and download token sets

#### Architecture (Rust + Tauri)
```
g4ldr/
├── src-tauri/            # Rust backend
│   ├── src/
│   │   ├── main.rs       # Application entry
│   │   ├── token/        # Token engine (pure Rust)
│   │   │   ├── resolver.rs    # Token resolution
│   │   │   ├── mixer.rs       # Token mixing engine
│   │   │   └── functions.rs   # Standard library
│   │   ├── git/          # Git operations (git2-rs)
│   │   ├── import/       # Framework importers
│   │   └── export/       # Multi-format exporters
│   └── Cargo.toml        # Rust dependencies
├── src/                  # Frontend (React/Svelte/Vue)
│   ├── Editor.tsx        # Token editor UI
│   ├── Preview.tsx       # Live preview
│   └── Terminal.tsx      # Built-in terminal
└── tauri.conf.json       # Tauri configuration
```

#### Why Rust + Tauri
- **Performance**: Rust token engine is blazing fast
- **Small binaries**: ~10MB vs ~150MB Electron
- **Memory efficient**: Native performance, no Chromium overhead
- **Security**: Memory-safe, no npm supply chain risks
- **Cross-platform**: Single codebase for Win/Mac/Linux
- **Native features**: System tray, file associations, native menus
- **WASM compatible**: Core can run in browsers too

### 4. g4ldr UI Design & User Experience

#### Interface Design
The g4ldr interface is designed for **token-focused workflow**, not illustration or complex layouts:

```
┌─────────────────────────────────────────────────────────────────┐
│ g4ldr - Design Token Studio                            ─ □ ✕    │
├─────────────────────────────────────────────────────────────────┤
│ [File] [Edit] [Token] [Mix] [Export] [Git] [Help]              │
├─────────────┬─────────────────────┬─────────────────────────────┤
│ Token Tree  │ Editor Panel        │ Live Preview               │
│             │                     │                            │
│ ▼ Colors    │ ┌─ primary ────────┐ │ ┌─ Component Previews ───┐ │
│   • primary │ │ Value: #004831   │ │ │ ■ Button Primary      │ │
│   • error   │ │ Type:  Color     │ │ │ ■ Alert Success       │ │
│   • success │ │ Ref:   $brand.1  │ │ │ ■ Card Background     │ │
│             │ │ Func:  darken(5) │ │ │                       │ │
│ ▼ Spacing   │ └─────────────────── │ │ ┌─ Theme Switcher ────┐ │
│   • xs      │                     │ │ │ [ Light | Dark ]    │ │
│   • sm      │ ┌─ Function Builder │ │ │ [ Nord | Material ] │ │
│   • md      │ │ $color.primary.   │ │ │                     │ │
│   • lg      │ │   ├ darken(10)    │ │ │ ┌─ Export Preview ──┐ │
│             │ │   ├ lighten(20)   │ │ │ │ --primary: #004831│ │
│ ▼ Typography│ │   ├ alpha(0.5)    │ │ │ │ --success: #4caf50│ │
│   • h1      │ │   └ mix(...)      │ │ │ │                   │ │
│   • body    │ └───────────────────── │ └─────────────────────┘ │
│             │                     │                            │
│ ▼ Git       │ ┌─ Token Mixer ─────┐ │ ┌─ Terminal (Built-in) ─┐ │
│   • 3 staged│ │ Base: Material-UI │ │ │ $ g4ldr mix nord      │ │
│   • 1 change│ │ +Colors: Nord     │ │ │ ✓ Mixed 47 tokens     │ │
│   [Commit]  │ │ +Shadows: Tailwind│ │ │ $ g4ldr cast          │ │
└─────────────┴─────────────────────┴─────────────────────────────┘
```

#### Key Interface Features

**Token-First Design:**
- **No canvas/artboard** - Focus purely on design system tokens
- **Tree navigation** - Explore tokens like code structure
- **Live preview** - See changes instantly on real components
- **Function autocomplete** - IntelliSense for token references

**Unique Workflow Elements:**
- **Token Mixer Panel** - Visually blend multiple design systems
- **Function Builder** - Build complex token relationships visually
- **Built-in Terminal** - CLI commands integrated into UI
- **Git Panel** - Version control without leaving the app
- **Theme Switcher** - Preview multiple themes simultaneously

#### Why Designers Would Choose g4ldr Over Figma

**For Token-Heavy Work:**
- **Token-native workflow** - Everything built around design systems
- **Massive token library** - Start with professional tokens, not blank canvas
- **Function system** - Create dynamic relationships between tokens
- **Real-time code preview** - See exactly how tokens affect components
- **Git workflow** - True collaboration with developers
- **Free & open source** - No subscription, no vendor lock-in

**For System Designers:**
- **Procedural generation** - Auto-generate color palettes, type scales
- **Token DNA** - Each design has a shareable genetic code
- **Multi-framework export** - Target React, Vue, iOS, Android simultaneously
- **Performance** - Handle thousands of tokens without lag
- **CLI power** - Scriptable, automatable workflows

#### Why Designers Would NOT Choose g4ldr

**g4ldr Is NOT Good For:**
- **Illustration/graphics** - No drawing tools, vector editing
- **Complex layouts** - No layout tools, grids, frames
- **User research** - No prototyping, user flows, wireframes
- **Team brainstorming** - No collaborative whiteboarding
- **Client presentations** - No presentation mode, slides
- **Asset management** - No icon libraries, image handling

**Figma Is Better For:**
- **Full design process** - Research → wireframes → high-fidelity → handoff
- **Collaborative design** - Real-time co-editing, comments
- **Prototyping** - Interactive mockups, user flows
- **Component libraries** - Visual component management
- **Design meetings** - Screen sharing, presentation mode
- **Non-systematic work** - One-off designs, exploration

#### The Sweet Spot

**g4ldr excels when:**
- Building/maintaining design systems
- Token-heavy workflows
- Developer collaboration is critical
- Need procedural/algorithmic design
- Want git-native workflow
- Cost is a concern (free vs $15/month)

**Use both when:**
- g4ldr for tokens/system → Export to Figma for layouts/prototypes
- Figma for design exploration → g4ldr for systematic implementation

g4ldr isn't trying to replace Figma completely - it's laser-focused on making design system work amazing and free.

#### Workflow
1. Designer clones design system repo
2. Opens standalone app, points to repo
3. Edits tokens visually with live preview
4. Commits changes with descriptive message
5. Creates PR directly from app
6. Developer reviews and merges

### 4. Figma Plugin (Adapter Implementation)

Uses the core library with Figma-specific adapter:

```typescript
import { TokenSyncCore, FigmaAdapter } from 'token-sync-core';

const sync = new TokenSyncCore({
  adapter: new FigmaAdapter(figma),
  gitRemote: 'https://github.com/org/design-system'
});
```

### 5. Token Mapping Strategy

#### Color Tokens

```json
{
  "color.brand.primary.tradGreen": "#004831"
}
```

→ Figma Color Style: "Brand / Primary / Trad Green"

#### Typography Tokens

```json
{
  "typography.heading.large": {
    "fontFamily": "Inter",
    "fontSize": "32px",
    "fontWeight": 600,
    "lineHeight": 1.2
  }
}
```

→ Figma Text Style: "Heading / Large"

#### Spacing Tokens

```json
{
  "size.spacing.md": "16px"
}
```

→ Figma Variable: "Spacing / MD"

### 4. Sync Workflow

#### Import Flow (ui-core → Figma)

1. Fetch latest `tokens.json` from ui-core build
2. Parse and validate token structure
3. Detect changes vs current Figma styles
4. Preview changes in UI
5. Apply updates to Figma document
6. Log sync history

#### Export Flow (Figma → ui-core)

1. Extract all Figma styles and variables
2. Transform to ui-core token format
3. Validate against token schema
4. Generate `tokens.json` update
5. Create PR or export file
6. Trigger ui-core rebuild

### 5. Implementation Phases

#### Phase 1: Core Sync (MVP)

- [ ] JSON token format generation in ui-core
- [ ] Basic Figma plugin structure
- [ ] Color token import/export
- [ ] Manual sync trigger

#### Phase 2: Extended Token Support

- [ ] Typography tokens
- [ ] Spacing/sizing tokens
- [ ] Shadow tokens
- [ ] Border radius tokens

#### Phase 3: Advanced Features

- [ ] Automatic sync on changes
- [ ] GitHub integration
- [ ] Conflict resolution UI
- [ ] Token usage analytics
- [ ] Theme switching

#### Phase 4: Team Collaboration

- [ ] Token change history
- [ ] Comments and annotations
- [ ] Design-dev handoff notes
- [ ] Token documentation generation

### 6. Technical Requirements

#### Figma Plugin

- Figma Plugin API v1.0.0+
- React 18+ for UI
- TypeScript for type safety
- Webpack for bundling

#### ui-core Integration

- JSON export format
- Token validation schema
- Build script hooks
- Version tracking

### 7. Token Format Specification

#### JSON Structure

```json
{
  "version": "1.0.0",
  "tokens": {
    "color": {
      "description": "Color tokens",
      "values": {
        "brand": {
          "primary": {
            "tradGreen": {
              "value": "#004831",
              "type": "color",
              "description": "Primary brand color"
            }
          }
        }
      }
    },
    "typography": {
      "description": "Typography tokens",
      "values": {
        "heading": {
          "large": {
            "value": {
              "fontFamily": "Inter",
              "fontSize": "32px",
              "fontWeight": 600
            },
            "type": "typography"
          }
        }
      }
    }
  }
}
```

### 8. Error Handling

#### Validation Rules

- Token naming conventions
- Value format validation
- Required property checks
- Circular reference detection

#### Conflict Resolution

- Duplicate style names
- Type mismatches
- Value conflicts
- Missing dependencies

### 9. Performance Considerations

- Batch style updates
- Incremental sync
- Caching mechanisms
- Async operations
- Progress indicators

### 10. Token Function Resolution

#### Resolver Architecture

```javascript
// Token resolver with pluggable functions
class TokenResolver {
  constructor(tokens, functions = {}) {
    this.tokens = tokens;
    this.functions = {
      ...standardLibrary, // Built-in functions
      ...functions, // Custom functions
    };
  }

  resolve(value) {
    // Parse $token.path.function(args) syntax
    // Apply functions from library
    // Return resolved value
  }
}
```

#### Standard Function Library

```javascript
const standardLibrary = {
  // Color functions
  darken: (color, amount) => {
    /* ... */
  },
  lighten: (color, amount) => {
    /* ... */
  },
  alpha: (color, opacity) => {
    /* ... */
  },
  mix: (color1, color2, ratio) => {
    /* ... */
  },
  contrast: (color) => {
    /* ... */
  },

  // Numeric functions
  multiply: (value, factor) => value * factor,
  divide: (value, divisor) => value / divisor,
  add: (value, addend) => value + addend,
  subtract: (value, subtrahend) => value - subtrahend,
  round: (value, precision) => {
    /* ... */
  },

  // Typography functions
  scale: (base, ratio, steps) => {
    /* ... */
  },
  clamp: (min, preferred, max) => {
    /* ... */
  },
};
```

#### Token Examples with Functions

```json
{
  "color": {
    "primary": "#004831",
    "primary-hover": "$color.primary.darken(10)",
    "primary-disabled": "$color.primary.alpha(0.5)",
    "primary-contrast": "$color.primary.contrast()",
    "surface-tint": "$color.primary.mix($color.surface, 5)"
  },

  "spacing": {
    "base": 8,
    "scale": {
      "xs": "$spacing.base.divide(2)",
      "sm": "$spacing.base.multiply(0.75)",
      "md": "$spacing.base",
      "lg": "$spacing.base.multiply(2)",
      "xl": "$spacing.base.multiply(3)"
    }
  },

  "typography": {
    "size": {
      "base": 16,
      "h1": "$typography.size.base.scale(1.5, 3)",
      "h2": "$typography.size.base.scale(1.5, 2)",
      "h3": "$typography.size.base.scale(1.5, 1)",
      "small": "$typography.size.base.multiply(0.875)"
    }
  }
}
```

#### Custom Function Support

```javascript
// Users can provide custom functions
const customFunctions = {
  brandify: (color) => mix(color, "#004831", 10),
  gridAlign: (value) => Math.round(value / 8) * 8,
};

const resolver = new TokenResolver(tokens, customFunctions);
```

### 11. Intelligent Autocomplete System

#### Autocomplete Features

The plugin provides intelligent autocomplete when editing token values:

**Token Reference Autocomplete:**
```
User types: "$col"
Suggests:  → $color
           → $color.primary
           → $color.primary.tradGreen
           → $color.secondary.honeyBeige
```

**Function Autocomplete:**
```
User types: "$color.primary.dar"
Suggests:  → darken(amount)
           → With signature: darken(amount: 0-100)
```

**Custom Function Discovery:**
```
User types: "$spacing.base.gr"
Suggests:  → gridAlign() [custom]
           → With tooltip: "Aligns to 8px grid"
```

#### Implementation

```typescript
interface AutocompleteProvider {
  // Get suggestions based on current input
  getSuggestions(input: string): Suggestion[];

  // Token path completion
  getTokenPaths(prefix: string): TokenPath[];

  // Function suggestions for a token type
  getFunctions(tokenType: TokenType): FunctionSig[];

  // Include custom functions from config
  registerCustomFunctions(funcs: CustomFunctions): void;
}

interface Suggestion {
  label: string;
  detail: string;        // e.g., "Color function"
  insertText: string;    // What to insert
  documentation?: string; // Tooltip help
  kind: 'token' | 'function' | 'custom-function';
}
```

**Smart Context Detection:**
- Detects token type to suggest relevant functions only
- Shows function signatures with parameter hints
- Indicates which functions are custom vs built-in
- Previews the resolved value in real-time

**Example UI Flow:**
```
Input field: [button-hover: $color.primary.|]
                                           ↑ cursor

Dropdown shows:
┌─────────────────────────────────────┐
│ darken(10)     Darken by 10%       │
│ lighten(10)    Lighten by 10%      │
│ alpha(0.5)     50% transparency    │
│ mix(...)       Mix with another    │
│ brandify()     Custom: Brand tint  │
└─────────────────────────────────────┘
```

### 12. Supported Workflow Patterns

#### Design Philosophy
The system supports both developer-initiated and designer-initiated token creation, recognizing that:
- **Developers** best understand where tokens are needed in code (semantic structure)
- **Designers** best understand what values look and feel right (visual refinement)

#### Developer Strengths
- Creating semantic tokens (`button-primary`, `surface-elevated`)
- Defining token relationships (`$color.primary.darken(10)`)
- Establishing systematic scales (spacing, typography hierarchies)
- Identifying reusable patterns in code

#### Designer Strengths
- Adjusting color values for visual harmony
- Fine-tuning proportions and relationships
- Creating new visual styles that may need tokens
- Validating accessibility and aesthetics

#### Bidirectional Token Creation
Both roles can create new tokens:

**Developer-initiated:**
```json
// Dev creates semantic token for code need
"alert-background": "$color.warning.alpha(0.1)"
```

**Designer-initiated:**
```
// Designer creates new Figma style
Figma Style: "Accent / Highlight"
Plugin: "Create new token from this style?"
→ Generates: "accent-highlight": "#E1C281"
```

### 12. Real-World Workflow Examples

#### Scenario: Designer needs a new hover state

**Designer (in Figma):**

1. Opens Figma, notices button hover color is too subtle
2. Opens token plugin, sees current value:
   ```json
   "button-hover": "$color.primary.darken(10)"
   ```
3. Adjusts directly in plugin UI: changes to `darken(15)`
4. Clicks "Preview" - sees all buttons update in Figma
5. Clicks "Push Changes"

**Automated System:**

```bash
# Plugin generates commit
git commit -m "design: increase button hover contrast
- Changed hover from darken(10) to darken(15)
- Improves accessibility and visual feedback"
```

**Developer (gets notification):**

1. Sees PR: "Token update from Figma - button hover adjustment"
2. Reviews diff:
   ```diff
   - "button-hover": "$color.primary.darken(10)"
   + "button-hover": "$color.primary.darken(15)"
   ```
3. Runs build locally - generates:
   - Updated TypeScript tokens
   - Updated CSS variables
   - New Storybook preview
4. Approves and merges

**Designer (5 minutes later):**

1. Gets notification: "Your token changes are live"
2. Opens staging site, confirms hover looks good
3. But realizes error text needs adjustment too...

#### Scenario: Developer adds new semantic token

**Developer (in code):**

1. Needs a "success-light" variant for backgrounds
2. Adds to tokens.json:
   ```json
   "success-light": "$color.success.alpha(0.1)"
   ```
3. Commits and pushes

**Designer (next morning):**

1. Opens Figma, gets plugin notification: "3 new tokens available"
2. Clicks "Sync from Code"
3. New color appears in Figma styles automatically
4. Starts using it in designs immediately
5. Realizes alpha(0.1) is too light, changes to alpha(0.15)
6. Pushes update back

**Both:**

- No meetings needed
- No "what's the hex value?" Slack messages
- No manual color picking
- Single source of truth maintained

#### Scenario: Accidental Conflict

**Designer & Developer (simultaneously):**

- Designer: Changes `spacing.large` from 24 to 32 in Figma
- Developer: Changes `spacing.large` from 24 to 28 in code

**System detects conflict:**

```
⚠️ Token Conflict Detected
spacing.large:
  - Current: 24
  - Figma (Sarah): 32 "Need more breathing room in cards"
  - Code (Alex): 28 "Matching 8px grid system"

[Use Figma Value] [Use Code Value] [Open Discussion]
```

**Resolution:**

1. They click "Open Discussion"
2. Plugin creates GitHub issue with both versions
3. Quick Slack chat: agree on 32
4. Designer's value wins, developer adjusts grid system docs

## g4ldr - The Chosen Name

**g4ldr** - From Old Norse "Galdr", runic magic that shapes reality through incantations. Perfect metaphor for design tokens shaping digital reality.

### Why g4ldr Works
- **Norse mythology ties**: Fits v0id/0din ecosystem perfectly
- **Meaning**: Galdr = incantations/spells = design tokens
- **L33t aesthetic**: g4ldr looks hardcore
- **Pronounceable**: "galder" sounds professional
- **Short**: 5 characters, easy to type
- **Unique**: Not taken, googleable
- **Expandable**: g4ldr-core, g4ldr-sync, g4ldr-studio

### Usage Examples
```bash
g4ldr init                    # Initialize new token system
g4ldr cast                    # Apply tokens (casting spells)
g4ldr forge button-primary    # Create new token (forging runes)
g4ldr mix nord material       # Mix token sets (mixing magic)
g4ldr summon tailwind        # Import from framework
```

## Alternative Name Ideas (Archived)

### L33t Norse Collection
- **run3f0rg3** - Runeforge (token creation)
- **v0lv4** - Völva (Norse seeress/witch)
- **mj0ln1r** - Thor's hammer (powerful tool)
- **s31dr** - Seidr (Norse magic)
- **sk4ld** - Skald (keeper of stories)
- **0d1n-f0rg3** - Odin's forge
- **n0rd1c-c0r3** - Nordic core

### Original Ideas
- **TokenForge** - Forging design tokens
- **Palette** - Simple, designer-friendly
- **Foundry** - Where tokens are created
- **Tint** - Simple, memorable
- **Prism** - Breaking down design
- **GitDesign** - Git-first workflow
- **OpenTokens** - Clear and open source

## Resources

- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [Style Dictionary](https://amzn.github.io/style-dictionary/)
- [Design Tokens W3C](https://design-tokens.github.io/community-group/)
- [Tokens Studio](https://tokens.studio/) (reference implementation)
