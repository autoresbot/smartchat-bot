/**
 * Pastikan modul native (better-sqlite3) cocok dengan versi Node.js yang sedang dipakai.
 * Jika Node.js di-upgrade/downgrade, binary lama gagal dimuat (NODE_MODULE_VERSION mismatch),
 * jadi script ini otomatis menjalankan `npm rebuild` sebelum bot dijalankan.
 */
import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const NATIVE_MODULES = ['better-sqlite3'];
const REQUIRED_NODE_MAJOR = 24;

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor !== REQUIRED_NODE_MAJOR) {
  console.warn(
    `\n⚠️  Bot ini WAJIB memakai Node.js ${REQUIRED_NODE_MAJOR}, sekarang terpasang ${process.version}.\n` +
      `   Jika server jalan di Pterodactyl: buka tab "Startup", ubah "Docker Image" menjadi Node.js ${REQUIRED_NODE_MAJOR}, lalu restart.\n`,
  );
}

const canLoad = (name) => {
  try {
    const Database = require(name);
    new Database(':memory:').close();
    return true;
  } catch (error) {
    if (error?.code === 'MODULE_NOT_FOUND') throw error;
    console.warn(`[ensure-native] ${name} tidak cocok dengan Node ${process.version}: ${error.message.split('\n')[0]}`);
    return false;
  }
};

for (const name of NATIVE_MODULES) {
  if (canLoad(name)) continue;

  console.warn(`[ensure-native] Menjalankan "npm rebuild ${name}"...`);
  execSync(`npm rebuild ${name}`, { stdio: 'inherit' });

  // Hapus cache require agar binary hasil rebuild yang diuji.
  for (const key of Object.keys(require.cache)) {
    if (key.includes(`node_modules${process.platform === 'win32' ? '\\' : '/'}${name}`)) delete require.cache[key];
  }

  if (!canLoad(name)) {
    console.error(`[ensure-native] Gagal memperbaiki ${name}. Coba hapus folder node_modules lalu jalankan "npm install".`);
    process.exit(1);
  }
  console.log(`[ensure-native] ${name} berhasil di-rebuild untuk Node ${process.version}.`);
}
