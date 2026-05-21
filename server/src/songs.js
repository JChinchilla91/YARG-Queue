import { db } from './db.js';

export function searchSongs(query, limit = 25) {
  const trimmed = query?.trim() ?? '';
  if (!trimmed) {
    return db
      .prepare(
        `SELECT id, title, artist, album FROM songs ORDER BY title COLLATE NOCASE LIMIT ?`
      )
      .all(limit);
  }

  const terms = trimmed
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => `%${t}%`);

  let sql = `SELECT id, title, artist, album FROM songs WHERE 1=1`;
  const params = [];
  for (const term of terms) {
    sql += ` AND search_text LIKE ?`;
    params.push(term);
  }
  sql += ` ORDER BY title COLLATE NOCASE LIMIT ?`;
  params.push(limit);

  return db.prepare(sql).all(...params);
}

export function getSongCount() {
  return db.prepare('SELECT COUNT(*) AS count FROM songs').get().count;
}

export function upsertSong(song) {
  const searchText = [song.title, song.artist, song.album]
    .join(' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  db.prepare(
    `
    INSERT INTO songs (id, title, artist, album, search_text)
    VALUES (@id, @title, @artist, @album, @searchText)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      artist = excluded.artist,
      album = excluded.album,
      search_text = excluded.search_text
  `
  ).run({
    id: song.id,
    title: song.title,
    artist: song.artist ?? '',
    album: song.album ?? '',
    searchText,
  });
}
