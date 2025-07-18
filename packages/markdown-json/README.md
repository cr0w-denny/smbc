# @smbc/markdown-json

Converts markdown files to JSON format for static consumption by browser applications.

## Usage

### CLI

```bash
# Generate docs from README files
npx markdown-json src/generated "README.md" "*/README.md"

# Generate from specific patterns
npx markdown-json dist "docs/**/*.md" "applets/*/*/README.md"
```

### Programmatic

```typescript
import { generateMarkdownJson } from '@smbc/markdown-json';

generateMarkdownJson([
  'README.md',
  'docs/**/*.md',
  'applets/*/*/README.md'
], 'src/generated');
```

## Generated Output

Creates a `docs.js` file with:

```javascript
export const DOCS = {
  "README": {
    "markdown": "# Title\n\nContent...",
    "html": "<h1>Title</h1><p>Content...</p>"
  },
  "docs_install": {
    "markdown": "# Installation\n\n...",
    "html": "<h1>Installation</h1>..."
  }
};

export function getDoc(key) {
  return DOCS[key];
}

export function hasDoc(key) {
  return !!DOCS[key];
}
```

## Key Naming

File paths are converted to keys by:
- Removing `.md` extension
- Replacing `/` with `_`

Examples:
- `README.md` → `README`
- `docs/install.md` → `docs_install`
- `applets/user-management/mui/README.md` → `applets_user-management_mui_README`