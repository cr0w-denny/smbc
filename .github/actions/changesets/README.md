# Local Changesets Action

This is a local implementation of the changesets GitHub Action functionality that can be used when external GitHub Actions are not allowed in your environment.

## Overview

This implementation provides the same core functionality as `changesets/action`:
- Detects changesets in your repository
- Creates version PRs when changesets are found
- Publishes packages after version PRs are merged

## Usage Options

### Option 1: Shell Script (Recommended)

Use the shell script directly in your workflow or CI/CD pipeline:

```yaml
- name: Run changesets action
  run: ./scripts/changesets-action.sh
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Option 2: Composite Action

Use the local composite action that wraps the shell script:

```yaml
- name: Changesets
  uses: ./.github/actions/changesets
  with:
    publish: npm run changeset:publish
    version: npm run changeset:version
    commit: "Version Packages"
    title: "Version Packages"
```

### Option 3: TypeScript Action (Advanced)

If you need more complex logic:

1. Build the TypeScript action:
   ```bash
   cd .github/actions/changesets
   npm install
   npm run build
   ```

2. Update the action.yml to use `node20` runner instead of `composite`

## Environment Variables

The shell script supports these environment variables:
- `PUBLISH_COMMAND`: Command to publish packages (default: `npm run changeset:publish`)
- `VERSION_COMMAND`: Command to version packages (default: `npm run changeset:version`)
- `COMMIT_MESSAGE`: Commit message for version updates (default: `Version Packages`)
- `PR_TITLE`: Pull request title (default: `Version Packages`)

## How It Works

1. **On push to main**: The action checks for changesets
2. **If changesets exist**: Creates a branch with version updates
3. **If versions were just updated**: Publishes the packages
4. **If no changesets**: Does nothing

## Integration with CI/CD Systems

### Jenkins

```groovy
stage('Changesets') {
  steps {
    sh './scripts/changesets-action.sh'
  }
}
```

### GitLab CI

```yaml
changesets:
  stage: deploy
  script:
    - ./scripts/changesets-action.sh
  only:
    - main
```

### CircleCI

```yaml
- run:
    name: Changesets
    command: ./scripts/changesets-action.sh
```

## Customization

You can modify the shell script to:
- Use different git providers (GitLab, Bitbucket)
- Create PRs/MRs using your internal APIs
- Add additional checks or notifications
- Integrate with your internal package registry

## Testing Locally

```bash
# Test changeset detection
./scripts/changesets-action.sh

# Test with custom commands
PUBLISH_COMMAND="echo 'Would publish'" \
VERSION_COMMAND="echo 'Would version'" \
./scripts/changesets-action.sh
```