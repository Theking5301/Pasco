import { Injectable } from '@angular/core';
import { BrowserState } from '../../../../app/models/UserData';
import { SparrowElectronService } from '../sparrow-electron/sparrow-electron.service';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private browser: BrowserState;

  constructor(private electron: SparrowElectronService) {

  }
  public getBrowserData(): BrowserState {
    return this.browser;
  }
  public initialize(): Promise<void> {
    return new Promise((resolve) => {
      this.electron.ipcRenderer.send('sparrow/window-data');
      this.electron.ipcRenderer.on('sparrow/window-data', (event, data) => {
        this.browser = new BrowserState(data);
        console.log(data);
        resolve();
      });
    });
  }
  public syncToDataAccess() {
    this.electron.ipcRenderer.send('sparrow/window-data/update', this.browser);
  }
}
