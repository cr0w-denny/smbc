# Branch Protection Setup

To ensure builds succeed before deployment, configure branch protection for the `main` branch:

## GitHub UI Setup

1. Go to **Settings** → **Branches**
2. Add a branch protection rule for `main`
3. Enable:
   - **Require status checks to pass before merging**
   - **Require branches to be up to date before merging**
4. Select required status checks:
   - `build-check`
   - `test`
5. Enable:
   - **Require pull request reviews before merging** (optional but recommended)
   - **Dismiss stale PR approvals when new commits are pushed** (optional)

## GitHub CLI Setup

```bash
# Require PR checks to pass before merge
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["build-check","test"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

## Result

With this setup:
- PRs must pass `build-check` and `test` jobs before merge
- Deployment only runs after successful merge to main
- Failed builds block deployment