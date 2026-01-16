import Groq from 'groq-sdk';
import config from '../config.js';
import { getContext } from './context-loader.js';

const groq = new Groq({ apiKey: config.groqApiKey });

export const getAIResponse = async (prompt) => {
  try {
    const context = config.useContext ? getContext() : '';

    let systemMessage = config.aiSystemPrompt;

    // Tambahkan context ke system prompt jika ada
    if (context) {
      systemMessage += `\n\n=== KONTEKS DOKUMENTASI TERSEDIA ===\n${context}\n=== AKHIR KONTEKS ===\n\n📌 PENTING: Gunakan konteks di atas sebagai informasi utama untuk menjawab pertanyaan user dengan akurat. Jika ada informasi yang relevan di konteks, prioritaskan informasi tersebut dalam jawaban Anda.`;
    } else {
      systemMessage += '\n\n⚠️ Catatan: Tidak ada konteks dokumentasi yang tersedia saat ini.';
    }

    console.log(
      '\n[DEBUG] Context loaded:',
      context.length > 0 ? `${context.length} chars` : 'NO CONTEXT',
    );

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: config.aiModel,
    });

    return (
      completion.choices[0]?.message?.content ||
      'Maaf, saya tidak dapat memproses permintaan anda saat ini.'
    );
  } catch (error) {
    console.error('Error fetching AI response:');
    return 'Terjadi kesalahan pada sistem AI.';
  }
};
