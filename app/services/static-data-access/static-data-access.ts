import { ipcMain } from "electron";
import { APP_DIRECTORY } from "../../main";
import { BaseService } from "../BaseService";

const os = require('os');

export default class StaticDataAccess extends BaseService {
  public data: IStaticData;

  public constructor() {
    super();
    this.data = {
      platform: os.platform(),
      appDirectory: APP_DIRECTORY
    }

    ipcMain.on('sparrow/static-data', (event, windowId) => {
      event.sender.send('sparrow/static-data', this.data);
    });
  }
  public initialize(): Promise<void> {
    return Promise.resolve();
  }
}
export interface IStaticData {
  platform: string;
  appDirectory: string;
}
