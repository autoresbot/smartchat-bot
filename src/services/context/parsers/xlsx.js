import fs from 'fs';
import XLSX from 'xlsx';
import log from '../../../utils/logger.js';

export const readXLSX = async (filePath) => {
  const workbook = XLSX.read(fs.readFileSync(filePath), { type: 'buffer' });

  let xlsxText = '';
  for (const sheetName of workbook.SheetNames) {
    xlsxText += `\n--- Sheet: ${sheetName} ---\n`;
    xlsxText += XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
  }

  if (!xlsxText.trim()) {
    log.warn(`⚠️  XLSX file ${filePath} has no readable content`);
    return '';
  }

  return xlsxText;
};
