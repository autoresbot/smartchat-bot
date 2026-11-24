import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import log from '../../utils/logger.js';
import { PARSERS, SUPPORTED_EXTENSIONS } from './parsers/index.js';

let cachedContext = '';

const listContextFiles = (contextFolderPath) =>
  fs
    .readdirSync(contextFolderPath)
    .filter((file) => SUPPORTED_EXTENSIONS.includes(path.extname(file).toLowerCase()))
    .filter((file) => fs.statSync(path.join(contextFolderPath, file)).isFile());

/** Baca seluruh file pendukung di folder context lalu simpan hasilnya di cache. */
export const loadContextFiles = async (contextFolderPath) => {
  try {
    if (!fs.existsSync(contextFolderPath)) {
      log.warn(`Folder context tidak ditemukan. Membuat folder: ${contextFolderPath}`);
      fs.mkdirSync(contextFolderPath, { recursive: true });
      return '';
    }

    const files = listContextFiles(contextFolderPath);
    if (files.length === 0) {
      log.warn(`⚠️  Tidak ada file yang didukung di folder context. Didukung: ${SUPPORTED_EXTENSIONS.join(', ')}`);
      return '';
    }

    log.step(`Found ${files.length} file(s) to load...\n`);

    let contextText = '';
    let filesLoaded = 0;
    let filesFailed = 0;

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      const parser = PARSERS[ext];

      process.stdout.write(chalk.cyan(`  ${parser.label}: ${file} ... `));

      try {
        const fileContent = await parser.read(path.join(contextFolderPath, file));

        if (fileContent) {
          console.log(chalk.green(`OK (${fileContent.length} chars)`));
          contextText += `\n\n=== File: ${file} ===\n${fileContent}`;
          filesLoaded += 1;
        } else {
          console.log(chalk.yellow('SKIPPED (empty content)'));
          filesFailed += 1;
        }
      } catch (fileError) {
        console.log(chalk.red(`FAILED (${fileError.message})`));
        filesFailed += 1;
      }
    }

    cachedContext = contextText;

    log.divider();
    log.success(`✅ Context loaded! (${filesLoaded} file, ${contextText.length} karakter)`);
    if (filesFailed > 0) log.warn(`⚠️  ${filesFailed} file gagal dimuat`);
    log.divider();
    console.log();

    return contextText;
  } catch (error) {
    log.error('Error loading context files:', error);
    return '';
  }
};

/** Context yang sedang di-cache. */
export const getContext = () => cachedContext;

/** Muat ulang seluruh file context dari disk. */
export const refreshContext = async (contextFolderPath) => {
  log.info('🔄 Refreshing context files...');
  return loadContextFiles(contextFolderPath);
};
