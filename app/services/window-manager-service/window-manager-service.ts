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
      // Then move the window.
      const browserWindow = BrowserWindow.fromWebContents(e.sender);
      const { x, y } = electron.screen.getCursorScreenPoint();
      const { newX, newY } = {
        newX: x - mouseX,
        newY: y - mouseY
      }

      if (Math.abs(newX - browserWindow.getPosition()[0]) >= 1 || Math.abs(newY - browserWindow.getPosition()[1]) >= 1) {
        // If we're maximized and moving, unmaximize.
        if (browserWindow?.isMaximizable()) {
          if (browserWindow.isMaximized()) {
            browserWindow.unmaximize();
          }
        }
        browserWindow.setPosition(newX, newY);
      }
    });

    ipcMain.on('windowMoved', () => { });
  }
  public initialize(): Promise<void> {
    return Promise.resolve();
  }
}
