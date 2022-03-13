"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var os = require('os');
var StaticDataAccess = /** @class */ (function () {
    function StaticDataAccess() {
        var _this = this;
        this.data = {
            platform: os.platform()
        };
        electron_1.ipcMain.on('sparrow/static-data', function (event, windowId) {
            event.sender.send('sparrow/static-data', _this.data);
        });
    }
    return StaticDataAccess;
}());
exports.default = StaticDataAccess;
//# sourceMappingURL=static-data-access.js.map