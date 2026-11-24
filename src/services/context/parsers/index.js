import { readCSV } from './csv.js';
import { readDOCX } from './docx.js';
import { readJSON } from './json.js';
import { readPDF } from './pdf.js';
import { readTXT } from './text.js';
import { readXLSX } from './xlsx.js';

/** Peta ekstensi file → parser. Tambah format baru cukup dengan menambah entri di sini. */
export const PARSERS = {
  '.pdf': { label: '📄 PDF', read: readPDF },
  '.txt': { label: '📝 TXT', read: readTXT },
  '.md': { label: '📝 MD', read: readTXT },
  '.docx': { label: '📋 DOCX', read: readDOCX },
  '.json': { label: '📊 JSON', read: readJSON },
  '.csv': { label: '📈 CSV', read: readCSV },
  '.xlsx': { label: '📊 XLSX', read: readXLSX },
};

export const SUPPORTED_EXTENSIONS = Object.keys(PARSERS);
