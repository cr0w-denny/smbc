# Implementation Guides

This section contains technical implementation details, tooling guides, and advanced configuration documentation for the SMBC Applets Platform.

## 📋 Overview

These documents are intended for developers who need to understand the internal workings of the platform, configure build processes, or work with the monorepo structure.

## 📚 Documentation Index

### 📦 [Package Management](./CHANGESETS.md)

**Versioning and Release Management**

- How to create changesets for package versions
- Linked package groups for applets
- Publishing workflow and best practices
- Integration with CI/CD pipelines

### 🏗️ [Monorepo Structure](./MONOREPO.md)

**Complete Architecture Reference**

- Detailed package topology and relationships
- Build pipeline configuration
- Technology stack breakdown
- Development workflow patterns
- Performance characteristics and architectural decisions

### 🔗 [Dependencies](./DEPENDENCIES.md)

**Package Dependency Management**

- Required peer dependencies for `@smbc/mui-host`
- Version compatibility matrix
- Externalization configuration
- Package installation requirements

## 🎯 Quick Navigation

### For Package Maintainers

- Review [Changesets Guide](./CHANGESETS.md) for versioning workflow
- Check [Dependencies](./DEPENDENCIES.md) for peer dependency requirements

### For Platform Contributors

- Start with [Monorepo Topology](./MONOREPO.md) for complete system understanding
- Review build pipeline configuration and architectural decisions

### For Integration Teams

- Reference [Dependencies](./DEPENDENCIES.md) for installation requirements
- Check monorepo structure for package relationships

---

**Note:** For general usage documentation, see the main [Getting Started](../GETTING_STARTED.md) guide. These implementation docs are for advanced configuration and platform maintenance.
