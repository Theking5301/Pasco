import { ipcMain } from "electron";

const os = require('os');

export default class StaticDataAccess {
  public data: IStaticData;

  public constructor() {
    this.data = {
      platform: os.platform()
    }

    ipcMain.on('sparrow/static-data', (event, windowId) => {
      event.sender.send('sparrow/static-data', this.data);
    });
  }
}
export interface IStaticData {
  platform: string;
}
