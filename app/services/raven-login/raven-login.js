"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RavenLogin = void 0;
const electron_1 = require("electron");
const jwt_decode_1 = require("jwt-decode");
const keytar = require("keytar");
const path = require("path");
const main_1 = require("../../main");
const BaseService_1 = require("../BaseService");
const RAVEN_WINDOW_WIDTH = 475;
const RAVEN_WINDOW_HEIGHT = 700;
class RavenLogin extends BaseService_1.BaseService {
    constructor(app, isDev) {
        super();
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
        electron_1.ipcMain.on('sparrow/open-raven-login', (event, data) => {
            this.promptForRavenLogin();
        });
        // Handle requests to get the raven token.
        electron_1.ipcMain.on('sparrow/raven-token', async (event) => {
            const token = await this.getValidAccessToken(false);
            event.sender.send('sparrow/raven-token', token);
        });
        electron_1.ipcMain.on('sparrow/raven-token-prompt', async (event) => {
            const token = await this.getValidAccessToken(true);
            event.sender.send('sparrow/raven-token', token);
        });
        // Only for windows.
        const gotTheLock = this.app.requestSingleInstanceLock();
        if (!gotTheLock) {
            app.quit();
        }
        // This is only for windows.
        app.on('second-instance', (event, commandLine, workingDirectory) => {
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
                let url = commandLine.find((arg) => arg.startsWith('sd-sparrow://'));
                this.handleRedirect(url);
            }
        });
        // Handle the protocol. In this case, we choose to show an Error Box.
        app.on('open-url', (event, url) => {
            this.handleRedirect(url);
        });
    }
    initialize() {
        return Promise.resolve();
    }
    async getValidAccessToken(promptIfInvalid) {
        let tokens = await this.getRavenTokens();
        // If the token is expired, prompt for relog (later change this to use the refresh token).
        if (promptIfInvalid) {
            if (tokens.decodedToken == undefined || Date.now() >= tokens.decodedToken.exp * 1000) {
                if (tokens.decodedToken) {
                    (0, main_1.logToDevtools)(tokens.decodedToken.exp * 1000);
                    (0, main_1.logToDevtools)(Date.now());
                }
                await this.promptForRavenLogin();
                tokens = await this.getRavenTokens();
            }
        }
        return tokens;
    }
    async getRavenTokens() {
        try {
            const accounts = await keytar.findCredentials('Raven');
            const key = accounts[0].password;
            const decodedKey = Buffer.from(key, 'base64').toString();
            const parsedTokens = JSON.parse(decodedKey);
            return {
                accessToken: parsedTokens.accessToken,
                refreshToken: parsedTokens.refreshToken,
                tokenType: parsedTokens.tokenType,
                decodedToken: (0, jwt_decode_1.default)(parsedTokens.accessToken)
            };
        }
        catch (_a) {
            return {
                accessToken: undefined,
                refreshToken: undefined,
                tokenType: undefined,
                decodedToken: undefined
            };
        }
    }
    async shouldPerformCloudOperations() {
        return (await this.getRavenTokens()).accessToken !== undefined;
    }
    async handleRedirect(url) {
        const tokens = this.stripTokensFromRedirect(url);
        await keytar.setPassword('Raven', tokens.decodedToken.ravenId, tokens.rawResponse);
        this.ravenWindow.close();
    }
    promptForRavenLogin() {
        if (this.ravenWindow && !this.ravenWindow.isDestroyed()) {
            this.ravenWindow.focus();
            return;
        }
        const x = main_1.MAIN_WINDOW.getSize()[0] / 2 + main_1.MAIN_WINDOW.getPosition()[0] - (RAVEN_WINDOW_WIDTH / 2);
        const y = main_1.MAIN_WINDOW.getSize()[1] / 2 + main_1.MAIN_WINDOW.getPosition()[1] - (RAVEN_WINDOW_HEIGHT / 2);
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
        const clientId = '04e7fc20-cc9b-4e3d-bb18-3b56cafa4557';
        const responseType = 'token';
        const redirectUri = `sd-sparrow://login`;
        const scope = 'sparrow';
        this.ravenWindow.loadURL(`http:/www.raven.suburbandigital.com/auth/login?scope=${scope}&response_type=${responseType}&redirect_uri=${redirectUri}&client_id=${clientId}`);
        // Return a promise that will resolve when the popup is closed.
        return new Promise((resolve) => {
            this.ravenWindow.on('close', (event) => {
                resolve();
            });
        });
    }
    stripTokensFromRedirect(url) {
        const encodedToken = url.split('#')[1];
        const response = Buffer.from(encodedToken, 'base64').toString();
        const tokens = JSON.parse(response);
        return {
            rawResponse: encodedToken,
            tokens: tokens,
            decodedToken: (0, jwt_decode_1.default)(tokens.accessToken)
        };
    }
}
exports.RavenLogin = RavenLogin;
//# sourceMappingURL=raven-login.js.map