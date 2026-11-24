import fs from 'fs';

export const readJSON = async (filePath) => {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return JSON.stringify(parsed, null, 2);
};
