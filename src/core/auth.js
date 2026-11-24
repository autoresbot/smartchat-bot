import qrcode from 'qrcode-terminal';
import config from '../config.js';
import log from '../utils/logger.js';

const normalizePhoneNumber = () => config.phoneNumber.replace(/[^0-9]/g, '');

const formatPairingCode = (code) => code.match(/.{1,4}/g)?.join('-') ?? code;

/**
 * Pasang handler pairing. zapo memancarkan event ini SELAMA `connect()` masih
 * berjalan, jadi handler harus terpasang sebelum connect dipanggil.
 */
export const registerAuthHandlers = (client) => {
  // Satu kode pairing per percobaan koneksi; direset saat koneksi tertutup.
  let pairingCodeRequested = false;

  // Minta pairing code. Dipicu oleh `auth_qr` ATAU `auth_pairing_required`:
  // pada koneksi pertama zapo hanya memancarkan `auth_qr`, sedangkan
  // `auth_pairing_required` baru muncul pada kasus tertentu (mis. forceManual).
  const requestPairingCode = async () => {
    if (pairingCodeRequested) return;

    const phoneNumber = normalizePhoneNumber();
    if (!phoneNumber) {
      log.error('ERROR: Nomor telepon tidak ditemukan di config.js! Silahkan isi terlebih dahulu.');
      return;
    }

    pairingCodeRequested = true;
    try {
      const code = await client.auth.requestPairingCode(phoneNumber);
      log.pairingCode(phoneNumber, formatPairingCode(code));
      log.muted('Buka WhatsApp → Perangkat tertaut → Tautkan dengan nomor telepon.');
    } catch (error) {
      pairingCodeRequested = false;
      log.error('Gagal request pairing code:', error?.message ?? error);
    }
  };

  client.on('auth_qr', ({ qr, ttlMs }) => {
    if (config.usePairingCode) {
      void requestPairingCode();
      return;
    }

    log.info(`\nScan QR berikut dari WhatsApp → Perangkat tertaut (berlaku ${Math.round(ttlMs / 1000)} detik):\n`);
    qrcode.generate(qr, { small: true });
  });

  client.on('auth_pairing_required', ({ forceManual } = {}) => {
    if (!config.usePairingCode) return;
    if (forceManual) pairingCodeRequested = false; // kode lama tidak berlaku lagi, minta yang baru
    void requestPairingCode();
  });

  client.on('auth_paired', ({ credentials }) => {
    log.success(`\nBerhasil pairing sebagai ${credentials.meJid}`);
  });

  client.on('connection', (event) => {
    if (event.status === 'close') pairingCodeRequested = false;
  });
};
