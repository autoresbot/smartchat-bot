import config from './config.js';
import { registerAuthHandlers } from './core/auth.js';
import { createClient } from './core/client.js';
import { connectWithRetry, registerShutdownHandlers } from './core/connection.js';
import { registerMessageHandler } from './handlers/message.js';
import { loadContextFiles } from './services/context/index.js';
import log from './utils/logger.js';

const startBot = async () => {
  log.banner('SMARTCHAT BOT');

  if (config.useContext) {
    log.step('📚 Loading context files from folder...');
    await loadContextFiles(config.contextFolderPath);
  }

  const client = await createClient();

  registerAuthHandlers(client);
  registerMessageHandler(client);

  log.info(`Menghubungkan session "${config.sessionId}" (store: ${config.storePath})...`);

  const stop = await connectWithRetry(client);
  registerShutdownHandlers(client, stop);
};

startBot().catch((error) => {
  log.error('Fatal error:', error);
  process.exit(1);
});
