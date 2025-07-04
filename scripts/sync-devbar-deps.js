#!/usr/bin/env node

/**
 * Sync DevHostAppBar dependencies with shared dependency definitions
 * This ensures the click-to-copy feature stays in sync with the dependency management tool
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { CORE_PEER_DEPS } from "./shared-deps.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const devBarPath = join(__dirname, "../packages/mui-components/src/DevHostAppBar.tsx");

function updateDevBarDependencies() {
  const content = readFileSync(devBarPath, "utf-8");
  
  // Generate the CORE_PEER_DEPS object string
  const depsString = JSON.stringify(CORE_PEER_DEPS, null, 2)
    .replace(/"/g, '"')
    .replace(/\n/g, '\n  ');
  
  // Replace the CORE_PEER_DEPS object in the file
  const updatedContent = content.replace(
    /const CORE_PEER_DEPS = \{[^}]*\};/s,
    `const CORE_PEER_DEPS = ${depsString};`
  );
  
  if (content !== updatedContent) {
    writeFileSync(devBarPath, updatedContent);
    console.log("✅ Updated DevHostAppBar dependencies");
  } else {
    console.log("✅ DevHostAppBar dependencies already up to date");
  }
}

updateDevBarDependencies();