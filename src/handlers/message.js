import config from '../config.js';
import { getAIResponse } from '../services/ai.js';
import log from '../utils/logger.js';
import { extractContextInfo, extractText, jidNumber, jidUser } from '../utils/message.js';

/** Cek apakah pesan dari chat yang diizinkan di config.botDestination. */
const isAllowedDestination = (isGroup) => {
  if (config.botDestination === 'group') return isGroup;
  if (config.botDestination === 'private') return !isGroup;
  return true; // 'both'
};

/** Identitas bot (nomor & LID) tanpa device/server, untuk dicocokkan dengan mention/reply. */
const getBotIds = (client) => {
  const creds = client.auth.getCurrentCredentials();
  return [creds?.meJid, creds?.meLid].filter(Boolean).map(jidUser);
};

/** Di grup dengan mode 'mention': balas hanya jika bot di-mention atau pesan bot di-reply. */
const isAddressedToBot = (client, message) => {
  const botIds = getBotIds(client);
  if (botIds.length === 0) return false;

  const ctx = extractContextInfo(message);
  if (!ctx) return false;

  const mentioned = (ctx.mentionedJid ?? []).some((jid) => botIds.includes(jidUser(jid)));
  const repliedToBot = Boolean(ctx.quotedMessage) && botIds.includes(jidUser(ctx.participant ?? ''));
  return mentioned || repliedToBot;
};

/** Hapus tag "@nomorbot" dari teks agar tidak ikut dikirim ke AI. */
const stripBotMention = (client, text) =>
  getBotIds(client)
    .reduce((result, id) => result.replaceAll(`@${id}`, ''), text)
    .trim();

// Batas panjang pesan yang di-reply agar prompt tidak membengkak.
const MAX_QUOTED_LENGTH = 1500;

/**
 * Jika user me-reply sebuah pesan, sertakan isi pesan tersebut ke AI
 * supaya AI paham konteks percakapan yang sedang dibahas.
 */
const buildPrompt = (client, message, content) => {
  const ctx = extractContextInfo(message);
  const quotedText = extractText(ctx?.quotedMessage)?.trim();
  if (!quotedText) return content;

  const fromBot = getBotIds(client).includes(jidUser(ctx.participant ?? ''));
  const author = fromBot ? 'jawaban kamu (bot) sebelumnya' : 'pesan lain';
  const quoted =
    quotedText.length > MAX_QUOTED_LENGTH ? `${quotedText.slice(0, MAX_QUOTED_LENGTH)}...` : quotedText;

  return `User sedang membalas ${author}:\n"""\n${quoted}\n"""\n\nPesan user:\n${content}`;
};

const replyWithAI = async (client, event, content) => {
  const jid = event.key.remoteJid;

  try {
    await client.presence.sendChatstate(jid, { state: 'composing' });

    const response = await getAIResponse(content);
    await client.message.send(jid, response, { quote: event });
  } catch (error) {
    log.error('Error in AI response:', error?.message ?? error);
    await client.message.send(jid, 'Maaf, terjadi kesalahan saat memproses pesan AI.', {
      quote: event,
    });
  } finally {
    await client.presence.sendChatstate(jid, { state: 'paused' }).catch(() => {});
  }
};

/** Handler untuk event `message` dari WaClient. */
export const handleMessage = async (client, event) => {
  try {
    if (event.key.fromMe) return; // pesan sendiri (sinkronisasi multi-device)

    const rawContent = extractText(event.message);
    if (!rawContent) return;

    const isGroup = Boolean(event.key.isGroup);
    if (!isAllowedDestination(isGroup)) return;

    if (isGroup && config.groupReplyMode === 'mention' && !isAddressedToBot(client, event.message)) {
      return;
    }

    const content = isGroup ? stripBotMention(client, rawContent) : rawContent;
    if (!content) return;

    log.message({
      pushName: event.pushName || 'Unknown',
      number: jidNumber(event.key.remoteJid),
      isGroup,
      text: content,
    });

    if (content.trim().toLowerCase() === 'ping') {
      await client.message.send(event.key.remoteJid, 'pong', { quote: event });
      return;
    }

    await replyWithAI(client, event, buildPrompt(client, event.message, content));
  } catch (error) {
    log.error('Error handling message:', error?.message ?? error);
  }
};

/** Pasang handler pesan ke client. */
export const registerMessageHandler = (client) => {
  client.on('message', (event) => void handleMessage(client, event));
};
