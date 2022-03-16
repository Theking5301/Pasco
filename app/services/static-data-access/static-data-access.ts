import { ipcMain } from "electron";
import { APP_DIRECTORY } from "../../main";

const os = require('os');

export default class StaticDataAccess {
  public data: IStaticData;

  public constructor() {
    this.data = {
      platform: os.platform(),
      appDirectory: APP_DIRECTORY
    }

    ipcMain.on('sparrow/static-data', (event, windowId) => {
      event.sender.send('sparrow/static-data', this.data);
    });
  }
}
export interface IStaticData {
  platform: string;
  appDirectory: string;
}
