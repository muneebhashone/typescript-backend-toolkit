#!/usr/bin/env node

// This file exists to support direct execution before build
// The actual CLI is in src/cli.ts which gets compiled to dist/cli.js

import('../dist/cli.js').catch((err) => {
  console.error('Failed to load CLI:', err);
  process.exit(1);
});
