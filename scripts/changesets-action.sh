#!/bin/bash
# Local implementation of changesets action functionality
# Can be used in any CI/CD system that supports bash

set -e

# Configuration
PUBLISH_COMMAND="${PUBLISH_COMMAND:-npm run changeset:publish}"
VERSION_COMMAND="${VERSION_COMMAND:-npm run changeset:version}"
COMMIT_MESSAGE="${COMMIT_MESSAGE:-Version Packages}"
PR_TITLE="${PR_TITLE:-Version Packages}"
BRANCH_NAME="changeset-release/main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we have changesets
check_for_changesets() {
    if npx changeset status --output=status.json 2>/dev/null; then
        if [ -f status.json ]; then
            changesets_count=$(jq -r '.changesets | length' status.json 2>/dev/null || echo "0")
            rm -f status.json
            [ "$changesets_count" -gt 0 ]
        else
            false
        fi
    else
        # Fallback: check for .changeset/*.md files
        find .changeset -name "*.md" -not -name "README.md" 2>/dev/null | grep -q .
    fi
}

# Check if packages were just versioned
check_if_just_versioned() {
    # Check if last commit touched package.json files and removed changesets
    local last_commit_files=$(git diff --name-only HEAD~1 2>/dev/null || echo "")
    
    if echo "$last_commit_files" | grep -q "package.json" && \
       echo "$last_commit_files" | grep -q "^\.changeset/.*\.md$"; then
        return 0
    fi
    
    return 1
}

# Create or update version PR
create_version_pr() {
    log_info "Creating version branch: $BRANCH_NAME"
    
    # Fetch latest changes
    git fetch origin main
    
    # Create branch from main
    git checkout -B "$BRANCH_NAME" origin/main
    
    # Run version command
    log_info "Running version command: $VERSION_COMMAND"
    eval "$VERSION_COMMAND"
    
    # Check if there are changes
    if [ -z "$(git status --porcelain)" ]; then
        log_info "No changes after versioning"
        return 1
    fi
    
    # Commit changes
    git add .
    git commit -m "$COMMIT_MESSAGE"
    
    # Push branch
    log_info "Pushing version branch"
    git push --force origin "$BRANCH_NAME"
    
    log_success "Version branch pushed: $BRANCH_NAME"
    echo "Create a pull request from $BRANCH_NAME to main with title: $PR_TITLE"
    
    # Output PR creation instructions for different platforms
    echo ""
    echo "GitHub CLI: gh pr create --title \"$PR_TITLE\" --body \"This PR updates package versions based on changesets.\""
    echo "GitLab: Create MR from $BRANCH_NAME to main"
    echo "Bitbucket: Create PR from $BRANCH_NAME to main"
    
    return 0
}

# Publish packages
publish_packages() {
    log_info "Publishing packages with: $PUBLISH_COMMAND"
    
    # Run publish command
    eval "$PUBLISH_COMMAND"
    
    log_success "Packages published successfully!"
}

# Main logic
main() {
    log_info "Starting changesets action"
    
    # Get current branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    log_info "Current branch: $current_branch"
    
    # Only run on main branch
    if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
        log_info "Not on main branch, skipping changesets action"
        exit 0
    fi
    
    # Check what to do
    if check_if_just_versioned; then
        log_info "Detected recent version changes, publishing packages..."
        publish_packages
    elif check_for_changesets; then
        log_info "Found changesets, creating version PR..."
        create_version_pr
    else
        log_info "No changesets found and no version changes detected"
    fi
    
    log_success "Changesets action completed"
}

# Run main function
main "$@"