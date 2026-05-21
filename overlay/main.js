const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173/overlay';
const CLICK_THROUGH = process.env.OVERLAY_CLICK_THROUGH !== 'false';

let mainWindow;

function createWindow() {
  const { width } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 380,
    height: 420,
    x: width - 400,
    y: 24,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(CLIENT_URL);

  if (CLICK_THROUGH) {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Toggle click-through: Ctrl+Shift+O
app.on('browser-window-created', (_, win) => {
  win.webContents.on('before-input-event', (_event, input) => {
    if (
      input.control &&
      input.shift &&
      input.key.toLowerCase() === 'o' &&
      input.type === 'keyDown'
    ) {
      const ignored = !win.isMouseEventsIgnored();
      win.setIgnoreMouseEvents(ignored, { forward: true });
      console.log(`Overlay click-through: ${ignored ? 'ON' : 'OFF'}`);
    }
  });
});
