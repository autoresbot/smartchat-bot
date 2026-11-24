# SmartChat Bot

Bot WhatsApp dengan balasan AI ([Autoresbot](https://api.autoresbot.com) atau Groq) yang menjawab berdasarkan dokumen di folder `context/`.
Koneksi WhatsApp memakai [**zapo-js**](https://zapo.to).

## Persyaratan

- **Wajib Node.js 24** (cek dengan `node -v`)
- API key Autoresbot (default `APIKEY_FREE`) atau API key [Groq](https://console.groq.com)

> ⚠️ **Server Pterodactyl:** buka tab **Startup**, lalu ubah **Docker Image** menjadi **Node.js 24**,
> kemudian restart server. Versi Node lain akan membuat modul `better-sqlite3` gagal dimuat
> (error `NODE_MODULE_VERSION`).

## Instalasi

```bash
npm install
```

Lalu isi `config.js` (minimal `phoneNumber`). Opsi lain sudah punya nilai bawaan.

## Menjalankan

```bash
npm start        # jalankan bot WhatsApp
npm run dev      # jalankan dengan auto-restart saat file berubah
npm run test:ai  # uji jawaban AI di terminal, tanpa koneksi WhatsApp
```

Saat pertama kali dijalankan, bot meminta **pairing code** 8 karakter. Masukkan lewat
WhatsApp → **Perangkat tertaut** → **Tautkan dengan nomor telepon**.
Ingin memakai QR code? Set `usePairingCode: false` di `config.js`.

Kredensial tersimpan otomatis di `session/state.sqlite`, jadi pairing hanya sekali.
Untuk memulai sesi baru dari nol, hapus folder `session/`.

## Struktur Proyek

```
config.js                     # pengaturan untuk user (yang perlu diubah saja)
context/                      # dokumen sumber jawaban AI (pdf, txt, md, docx, json, csv, xlsx)
scripts/test-ai.js            # penguji AI di terminal
src/
├── index.js                  # titik masuk aplikasi
├── config.js                 # nilai bawaan teknis + penggabung config.js
├── core/
│   ├── client.js             # store SQLite + WaClient
│   ├── auth.js               # pairing code / QR
│   └── connection.js         # reconnect berjenjang + shutdown rapi
├── handlers/
│   └── message.js            # alur balasan pesan masuk
├── services/
│   ├── ai.js                 # integrasi Autoresbot / Groq
│   └── context/              # pemuat dokumen konteks
│       ├── index.js
│       └── parsers/          # satu parser per format file
└── utils/                    # logger & helper pesan
```

## Konfigurasi

Opsi di `config.js`:

| Opsi | Keterangan |
| --- | --- |
| `phoneNumber` | nomor WhatsApp bot (format `628xxx`) |
| `usePairingCode` | `true` = pairing code, `false` = QR code |
| `apiKey` | API key Autoresbot, default `APIKEY_FREE` |
| `aiModel` | `claude-fable`, `claude-sonnet`, atau `gpt-5.5` |
| `aiSystemPrompt` | kepribadian & aturan menjawab |
| `useContext` | jawab berdasarkan file di folder `context/` |
| `botDestination` | `group`, `private`, atau `both` |
| `groupReplyMode` | `all` = balas semua pesan grup, `mention` = hanya jika bot di-tag atau di-reply |

### Opsi lanjutan (opsional)

Nilai bawaannya ada di `src/config.js`. Untuk mengubahnya, cukup tambahkan key yang sama ke `config.js`.

| Opsi | Bawaan | Keterangan |
| --- | --- | --- |
| `sessionId` | `default` | nama sesi (untuk multi-akun) |
| `storePath` | `./session/state.sqlite` | lokasi file login WhatsApp |
| `reconnect` | `{ maxAttempts: 10, baseDelayMs: 1000, maxDelayMs: 30000 }` | aturan sambung ulang |
| `logLevel` | `silent` | log internal zapo: `silent` … `trace` |
| `contextFolderPath` | `./context` | lokasi folder konteks |
| `aiProvider` | `autoresbot` | ganti ke `groq` untuk memakai Groq |
| `groq` | `{ apiKey: env GROQ_API_KEY, model: "openai/gpt-oss-20b" }` | pengaturan Groq |

## Menambah Format Konteks

Buat parser baru di `src/services/context/parsers/`, lalu daftarkan ekstensinya
pada peta `PARSERS` di `src/services/context/parsers/index.js`.

## Catatan

- `better-sqlite3` dipin ke `12.6.2` karena versi tersebut masih menyediakan
  binary siap pakai untuk Node 20 (versi lebih baru butuh Visual Studio Build Tools).
  Jika memakai Node 22+, versi terbaru bisa dipakai.
- Paket `xlsx` dari npm punya peringatan keamanan tanpa perbaikan; hapus dependensinya
  bila dukungan `.xlsx` tidak diperlukan.
