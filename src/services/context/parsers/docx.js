import fs from 'fs';
import mammoth from 'mammoth';

export const readDOCX = async (filePath) => {
  const result = await mammoth.extractRawText({ buffer: fs.readFileSync(filePath) });
  return result.value;
};
