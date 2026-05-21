/**
 * Scans SONG_FOLDERS for song.ini and upserts into the party-queue database.
 * Loads .env from the project root (see server/src/loadEnv.js).
 */
import { projectRoot } from '../src/loadEnv.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { db } from '../src/db.js';
import { upsertSong, getSongCount } from '../src/songs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseIni(content) {
  const data = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim().toLowerCase();
    const value = trimmed.slice(eq + 1).trim();
    data[key] = value;
  }
  return data;
}

function songIdFromPath(root) {
  return crypto.createHash('sha256').update(root.toLowerCase()).digest('hex').slice(0, 16);
}

function* walkDirs(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  let hasSongIni = false;
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isFile() && entry.name.toLowerCase() === 'song.ini') {
      hasSongIni = true;
    } else if (entry.isDirectory()) {
      yield* walkDirs(full);
    }
  }
  if (hasSongIni) yield dir;
}

function indexFolder(folder) {
  let count = 0;
  for (const songDir of walkDirs(folder)) {
    const iniPath = path.join(songDir, 'song.ini');
    let ini;
    try {
      ini = parseIni(fs.readFileSync(iniPath, 'utf8'));
    } catch {
      continue;
    }

    const title = ini.name || ini.songname || path.basename(songDir);
    const artist = ini.artist || '';
    const album = ini.album || '';

    upsertSong({
      id: songIdFromPath(songDir),
      title,
      artist,
      album,
    });
    count += 1;
  }
  return count;
}

function seedDevSongs() {
  const samples = [
    { id: 'dev-001', title: 'Example Song One', artist: 'Demo Artist', album: 'Demo Album' },
    { id: 'dev-002', title: 'Example Song Two', artist: 'Another Band', album: '' },
    { id: 'dev-003', title: 'Test Track', artist: 'Local Player', album: 'Party Pack' },
  ];
  for (const s of samples) upsertSong(s);
  return samples.length;
}

const folders = (process.env.SONG_FOLDERS ?? '')
  .split(',')
  .map((f) => f.trim())
  .filter(Boolean);

if (folders.length === 0) {
  console.warn('SONG_FOLDERS is not set.');
  console.warn(`Add it to ${path.join(projectRoot, '.env')} (project root), for example:`);
  console.warn('  SONG_FOLDERS=F:\\Games\\Songs');
  console.warn('Then run: npm run index-songs');
  console.warn('Seeding dev sample songs instead.\n');
  seedDevSongs();
  console.log(`Songs in database: ${getSongCount()}`);
  process.exit(0);
}

let indexed = 0;
let missing = 0;
for (const folder of folders) {
  if (!fs.existsSync(folder)) {
    console.warn(`Skipping missing folder: ${folder}`);
    missing += 1;
    continue;
  }
  const n = indexFolder(folder);
  console.log(`Indexed ${n} songs from ${folder}`);
  indexed += n;
}

if (indexed === 0) {
  console.warn('SONG_FOLDERS is set but no song.ini files were found under:');
  for (const folder of folders) {
    if (fs.existsSync(folder)) console.warn(`  ${folder}`);
  }
  if (missing > 0) {
    console.warn('Some paths in SONG_FOLDERS do not exist — check spelling and drive letter.');
  }
  console.warn('Seeding dev sample songs instead.\n');
  seedDevSongs();
} else {
  console.log(`Total indexed this run: ${indexed}`);
  db.prepare(`DELETE FROM queue_entries WHERE song_id LIKE 'dev-%'`).run();
  db.prepare(`DELETE FROM songs WHERE id LIKE 'dev-%'`).run();
}

console.log(`Songs in database: ${getSongCount()}`);
