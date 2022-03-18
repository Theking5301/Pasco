"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowManagerService = void 0;
const electron = require("electron");
const electron_1 = require("electron");
const BaseService_1 = require("../BaseService");
class WindowManagerService extends BaseService_1.BaseService {
    constructor() {
        super();
        electron_1.ipcMain.on('sparrow/maximize', (event) => {
            const browserWindow = electron_1.BrowserWindow.fromWebContents(event.sender);
            if (browserWindow === null || browserWindow === void 0 ? void 0 : browserWindow.isMaximizable()) {
                if (browserWindow.isMaximized()) {
                    browserWindow.unmaximize();
                }
                else {
                    browserWindow.maximize();
                }
            }
        });
        electron_1.ipcMain.on('sparrow/minimize', (event) => {
            const browserWindow = electron_1.BrowserWindow.fromWebContents(event.sender);
            browserWindow === null || browserWindow === void 0 ? void 0 : browserWindow.minimize();
        });
        electron_1.ipcMain.on('sparrow/close', (event) => {
            const browserWindow = electron_1.BrowserWindow.fromWebContents(event.sender);
            browserWindow === null || browserWindow === void 0 ? void 0 : browserWindow.close();
        });
        electron_1.ipcMain.on('windowMoving', (e, { mouseX, mouseY }) => {
            // If we're maximized and moving, unmaximize.
            const browserWindow = electron_1.BrowserWindow.fromWebContents(e.sender);
            if (browserWindow === null || browserWindow === void 0 ? void 0 : browserWindow.isMaximizable()) {
                if (browserWindow.isMaximized()) {
                    browserWindow.unmaximize();
                }
            }
            // Then move the window.
            const { x, y } = electron.screen.getCursorScreenPoint();
            browserWindow.setPosition(x - mouseX, y - mouseY);
        });
        electron_1.ipcMain.on('windowMoved', () => { });
    }
    initialize() {
        return Promise.resolve();
    }
}
exports.WindowManagerService = WindowManagerService;
//# sourceMappingURL=window-manager-service.js.map