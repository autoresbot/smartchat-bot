import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import csvParser from 'csv-parser';
import chalk from 'chalk';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let cachedContext = '';

// Baca file PDF
const readPDF = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    if (fileBuffer.length === 0) {
      console.warn(`⚠️  PDF file ${filePath} is empty`);
      return '';
    }
    const pdfData = await pdfParse(fileBuffer);
    if (!pdfData.text || pdfData.text.trim().length === 0) {
      console.warn(`⚠️  PDF file ${filePath} has no extractable text`);
      return '';
    }

    // console.log({
    //   pages: pdfData.numpages,
    //   info: pdfData.info,
    //   metadata: pdfData.metadata,
    // });

    console.log(`✓ PDF parsed successfully: ${pdfData.text.length} chars`);
    return pdfData.text;
  } catch (error) {
    console.error(`❌ Error reading PDF ${filePath}:`);
    console.error(`   Error type: ${error.name}`);
    console.error(`   Error message: ${error.message}`);
    return '';
  }
};

// Baca file TXT & MD
const readTXT = async (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading TXT ${filePath}:`, error.message);
    return '';
  }
};

// Baca file DOCX
const readDOCX = async (filePath) => {
  try {
    const docBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: docBuffer });
    return result.value;
  } catch (error) {
    console.error(`Error reading DOCX ${filePath}:`, error.message);
    return '';
  }
};

// Baca file JSON
const readJSON = async (filePath) => {
  try {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(jsonData);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    console.error(`Error reading JSON ${filePath}:`, error.message);
    return '';
  }
};

// Baca file XLSX
const readXLSX = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    let xlsxText = '';

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      xlsxText += `\n--- Sheet: ${sheetName} ---\n`;

      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      xlsxText += csvContent;
    }

    if (!xlsxText.trim()) {
      console.warn(`⚠️  XLSX file ${filePath} has no readable content`);
      return '';
    }

    return xlsxText;
  } catch (error) {
    console.error(`Error reading XLSX ${filePath}:`, error.message);
    return '';
  }
};

// Baca file CSV
const readCSV = async (filePath) => {
  return new Promise((resolve) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', () => {
        const csvText = rows
          .map((row, idx) => {
            return Object.entries(row)
              .map(([key, value]) => `${key}: ${value}`)
              .join(' | ');
          })
          .join('\n');
        resolve(csvText);
      })
      .on('error', (error) => {
        console.error(`Error reading CSV ${filePath}:`, error.message);
        resolve('');
      });
  });
};

// Load semua files dari folder context
export const loadContextFiles = async (contextFolderPath) => {
  try {
    if (!fs.existsSync(contextFolderPath)) {
      console.log(`Folder context tidak ditemukan. Membuat folder: ${contextFolderPath}`);
      fs.mkdirSync(contextFolderPath, { recursive: true });
      return '';
    }

    const files = fs.readdirSync(contextFolderPath);
    const supportedExtensions = ['.pdf', '.txt', '.md', '.docx', '.json', '.csv', '.xlsx'];
    const validFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return supportedExtensions.includes(ext);
    });

    if (validFiles.length === 0) {
      console.log(
        chalk.yellow(
          '⚠️  No supported files found in context folder. Supported: .pdf, .txt, .md, .docx, .json, .csv, .xlsx',
        ),
      );
      return '';
    }

    console.log(chalk.blue(`Found ${validFiles.length} file(s) to load...\n`));

    let contextText = '';
    let filesLoaded = 0;
    let filesFailed = 0;

    for (const file of validFiles) {
      const filePath = path.join(contextFolderPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        let fileContent = '';

        try {
          if (ext === '.pdf') {
            //process.stdout.write(chalk.cyan(`📄 Reading PDF: ${file} ... `));
            fileContent = await readPDF(filePath);
            if (fileContent) {
              console.log(chalk.green(`OK (${fileContent.length} chars)`));
            }
          } else if (ext === '.txt' || ext === '.md') {
            //process.stdout.write(chalk.cyan(`  📝 Reading ${ext.toUpperCase()}: ${file} ... `));
            fileContent = await readTXT(filePath);
            if (fileContent) {
              console.log(chalk.green(`OK (${fileContent.length} chars)`));
            }
          } else if (ext === '.docx') {
            process.stdout.write(chalk.cyan(`  📋 Reading DOCX: ${file} ... `));
            fileContent = await readDOCX(filePath);
            if (fileContent) {
              console.log(chalk.green(`OK (${fileContent.length} chars)`));
            }
          } else if (ext === '.json') {
            process.stdout.write(chalk.cyan(`  📊 Reading JSON: ${file} ... `));
            fileContent = await readJSON(filePath);
            if (fileContent) {
              console.log(chalk.green(`OK (${fileContent.length} chars)`));
            }
          } else if (ext === '.csv') {
            process.stdout.write(chalk.cyan(`  📈 Reading CSV: ${file} ... `));
            fileContent = await readCSV(filePath);
            if (fileContent) {
              console.log(chalk.green(`OK (${fileContent.length} chars)`));
            }
          } else if (ext === '.xlsx') {
            process.stdout.write(chalk.cyan(`  📊 Reading XLSX: ${file} ... `));
            fileContent = await readXLSX(filePath);
            if (fileContent) {
              console.log(chalk.green(`OK (${fileContent.length} chars)`));
            }
          }

          if (fileContent) {
            contextText += `\n\n=== File: ${file} ===\n${fileContent}`;
            filesLoaded++;
          } else {
            console.log(chalk.yellow('SKIPPED (empty content)'));
            filesFailed++;
          }
        } catch (fileError) {
          console.log(chalk.red(`FAILED (${fileError.message})`));
          filesFailed++;
        }
      }
    }

    cachedContext = contextText;

    console.log(chalk.blue('\n' + '─'.repeat(50)));
    console.log(
      chalk.green(`✅ Context loaded successfully!`) +
        ` (${filesLoaded} files, ${contextText.length} total characters)`,
    );
    if (filesFailed > 0) {
      console.log(chalk.yellow(`⚠️  ${filesFailed} file(s) failed to load`));
    }
    console.log(chalk.blue('─'.repeat(50)) + '\n');

    return contextText;
  } catch (error) {
    console.error(chalk.red('Error loading context files:'), error);
    return '';
  }
};

// Get cached context
export const getContext = () => {
  return cachedContext;
};

// Update context (reload files)
export const refreshContext = async (contextFolderPath) => {
  console.log('🔄 Refreshing context files...');
  return await loadContextFiles(contextFolderPath);
};
