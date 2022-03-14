"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RavenLogin = void 0;
var electron_1 = require("electron");
var jwt_decode_1 = require("jwt-decode");
var path = require("path");
var main_1 = require("../main");
var keytar = require('keytar');
var RavenLogin = /** @class */ (function () {
    function RavenLogin(app, isDev) {
        var _this = this;
        this.app = app;
        if (process.defaultApp) {
            if (process.argv.length >= 2) {
                app.setAsDefaultProtocolClient('sd-sparrow', process.execPath, [path.resolve(process.argv[1])]);
            }
        }
        else {
            app.setAsDefaultProtocolClient('sd-sparrow');
        }
        // Handle the call to open the login window.
        electron_1.ipcMain.on('sparrow/open-raven-login', function (event, data) {
            if (_this.sparrowWindow && !_this.sparrowWindow.isDestroyed()) {
                _this.sparrowWindow.focus();
            }
            else {
                var clientId = '04e7fc20-cc9b-4e3d-bb18-3b56cafa4557';
                var responseType = 'token';
                var redirectUri = "sd-sparrow://login";
                var scope = 'sparrow';
                _this.sparrowWindow = _this.openRavenLogin("http://localhost:4200/login?scope=".concat(scope, "&response_type=").concat(responseType, "&redirect_uri=").concat(redirectUri, "&client_id=").concat(clientId), 475, 675);
            }
        });
        // Only for windows.
        var gotTheLock = this.app.requestSingleInstanceLock();
        if (!gotTheLock) {
            app.quit();
        }
        // This is only for windows.
        app.on('second-instance', function (event, commandLine, workingDirectory) {
            // Someone tried to run a second instance, we should focus our window.
            if (main_1.mainWindow) {
                if (main_1.mainWindow.isMinimized()) {
                    main_1.mainWindow.restore();
                }
                main_1.mainWindow.focus();
            }
            // Protocol handler for win32
            // argv: An array of the second instance’s (command line / deep linked) arguments
            if (process.platform == 'win32') {
                // Keep only command line / deep linked arguments
                var url = commandLine.find(function (arg) { return arg.startsWith('sd-sparrow://'); });
                (0, main_1.logToDevtools)("Second: " + url);
                _this.handleRedirect(url);
            }
        });
        // Handle the protocol. In this case, we choose to show an Error Box.
        app.on('open-url', function (event, url) {
            (0, main_1.logToDevtools)("OpenURL: " + url);
            _this.handleRedirect(url);
        });
    }
    RavenLogin.prototype.handleRedirect = function (url) {
        var response = Buffer.from(url.split('#')[1], 'base64').toString();
        var token = JSON.parse(response).accessToken;
        var decodedToken = (0, jwt_decode_1.default)(token);
        (0, main_1.logToDevtools)(decodedToken);
        keytar.setPassword('Raven', decodedToken.RavenId, response);
        this.sparrowWindow.close();
        this.app.releaseSingleInstanceLock();
    };
    RavenLogin.prototype.openRavenLogin = function (url, w, h) {
        var x = main_1.mainWindow.getSize()[0] / 2 + main_1.mainWindow.getPosition()[0] - (w / 2);
        var y = main_1.mainWindow.getSize()[1] / 2 + main_1.mainWindow.getPosition()[1] - (h / 2);
        var popup = new electron_1.BrowserWindow({
            x: x,
            y: y,
            width: w,
            height: h,
            webPreferences: {
                allowRunningInsecureContent: false
            }
        });
        popup.setMenuBarVisibility(false);
        // Load the url.
        popup.loadURL(url);
        return popup;
    };
    return RavenLogin;
}());
exports.RavenLogin = RavenLogin;
//# sourceMappingURL=raven-login.js.map