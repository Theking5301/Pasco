import { Injectable } from '@angular/core';
import { app, ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';

@Injectable({
  providedIn: 'root'
})
export class PascoElectronService {
  public ipcRenderer: typeof ipcRenderer;
  public webFrame: typeof webFrame;
  public childProcess: typeof childProcess;
  public fs: typeof fs;

  constructor() {
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');

      // Notes :
      // * A NodeJS's dependency imported with 'window.require' MUST BE present in `dependencies` of both `app/package.json`
      // and `package.json (root folder)` in order to make it work here in Electron's Renderer process (src folder)
      // because it will loaded at runtime by Electron.
      // * A NodeJS's dependency imported with TS module import (ex: import { Dropbox } from 'dropbox') CAN only be present
      // in `dependencies` of `package.json (root folder)` because it is loaded during build phase and does not need to be
      // in the final bundle. Reminder : only if not used in Electron's Main process (app folder)

      // If you want to use a NodeJS 3rd party deps in Renderer process,
      // ipcRenderer.invoke can serve many common use cases.
      // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }
  public getData<T>(channel: string): Promise<IpcResponse<T>> {
    return this.getDataWithArgs(channel, []);
  }
  public getDataWithArgs<T>(channel: string, ...args: any[]): Promise<IpcResponse<T>> {
    this.ipcRenderer.send('pasco/' + channel, args);
    return new Promise((resolve) => {
      this.ipcRenderer.on('pasco/' + channel, (event, data) => {
        resolve(new IpcResponse(data, event));
      });
    });
  }
}

export class IpcResponse<T> {
  public constructor(private data: T, private event: any) { }
  public getData(): T {
    return this.data;
  }
  public getEvent(): any {
    return this.event;
  }
}
