"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataAccess = void 0;
var electron_1 = require("electron");
var fs = require("fs");
var jwt_decode_1 = require("jwt-decode");
var main_1 = require("../main");
var UserData_1 = require("../models/UserData");
var keytar = require('keytar');
var UserDataAccess = /** @class */ (function () {
  function UserDataAccess() {
    var _this = this;
    if (fs.existsSync(electron_1.app.getPath('userData').concat('\\user-data.json'))) {
      var data = fs.readFileSync(electron_1.app.getPath('userData').concat('\\user-data.json'), 'utf8');
      this.cachedData = new UserData_1.UserData(JSON.parse(data));
    }
    electron_1.ipcMain.on('sparrow/user-data/update', function (event, data) {
      _this.cachedData = data;
      fs.writeFileSync(electron_1.app.getPath('userData').concat('\\user-data.json'), JSON.stringify(_this.cachedData, null, 4));
    });
    electron_1.ipcMain.on('sparrow/user-data', function (event) {
      event.sender.send('sparrow/user-data', _this.cachedData);
    });
    electron_1.ipcMain.on('sparrow/open-raven-login', function (event, data) {
      _this.openRavenLogin('http://localhost:4200/', 475, 675);
    });
  }
  UserDataAccess.prototype.openRavenLogin = function (url, w, h) {
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    var y = main_1.win.getSize()[0] / 2 + main_1.win.getPosition()[0] - (h / 2);
    var x = main_1.win.getSize()[1] / 2 + main_1.win.getPosition()[1] - (w / 2);
    var popup = new electron_1.BrowserWindow({
      x: x,
      y: y,
      width: w,
      height: h,
      webPreferences: {
        allowRunningInsecureContent: false
      }
    });
    // Load the url.
    popup.loadURL(url);
    popup.webContents.addListener('did-navigate-in-page', function (e, url) {
      if (url.indexOf('#') > 0) {
        var response = Buffer.from(url.split('#')[1], 'base64').toString();
        console.log(response);
        var token = JSON.parse(response).accessToken;
        console.log(token);
        var decodedToken = (0, jwt_decode_1.default)(token);
        console.log(decodedToken);
        keytar.setPassword('Raven', decodedToken.RavenId, response);
        popup.close();
      }
    });
    return popup;
  };
  return UserDataAccess;
}());
exports.UserDataAccess = UserDataAccess;
//# sourceMappingURL=user-data-access.js.map
