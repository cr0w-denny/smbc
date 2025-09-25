# g4ldr Design Token System - v2 Architecture Plan

## Overview

g4ldr is a git-first, token-centric design system tool built in Rust. It focuses exclusively on design token creation, management, and export - leaving layout design to specialized tools like Figma.

## Architecture Philosophy

### Core Principle: Git-First Workflow
- **Single source of truth**: Git repository
- **Designer workflow**: g4ldr ↔ Git (primary)
- **Developer workflow**: Code ↔ Git (integrated)
- **Layout tools**: g4ldr → Figma/Sketch (one-way import)

### Why Git-First
- **True collaboration**: Designers and developers use same version control
- **No vendor lock-in**: Works with any git provider
- **Offline capable**: Full functionality without internet
- **Branching support**: Feature branches for token experiments
- **History tracking**: Every token change is versioned

## System Components

### 1. g4ldr Core Engine (TypeScript)

#### Modules
```
g4ldr-core/
├── src/
│   ├── token/
│   │   ├── manager.ts       # Token CRUD operations
│   │   ├── resolver.ts      # Reference/function resolution
│   │   ├── mixer.ts         # Token set blending
│   │   └── functions.ts     # Standard function library
│   ├── git/
│   │   ├── sync.ts          # Git operations (simple-git)
│   │   ├── diff.ts          # Change detection
│   │   └── merge.ts         # Conflict resolution
│   ├── library/
│   │   ├── catalog.ts       # Built-in token sets
│   │   ├── download.ts      # Community marketplace
│   │   └── templates.ts     # Project templates
│   ├── import/
│   │   ├── tailwind.ts      # Extract from Tailwind
│   │   ├── mui.ts           # Extract from MUI
│   │   └── figma.ts         # Extract from Figma files
│   └── export/
│       ├── css.ts           # CSS custom properties
│       ├── typescript.ts    # TS token objects
│       ├── swift.ts         # iOS tokens
│       ├── kotlin.ts        # Android tokens
│       └── figma.ts         # Figma style import
```

#### Token Function System
```typescript
// Built-in functions (TypeScript implementations)
color.darken(10)              // Darken by 10%
color.lighten(20)             // Lighten by 20%
color.alpha(0.5)              // 50% opacity
color.mix(other, 30)          // Mix 30% with other
spacing.multiply(1.5)         // Scale by 1.5x
typography.scale(1.2, 3)      // Modular scale
```

### 2. g4ldr CLI

#### Commands
```bash
# Project management
g4ldr init [template]         # Initialize .g4ldr config in existing git repo
g4ldr status                  # Show token status + git status

# Token operations
g4ldr forge button-primary    # Create new token
g4ldr mix nord material       # Blend token sets
g4ldr build                   # Build/compile tokens
g4ldr preview button          # Terminal preview

# Library management
g4ldr install tailwind-colors # Install from library
g4ldr search "dark theme"     # Search marketplace
g4ldr publish my-tokens       # Publish to marketplace

# Export
g4ldr export --css           # Export CSS variables
g4ldr export --figma         # Export Figma styles
g4ldr export --ios           # Export iOS tokens

# Use regular git commands:
git add .
git commit -m "update primary colors"
git push origin main
git checkout -b new-theme
git merge main
```

#### Git Integration Philosophy
g4ldr **augments** git workflow, doesn't replace it:

- **g4ldr init** sets up `.g4ldr/` config in existing repo
- **g4ldr status** shows token changes + `git status`
- **g4ldr build** compiles tokens, ready for `git add`
- **Use git directly** for all version control operations

#### Git-Aware, Not Git-Controlling
g4ldr should be "git-aware" but never "git-controlling":

**✅ What g4ldr SHOULD do:**
- **Show current branch** in UI
- **Reflect current repo state** automatically
- **Warn about uncommitted changes** before destructive operations
- **Provide git workflow tips** in documentation

**❌ What g4ldr should NOT do:**
- **Don't switch branches** - Respect user's git workflow
- **Don't auto-commit** - User controls when to commit
- **Don't manage git state** - No stashing, merging, rebasing

