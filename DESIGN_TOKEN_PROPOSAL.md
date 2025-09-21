# SMBC Group Design Token System Proposal

## Executive Summary

Based on a comprehensive analysis of all EWI (Early Warning Indicators) applets and the broader SMBC Group design system, this proposal outlines strategic additions to the existing design token architecture. The goal is to eliminate hardcoded values, improve consistency, and provide maximum flexibility for scaling across the application ecosystem.

## Current State Assessment

### Strengths of Existing System
The current design token system in `/packages/ui-core/tokens/` demonstrates sophisticated architecture:

- **Complete Brand Foundation**: TradGreen (#004831) and FreshGreen (#C4D700) with comprehensive secondary palettes
- **Robust Semantic System**: 425+ tokens covering backgrounds, text, borders, inputs, tables, cards, and navigation
- **Advanced Typography**: Complete font scale with semantic purpose mapping
- **Comprehensive Layout**: Spacing (4px base), border radius, breakpoints, and shadow systems
- **Light/Dark Mode**: Full dual-mode support across all semantic tokens

### Critical Gaps Identified

#### 1. **Status/Lifecycle Colors** (Highest Priority)
Currently hardcoded across multiple components:

```typescript
// EWI Events & Event Details
"#12A187" // On-course status (teal green)
"#FD992E" // Almost-due status (orange)
"#EF5569" // Past-due status (red)
"#CD463C" // Past-due alternative (darker red)
"#A32B9A" // Needs-attention (purple)

// Reports Components
"#4caf50" // Success/Completed (green)
"#ff9800" // Warning/Running (orange)
"#f44336" // Error/Failed (red)
```

#### 2. **Interactive State Patterns**
Complex gradients and hover states hardcoded in themes:

```typescript
// Button gradients
"linear-gradient(130.39deg, #024FB0 24.79%, #2C88F3 75.21%)"
"linear-gradient(130.39deg, #023d8a 24.79%, #2472d9 75.21%)"

// Navigation active states
"linear-gradient(90deg, #27A0E4 0%, #7BDEE9 100%)"
```

#### 3. **Alpha/Opacity System**
Frequent use of magic numbers for transparency:

```typescript
"rgba(255, 255, 255, 0.87)" // Primary text alpha
"rgba(255, 255, 255, 0.6)"  // Secondary text alpha
"rgba(255, 255, 255, 0.38)" // Disabled text alpha
"rgba(0, 0, 0, 0.26)"       // Elevation shadows
```

## Proposed Token Additions

### 1. Lifecycle Status System

**Core Status Colors:**
```json
{
  "semantic": {
    "status": {
      "lifecycle": {
        "on-course": {
          "light": { "value": "#12A187", "type": "color" },
          "dark": { "value": "#12A187", "type": "color" }
        },
        "almost-due": {
          "light": { "value": "#FD992E", "type": "color" },
          "dark": { "value": "#FD992E", "type": "color" }
        },
        "past-due": {
          "light": { "value": "#EF5569", "type": "color" },
          "dark": { "value": "#EF5569", "type": "color" }
        },
        "needs-attention": {
          "light": { "value": "#A32B9A", "type": "color" },
          "dark": { "value": "#A32B9A", "type": "color" }
        }
      }
    }
  }
}
```

**Background Variants:**
```json
{
  "semantic": {
    "background": {
      "status": {
        "on-course": {
          "light": { "value": "rgba(18, 161, 135, 0.1)", "type": "color" },
          "dark": { "value": "rgba(18, 161, 135, 0.2)", "type": "color" }
        },
        "almost-due": {
          "light": { "value": "rgba(253, 153, 46, 0.1)", "type": "color" },
          "dark": { "value": "rgba(253, 153, 46, 0.2)", "type": "color" }
        },
        "past-due": {
          "light": { "value": "rgba(239, 85, 105, 0.1)", "type": "color" },
          "dark": { "value": "rgba(239, 85, 105, 0.2)", "type": "color" }
        },
        "needs-attention": {
          "light": { "value": "rgba(163, 43, 154, 0.1)", "type": "color" },
          "dark": { "value": "rgba(163, 43, 154, 0.2)", "type": "color" }
        }
      }
    }
  }
}
```

### 2. Enhanced Interactive States

**Gradient System:**
```json
{
  "semantic": {
    "gradient": {
      "primary": {
        "default": {
          "light": {
            "value": "linear-gradient(130.39deg, #024FB0 24.79%, #2C88F3 75.21%)",
            "type": "color"
          },
          "dark": {
            "value": "linear-gradient(130.39deg, #024FB0 24.79%, #2C88F3 75.21%)",
            "type": "color"
          }
        },
        "hover": {
          "light": {
            "value": "linear-gradient(130.39deg, #023d8a 24.79%, #2472d9 75.21%)",
            "type": "color"
          },
          "dark": {
            "value": "linear-gradient(130.39deg, #023d8a 24.79%, #2472d9 75.21%)",
            "type": "color"
          }
        }
      },
      "navigation": {
        "active": {
          "light": {
            "value": "linear-gradient(90deg, #27A0E4 0%, #7BDEE9 100%)",
            "type": "color"
          },
          "dark": {
            "value": "linear-gradient(90deg, #27A0E4 0%, #7BDEE9 100%)",
            "type": "color"
          }
        }
      }
    }
  }
}
```

### 3. Systematic Alpha Channel System

**Core Alpha Values:**
```json
{
  "semantic": {
    "alpha": {
      "text": {
        "primary": { "value": "0.87", "type": "number" },
        "secondary": { "value": "0.6", "type": "number" },
        "disabled": { "value": "0.38", "type": "number" }
      },
      "interaction": {
        "hover": { "value": "0.04", "type": "number" },
        "selected": { "value": "0.08", "type": "number" },
        "focus": { "value": "0.12", "type": "number" }
      },
      "elevation": {
        "low": { "value": "0.1", "type": "number" },
        "medium": { "value": "0.15", "type": "number" },
        "high": { "value": "0.2", "type": "number" }
      }
    }
  }
}
```

### 4. Priority/Severity Scale

**Priority System for Filters & Chips:**
```json
{
  "semantic": {
    "priority": {
      "critical": {
        "light": { "value": "#d32f2f", "type": "color" },
        "dark": { "value": "#f44336", "type": "color" }
      },
      "high": {
        "light": { "value": "#ed6c02", "type": "color" },
        "dark": { "value": "#ff9800", "type": "color" }
      },
      "medium": {
        "light": { "value": "#1976d2", "type": "color" },
        "dark": { "value": "#2196f3", "type": "color" }
      },
      "low": {
        "light": { "value": "#2e7d32", "type": "color" },
        "dark": { "value": "#4caf50", "type": "color" }
      }
    }
  }
}
```

### 5. Enhanced Component Elevation

**Sophisticated Shadow System:**
```json
{
  "semantic": {
    "elevation": {
      "card": {
        "resting": {
          "light": {
            "value": "0px 1px 3px rgba(0,0,0,0.1)",
            "type": "boxShadow"
          },
          "dark": {
            "value": "0px 1px 3px rgba(0,0,0,0.3)",
            "type": "boxShadow"
          }
        },
        "hover": {
          "light": {
            "value": "0px 2px 8px rgba(0,0,0,0.15), 0px 4px 16px rgba(0,0,0,0.1)",
            "type": "boxShadow"
          },
          "dark": {
            "value": "0px 2px 8px rgba(0,0,0,0.4), 0px 4px 16px rgba(0,0,0,0.2)",
            "type": "boxShadow"
          }
        }
      },
      "modal": {
        "default": {
          "light": {
            "value": "0px 8px 32px rgba(0,0,0,0.12), 0px 16px 64px rgba(0,0,0,0.08)",
            "type": "boxShadow"
          },
          "dark": {
            "value": "0px 8px 32px rgba(0,0,0,0.5), 0px 16px 64px rgba(0,0,0,0.3)",
            "type": "boxShadow"
          }
        }
      }
    }
  }
}
```

## Component-Specific Recommendations

### EWI Event Details
- **Status Chip System**: Replace hardcoded colors with `semantic.status.lifecycle.*` tokens
- **Editor Theming**: Leverage existing input tokens for TipTap editor consistency
- **Tab Navigation**: Use existing navigation tokens with new hover states

### EWI Events
- **AG Grid Status**: Implement status tokens for cell rendering consistency
- **Filter Chips**: Use new priority tokens for filter state indication
- **Action Buttons**: Apply gradient tokens for workflow action consistency

### EWI Obligor
- **Dashboard Cards**: Use enhanced elevation tokens for card hierarchy
- **Status Indicators**: Consistent lifecycle status across all displays
- **Grid Theming**: Unified AG Grid appearance with other EWI applets

## Implementation Strategy

### Phase 1: Critical Status Colors (Week 1)
1. **Add lifecycle status tokens** to semantic.json
2. **Replace hardcoded values** in EWI Events components
3. **Update MUI theme overrides** to use new tokens
4. **Verify visual consistency** across light/dark modes

### Phase 2: Interactive States (Week 2)
1. **Implement gradient token system**
2. **Refactor button and navigation themes**
3. **Add alpha channel tokens** for systematic transparency
4. **Update hover/focus/active states** across components

### Phase 3: Component Enhancement (Week 3)
1. **Priority color system** for filters and chips
2. **Enhanced elevation tokens** for card hierarchies
3. **AG Grid theme integration** with new token system
4. **Documentation and examples** for new token usage

### Phase 4: System Validation (Week 4)
1. **Cross-applet consistency audit**
2. **Accessibility contrast validation**
3. **Performance impact assessment**
4. **Developer experience documentation**

## Expected Benefits

### Immediate Impact
- **Eliminates 20+ hardcoded color values** across EWI applets
- **Unifies status indication** across all workflow components
- **Reduces theme complexity** with systematic gradient tokens
- **Improves maintainability** with centralized color management

### Long-term Scalability
- **Semantic token foundation** supports rapid new applet development
- **Consistent interaction patterns** across entire application ecosystem
- **Accessibility compliance** through systematic contrast management
- **Future-proof architecture** for design system evolution

### Developer Experience
- **TypeScript autocompletion** for all new tokens
- **Clear naming conventions** reduce cognitive load
- **Comprehensive documentation** accelerates onboarding
- **Reduced CSS custom properties** needed in components

## Risk Mitigation

### Visual Regression Prevention
- **Comprehensive screenshot testing** before/after token implementation
- **Gradual rollout strategy** with component-by-component validation
- **Fallback mechanisms** for critical user workflows

### Performance Considerations
- **Token bundle size monitoring** to prevent bloat
- **CSS custom property optimization** for runtime performance
- **Build-time token resolution** where possible

### Team Adoption
- **Migration guides** for existing components
- **Code review checklists** to prevent hardcoded value regression
- **Design handoff processes** to ensure token usage in new features

## Conclusion

This proposal represents a strategic evolution of the SMBC Group design token system, building on the solid foundation already established. By addressing the identified gaps in status colors, interactive states, and component-specific tokens, we can achieve true design system maturity that scales across the entire application ecosystem while maintaining the high quality and consistency users expect from SMBC Group applications.

The phased implementation approach ensures minimal disruption to current development while delivering immediate value through improved consistency and maintainability. The semantic token architecture positions the system for long-term success as the application portfolio continues to grow and evolve.

---

**Document Prepared By:** Claude Code Analysis
**Date:** September 20, 2025
**Version:** 1.0
**Next Review:** After Phase 1 Implementation