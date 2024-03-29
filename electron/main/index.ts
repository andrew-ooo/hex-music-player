/* eslint-disable import/no-extraneous-dependencies, no-param-reassign */
// @ts-nocheck
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { hostname, release, version } from 'os';
import path, { join } from 'path';
import {
  app, BrowserWindow, shell, ipcMain, screen, nativeImage,
} from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

app.commandLine.appendSwitch('disable-background-timer-throttling');

// Config setup
const dataPath = app.getPath('userData');
const configPath = join(dataPath, 'config.json');
const filtersPath = join(dataPath, 'filters.json');
const lyricsPath = join(dataPath, 'lyrics');

function parseData(file: string) {
  const defaultData = {};
  try {
    return JSON.parse(readFileSync(file).toString());
  } catch (error) {
    return defaultData;
  }
}

function writeData(key: string, value: any, file: string) {
  const contents = parseData(file);
  contents[key] = value;
  writeFileSync(file, JSON.stringify(contents, null, 2));
}

function readData(key: string, file: string) {
  const contents = parseData(file);
  try {
    return contents[key];
  } catch {
    return {};
  }
}

function writeLyrics(lyrics: any) {
  const { artistGuid, trackGuid } = lyrics;
  if (!existsSync(lyricsPath)) {
    mkdirSync(lyricsPath);
  }
  const trimmedGuid = artistGuid[0] === 'p'
    ? artistGuid.slice(13)
    : artistGuid.slice(8);
  const lyricsFilePath = join(dataPath, 'lyrics', `${trimmedGuid}.json`);
  const contents = parseData(lyricsFilePath);
  contents[trackGuid] = lyrics;
  writeFileSync(lyricsFilePath, JSON.stringify(contents, null, 2));
}

function readLyrics(artistGuid: string, trackGuid: string) {
  if (!existsSync(lyricsPath)) {
    mkdirSync(lyricsPath);
  }
  const trimmedGuid = artistGuid[0] === 'p'
    ? artistGuid.slice(13)
    : artistGuid.slice(8);
  const lyricsFilePath = join(dataPath, 'lyrics', `${trimmedGuid}.json`);
  const contents = parseData(lyricsFilePath);
  try {
    return contents[trackGuid];
  } catch (error) {
    return undefined;
  }
}

function UpsertKeyValue(obj, keyToChange, value) {
  const keyToChangeLower = keyToChange.toLowerCase();
  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === keyToChangeLower) {
      obj[key] = value;
      return;
    }
  }
  obj[keyToChange] = value;
}

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

const ROOT_PATH = {
  // /dist
  dist: join(__dirname, '../..'),
  // /dist or /public
  public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
};

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin
const url = process.env.VITE_DEV_SERVER_URL as string;
const indexHtml = join(ROOT_PATH.dist, 'index.html');

const resetTaskbarButtons = (isPlaying : boolean) => {
  win.setThumbarButtons([
    {
      tooltip: 'Previous',
      icon: nativeImage
        .createFromPath(path.join(ROOT_PATH.public, 'taskbar', 'prev.png')),
      click() { win.webContents.send('taskbar-controls', { event: 'prev' }); },
    },
    {
      tooltip: isPlaying ? 'Pause' : 'Play',
      icon: nativeImage
        .createFromPath(
          path.join(ROOT_PATH.public, 'taskbar', `${isPlaying ? 'pause' : 'play'}.png`),
        ),
      click() { win.webContents.send('taskbar-controls', { event: 'play-pause' }); },
    },
    {
      tooltip: 'Next',
      icon: nativeImage
        .createFromPath(path.join(ROOT_PATH.public, 'taskbar', 'next.png')),
      click() { win.webContents.send('taskbar-controls', { event: 'next' }); },
    },
  ]);
};

