/**
 * Ambil teks dari payload pesan zapo (Proto.IMessage).
 * Teks bisa berada di beberapa field tergantung tipe pesannya.
 */
export const extractText = (message) => {
  if (!message) return undefined;

  return (
    message.conversation ??
    message.extendedTextMessage?.text ??
    message.imageMessage?.caption ??
    message.videoMessage?.caption ??
    message.documentMessage?.caption ??
    undefined
  );
};

/** Ambil bagian nomor/identitas dari sebuah JID (sebelum tanda @). */
export const jidNumber = (jid = '') => jid.split('@')[0];

/** Bagian user dari JID tanpa device, mis. "628xx:12@s.whatsapp.net" → "628xx". */
export const jidUser = (jid = '') => jidNumber(jid).split(':')[0];

/** Ambil `contextInfo` (mention & info reply) dari submessage mana pun yang membawanya. */
export const extractContextInfo = (message) => {
  if (!message) return undefined;
  for (const value of Object.values(message)) {
    if (value && typeof value === 'object' && value.contextInfo) return value.contextInfo;
  }
  return undefined;
};
