import { App, BrowserWindow, screen, Size } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { IS_DEV } from './main';
import { BrowserState } from './models/UserData';
import { ServiceCollection } from "./ServiceCollections";

export class Application {
  public static SCREEN_SIZE: Size;
  public static DEFAULT_WINDOW_SIZE: Size;
  private devMode: boolean;
  private windows: BrowserWindow[];

  public constructor(private app: App, isInDevelopmentMode: boolean) {
    this.devMode = isInDevelopmentMode;
    this.windows = [];

    let args = '--new-window';
    if (IS_DEV) {
      args += ` ${process.argv[1]} ${path.resolve(process.argv[2])} ${path.resolve(process.argv[3])}`;
    }

    app.setUserTasks([
      {
        program: process.execPath,
        arguments: args,
        iconPath: process.execPath,
        iconIndex: 0,
        title: 'New Window',
        description: 'Create a new window'
      }
    ]);
  }

  public async initialize() {
    Application.SCREEN_SIZE = screen.getPrimaryDisplay().workAreaSize;
    Application.DEFAULT_WINDOW_SIZE = { width: Application.SCREEN_SIZE.width / 2, height: Application.SCREEN_SIZE.height / 2 };
    const userData = await ServiceCollection.USER_SERVICE.getProfileFromBestAvailableSource();
    for (const browser of userData.getBrowsers()) {
      await this.createNewWindow(browser);
    }
  }
  public getWindows(): BrowserWindow[] {
    return this.windows;
  }
  public async createNewWindow(browserState?: BrowserState): Promise<BrowserWindow> {    // Create the browser window.
    const newWindow = new BrowserWindow({
      x: browserState ? browserState.xPosition : 0,
      y: browserState ? browserState.yPosition : 0,
      width: browserState ? browserState.width : Application.DEFAULT_WINDOW_SIZE.width,
      height: browserState ? browserState.height : Application.DEFAULT_WINDOW_SIZE.height,
      minWidth: 500,
      minHeight: 500,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInSubFrames: false,
        allowRunningInsecureContent: false,
        webviewTag: true,
        contextIsolation: false
      },
      transparent: true,
      titleBarStyle: 'hidden',
      trafficLightPosition: { x: 16, y: 14 }
    });

    if (browserState && browserState.maximized) {
      newWindow.maximize();
    }

    if (this.devMode) {
      newWindow.webContents.openDevTools();
      require('electron-reload')(__dirname, {
        electron: require(path.join(__dirname, '/../node_modules/electron'))
      });
      newWindow.loadURL(url.format({
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

      newWindow.loadURL(url.format({
        pathname: path.join(__dirname, pathIndex),
        protocol: 'file:',
        slashes: true
      }));

      console.log(newWindow.id);
    }

    newWindow.on('close', async () => {
      // Let the user service know a window is closing.
      await ServiceCollection.USER_SERVICE.onWindowClosed(newWindow);
    });

    // Emitted when the window is closed. Remove the window from the window array.
    newWindow.on('closed', () => {
      const index = this.windows.indexOf(newWindow, 0);
      if (index >= 0) {
        this.windows.splice(index, 1);
      }
    });

    // Add the new window to the Windows array.
    this.windows.push(newWindow);

    return newWindow;
  }
  public isInDevelopmentMode() {
    return this.devMode;
  }
}
