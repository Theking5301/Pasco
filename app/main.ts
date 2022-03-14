import * as electron from 'electron';
import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as contextMenu from 'electron-context-menu';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { RavenLogin } from './services/raven-login';
import StaticDataAccess from './services/static-data-access';
import { UserDataAccess } from './services/user-data-access';

export let mainWindow: BrowserWindow = null;

const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

const services = [new UserDataAccess(), new StaticDataAccess(), new RavenLogin(app, serve)];

function createWindow(): BrowserWindow {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width / 2,
    height: size.height / 2,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      allowRunningInsecureContent: (serve) ? true : false,
      webviewTag: true,
      contextIsolation: false
    },
    transparent: true,
    titleBarStyle: 'hidden',
  });

  if (serve) {
    mainWindow.webContents.openDevTools();
    require('electron-reload')(__dirname, {
      electron: require(path.join(__dirname, '/../node_modules/electron'))
    });
    mainWindow.loadURL(url.format({
      pathname: 'localhost:4300',
      protocol: 'http:',
      slashes: true,
      query: { "dirname": __dirname }
    }));
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, pathIndex),
      protocol: 'file:',
      slashes: true,
      query: { "dirname": __dirname }
    }));
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  return mainWindow;
}

ipcMain.on('sparrow/maximize', (event) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (browserWindow?.isMaximizable()) {
    if (browserWindow.isMaximized()) {
      browserWindow.unmaximize();
    } else {
      browserWindow.maximize();
    }
  }
});

ipcMain.on('sparrow/minimize', (event) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  browserWindow?.minimize();
});

ipcMain.on('sparrow/close', (event) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  browserWindow?.close();
});

ipcMain.on('windowMoving', (e, { mouseX, mouseY }) => {
  // If we're maximized and moving, unmaximize.
  const browserWindow = BrowserWindow.fromWebContents(e.sender);
  if (browserWindow?.isMaximizable()) {
    if (browserWindow.isMaximized()) {
      browserWindow.unmaximize();
    }
  }

  // Then move the window.
  const { x, y } = electron.screen.getCursorScreenPoint()
  mainWindow.setPosition(x - mouseX, y - mouseY)
});

ipcMain.on('windowMoved', () => { });

ipcMain.on('sparrow/get-platform', (event) => {
  event.sender.send('sparrow/platform', process.platform);
});


try {
  app.commandLine.appendSwitch('disable-site-isolation-trials');

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

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
    if (mainWindow === null) {
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
  console.log(message)
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.executeJavaScript(`console.log("${message}")`)
  }
}
