import { BrowserWindow, screen } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { ServiceCollection } from "./ServiceCollections";

export class Application {
  private devMode: boolean;
  private windows: BrowserWindow[];

  public constructor(isInDevelopmentMode: boolean) {
    this.devMode = isInDevelopmentMode;
    this.windows = [];
  }

  public async initialize() {
    const userData = await ServiceCollection.USER_SERVICE.getProfileFromBestAvailableSource();
    await this.createNewWindow();
  }
  public getWindows(): BrowserWindow[] {
    return this.windows;
  }
  public async createNewWindow(): Promise<BrowserWindow> {
    const electronScreen = screen;
    const size = electronScreen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    const newWindow = new BrowserWindow({
      x: 0,
      y: 0,
      width: size.width / 2,
      height: size.height / 2,
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
    });

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
    }

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
