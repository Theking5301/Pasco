import { App, BrowserWindow, ipcMain } from 'electron';
import jwt_decode from "jwt-decode";
import * as path from 'path';
import { logToDevtools, mainWindow } from '../main';
const keytar = require('keytar')

export class RavenLogin {
  private sparrowWindow: BrowserWindow;
  private protocol: string;

  public constructor(private app: App, isDev: boolean) {
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('sd-sparrow', process.execPath, [path.resolve(process.argv[1])])
      }
    } else {
      app.setAsDefaultProtocolClient('sd-sparrow')
    }

    // Handle the call to open the login window.
    ipcMain.on('sparrow/open-raven-login', (event, data) => {
      if (this.sparrowWindow && !this.sparrowWindow.isDestroyed()) {
        this.sparrowWindow.focus();
      } else {
        const clientId = '04e7fc20-cc9b-4e3d-bb18-3b56cafa4557';
        const responseType = 'token';
        const redirectUri = `sd-sparrow://login`;
        const scope = 'sparrow';
        this.sparrowWindow = this.openRavenLogin(`http://localhost:4200/login?scope=${scope}&response_type=${responseType}&redirect_uri=${redirectUri}&client_id=${clientId}`, 475, 675);
      }
    });

    // Only for windows.
    const gotTheLock = this.app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit()
    }

    // This is only for windows.
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.focus()
      }

      // Protocol handler for win32
      // argv: An array of the second instance’s (command line / deep linked) arguments
      if (process.platform == 'win32') {
        // Keep only command line / deep linked arguments
        let url = commandLine.find((arg) => arg.startsWith('sd-sparrow://'));
        logToDevtools("Second: " + url);
        this.handleRedirect(url);
      }
    })

    // Handle the protocol. In this case, we choose to show an Error Box.
    app.on('open-url', (event, url) => {
      logToDevtools("OpenURL: " + url);
      this.handleRedirect(url);
    });
  }

  private handleRedirect(url: string) {
    const response = Buffer.from(url.split('#')[1], 'base64').toString();
    const token = JSON.parse(response).accessToken;
    const decodedToken: any = jwt_decode(token);
    logToDevtools(decodedToken);
    keytar.setPassword('Raven', decodedToken.RavenId, response);
    this.sparrowWindow.close();
    this.app.releaseSingleInstanceLock();
  }

  private openRavenLogin(url: string, w: number, h: number) {
    const x = mainWindow.getSize()[0] / 2 + mainWindow.getPosition()[0] - (w / 2);
    const y = mainWindow.getSize()[1] / 2 + mainWindow.getPosition()[1] - (h / 2);
    const popup = new BrowserWindow({
      x: x,
      y: y,
      width: w,
      height: h,
      webPreferences: {
        allowRunningInsecureContent: false
      }
    });
    popup.setMenuBarVisibility(false);

    // Load the url.
    popup.loadURL(url);


    return popup;
  }
}

