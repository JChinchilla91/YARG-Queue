import { db, runTransaction } from './db.js';

const QUEUED = 'queued';
const PLAYING = 'playing';

const selectSong = db.prepare(`
  SELECT id, title, artist, album FROM songs WHERE id = ?
`);

const selectQueued = db.prepare(`
  SELECT
    q.id,
    q.song_id AS songId,
    q.requested_by AS requestedBy,
    q.status,
    q.created_at AS createdAt,
    s.title,
    s.artist,
    s.album
  FROM queue_entries q
  JOIN songs s ON s.id = q.song_id
  WHERE q.status = ?
  ORDER BY q.created_at ASC
`);

const selectPlaying = db.prepare(`
  SELECT
    q.id,
    q.song_id AS songId,
    q.requested_by AS requestedBy,
    q.status,
    q.created_at AS createdAt,
    s.title,
    s.artist,
    s.album
  FROM queue_entries q
  JOIN songs s ON s.id = q.song_id
  WHERE q.status = ?
  LIMIT 1
`);

const countActiveByUser = db.prepare(`
  SELECT COUNT(*) AS count
  FROM queue_entries
  WHERE requested_by = ? COLLATE NOCASE
    AND status IN ('queued', 'playing')
`);

const countQueuedBySong = db.prepare(`
  SELECT COUNT(*) AS count
  FROM queue_entries
  WHERE song_id = ? AND status = 'queued'
`);

export function getQueueState() {
  return {
    nowPlaying: selectPlaying.get(PLAYING) ?? null,
    queue: selectQueued.all(QUEUED),
  };
}

export function addRequest({ songId, requestedBy }) {
  const song = selectSong.get(songId);
  if (!song) {
    const err = new Error('Song not found');
    err.status = 404;
    throw err;
  }

  const active = countActiveByUser.get(requestedBy);
  if (active.count > 0) {
    const err = new Error('You already have a song in the queue');
    err.status = 409;
    throw err;
  }

  const result = db
    .prepare(`
      INSERT INTO queue_entries (song_id, requested_by, status, created_at)
      VALUES (?, ?, 'queued', ?)
    `)
    .run(songId, requestedBy.trim(), Date.now());

  return {
    id: Number(result.lastInsertRowid),
    songId,
    requestedBy: requestedBy.trim(),
    status: QUEUED,
    createdAt: Date.now(),
    ...song,
  };
}

export function setPlaying(entryId) {
  const entry = db.prepare('SELECT id, status FROM queue_entries WHERE id = ?').get(entryId);
  if (!entry) {
    const err = new Error('Queue entry not found');
    err.status = 404;
    throw err;
  }

  runTransaction(() => {
    db.prepare(`UPDATE queue_entries SET status = 'played' WHERE status = 'playing'`).run();
    db.prepare(`UPDATE queue_entries SET status = 'playing' WHERE id = ?`).run(entryId);
  });

  return getQueueState();
}

export function markPlayed(entryId) {
  const result = db
    .prepare(`UPDATE queue_entries SET status = 'played' WHERE id = ? AND status IN ('queued', 'playing')`)
    .run(entryId);

  if (result.changes === 0) {
    const err = new Error('Queue entry not found or already finished');
    err.status = 404;
    throw err;
  }

  return getQueueState();
}

export function removeEntry(entryId) {
  const result = db
    .prepare(`UPDATE queue_entries SET status = 'removed' WHERE id = ? AND status IN ('queued', 'playing')`)
    .run(entryId);

  if (result.changes === 0) {
    const err = new Error('Queue entry not found');
    err.status = 404;
    throw err;
  }

  return getQueueState();
}

export function clearQueue() {
  db.prepare(`UPDATE queue_entries SET status = 'removed' WHERE status IN ('queued', 'playing')`).run();
  return getQueueState();
}

export function isSongQueued(songId) {
  return countQueuedBySong.get(songId).count > 0;
}
