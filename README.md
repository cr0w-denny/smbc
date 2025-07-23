# SMBC Applets Platform

A monorepo containing React applets for business functionality. Each applet includes API definitions, generated TypeScript clients, UI components, and development mocks.

## Release Workflow

1. **Make changes** and commit to a feature branch
2. **Create changeset**: `npm run changeset` (describes what changed)
3. **Create PR** and merge to main
4. **Bot creates "Version Packages" PR** (if changesets exist)
5. **Merge "Version Packages" PR** → packages auto-publish to npm
