import { loadConfig } from './utils/config.js';
import { logger } from './utils/logger.js';
import { OpenClawGateway } from './gateway.js';
import 'dotenv/config';

async function main() {
  try {
    loadConfig();

    logger.info('🚀 Starting OpenClaw Gateway...');
    const gateway = new OpenClawGateway();

    await gateway.start();

    // Handle graceful shutdown
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        logger.info(`Received ${signal}, shutting down gracefully...`);
        await gateway.shutdown();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start OpenClaw Gateway:', error);
    process.exit(1);
  }
}

main();
