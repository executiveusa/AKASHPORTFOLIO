#!/usr/bin/env node

/**
 * SYNTHIA 3.0 AUTOMATED DEPLOYMENT
 * Connect to Coolify or VPS via SSH/API and deploy
 * Usage: node auto-deploy.js [coolify|ssh|local]
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  vpsIp: process.env.VPS_IP || '31.220.58.212',
  coolifyUrl: process.env.COOLIFY_URL || 'http://31.220.58.212:8000',
  coolifyToken: process.env.COOLIFY_API_TOKEN || '1439|JNBGNRm9lON2g8DpkpKIa5TnRdGc8LaILhTgPTuR8d6b1c26',
  sshKey: process.env.SSH_KEY_PATH || path.join(process.env.HOME || process.env.USERPROFILE, '.ssh', 'bambu_key'),
  sshUser: 'root',
  workDir: '/opt/synthia/control-room',
  imageName: 'synthia-control-room:latest',
  containerName: 'synthia-control-room',
  port: 3001,
};

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg) => console.error(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  warn: (msg) => console.warn(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`),
  header: (msg) => console.log(`\n${COLORS.blue}${'═'.repeat(60)}${COLORS.reset}\n${msg}\n${COLORS.blue}${'═'.repeat(60)}${COLORS.reset}\n`),
};

// Deployment strategies
const strategies = {
  // SSH-based deployment
  async ssh() {
    log.header('🚀 DEPLOYING VIA SSH');

    const sshCmd = `ssh -i "${CONFIG.sshKey}" ${CONFIG.sshUser}@${CONFIG.vpsIp}`;

    const deployScript = `
set -e
export PGPASSWORD="072090156d28a9df6502d94083e47990"

# Schema
psql -h 31.220.58.212 -p 5434 -U postgres -d second_brain << 'SQL'
CREATE TABLE IF NOT EXISTS agent_state (id BIGSERIAL PRIMARY KEY, agent_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL, status TEXT DEFAULT 'idle', metadata JSONB DEFAULT '{}'::jsonb, last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(), created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS observations (id BIGSERIAL PRIMARY KEY, session_id TEXT NOT NULL, event_type TEXT NOT NULL, summary TEXT, data JSONB DEFAULT '{}'::jsonb, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS memories (id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, summary TEXT, content TEXT, embedding vector(384), agent_id TEXT REFERENCES agent_state(agent_id), type TEXT DEFAULT 'observation', status TEXT DEFAULT 'active', importance INTEGER DEFAULT 0, metadata JSONB DEFAULT '{}'::jsonb, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS memory_links (id BIGSERIAL PRIMARY KEY, source_id BIGINT NOT NULL REFERENCES memories(id), target_id BIGINT NOT NULL REFERENCES memories(id), type TEXT DEFAULT 'related', created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS conversations (id BIGSERIAL PRIMARY KEY, session_id TEXT UNIQUE NOT NULL, participants TEXT[] DEFAULT '{}', status TEXT DEFAULT 'active', metadata JSONB DEFAULT '{}'::jsonb, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS conversation_messages (id BIGSERIAL PRIMARY KEY, conversation_id BIGINT NOT NULL REFERENCES conversations(id), role TEXT NOT NULL, content TEXT NOT NULL, embedding vector(384), agent_id TEXT REFERENCES agent_state(agent_id), created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
INSERT INTO agent_state (agent_id, name, role, status, metadata) VALUES ('synthia-0', 'Synthia Prime', 'Digital CEO', 'idle', '{"version":"3.0.0","tier":"core"}') ON CONFLICT DO NOTHING;
SQL

# Deploy
cd ${CONFIG.workDir} && git pull origin main && \\
docker build -t ${CONFIG.imageName} . && \\
docker stop ${CONFIG.containerName} 2>/dev/null || true && \\
docker rm ${CONFIG.containerName} 2>/dev/null || true && \\
docker run -d --name ${CONFIG.containerName} --restart always \\
  -p ${CONFIG.port}:3000 --env-file .env.local ${CONFIG.imageName} && \\
sleep 5 && curl http://localhost:${CONFIG.port}/api/health
    `;

    try {
      log.info('Connecting to VPS via SSH...');
      const { stdout, stderr } = await execAsync(`${sshCmd} "${deployScript.replace(/"/g, '\\"')}"`, {
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });

      console.log(stdout);
      if (stderr) log.warn(stderr);

      log.info('SSH deployment completed');
      return { success: true, method: 'SSH' };
    } catch (error) {
      log.error(`SSH deployment failed: ${error.message}`);
      throw error;
    }
  },

  // Coolify API deployment
  async coolify() {
    log.header('🚀 DEPLOYING VIA COOLIFY API');

    const deployPayload = {
      source: 'github',
      repository: 'executiveusa/AKASHPORTFOLIO',
      branch: 'main',
      dockerfile: 'apps/control-room/Dockerfile.prod',
      ports: [{ containerPort: 3000, hostPort: CONFIG.port }],
      environmentVariables: JSON.parse(fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8')),
    };

    try {
      log.info('Sending deployment request to Coolify API...');

      // Note: Actual Coolify API implementation would go here
      // This is a placeholder showing the structure

      log.warn('Coolify API deployment requires service UUID configuration');
      log.info('Using SSH as fallback...');

      return await strategies.ssh();
    } catch (error) {
      log.error(`Coolify deployment failed: ${error.message}`);
      throw error;
    }
  },

  // Local Docker Compose deployment
  async local() {
    log.header('🚀 DEPLOYING LOCALLY WITH DOCKER COMPOSE');

    try {
      log.info('Building image...');
      await execAsync('docker build -f Dockerfile.prod -t synthia-control-room:latest .');

      log.info('Starting services with docker-compose...');
      await execAsync('docker-compose up -d');

      log.info('Waiting for health check...');
      for (let i = 0; i < 10; i++) {
        try {
          await execAsync('curl http://localhost:3000/api/health');
          log.info('✅ Health check passed');
          return { success: true, method: 'Docker Compose' };
        } catch (e) {
          if (i < 9) {
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }

      log.error('Health check timeout');
      throw new Error('Service did not become healthy');
    } catch (error) {
      log.error(`Local deployment failed: ${error.message}`);
      throw error;
    }
  },
};

// Main execution
async function main() {
  const method = process.argv[2] || 'ssh';

  if (!strategies[method]) {
    log.error(`Unknown deployment method: ${method}`);
    console.log('Available methods: ssh, coolify, local');
    process.exit(1);
  }

  try {
    const result = await strategies[method]();
    log.header(`✅ DEPLOYMENT SUCCESSFUL\nMethod: ${result.method}`);

    console.log(`\n📊 Service Details:\n`);
    console.log(`  Container: ${CONFIG.containerName}`);
    console.log(`  Port: ${CONFIG.port}`);
    console.log(`  VPS: ${CONFIG.vpsIp}`);
    console.log(`\n🔗 Endpoints:\n`);
    console.log(`  Health: http://${CONFIG.vpsIp}:${CONFIG.port}/api/health`);
    console.log(`  Synthia: http://${CONFIG.vpsIp}:${CONFIG.port}/api/synthia`);
    console.log(`  Dashboard: http://${CONFIG.vpsIp}:${CONFIG.port}/api/dashboard`);
    console.log();

    process.exit(0);
  } catch (error) {
    log.header('❌ DEPLOYMENT FAILED');
    console.error(error);
    process.exit(1);
  }
}

main();
