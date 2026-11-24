import fs from 'fs';
import pdfParse from 'pdf-parse';
import log from '../../../utils/logger.js';

export const readPDF = async (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  if (fileBuffer.length === 0) {
    log.warn(`⚠️  PDF file ${filePath} is empty`);
    return '';
  }

  const pdfData = await pdfParse(fileBuffer);
  if (!pdfData.text || pdfData.text.trim().length === 0) {
    log.warn(`⚠️  PDF file ${filePath} has no extractable text`);
    return '';
  }

  return pdfData.text;
};
