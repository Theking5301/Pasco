"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataAccess = void 0;
var electron_1 = require("electron");
var fs = require("fs");
var UserData_1 = require("../models/UserData");
var UserDataAccess = /** @class */ (function () {
    function UserDataAccess() {
        var _this = this;
        if (fs.existsSync(electron_1.app.getPath('userData').concat('\\user-data.json'))) {
            var data = fs.readFileSync(electron_1.app.getPath('userData').concat('\\user-data.json'), 'utf8');
            this.cachedData = new UserData_1.UserData(JSON.parse(data));
        }
        electron_1.ipcMain.on('pasco/user-data/update', function (event, data) {
            _this.cachedData = data;
            fs.writeFileSync(electron_1.app.getPath('userData').concat('\\user-data.json'), JSON.stringify(_this.cachedData, null, 4));
        });
        electron_1.ipcMain.on('pasco/user-data', function (event) {
            event.sender.send('pasco/user-data', _this.cachedData);
        });
    }
    return UserDataAccess;
}());
exports.UserDataAccess = UserDataAccess;
//# sourceMappingURL=user-data-access.js.map