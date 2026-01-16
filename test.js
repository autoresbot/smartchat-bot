import readline from 'readline';
import chalk from 'chalk';
import config from './config.js';
import { getAIResponse } from './lib/ai.js';
import { loadContextFiles, getContext } from './lib/context-loader.js';

// Setup readline untuk input terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};

const startTesting = async () => {
  console.log(chalk.blue.bold('\n╔═══════════════════════════════════════╗'));
  console.log(chalk.blue.bold('║     AI BOT TESTING TOOL (NO WA)      ║'));
  console.log(chalk.blue.bold('╚═══════════════════════════════════════╝\n'));

  // Load context
  if (config.useContext) {
    console.log(chalk.cyan.bold('📚 Loading context files from: ' + config.contextFolderPath));
    await loadContextFiles(config.contextFolderPath);
    const context = getContext();
    if (context) {
      //console.log(chalk.green(`✅ Context loaded! (${context.length} characters)`));
      //   console.log(chalk.gray('Preview (first 200 chars):'));
      //   console.log(chalk.gray(context.substring(0, 200) + '...\n'));
    } else {
      console.log(chalk.yellow('⚠️  No context files found in folder.\n'));
      console.log(
        chalk.yellow('Add .pdf, .txt, .md, .docx, .json, or .csv files to ./context/ folder\n'),
      );
    }
  } else {
    console.log(chalk.yellow('⚠️  Context disabled in config.js\n'));
  }

  console.log(chalk.cyan.bold('Type your questions below (or type "exit" to quit)\n'));
  console.log(chalk.gray('─'.repeat(50)) + '\n');

  // Loop untuk input berulang
  const askLoop = async () => {
    const userInput = await askQuestion(chalk.green.bold('You: '));

    // Check if user wants to exit
    if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
      console.log(chalk.blue.bold('\n👋 Thank you for testing! Goodbye.\n'));
      rl.close();
      process.exit(0);
    }

    // Skip jika input kosong
    if (!userInput.trim()) {
      await askLoop();
      return;
    }

    try {
      // Show typing indicator
      console.log(chalk.gray('Bot is thinking...'));

      // Get AI response
      const response = await getAIResponse(userInput);

      console.log(chalk.blue.bold('\nBot: ') + chalk.white(response) + '\n');
      console.log(chalk.gray('─'.repeat(50)) + '\n');

      // Ask next question
      await askLoop();
    } catch (error) {
      console.error(chalk.red('Error getting response:'), error.message);
      console.log(chalk.gray('─'.repeat(50)) + '\n');
      await askLoop();
    }
  };

  // Mulai loop
  await askLoop();
};

// Start testing
startTesting().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
