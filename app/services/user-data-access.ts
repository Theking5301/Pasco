import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as fs from 'fs';
import jwt_decode from "jwt-decode";
import { win } from '../main';
import { UserData } from '../models/UserData';
const keytar = require('keytar')

export class UserDataAccess {
  private cachedData: UserData;

  public constructor() {
    if (fs.existsSync(app.getPath('userData').concat('\\user-data.json'))) {
      const data = fs.readFileSync(app.getPath('userData').concat('\\user-data.json'), 'utf8');
      this.cachedData = new UserData(JSON.parse(data));
    }

    ipcMain.on('sparrow/user-data/update', (event, data) => {
      this.cachedData = data;
      fs.writeFileSync(app.getPath('userData').concat('\\user-data.json'), JSON.stringify(this.cachedData, null, 4));
    });

    ipcMain.on('sparrow/user-data', (event) => {
      event.sender.send('sparrow/user-data', this.cachedData);
    });

    ipcMain.on('sparrow/open-raven-login', (event, data) => {
      this.openRavenLogin('http://localhost:4200/', 475, 675);
    });
  }

  private openRavenLogin(url: string, w: number, h: number) {
    const electronScreen = screen;
    const size = electronScreen.getPrimaryDisplay().workAreaSize;
    const y = win.getSize()[0] / 2 + win.getPosition()[0] - (h / 2);
    const x = win.getSize()[1] / 2 + win.getPosition()[1] - (w / 2);
    const popup = new BrowserWindow({
      x: x,
      y: y,
      width: w,
      height: h,
      webPreferences: {
        allowRunningInsecureContent: false
      }
    });

    // Load the url.
    popup.loadURL(url);

    popup.webContents.addListener('did-navigate-in-page', (e, url) => {
      // Once navigated, grab the encoded token from the URL and store it in our credential manager under the user's ravenId.
      if (url.indexOf('#') > 0) {
        const response = Buffer.from(url.split('#')[1], 'base64').toString();
        const token = JSON.parse(response).accessToken;
        const decodedToken: any = jwt_decode(token);
        keytar.setPassword('Raven', decodedToken.RavenId, response);
        popup.close();
      }
    });
    return popup;
  }
}

