#!/usr/bin/env node
import { execSync } from 'node:child_process';
const out = execSync("rg --files apps/control-room/src/app/api -g 'route.ts'", {encoding:'utf8'});
const routes = out.trim().split('\n').filter(Boolean);
console.log(`Found ${routes.length} API route files`);
for (const r of routes) console.log(r);
