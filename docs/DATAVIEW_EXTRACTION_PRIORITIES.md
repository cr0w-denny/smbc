# DataView Package Extraction Priorities

## Overview

Analysis of the most valuable and easiest-to-extract features from the monolithic `@smbc/dataview` package to guide incremental refactoring efforts.

## Top 3 Most Valuable Features to Extract

### 1. **Action System** (`@smbc/action-core` + `@smbc/action-helpers`)

**Value Score: 9/10**

**Why it's valuable:**
- **Reusability**: Actions are needed everywhere - tables, cards, lists, forms
- **Consistency**: Standardizes how bulk operations, row actions, and workflows are handled
- **Permission Integration**: Built-in support for `appliesTo`, `disabled`, `hidden` logic
- **Developer Experience**: Pre-built helpers for common operations (delete, update, toggle status)
- **Extensibility**: Easy to add new action types and behaviors

**Current pain points it solves:**
- Every table/list reinvents action handling
- Inconsistent permission checking across components
- No standard way to handle bulk operations
- Complex manual wiring of action buttons to business logic

**Impact on other systems:**
- EWI events workflow permissions (immediate need)
- Product catalog bulk operations
- User management actions
- Any data table across the platform

### 2. **Permission System** (`@smbc/permissions`)

**Value Score: 8/10**

**Why it's valuable:**
- **Security**: Centralized permission logic reduces security bugs
- **Composability**: Permission rules can be combined and reused
- **Performance**: Optimized permission checking for large datasets
- **Auditability**: Clear permission logic that can be reviewed and tested
- **Integration**: Works seamlessly with action system and UI components

**Current pain points it solves:**
- Permission logic scattered across components
- Inconsistent permission checking patterns
- Hard to audit who can do what
- Performance issues with naive permission checks

**Impact on other systems:**
- All admin interfaces
- API endpoint protection
- Feature flagging and role-based UI
- Compliance and audit requirements

### 3. **Selection Management** (`@smbc/selection`)

**Value Score: 7/10**

**Why it's valuable:**
- **Ubiquity**: Multi-select is needed in almost every data interface
- **State Management**: Complex selection state with undo/redo capabilities
- **Performance**: Optimized for large datasets
- **UX Consistency**: Standard selection behaviors across the platform
- **Integration**: Works with actions and permissions out of the box

**Current pain points it solves:**
- Every table implements selection differently
- Inconsistent keyboard shortcuts and behaviors
- Performance issues with large selection sets
- Complex state management for nested selections

**Impact on other systems:**
- All data tables and grids
- File managers and media libraries
- Bulk operations interfaces
- Multi-step workflows

## Top 3 Easiest Features to Extract

### 1. **Core Types** (`@smbc/data-core`)

**Difficulty Score: 2/10**

**Why it's easy:**
- **No Dependencies**: Pure TypeScript interfaces and types
- **No Runtime Logic**: Just type definitions and utilities
- **Clear Boundaries**: Well-defined scope with no side effects
- **No State**: Stateless utility functions
- **Small Surface Area**: Limited API surface to maintain

**Extraction steps:**
1. Copy type definitions to new package
2. Add utility functions for type guards and validation
3. Update imports in dataview package
4. Publish and test

**Risk factors:**
- Minimal - types don't break at runtime
- Easy to roll back if issues arise

### 2. **Activity Tracking** (`@smbc/activity-tracking`)

**Difficulty Score: 3/10**

**Why it's easy:**
- **Self-Contained**: Clear input/output boundaries
- **Optional Feature**: Can be disabled without breaking core functionality
- **Simple State**: Just event logging and basic aggregation
- **Few Dependencies**: Only depends on core types
- **Well-Defined API**: Clear event structure and subscription model

**Extraction steps:**
1. Extract activity interfaces and event types
2. Move activity context and hooks
3. Create standalone activity manager
4. Add optional integration points in dataview
5. Test with activity disabled

