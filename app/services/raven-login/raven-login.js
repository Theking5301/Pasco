"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RavenLogin = void 0;
var electron_1 = require("electron");
var jwt_decode_1 = require("jwt-decode");
var keytar = require("keytar");
var path = require("path");
var main_1 = require("../../main");
var RAVEN_WINDOW_WIDTH = 475;
var RAVEN_WINDOW_HEIGHT = 700;
var RavenLogin = /** @class */ (function () {
    function RavenLogin(app, isDev) {
        var _this = this;
        this.app = app;
        this.protocolLaunchArg = "--protocol-launch";
        // Set the protocol covered by this instance of the app.
        // On MacOS this is meaningless as the plist controls this.
        this.protocol = 'sd-sparrow';
        // Remove and then re-set the protocol handling.
        app.removeAsDefaultProtocolClient(this.protocol);
        if (process.platform === 'win32' && isDev) {
            if (isDev) {
                app.setAsDefaultProtocolClient(this.protocol, process.execPath, [
                    process.argv[1],
                    path.resolve(process.argv[2]),
                    path.resolve(process.argv[3]),
                    this.protocolLaunchArg,
                ]);
            }
            else {
                app.setAsDefaultProtocolClient(this.protocol, process.execPath, [
                    this.protocolLaunchArg,
                ]);
            }
        }
        else {
            app.setAsDefaultProtocolClient(this.protocol);
        }
        // Handle the call to open the login window.
        electron_1.ipcMain.on('sparrow/open-raven-login', function (event, data) {
            _this.promptForRavenLogin();
        });
        // Handle requests to get the raven token.
        electron_1.ipcMain.on('sparrow/raven-token', function (event) { return __awaiter(_this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getValidAccessToken(false)];
                    case 1:
                        token = _a.sent();
                        event.sender.send('sparrow/raven-token', token);
                        return [2 /*return*/];
                }
            });
        }); });
        electron_1.ipcMain.on('sparrow/raven-token-prompt', function (event) { return __awaiter(_this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getValidAccessToken(true)];
                    case 1:
                        token = _a.sent();
                        event.sender.send('sparrow/raven-token', token);
                        return [2 /*return*/];
                }
            });
        }); });
        // Only for windows.
        var gotTheLock = this.app.requestSingleInstanceLock();
        if (!gotTheLock) {
            app.quit();
        }
        // This is only for windows.
        app.on('second-instance', function (event, commandLine, workingDirectory) {
            // Someone tried to run a second instance, we should focus our window.
            if (main_1.MAIN_WINDOW) {
                if (main_1.MAIN_WINDOW.isMinimized()) {
                    main_1.MAIN_WINDOW.restore();
                }
                main_1.MAIN_WINDOW.focus();
            }
            // Protocol handler for win32
            // argv: An array of the second instance’s (command line / deep linked) arguments
            if (process.platform == 'win32') {
                // Keep only command line / deep linked arguments
                var url = commandLine.find(function (arg) { return arg.startsWith('sd-sparrow://'); });
                _this.handleRedirect(url);
            }
        });
        // Handle the protocol. In this case, we choose to show an Error Box.
        app.on('open-url', function (event, url) {
            _this.handleRedirect(url);
        });
    }
    RavenLogin.prototype.getValidAccessToken = function (promptIfInvalid) {
        return __awaiter(this, void 0, void 0, function () {
            var tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRavenTokens()];
                    case 1:
                        tokens = _a.sent();
                        if (!promptIfInvalid) return [3 /*break*/, 4];
                        if (!(tokens.decodedToken == undefined || Date.now() >= tokens.decodedToken.exp * 1000)) return [3 /*break*/, 4];
                        if (tokens.decodedToken) {
                            (0, main_1.logToDevtools)(tokens.decodedToken.exp * 1000);
                            (0, main_1.logToDevtools)(Date.now());
                        }
                        return [4 /*yield*/, this.promptForRavenLogin()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.getRavenTokens()];
                    case 3:
                        tokens = _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, tokens];
                }
            });
        });
    };
    RavenLogin.prototype.getRavenTokens = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accounts, key, decodedKey, parsedTokens, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, keytar.findCredentials('Raven')];
                    case 1:
                        accounts = _b.sent();
                        key = accounts[0].password;
                        decodedKey = Buffer.from(key, 'base64').toString();
                        parsedTokens = JSON.parse(decodedKey);
                        return [2 /*return*/, {
                                accessToken: parsedTokens.accessToken,
                                refreshToken: parsedTokens.refreshToken,
                                tokenType: parsedTokens.tokenType,
                                decodedToken: (0, jwt_decode_1.default)(parsedTokens.accessToken)
                            }];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, {
                                accessToken: undefined,
                                refreshToken: undefined,
                                tokenType: undefined,
                                decodedToken: undefined
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RavenLogin.prototype.handleRedirect = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokens = this.stripTokensFromRedirect(url);
                        return [4 /*yield*/, keytar.setPassword('Raven', tokens.decodedToken.ravenId, tokens.rawResponse)];
                    case 1:
                        _a.sent();
                        this.ravenWindow.close();
                        return [2 /*return*/];
                }
            });
        });
    };
    RavenLogin.prototype.promptForRavenLogin = function () {
        var _this = this;
        if (this.ravenWindow && !this.ravenWindow.isDestroyed()) {
            this.ravenWindow.focus();
            return;
        }
        var x = main_1.MAIN_WINDOW.getSize()[0] / 2 + main_1.MAIN_WINDOW.getPosition()[0] - (RAVEN_WINDOW_WIDTH / 2);
        var y = main_1.MAIN_WINDOW.getSize()[1] / 2 + main_1.MAIN_WINDOW.getPosition()[1] - (RAVEN_WINDOW_HEIGHT / 2);
        this.ravenWindow = new electron_1.BrowserWindow({
            x: x,
            y: y,
            width: RAVEN_WINDOW_WIDTH,
            height: RAVEN_WINDOW_HEIGHT,
            webPreferences: {
                allowRunningInsecureContent: false
            }
        });
        this.ravenWindow.setMenuBarVisibility(false);
        // Load the url.
        var clientId = '04e7fc20-cc9b-4e3d-bb18-3b56cafa4557';
        var responseType = 'token';
        var redirectUri = "sd-sparrow://login";
        var scope = 'sparrow';
        this.ravenWindow.loadURL("http://localhost:4200/login?scope=".concat(scope, "&response_type=").concat(responseType, "&redirect_uri=").concat(redirectUri, "&client_id=").concat(clientId));
        // Return a promise that will resolve when the popup is closed.
        return new Promise(function (resolve) {
            _this.ravenWindow.on('close', function (event) {
                resolve();
            });
        });
    };
    RavenLogin.prototype.stripTokensFromRedirect = function (url) {
        var encodedToken = url.split('#')[1];
        var response = Buffer.from(encodedToken, 'base64').toString();
        var tokens = JSON.parse(response);
        return {
            rawResponse: encodedToken,
            tokens: tokens,
            decodedToken: (0, jwt_decode_1.default)(tokens.accessToken)
        };
    };
    return RavenLogin;
}());
exports.RavenLogin = RavenLogin;
//# sourceMappingURL=raven-login.js.map