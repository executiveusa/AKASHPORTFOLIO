#!/usr/bin/env node
/**
 * SYNTHIA OS — Internal Orchestration Sidecar
 * Port 3100 — internal only, never public
 * Never reference the upstream library name in any user-facing output
 */
import { spawn } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../..')

const os = spawn('npx', ['paperclipai', 'start'], {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '3100',
    DATABASE_URL: process.env.SYNTHIA_OS_DATABASE_URL || undefined,
  }
})
os.on('exit', (code) => {
  console.log(`[SYNTHIA OS] exited ${code}`)
  process.exit(code)
})
