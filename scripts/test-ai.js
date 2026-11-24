import readline from 'readline';
import chalk from 'chalk';
import config from '../src/config.js';
import { getAIResponse } from '../src/services/ai.js';
import { getContext, loadContextFiles } from '../src/services/context/index.js';
import log from '../src/utils/logger.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

const loadContext = async () => {
  if (!config.useContext) {
    log.warn('⚠️  Context dinonaktifkan di config.js\n');
    return;
  }

  log.step('📚 Loading context files from: ' + config.contextFolderPath);
  await loadContextFiles(config.contextFolderPath);

  if (!getContext()) {
    log.warn('⚠️  Tidak ada file context yang ditemukan.');
    log.warn('Tambahkan file .pdf, .txt, .md, .docx, .json, .csv, atau .xlsx ke folder context/\n');
  }
};

const startTesting = async () => {
  log.banner('AI BOT TESTING (TANPA WA)');
  await loadContext();

  log.info('Ketik pertanyaan di bawah (ketik "exit" untuk keluar)\n');
  log.divider();

  for (;;) {
    const userInput = await askQuestion(chalk.green.bold('\nYou: '));

    if (['exit', 'quit'].includes(userInput.trim().toLowerCase())) {
      log.step('\n👋 Terima kasih sudah mencoba. Sampai jumpa!\n');
      rl.close();
      return;
    }

    if (!userInput.trim()) continue;

    log.muted('Bot sedang berpikir...');
    const response = await getAIResponse(userInput);

    console.log(chalk.blue.bold('\nBot: ') + chalk.white(response) + '\n');
    log.divider();
  }
};

startTesting().catch((error) => {
  log.error('Fatal error:', error);
  process.exit(1);
});
