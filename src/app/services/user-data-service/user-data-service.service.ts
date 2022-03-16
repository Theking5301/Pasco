import { Injectable } from '@angular/core';
import { BrowserState, UserData } from '../../../../app/models/UserData';
import { SparrowElectronService } from '../sparrow-electron/sparrow-electron.service';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private userData: UserData;

  constructor(private electron: SparrowElectronService) {
    this.userData = new UserData();
  }

  public getUserData(): UserData {
    return this.userData;
  }
  public getBrowserData(): BrowserState {
    return this.userData.getBrowser('4ebada60-4da0-4caf-b3cb-b43f7eff4c5b');
  }
  public initialize(): Promise<void> {
    return new Promise((resolve) => {
      this.electron.ipcRenderer.send('sparrow/user-data');
      this.electron.ipcRenderer.on('sparrow/user-data', (event, data) => {
        this.userData = new UserData(data);
        resolve();
      });
    });
  }
  public syncToDataAccess() {
    this.userData.lastModified = Date.now();
    this.electron.ipcRenderer.send('sparrow/user-data/update', this.userData);
  }
}
