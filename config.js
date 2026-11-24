const config = {
  // ── WhatsApp ─────────────────────────────────────────────────────────
  phoneNumber: '628xxxx', // Nomor WhatsApp bot (format: 628xxx)
  usePairingCode: true, // true = login pakai kode pairing, false = scan QR Code

  // ── AI ───────────────────────────────────────────────────────────────
  apiKey: '', // API key dari https://api.autoresbot.com
  aiModel: 'claude-sonnet', // Pilihan: 'claude-fable' | 'claude-sonnet' | 'gpt-5.5'

  // Kepribadian & aturan menjawab bot
  aiSystemPrompt:
    'Kamu adalah asisten AI yang cerdas, ramah, dan membantu. Kamu tertanam di dalam bot WhatsApp. Jawablah pertanyaan user dengan sopan dan jelas. Gunakan Bahasa Indonesia. Jika kami menyediakan konteks tolong gunakan konteks tersebut untuk menjawab pertanyaan user dengan akurat tapi tanpa sebut nama file, tanpa sebut istilah konteks atau informasi dari internal sistem misal jangan sebut (Menurut informasi di file A, atau menurut konteks di file B). Jika kamu tidak tahu jawabannya, katakan "Maaf, saya tidak tahu.',

  // Jawab berdasarkan file di folder "context" (true = ya, false = tidak)
  useContext: true,

  // ── Perilaku Bot ─────────────────────────────────────────────────────
  // Bot aktif di: 'group' (hanya grup) | 'private' (hanya chat pribadi) | 'both' (keduanya)
  botDestination: 'both',

  // Di grup: 'all' (balas semua pesan) | 'mention' (hanya saat bot di-tag atau di-reply)
  groupReplyMode: 'mention',

  // ── Penyedia AI ──────────────────────────────────────────────────────
  // 'autoresbot' = pakai apiKey & aiModel di atas | 'groq' = pakai pengaturan groq di bawah
  aiProvider: 'autoresbot',

  // Hanya dipakai jika aiProvider: 'groq'
  groq: {
    apiKey: process.env.GROQ_API_KEY || '', // API key dari https://console.groq.com
    model: 'openai/gpt-oss-20b', // Daftar model: https://console.groq.com/docs/models
  },
};

export default config;
