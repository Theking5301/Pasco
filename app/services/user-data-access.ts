import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import { UserData } from '../models/UserData';

export class UserDataAccess {
  private cachedData: UserData;

  public constructor() {
    if (fs.existsSync(app.getPath('userData').concat('\\user-data.json'))) {
      const data = fs.readFileSync(app.getPath('userData').concat('\\user-data.json'), 'utf8');
      this.cachedData = new UserData(JSON.parse(data));
    }

    ipcMain.on('pasco/user-data/update', (event, data) => {
      this.cachedData = data;
      fs.writeFileSync(app.getPath('userData').concat('\\user-data.json'), JSON.stringify(this.cachedData, null, 4));
    });

    ipcMain.on('pasco/user-data', (event) => {
      event.sender.send('pasco/user-data', this.cachedData);
    });
  }
}
