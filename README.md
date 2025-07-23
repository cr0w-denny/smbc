# SMBC Applets Platform

A monorepo containing React applets for business functionality. Each applet includes API definitions, generated TypeScript clients, UI components, and development mocks.

## Local Registry Setup

To develop locally with published packages:

1. **Start the registry** (keeps running):
   ```bash
   npm run registry:start
   ```

2. **In a separate terminal**, authenticate and publish:
   ```bash
   npm adduser --registry http://localhost:4873
   # Use: dev/dev/dev@example.com
   npm run registry:publish
   ```

3. **Test installation** from any directory:
   ```bash
   npm run registry:use-local
   npm install @smbc/applet-core
   ```

## Release Workflow

1. **Make changes** and commit to a feature branch
2. **Create changeset**: `npm run changeset` (describes what changed)
3. **Create PR** and merge to main
4. **Bot creates "Version Packages" PR** (if changesets exist)
5. **Merge "Version Packages" PR** → packages auto-publish to npm