**Risk factors:**
- Low - activity tracking is supplementary
- Can gracefully degrade if extraction fails

### 3. **Data Schema & Validation** (`@smbc/data-schema`)

**Difficulty Score: 4/10**

**Why it's easy:**
- **Pure Functions**: Schema validation is functional
- **Clear Interface**: DataField and DataSchema are well-defined
- **Minimal State**: Schema definitions are static
- **Standalone Value**: Useful outside of dataview context
- **Good Test Coverage**: Schema validation is well-tested

**Extraction steps:**
1. Extract field definition types and interfaces
2. Move validation logic and form field generators
3. Create schema builder utilities
4. Update form components to use extracted package
5. Test form rendering and validation

**Risk factors:**
- Medium - forms depend heavily on schema validation
- Need careful testing of edge cases

## Implementation Strategy

### Phase 1: Quick Wins (1-2 weeks)
1. **Extract `@smbc/data-core`** - Types and utilities
2. **Set up build pipeline** for new packages
3. **Update dataview** to use extracted core types

### Phase 2: High-Value Extraction (3-4 weeks)
1. **Extract `@smbc/action-core`** - Action interfaces and base classes
2. **Extract `@smbc/action-helpers`** - Pre-built action creators
3. **Update EWI events** to use new action system
4. **Test action system** with existing dataview tables

### Phase 3: Foundation Building (2-3 weeks)
1. **Extract `@smbc/permissions`** - Permission checking logic
2. **Extract `@smbc/selection`** - Selection state management
3. **Integrate permissions** with action system
4. **Test with complex permission scenarios**

### Phase 4: Low-Risk Additions (1-2 weeks)
1. **Extract `@smbc/activity-tracking`** - Event logging
2. **Extract `@smbc/data-schema`** - Schema validation
3. **Add comprehensive integration tests**
4. **Update documentation and examples**

## Success Metrics

### Technical Metrics
- **Bundle Size Reduction**: 20-30% smaller bundles for apps using subset of features
- **Build Time**: Faster builds due to smaller dependency graphs
- **Type Check Performance**: Faster TypeScript compilation
- **Test Speed**: Faster test suites with focused packages

### Developer Experience Metrics
- **Adoption Rate**: Number of components using extracted packages
- **Documentation Quality**: Clear examples and API docs for each package
- **Migration Ease**: Time to migrate existing components
- **Bug Reduction**: Fewer permission-related and action-related bugs

### Business Value Metrics
- **Feature Velocity**: Faster implementation of new data interfaces
- **Consistency**: More consistent UX across data management features
- **Maintenance Cost**: Reduced time spent on dataview-related bugs
- **Platform Reuse**: Higher reuse of data management patterns

## Risk Mitigation

### Technical Risks
- **Breaking Changes**: Maintain backward compatibility during extraction
- **Dependency Hell**: Keep package dependencies minimal and well-defined
- **Performance Regression**: Benchmark before and after extraction
- **Integration Issues**: Comprehensive integration testing

### Process Risks
- **Team Coordination**: Clear communication about package ownership
- **Migration Timeline**: Phased rollout to minimize disruption
- **Documentation Gaps**: Keep docs updated throughout extraction
- **Support Burden**: Plan for supporting both old and new APIs

## Decision Framework

### For Each Feature, Ask:
1. **Value**: Does this solve a real pain point for multiple teams?
2. **Complexity**: Can this be extracted without major refactoring?
3. **Dependencies**: How many other features depend on this?
4. **Risk**: What's the blast radius if the extraction goes wrong?
5. **Timeline**: Can this be completed in the available time window?

### Prioritization Matrix:
```
High Value + Easy = Phase 1 (Quick Wins)
High Value + Hard = Phase 2 (Strategic Investment)
Low Value + Easy = Phase 3 (Nice to Have)
Low Value + Hard = Phase 4 (Future Consideration)
```

This prioritized approach ensures we get maximum value from the refactoring effort while minimizing risk and maintaining development velocity.