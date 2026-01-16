const config = {
  phoneNumber: '6285124002198', // Ganti dengan nomor WhatsApp mu (format: 628xxx)
  usePairingCode: true, // Ubah ke false jika ingin menggunakan QR Code
  sessionName: 'session', // Nama folder session
  groqApiKey: '', // Isi dengan API Key Groq Anda

  // AI Configuration
  aiModel: 'llama-3.1-8b-instant', // model cek disini : https://console.groq.com/docs/models
  aiSystemPrompt:
    'Kamu adalah asisten AI yang cerdas, ramah, dan membantu. Kamu tertanam di dalam bot WhatsApp. Jawablah pertanyaan user dengan sopan dan jelas. Gunakan Bahasa Indonesia. Jika kami menyediakan konteks tolong gunakan konteks tersebut untuk menjawab pertanyaan user dengan akurat tapi tanpa sebut nama file, tanpa sebut istilah konteks atau informasi dari internal sistem misal jangan sebut (Menurut informasi di file A, atau menurut konteks di file B). Jika kamu tidak tahu jawabannya, katakan "Maaf, saya tidak tahu.',

  // Context Configuration
  contextFolderPath: './context', // Folder tempat menyimpan PDF/TXT sebagai konteks
  useContext: true, // Enable/disable penggunaan context
};

export default config;
