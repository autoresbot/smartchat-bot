import config from '../config.js';
import log from '../utils/logger.js';

/**
 * zapo sengaja tidak auto-reconnect: kebijakan retry ada di sisi aplikasi.
 * Fungsi ini menjalankan koneksi pertama lalu reconnect dengan exponential backoff.
 */
export const connectWithRetry = async (client) => {
  const { maxAttempts, baseDelayMs, maxDelayMs } = config.reconnect;
  let attempt = 0;
  let stopped = false;

  const reconnect = async () => {
    if (stopped) return;

    if (attempt >= maxAttempts) {
      log.error(`Menyerah setelah ${attempt} percobaan reconnect.`);
      return;
    }

    const delayMs = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
    attempt += 1;
    log.warn(`Mencoba reconnect dalam ${delayMs}ms (percobaan ${attempt}/${maxAttempts})...`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    try {
      await client.connect();
    } catch (error) {
      log.error('Reconnect gagal:', error?.message ?? error);
      void reconnect();
    }
  };

  client.on('connection', (event) => {
    if (event.status === 'open') {
      attempt = 0; // koneksi sehat: reset backoff
      log.success('Bot berhasil terhubung ke WhatsApp!');
      return;
    }

    if (event.status === 'connecting') return;

    log.error(`Koneksi terputus: ${event.reason ?? 'unknown'}${event.code ? ` (${event.code})` : ''}`);

    if (event.isLogout) {
      log.error('Device sudah di-unlink dari WhatsApp. Hapus store lalu pairing ulang.');
      return;
    }

    void reconnect();
  });

  const stop = () => {
    stopped = true;
  };

  await client.connect();
  return stop;
};

/** Tutup koneksi dengan rapi agar kredensial & antrian persist tersimpan. */
export const registerShutdownHandlers = (client, stop) => {
  let shuttingDown = false;

  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    stop?.();

    log.warn(`\nMenerima ${signal}, menutup koneksi...`);
    try {
      await client.disconnect();
    } catch (error) {
      log.error('Gagal menutup koneksi:', error?.message ?? error);
    }
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
};
