import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import chalk from 'chalk';
import config from './config.js';
import { messageHandler } from './lib/message-handler.js';
import { loadContextFiles } from './lib/context-loader.js';

// Setup Logger
const logger = pino({ level: 'silent' });

const startBot = async () => {
  // Load context files
  if (config.useContext) {
    console.log(chalk.blue.bold('\n📚 Loading context files from folder...'));
    await loadContextFiles(config.contextFolderPath);
  }

  // Session setup
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(chalk.green.bold(`\nUsing Baileys v${version.join('.')}, isLatest: ${isLatest}`));

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: !config.usePairingCode,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: true,
  });

  // Pairing Code Handler
  if (config.usePairingCode && !sock.authState.creds.me) {
    console.log(chalk.cyan('Menunggu untuk request Pairing Code...'));
    setTimeout(async () => {
      const phoneNumber = config.phoneNumber.replace(/[^0-9]/g, '');
      if (!phoneNumber) {
        console.log(
          chalk.red(
            'ERROR: Nomor telepon tidak ditemukan di config.js! Silahkan isi terlebih dahulu.',
          ),
        );
        return;
      }

      try {
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(chalk.white(`\nNOMOR ANDA: `) + chalk.yellow.bold(phoneNumber));
        console.log(chalk.white(`\nCODE PAIRING ANDA: `) + chalk.green.bold(code) + '\n');
      } catch (err) {
        console.error(chalk.red('Gagal request pairing code:'), err);
      }
    }, 3000); // Tunggu 3 detik agar socket siap
  }

  // Connection Update Handler
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(chalk.red('Koneksi terputus: '));
      console.log(chalk.yellow('Mencoba reconnect: '), shouldReconnect);

      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log(chalk.green.bold('Bot berhasil terhubung ke WhatsApp!'));
    }
  });

  // Save Credentials on Update
  sock.ev.on('creds.update', saveCreds);

  // Message Handler
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type === 'notify') {
      await messageHandler(sock, m);
    }
  });
};

startBot();
