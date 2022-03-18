import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as contextMenu from 'electron-context-menu';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { ServiceCollection } from './ServiceCollections';
import { Logger } from './utilities/Logger';

export let MAIN_WINDOW: BrowserWindow = null;

const ARGS = process.argv.slice(1);
export const APP_DIRECTORY = __dirname;
export const IS_DEV = ARGS.some(val => val === '--serve');
export const SERVICE_COLLECTION = new ServiceCollection(app, IS_DEV);

contextMenu({
  prepend: (params, browserWindow) => [{
    label: 'Rainbow',
  }]
});

function createWindow(): BrowserWindow {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  MAIN_WINDOW = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width / 2,
    height: size.height / 2,
    minWidth: 500,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      allowRunningInsecureContent: (IS_DEV) ? true : false,
      webviewTag: true,
      contextIsolation: false
    },
    transparent: true,
    titleBarStyle: 'hidden',
  });

  if (IS_DEV) {
    MAIN_WINDOW.webContents.openDevTools();
    require('electron-reload')(__dirname, {
      electron: require(path.join(__dirname, '/../node_modules/electron'))
    });
    MAIN_WINDOW.loadURL(url.format({
      pathname: 'localhost:4300',
      protocol: 'http:',
      slashes: true
    }));
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    MAIN_WINDOW.loadURL(url.format({
      pathname: path.join(__dirname, pathIndex),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Emitted when the window is closed.
  MAIN_WINDOW.on('closed', () => {
    MAIN_WINDOW = null;
  });

  return MAIN_WINDOW;
}

ipcMain.on('sparrow/get-platform', (event) => {
  event.sender.send('sparrow/platform', process.platform);
});


try {
  app.commandLine.appendSwitch('disable-site-isolation-trials');

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    SERVICE_COLLECTION.initialize().then((resolve) => {
      setTimeout(createWindow, 400);
    })
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (MAIN_WINDOW === null) {
      createWindow();
    }
  });

  app.on("web-contents-created", (e, contents) => {
    if (contents.getType() == "webview") {
      // set context menu in webview
      contextMenu({ window: contents, });
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}

export function logToDevtools(message) {
  Logger.info(message)
  if (MAIN_WINDOW && MAIN_WINDOW.webContents) {
    MAIN_WINDOW.webContents.executeJavaScript(`Logger.info("${message.toString()}")`)
  }
}
