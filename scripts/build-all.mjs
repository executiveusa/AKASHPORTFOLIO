#!/usr/bin/env node
import { execSync } from 'node:child_process';
for (const cmd of ['npm run build:web', 'npm run build:control']) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}