**Why this matters:**
- **Git users have workflows** - Branching strategies, commit patterns
- **Branch switching affects entire repo** - Not just tokens, all files
- **Git state is complex** - Uncommitted changes, conflicts, etc.
- **Respect user control** - Let them manage git how they want

**UI Design:**
```
┌─ Repository Status ─────────────────┐
│ Branch: feature/dark-theme          │
│ Status: Clean                       │
│ Behind origin: 2 commits            │
│ [ Refresh ]                         │
│                                     │
│ 💡 Tip: Consider creating a branch  │
│    for token experiments:           │
│    git checkout -b theme-experiment │
└─────────────────────────────────────┘
```

**Example workflow:**
```bash
# Clone existing design system repo
git clone https://github.com/company/design-system
cd design-system

# Initialize g4ldr in the repo
g4ldr init

# Work on tokens
g4ldr forge accent-color
g4ldr mix nord-colors
g4ldr build

# Use git normally
git add .
git commit -m "feat: add new accent color with nord palette"
git push

# Create feature branch
git checkout -b dark-theme-experiment
g4ldr install dark-theme-collection
g4ldr build
git add . && git commit -m "experiment: try dark theme"
git push -u origin dark-theme-experiment
```

### 3. g4ldr Desktop App (Tauri + TypeScript)

#### Interface Design
```
┌─────────────────────────────────────────────────────────┐
│ g4ldr - Token Studio                           ─ □ ✕   │
├─────────────────────────────────────────────────────────┤
│ Project: design-system-v2    Branch: main     [Sync]   │
├─────────────┬─────────────────────┬───────────────────────┤
│ Token Tree  │ Editor              │ Preview & Export     │
│             │                     │                      │
│ ▼ Library   │ ┌─ primary ───────┐ │ ┌─ Live Preview ───┐ │
│ • tailwind  │ │ #004831         │ │ │ ■ Button        │ │
│ • material  │ │ $brand.main     │ │ │ ■ Alert         │ │
│ • nord      │ │ .darken(10)     │ │ │ ■ Card          │ │
│             │ └─────────────────── │ └─────────────────── │
│ ▼ My Tokens │                     │                      │
│ • colors    │ ┌─ Mixer ─────────┐ │ ┌─ Export ────────┐ │
│ • spacing   │ │ Base: Material  │ │ │ [CSS] [Figma]   │ │
│ • shadows   │ │ + Nord colors   │ │ │ [iOS] [Android] │ │
│             │ │ + Custom space  │ │ │                 │ │
│ ▼ Git       │ └─────────────────── │ └─────────────────── │
│ • main      │                     │                      │
│ • feature-1 │ ┌─ Function Builder│ │ ┌─ Terminal ──────┐ │
│ [+ Branch]  │ │ $color.primary.  │ │ │ $ g4ldr cast    │ │
│             │ │   darken( 10 )▼ │ │ │ ✓ Built tokens  │ │
│ 📝 2 staged │ └─────────────────── │ └─────────────────── │
│ [Commit]    │                     │                      │
└─────────────┴─────────────────────┴───────────────────────┘
```

#### Key Features
- **Project-based**: Each design system is a git repo
- **Token Library**: Browse/install from massive built-in catalog
- **Visual Mixing**: Drag-and-drop token set blending
- **Live Preview**: See tokens applied to components instantly
- **Git Integration**: Branch, commit, push/pull directly in UI
- **Multi-export**: Generate for all platforms simultaneously

### 4. Layout Tool Integration

#### One-Way Sync Model
g4ldr doesn't try to be a layout tool. Instead, it feeds tokens to layout tools:

**g4ldr → Figma:**
```bash
# Export Figma styles file
g4ldr export --figma styles.json

# Figma plugin imports styles
figma.importStyles('./styles.json')
```

**g4ldr → Sketch:**
```bash
# Export Sketch library
g4ldr export --sketch tokens.sketch
```

