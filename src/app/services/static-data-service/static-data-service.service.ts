import { Injectable } from '@angular/core';
import { IStaticData } from '../../../../app/services/static-data-access/static-data-access';
import { SparrowElectronService } from '../sparrow-electron/sparrow-electron.service';

@Injectable({
  providedIn: 'root'
})
export class StaticDataService {
  private staticData: IStaticData;

  constructor(private electron: SparrowElectronService) { }
  public getStaticData(): IStaticData {
    return this.staticData;
  }
  public initialize(): Promise<void> {
    return new Promise((resolve) => {
      this.electron.ipcRenderer.send('sparrow/static-data');
      this.electron.ipcRenderer.on('sparrow/static-data', (event, data) => {
        this.staticData = data;
        resolve();
      });
    });
  }
}
