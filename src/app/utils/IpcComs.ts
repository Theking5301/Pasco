
const electron = window.require('electron');

export class IpcComs {
  public static getData(channel: string, response: (event, data) => void): void {
    IpcComs.getDataWithArgs(channel, undefined, response);
  }
  public static getDataWithArgs(channel: string, args: any[], response: (event, data) => void): void {
    electron.ipcRenderer.send('pasco/get' + channel, args);
    electron.ipcRenderer.on('pasco/' + channel, (event, data) => {
      response(event, data);
    });
  }
}
