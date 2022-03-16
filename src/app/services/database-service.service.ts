import { Injectable } from '@angular/core';
import { SparrowElectronService } from './sparrow-electron/sparrow-electron.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseServiceService {

  constructor(private electron: SparrowElectronService) { }

  public query<T>(query: string, params: any): Promise<T> {
    return new Promise<T>((resolve) => {
      this.electron.ipcRenderer.send('sparrow/sql', [query, params]);
      this.electron.ipcRenderer.once('sparrow/sql', (event, data) => {
        resolve(data);
      });
    });
  }
}
