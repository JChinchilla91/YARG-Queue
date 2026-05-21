# YARG Party Queue

Local FIFO song request queue for [YARG](https://github.com/YARC-Official/YARG). Players on the same Wi‑Fi pick songs from a small web app; a transparent desktop overlay shows the queue on top of the game.

## Stack

- **Server** — Node 22.5+, Express, built-in `node:sqlite` (no native rebuilds)
- **Client** — React, Vite, Material UI
- **Overlay** — Electron (always-on-top window)

## Quick start

```bash
npm install
npm run index-songs          # optional: seed sample songs for dev
npm run dev:all              # server + client + overlay
```

- **Web UI (dev):** http://localhost:5173 — phones use your **Wi‑Fi** IP on the same port
- **Web UI (production):** http://localhost:3001 — when `NODE_ENV=production` and client is built
- **API:** http://localhost:3001

### Phones on the same Wi‑Fi

1. Use the **Wi‑Fi** URL from the Join page (usually `http://192.168.x.x:...`), not VPN or VirtualBox IPs.
2. With `NODE_ENV=production` in `.env`, phones should use **port 3001** (not 5173).
3. If the page never loads, allow ports through Windows Firewall (Admin PowerShell):

   ```powershell
   npm run open-firewall
   ```

4. Turn off VPN (NordVPN, etc.) on the PC and phone while testing.
5. Some routers block **client isolation** — phones can’t reach PCs; disable that in router settings or use the PC’s browser only.
- **Overlay:** opens automatically in dev when using `dev:all`

### Production

```bash
npm run build
npm run start                # serves API + built client on port 3001
# Run overlay separately after pointing it at the built URL (see overlay/README)
```

## Song library

Copy `.env.example` to `.env` and set `SONG_FOLDERS` to the same folders YARG uses (comma-separated for multiple paths):

```env
SONG_FOLDERS=F:\Games\Songs
```

Then rebuild the index:

```bash
npm run index-songs
```

The indexer is a starter implementation — extend `server/scripts/index-songs.js` for your chart layout.

## Workflow

1. Host starts server + overlay on the YARG PC.
2. Players open the site, enter a display name, search, and request songs (FIFO).
3. Overlay shows the queue; host marks songs playing/played from the **Host** page.
4. Add the top song to YARG’s setlist manually (native auto-add can be added later).

## Project layout

```
server/     API + SQLite
client/     React + MUI web app
overlay/    Electron always-on-top window
```
