# Context Files Folder

Folder ini digunakan untuk menyimpan file PDF dan TXT yang akan digunakan sebagai konteks awal untuk AI.

## Cara Menggunakan:

1. **Tambahkan file PDF atau TXT** ke folder ini
2. Saat bot start, semua file akan otomatis dibaca
3. Konteks dari file akan dikirimkan ke AI untuk setiap pertanyaan user

## Contoh File:

- `dokumentasi.pdf` - Dokumentasi produk/layanan
- `panduan.txt` - Panduan FAQ atau SOP
- `company-info.txt` - Informasi perusahaan

## Format File yang Didukung:

- `.pdf` - File PDF
- `.txt` - File text biasa
- `.md` - File Markdown
- `.docx` - File Word Document
- `.json` - File JSON
- `.csv` - File CSV (spreadsheet)

## Tips:

- Jangan tambahkan file yang terlalu besar (>10MB) karena akan membebani memory
- Update file kapan saja, bot akan membacanya saat di-restart
- Untuk reload context tanpa restart, gunakan command khusus (akan ditambahkan di versi berikutnya)
