import chalk from 'chalk';
import { getAIResponse } from './ai.js';

export const messageHandler = async (sock, m) => {
    try {
        if (!m.messages || !m.messages[0]) return;
        
        const msg = m.messages[0];
        
        // Skip if message is from myself
        if (msg.key.fromMe) return;

        // Get the message text (simple conversation or extended text)
        const content = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
        
        if (!content) return;

        const sender = msg.key.remoteJid;
        const pushName = msg.pushName || 'Unknown';

        console.log(
            chalk.cyan.bold('[MESSAGE]'), 
            chalk.yellow(`${pushName} (${sender.split('@')[0]})`), 
            chalk.white('|'), 
            chalk.white(content)
        );

        // Logic: Ping -> Pong (Test Connection)
        if (content.trim().toLowerCase() === 'ping') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'pong' }, { quoted: msg });
        } else {
            // AI Chat Logic
            try {
                // Send typing presence
                await sock.sendPresenceUpdate('composing', msg.key.remoteJid);
                
                const response = await getAIResponse(content);
                
                await sock.sendMessage(msg.key.remoteJid, { text: response }, { quoted: msg });
                
                // Clear presence
                await sock.sendPresenceUpdate('available', msg.key.remoteJid);

            } catch (err) {
                console.error(chalk.red('Error in AI response:'), err);
                await sock.sendMessage(msg.key.remoteJid, { text: 'Maaf, terjadi kesalahan saat memproses pesan AI.' }, { quoted: msg });
            }
        }

    } catch (error) {
        console.error(chalk.red('Error handling message:'), error);
    }
};