async function createWindow() {
  const bounds = readData('bounds', configPath);
  if (typeof bounds !== 'undefined') {
    const display = screen.getDisplayNearestPoint({ x: bounds.x, y: bounds.y });
    if (!(bounds.x > display.bounds.x && bounds.x < display.size.width)
      || !(bounds.y > display.bounds.y && bounds.y < display.size.height)) {
      // The requested position cannot be accessible so the nearest point is applied
      bounds.x = null;
      bounds.y = null;
    }
  }
  win = new BrowserWindow({
    backgroundColor: '#fff',
    frame: false,
    height: bounds?.height || 720,
    icon: join(ROOT_PATH.public, 'favicon.svg'),
    minHeight: 720,
    minWidth: 1202,
    show: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 20, y: 17 },
    webPreferences: {
      backgroundThrottling: false,
      contextIsolation: true,
      nodeIntegration: false,
      preload,
    },
    width: bounds?.width || 1202,
    x: bounds?.x,
    y: bounds?.y,
  });

  if (app.isPackaged) {
    await win.loadFile(indexHtml);
    win.show();
  } else {
    await win.loadURL(url);
    win.webContents.openDevTools();
    win.show();
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      const { requestHeaders } = details;
      UpsertKeyValue(requestHeaders, 'Access-Control-Allow-Origin', ['*']);
      callback({ requestHeaders });
    },
  );

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const { responseHeaders } = details;
    UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*']);
    UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*']);
    callback({
      responseHeaders,
    });
  });

  const setTitleOpacity = (value) => `
    if(document.readyState === 'complete') {
      const titleBar = document.getElementById('window-title-menu');
      const titleButtons = document.getElementById('window-title-buttons');

      if(titleBar) titleBar.style.opacity = ${value};
      if(titleButtons) titleButtons.style.opacity = ${value};
    }
  `;

  win.once('focus', () => resetTaskbarButtons(false));
  win.on('focus', () => win.webContents.executeJavaScript(setTitleOpacity(1)));
  win.on('blur', () => win.webContents.executeJavaScript(setTitleOpacity(0.5)));
  win.on('close', (event) => {
    writeData('bounds', win.getNormalBounds(), configPath);
    if (process.platform === 'darwin') {
      if (app.quitting) {
        win = null;
      } else if (win !== null) {
        event.preventDefault();
        win.hide();
      }
    }
  });
}

app.whenReady()
  .then(() => installExtension(REACT_DEVELOPER_TOOLS))
  .then(createWindow);

app.on('before-quit', () => {
  if (process.platform === 'darwin') {
    app.quitting = true;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const initialInstance = app.requestSingleInstanceLock();
if (!initialInstance) app.quit();
else {
  app.on('second-instance', () => {
    if (win.isMinimized()) win.restore();
    win.focus();
  });
}

app.on('activate', () => {
  if (process.platform === 'darwin' && win !== null) {
    win.show();
  }
});

ipcMain.on('app-maximize', () => win.maximize());
ipcMain.on('app-minimize', () => win.minimize());
ipcMain.on('app-quit', () => win.close());
ipcMain.on('app-unmaximize', () => win.unmaximize());
ipcMain.on('read-config', (event, arg) => {
  event.returnValue = readData(arg.key, configPath);
});
ipcMain.on('write-config', (event, arg) => {
  writeData(arg.key, arg.value, configPath);
  event.returnValue = readData(arg.key, configPath);
});
ipcMain.on('read-filters', (event, arg) => {
  event.returnValue = readData(arg.key, filtersPath);
});
ipcMain.on('write-filters', (event, arg) => {
  writeData(arg.key, arg.value, filtersPath);
  event.returnValue = readData(arg.key, filtersPath);
});
ipcMain.on('read-lyrics', (event, arg) => {
  event.returnValue = readLyrics(arg.artistGuid, arg.trackGuid);
});
ipcMain.on('write-lyrics', (event, arg) => {
  writeLyrics(arg.lyrics);
  event.returnValue = readLyrics(arg.lyrics.artistGuid, arg.lyrics.trackGuid);
});
ipcMain.on('get-app-info', (event) => {
  event.returnValue = {
    appName: app.getName(),
    appVersion: app.getVersion(),
    hostname: hostname(),
    platform: process.platform,
    version: version(),
  };
});
ipcMain.on('update-playing', (event, arg) => {
  resetTaskbarButtons(arg.value);
});
