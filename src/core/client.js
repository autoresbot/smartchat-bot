import fs from 'fs';
import path from 'path';
import { createNoopLogger, createPinoLogger, createStore, WaClient } from 'zapo-js';
import { createSqliteStore } from '@zapo-js/store-sqlite';
import config from '../config.js';

// Semua domain auth/Signal wajib punya provider. Domain arsip (messages/threads/
// contacts) dimatikan: bot ini tidak membaca ulang riwayat, jadi database tetap kecil.
const SQLITE_PROVIDERS = {
  auth: 'sqlite',
  signal: 'sqlite',
  preKey: 'sqlite',
  session: 'sqlite',
  identity: 'sqlite',
  senderKey: 'sqlite',
  appState: 'sqlite',
  privacyToken: 'sqlite',
  messages: 'none',
  threads: 'none',
  contacts: 'none',
};

const createLibraryLogger = async () => {
  if (config.logLevel === 'silent') return createNoopLogger();
  return createPinoLogger({ level: config.logLevel, pretty: true });
};

const createSessionStore = () => {
  fs.mkdirSync(path.dirname(path.resolve(config.storePath)), { recursive: true });

  return createStore({
    backends: {
      sqlite: createSqliteStore({ path: config.storePath, driver: 'auto' }),
    },
    providers: SQLITE_PROVIDERS,
  });
};

/**
 * Bangun WaClient beserta store-nya. Kredensial dipersist otomatis oleh store,
 * jadi tidak ada lagi handler `creds.update` seperti di Baileys.
 */
export const createClient = async () => {
  const store = createSessionStore();
  const logger = await createLibraryLogger();

  return new WaClient(
    {
      store,
      sessionId: config.sessionId,
      markOnlineOnConnect: true,
    },
    logger,
  );
};
