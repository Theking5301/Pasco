"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const main_1 = require("../../main");
const BaseService_1 = require("../BaseService");
const os = require('os');
class StaticDataAccess extends BaseService_1.BaseService {
    constructor() {
        super();
        this.data = {
            platform: os.platform(),
            appDirectory: main_1.APP_DIRECTORY
        };
        electron_1.ipcMain.on('sparrow/static-data', (event, windowId) => {
            event.sender.send('sparrow/static-data', this.data);
        });
    }
    initialize() {
        return Promise.resolve();
    }
}
exports.default = StaticDataAccess;
//# sourceMappingURL=static-data-access.js.map