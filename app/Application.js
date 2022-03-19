"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const electron_1 = require("electron");
const fs = require("fs");
const path = require("path");
const url = require("url");
const ServiceCollections_1 = require("./ServiceCollections");
class Application {
    constructor(isInDevelopmentMode) {
        this.devMode = isInDevelopmentMode;
        this.windows = [];
    }
    async initialize() {
        const userData = await ServiceCollections_1.ServiceCollection.USER_SERVICE.getProfileFromBestAvailableSource();
        await this.createNewWindow();
    }
    getWindows() {
        return this.windows;
    }
    async createNewWindow() {
        const electronScreen = electron_1.screen;
        const size = electronScreen.getPrimaryDisplay().workAreaSize;
        // Create the browser window.
        const newWindow = new electron_1.BrowserWindow({
            x: 0,
            y: 0,
            width: size.width / 2,
            height: size.height / 2,
            minWidth: 500,
            minHeight: 500,
            webPreferences: {
                nodeIntegration: true,
                nodeIntegrationInSubFrames: false,
                allowRunningInsecureContent: false,
                webviewTag: true,
                contextIsolation: false
            },
            transparent: true,
            titleBarStyle: 'hidden',
        });
        if (this.devMode) {
            newWindow.webContents.openDevTools();
            require('electron-reload')(__dirname, {
                electron: require(path.join(__dirname, '/../node_modules/electron'))
            });
            newWindow.loadURL(url.format({
                pathname: 'localhost:4300',
                protocol: 'http:',
                slashes: true
            }));
        }
        else {
            // Path when running electron executable
            let pathIndex = './index.html';
            if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
                // Path when running electron in local folder
                pathIndex = '../dist/index.html';
            }
            newWindow.loadURL(url.format({
                pathname: path.join(__dirname, pathIndex),
                protocol: 'file:',
                slashes: true
            }));
        }
        // Emitted when the window is closed. Remove the window from the window array.
        newWindow.on('closed', () => {
            const index = this.windows.indexOf(newWindow, 0);
            if (index >= 0) {
                this.windows.splice(index, 1);
            }
        });
        // Add the new window to the Windows array.
        this.windows.push(newWindow);
        return newWindow;
    }
    isInDevelopmentMode() {
        return this.devMode;
    }
}
exports.Application = Application;
//# sourceMappingURL=Application.js.map