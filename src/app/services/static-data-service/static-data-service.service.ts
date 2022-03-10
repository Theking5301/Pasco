import { Injectable } from '@angular/core';
import { IStaticData } from '../../../../app/services/static-data-access';
import { PascoElectronService } from '../pasco-electron/pasco-electron.service';

@Injectable({
  providedIn: 'root'
})
export class StaticDataService {
  private staticData: IStaticData;

  constructor(private electron: PascoElectronService) { }
  public getStaticData(): IStaticData {
    return this.staticData;
  }
  public initialize(): Promise<void> {
    return new Promise((resolve) => {
      this.electron.ipcRenderer.send('pasco/static-data');
      this.electron.ipcRenderer.on('pasco/static-data', (event, data) => {
        this.staticData = data;
        resolve();
      });
    });
  }
}
