/**
 * Generated markdown documentation
 * Generated at: 2025-07-18T16:29:48.023Z
 * 
 * This file contains markdown files converted to JSON format
 * for static consumption by browser applications.
 */

export const DOCS = {
  "packages_markdown-json_README": {
    "markdown": "# @smbc/markdown-json\n\nConverts markdown files to JSON format for static consumption by browser applications.\n\n## Usage\n\n### CLI\n\n```bash\n# Generate docs from README files\nnpx markdown-json src/generated \"README.md\" \"*/README.md\"\n\n# Generate from specific patterns\nnpx markdown-json dist \"docs/**/*.md\" \"applets/*/*/README.md\"\n```\n\n### Programmatic\n\n```typescript\nimport { generateMarkdownJson } from '@smbc/markdown-json';\n\ngenerateMarkdownJson([\n  'README.md',\n  'docs/**/*.md',\n  'applets/*/*/README.md'\n], 'src/generated');\n```\n\n## Generated Output\n\nCreates a `docs.js` file with:\n\n```javascript\nexport const DOCS = {\n  \"README\": {\n    \"markdown\": \"# Title\\n\\nContent...\",\n    \"html\": \"<h1>Title</h1><p>Content...</p>\"\n  },\n  \"docs_install\": {\n    \"markdown\": \"# Installation\\n\\n...\",\n    \"html\": \"<h1>Installation</h1>...\"\n  }\n};\n\nexport function getDoc(key) {\n  return DOCS[key];\n}\n\nexport function hasDoc(key) {\n  return !!DOCS[key];\n}\n```\n\n## Key Naming\n\nFile paths are converted to keys by:\n- Removing `.md` extension\n- Replacing `/` with `_`\n\nExamples:\n- `README.md` → `README`\n- `docs/install.md` → `docs_install`\n- `applets/user-management/mui/README.md` → `applets_user-management_mui_README`",
    "html": "<h1>@smbc/markdown-json</h1>\n<p>Converts markdown files to JSON format for static consumption by browser applications.</p>\n<h2>Usage</h2>\n<h3>CLI</h3>\n<pre><code class=\"language-bash\"># Generate docs from README files\nnpx markdown-json src/generated &quot;README.md&quot; &quot;*/README.md&quot;\n\n# Generate from specific patterns\nnpx markdown-json dist &quot;docs/**/*.md&quot; &quot;applets/*/*/README.md&quot;\n</code></pre>\n<h3>Programmatic</h3>\n<pre><code class=\"language-typescript\">import { generateMarkdownJson } from &#39;@smbc/markdown-json&#39;;\n\ngenerateMarkdownJson([\n  &#39;README.md&#39;,\n  &#39;docs/**/*.md&#39;,\n  &#39;applets/*/*/README.md&#39;\n], &#39;src/generated&#39;);\n</code></pre>\n<h2>Generated Output</h2>\n<p>Creates a <code>docs.js</code> file with:</p>\n<pre><code class=\"language-javascript\">export const DOCS = {\n  &quot;README&quot;: {\n    &quot;markdown&quot;: &quot;# Title\\n\\nContent...&quot;,\n    &quot;html&quot;: &quot;&lt;h1&gt;Title&lt;/h1&gt;&lt;p&gt;Content...&lt;/p&gt;&quot;\n  },\n  &quot;docs_install&quot;: {\n    &quot;markdown&quot;: &quot;# Installation\\n\\n...&quot;,\n    &quot;html&quot;: &quot;&lt;h1&gt;Installation&lt;/h1&gt;...&quot;\n  }\n};\n\nexport function getDoc(key) {\n  return DOCS[key];\n}\n\nexport function hasDoc(key) {\n  return !!DOCS[key];\n}\n</code></pre>\n<h2>Key Naming</h2>\n<p>File paths are converted to keys by:</p>\n<ul>\n<li>Removing <code>.md</code> extension</li>\n<li>Replacing <code>/</code> with <code>_</code></li>\n</ul>\n<p>Examples:</p>\n<ul>\n<li><code>README.md</code> → <code>README</code></li>\n<li><code>docs/install.md</code> → <code>docs_install</code></li>\n<li><code>applets/user-management/mui/README.md</code> → <code>applets_user-management_mui_README</code></li>\n</ul>\n"
  }
};

export function getDoc(key) {
  return DOCS[key];
}

export function hasDoc(key) {
  return !!DOCS[key];
}

export const GENERATED_AT = "2025-07-18T16:29:48.023Z";
