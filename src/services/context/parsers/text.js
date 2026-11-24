import fs from 'fs';

/** Pembaca untuk .txt dan .md */
export const readTXT = async (filePath) => fs.readFileSync(filePath, 'utf-8');
