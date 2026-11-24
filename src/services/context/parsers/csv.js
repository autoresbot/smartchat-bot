import fs from 'fs';
import csvParser from 'csv-parser';

export const readCSV = async (filePath) =>
  new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => rows.push(row))
      .on('end', () => {
        const csvText = rows
          .map((row) =>
            Object.entries(row)
              .map(([key, value]) => `${key}: ${value}`)
              .join(' | '),
          )
          .join('\n');
        resolve(csvText);
      })
      .on('error', reject);
  });
