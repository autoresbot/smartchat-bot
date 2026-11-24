import chalk from 'chalk';

const line = (width = 50) => chalk.blue('─'.repeat(width));

export const log = {
  banner(title) {
    const padded = ` ${title} `.padStart((38 + title.length) / 2 + 1).padEnd(38);
    console.log(chalk.blue.bold('\n╔══════════════════════════════════════╗'));
    console.log(chalk.blue.bold(`║${padded}║`));
    console.log(chalk.blue.bold('╚══════════════════════════════════════╝\n'));
  },
  info: (...args) => console.log(chalk.cyan(...args)),
  step: (...args) => console.log(chalk.blue.bold(...args)),
  success: (...args) => console.log(chalk.green.bold(...args)),
  warn: (...args) => console.log(chalk.yellow(...args)),
  error: (...args) => console.error(chalk.red(...args)),
  muted: (...args) => console.log(chalk.gray(...args)),
  divider: () => console.log(line()),

  message({ pushName, number, isGroup, text }) {
    console.log(
      chalk.cyan.bold('[MESSAGE]'),
      chalk.yellow(`${pushName} (${number})`),
      chalk.gray(`[${isGroup ? 'GROUP' : 'PRIVATE'}]`),
      chalk.white('|'),
      chalk.white(text),
    );
  },

  pairingCode(phoneNumber, code) {
    console.log(chalk.white('\nNOMOR ANDA: ') + chalk.yellow.bold(phoneNumber));
    console.log(chalk.white('CODE PAIRING ANDA: ') + chalk.green.bold(code) + '\n');
  },
};

export default log;