**Workflow:**
1. Designer creates/edits tokens in g4ldr
2. g4ldr exports to Figma styles
3. Designer uses Figma for layouts with those styles
4. No tokens edited in Figma - g4ldr remains source of truth

## Token Library System

### Built-in Token Sets
Ships with professional token collections:

#### Design Systems
- **Material Design**: Complete Google Material tokens
- **Tailwind**: All Tailwind utility classes as tokens
- **Bootstrap**: Bootstrap variable system
- **Carbon**: IBM's Carbon design system
- **Ant Design**: Complete Ant token set

#### Color Palettes
- **Developer Themes**: Nord, Dracula, Solarized, One Dark
- **Brand Palettes**: Extracted from major brands
- **Accessibility**: WCAG-compliant color systems
- **Generative**: Algorithmic palette generators

#### Typography Systems
- **Modular Scales**: Golden ratio, perfect fourth, major third
- **System Fonts**: Platform-optimized font stacks
- **Web Fonts**: Popular Google Fonts configurations

### Community Marketplace
- **Publishing**: `g4ldr publish my-awesome-tokens`
- **Discovery**: `g4ldr search "cyberpunk theme"`
- **Installation**: `g4ldr install user/dark-theme`
- **Versioning**: Semantic versioning for token sets
- **Dependencies**: Token sets can depend on others

## Advantages Over Figma-First Approach

### For Designers
- **No subscription costs**: Completely free
- **Massive token library**: Start with professional tokens
- **Algorithmic generation**: Create variations programmatically
- **True version control**: Branch, merge, diff tokens
- **Multi-platform**: Export to iOS, Android, web simultaneously

### For Developers
- **Native git workflow**: Same tools, same process
- **Performance**: Rust engine handles thousands of tokens
- **Automation**: Scriptable via CLI
- **No API limits**: Direct file system access
- **Type safety**: Generated TypeScript with proper types

### For Teams
- **Single source of truth**: Git repository
- **No sync conflicts**: Proper merge conflict resolution
- **Offline work**: Full functionality without internet
- **Tool independence**: Not locked into any design tool
- **Cost effective**: Zero recurring costs

## Implementation Phases

### Phase 1: Core Engine (8 weeks)
- [x] Rust token engine with basic functions
- [x] Git integration (clone, commit, push/pull)
- [x] CLI with essential commands
- [x] Basic token library (Material, Tailwind)

### Phase 2: Desktop UI (6 weeks)
- [x] Tauri app with token editor
- [x] Visual token mixer
- [x] Live preview system
- [x] Git UI integration

### Phase 3: Export System (4 weeks)
- [x] CSS/SCSS/TypeScript exporters
- [x] Figma style export
- [x] iOS/Android token export
- [x] Multi-format build system

### Phase 4: Community Features (8 weeks)
- [x] Token marketplace
- [x] Publishing system
- [x] Advanced mixing algorithms
- [x] AI-assisted generation

## Success Metrics

- **Adoption**: 10k+ GitHub stars
- **Community**: 500+ published token sets
- **Performance**: Handle 10k+ tokens smoothly
- **Integration**: Support for 20+ frameworks/platforms
- **Developer satisfaction**: Faster token workflows vs manual process

## Why This Works Better

### Focused Scope
- **Does one thing well**: Token management only
- **Integrates with existing tools**: Doesn't replace Figma, enhances it
- **Clear value proposition**: Free, fast, git-native tokens

### Technical Advantages
- **TypeScript**: Familiar language, great tooling, type safety
- **Tauri wrapper**: Native performance, small binaries (~10MB)
- **Git native**: True version control, not sync hacks
- **Multi-platform**: Single codebase, all platforms
- **Extensible**: Plugin system for custom functions

### Community Benefits
- **Open source**: No vendor lock-in
- **Free forever**: No subscription model
- **Extensible**: Community can add features
- **Standards-based**: Uses git, follows W3C token spec

This v2 approach positions g4ldr as a specialized, powerful tool that complements existing design workflows rather than trying to replace them entirely.