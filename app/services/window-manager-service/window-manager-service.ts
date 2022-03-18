import * as electron from 'electron';
import { BrowserWindow, ipcMain } from "electron";
import { BaseService } from "../BaseService";

export class WindowManagerService extends BaseService {
  public constructor() {
    super();


    ipcMain.on('sparrow/maximize', (event) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender);
      if (browserWindow?.isMaximizable()) {
        if (browserWindow.isMaximized()) {
          browserWindow.unmaximize();
        } else {
          browserWindow.maximize();
        }
      }
    });

    ipcMain.on('sparrow/minimize', (event) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender);
      browserWindow?.minimize();
    });

    ipcMain.on('sparrow/close', (event) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender);
      browserWindow?.close();
    });

    ipcMain.on('windowMoving', (e, { mouseX, mouseY }) => {
      // If we're maximized and moving, unmaximize.
      const browserWindow = BrowserWindow.fromWebContents(e.sender);
      if (browserWindow?.isMaximizable()) {
        if (browserWindow.isMaximized()) {
          browserWindow.unmaximize();
        }
      }

      // Then move the window.
      const { x, y } = electron.screen.getCursorScreenPoint()
      browserWindow.setPosition(x - mouseX, y - mouseY)
    });

    ipcMain.on('windowMoved', () => { });
  }
  public initialize(): Promise<void> {
    return Promise.resolve();
  }
}
