import Groq from 'groq-sdk';
import config from '../config.js';
import log from '../utils/logger.js';
import { getContext } from './context/index.js';

const FALLBACK_REPLY = 'Maaf, saya tidak dapat memproses permintaan anda saat ini.';
const ERROR_REPLY = 'Terjadi kesalahan pada sistem AI.';

// Batas panjang URL aman untuk request GET; lebih dari ini otomatis pakai POST.
const MAX_GET_URL_LENGTH = 2000;

const buildSystemMessage = () => {
  const context = config.useContext ? getContext() : '';

  if (!context) {
    return `${config.aiSystemPrompt}\n\n⚠️ Catatan: Tidak ada konteks dokumentasi yang tersedia saat ini.`;
  }

  return (
    `${config.aiSystemPrompt}\n\n` +
    `=== KONTEKS DOKUMENTASI TERSEDIA ===\n${context}\n=== AKHIR KONTEKS ===\n\n` +
    '📌 PENTING: Gunakan konteks di atas sebagai informasi utama untuk menjawab pertanyaan user ' +
    'dengan akurat. Jika ada informasi yang relevan di konteks, prioritaskan informasi tersebut ' +
    'dalam jawaban Anda.'
  );
};

// ── Provider: Autoresbot ───────────────────────────────────────────────
// Endpoint: https://api.autoresbot.com/api/<model>?apikey=...&text=...
// API ini tidak punya parameter system prompt, jadi instruksi + konteks
// digabung ke dalam `text`.
const askAutoresbot = async (prompt) => {
  const { autoresbotBaseUrl: baseUrl, apiKey, aiModel: model } = config;
  const text = `${buildSystemMessage()}\n\n=== PERTANYAAN USER ===\n${prompt}`;

  const endpoint = `${baseUrl.replace(/\/+$/, '')}/${model}?apikey=${encodeURIComponent(apiKey)}`;
  const getUrl = `${endpoint}&text=${encodeURIComponent(text)}`;

  const res =
    getUrl.length <= MAX_GET_URL_LENGTH
      ? await fetch(getUrl)
      : await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status) {
    throw new Error(json?.message || `HTTP ${res.status}`);
  }

  return typeof json.data === 'string' ? json.data : '';
};

// ── Provider: Groq ─────────────────────────────────────────────────────
let groq;
const askGroq = async (prompt) => {
  groq ??= new Groq({ apiKey: config.groq.apiKey });
  const completion = await groq.chat.completions.create({
    model: config.groq.model,
    messages: [
      { role: 'system', content: buildSystemMessage() },
      { role: 'user', content: prompt },
    ],
  });
  return completion.choices[0]?.message?.content ?? '';
};

/** Kirim prompt user ke provider AI (sesuai config.aiProvider) beserta konteks dokumen. */
export const getAIResponse = async (prompt) => {
  try {
    const answer = config.aiProvider === 'groq' ? await askGroq(prompt) : await askAutoresbot(prompt);
    return answer || FALLBACK_REPLY;
  } catch (error) {
    log.error('Error fetching AI response:', error?.message ?? error);
    return ERROR_REPLY;
  }
};
