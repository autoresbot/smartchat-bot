/**
 * Pengaturan teknis bawaan. User cukup mengedit `config.js` di root proyek;
 * nilai di sini hanya dipakai jika tidak diisi di sana. Opsi apa pun di bawah
 * tetap bisa ditimpa dengan menuliskan key yang sama di `config.js`.
 */
import userConfig from '../config.js';

const DEFAULTS = {
  // WhatsApp
  phoneNumber: '',
  usePairingCode: true,
  sessionId: 'default', // nama session di dalam store
  storePath: './session/state.sqlite', // file SQLite penyimpan login & kunci enkripsi
  reconnect: { maxAttempts: 10, baseDelayMs: 1000, maxDelayMs: 30000 },
  logLevel: 'silent', // log internal zapo: silent | error | warn | info | debug | trace

  // AI
  aiProvider: 'autoresbot', // 'autoresbot' | 'groq'
  apiKey: process.env.AUTORESBOT_API_KEY || 'APIKEY_FREE',
  aiModel: 'claude-sonnet',
  autoresbotBaseUrl: 'https://api.autoresbot.com/api',
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: 'openai/gpt-oss-20b',
  },
  aiSystemPrompt: 'Kamu adalah asisten AI yang ramah di WhatsApp. Gunakan Bahasa Indonesia.',

  // Konteks
  useContext: true,
  contextFolderPath: './context',

  // Perilaku bot
  botDestination: 'both',
  groupReplyMode: 'mention',
};

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const merge = (base, override) => {
  const result = { ...base };
  for (const [key, value] of Object.entries(override ?? {})) {
    if (value === undefined) continue;
    result[key] = isPlainObject(value) && isPlainObject(base[key]) ? merge(base[key], value) : value;
  }
  return result;
};

const config = merge(DEFAULTS, userConfig);

export default config;
