import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbPath } from './db.js';
import { getLanAddresses, getJoinUrls } from './lan.js';
import { searchSongs, getSongCount } from './songs.js';
import {
  getQueueState,
  addRequest,
  setPlaying,
  markPlayed,
  removeEntry,
  clearQueue,
  isSongQueued,
} from './queue.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const HOST_PIN = process.env.HOST_PIN ?? '';
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

function requireHostPin(req, res, next) {
  if (!HOST_PIN) return next();
  const pin = req.headers['x-host-pin'];
  if (pin !== HOST_PIN) {
    return res.status(401).json({ error: 'Invalid host PIN' });
  }
  next();
}

app.get('/api/health', (_req, res) => {
  const joinUrls = getJoinUrls();
  res.json({
    ok: true,
    songCount: getSongCount(),
    database: dbPath,
    lanAddresses: getLanAddresses().map((a) => a.address),
    joinUrls,
    hostPinRequired: Boolean(HOST_PIN),
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  });
});

app.get('/api/songs', (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const limit = Math.min(Number(req.query.limit) || 25, 50);
  const songs = searchSongs(q, limit).map((song) => ({
    ...song,
    queued: isSongQueued(song.id),
  }));
  res.json({ songs });
});

app.get('/api/queue', (_req, res) => {
  res.json(getQueueState());
});

app.post('/api/request', (req, res) => {
  const { songId, name } = req.body ?? {};
  if (!songId || typeof songId !== 'string') {
    return res.status(400).json({ error: 'songId is required' });
  }
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }

  try {
    const entry = addRequest({ songId, requestedBy: name });
    res.status(201).json({ entry, queue: getQueueState() });
  } catch (err) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

app.post('/api/queue/:id/playing', requireHostPin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  try {
    res.json(setPlaying(id));
  } catch (err) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

app.post('/api/queue/:id/played', requireHostPin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  try {
    res.json(markPlayed(id));
  } catch (err) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

app.delete('/api/queue/:id', requireHostPin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  try {
    res.json(removeEntry(id));
  } catch (err) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

app.post('/api/queue/clear', requireHostPin, (_req, res) => {
  res.json(clearQueue());
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  const lan = getLanAddresses();
  console.log(`API listening on http://0.0.0.0:${PORT}`);
  console.log(`Database: ${dbPath}`);
  const joinUrls = getJoinUrls();
  if (joinUrls.length) {
    console.log('LAN URLs for phones (use the Wi‑Fi one):');
    for (const entry of joinUrls) {
      const star = entry.preferred ? '*' : ' ';
      console.log(`  ${star} ${entry.url}  (${entry.interface})`);
    }
    console.log('If phones cannot connect, run: npm run open-firewall');
  }
  if (HOST_PIN) {
    console.log('Host PIN required for queue management');
  }
});
