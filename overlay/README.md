# Overlay

Always-on-top Electron window that loads the React `/overlay` route.

## Dev

Start the API and client first, then:

```bash
npm run dev -w overlay
```

Or from the repo root:

```bash
npm run dev:all
```

## Controls

- **Ctrl+Shift+O** — toggle click-through (so you can click YARG under the overlay)
- Drag the window by edges when click-through is off

## Production

Build the client, serve it from the Node server (`NODE_ENV=production`), then:

```bash
set CLIENT_URL=http://localhost:3001/overlay
npm run dev -w overlay
```
