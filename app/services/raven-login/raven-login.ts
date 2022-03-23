import { App, BrowserWindow, ipcMain, WebContents } from 'electron';
import jwt_decode, { JwtPayload } from "jwt-decode";
import * as keytar from 'keytar';
import * as path from 'path';
import { APP, logToDevtools } from '../../main';
import { BaseService } from '../BaseService';

const RAVEN_WINDOW_WIDTH = 475;
const RAVEN_WINDOW_HEIGHT = 700;

export class RavenLogin extends BaseService {
  private ravenWindow: BrowserWindow;
  private protocol: string;
  private protocolLaunchArg: string = "--protocol-launch";

  public constructor(private app: App, isDev: boolean) {
    super();
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
      } else {
        app.setAsDefaultProtocolClient(this.protocol, process.execPath, [
          this.protocolLaunchArg,
        ]);
      }
    } else {
      app.setAsDefaultProtocolClient(this.protocol);
    }

    // Handle the call to open the login window.
    ipcMain.on('sparrow/open-raven-login', (event, data) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender);
      this.promptForRavenLogin(browserWindow);
    });

    // Handle requests to get the raven token.
    ipcMain.on('sparrow/raven-token', async (event) => {
      const tokens = await this.getValidAccessToken(false);
      this.sentTokensToWebContents(event.sender, tokens);
    });
    ipcMain.on('sparrow/raven-token-prompt', async (event) => {
      const tokens = await this.getValidAccessToken(true, BrowserWindow.fromWebContents(event.sender));
      this.sentTokensToWebContents(event.sender, tokens);
    });

    // Only for windows.
    const gotTheLock = this.app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit()
    }

    // This is only for windows.
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      const url = commandLine.find((arg) => arg.startsWith('sd-sparrow://'));
      if (url) {
        // Someone tried to run a second instance, we should focus our window.
        const firstWindow = APP.getWindows().length > 0 ? APP.getWindows()[0] : undefined;
        if (firstWindow) {
          if (firstWindow.isMinimized()) {
            firstWindow.restore()
          }
          firstWindow.focus()
        }

        if (process.platform == 'win32') {
          this.handleRedirect(url);
        }
      } else {
        APP.createNewWindow();
      }
    })

    // Handle the protocol. In this case, we choose to show an Error Box.
    app.on('open-url', (event, url) => {
      this.handleRedirect(url);
    });
  }
  public initialize(): Promise<void> {
    return Promise.resolve();
  }
  public async getValidAccessToken(promptIfInvalid: boolean, window?: BrowserWindow): Promise<IRavenTokens> {
    let tokens = await this.getRavenTokens();

    // If the token is expired, prompt for relog (later change this to use the refresh token).
    if (promptIfInvalid) {
      if (tokens.decodedToken == undefined || Date.now() >= tokens.decodedToken.exp * 1000) {
        if (tokens.decodedToken) {
          logToDevtools(tokens.decodedToken.exp * 1000);
          logToDevtools(Date.now());
        }
        await this.promptForRavenLogin(window);
        tokens = await this.getRavenTokens();
      }
    }
    return tokens;
  }
  public async getRavenTokens(): Promise<IRavenTokens> {
    try {
      const accounts = await keytar.findCredentials('Raven');
      const key = accounts[0].password;
      const decodedKey = Buffer.from(key, 'base64').toString();
      const parsedTokens = JSON.parse(decodedKey);
      return {
        accessToken: parsedTokens.accessToken,
        refreshToken: parsedTokens.refreshToken,
        tokenType: parsedTokens.tokenType,
        decodedToken: jwt_decode(parsedTokens.accessToken)
      };
    } catch {
      return {
        accessToken: undefined,
        refreshToken: undefined,
        tokenType: undefined,
        decodedToken: undefined
      };
    }
  }
  public async areCloudOperationsEnabled(): Promise<boolean> {
    return (await this.getRavenTokens()).accessToken !== undefined;
  }
  private async handleRedirect(url: string): Promise<void> {
    const parsedResponse = this.stripTokensFromRedirect(url);
    await keytar.setPassword('Raven', parsedResponse.decodedToken.ravenId, parsedResponse.rawResponse);
    this.ravenWindow.close();
  }
  private promptForRavenLogin(browser?: BrowserWindow): Promise<void> {
    if (this.ravenWindow && !this.ravenWindow.isDestroyed()) {
      this.ravenWindow.focus();
      return;
    }

    let x = (RAVEN_WINDOW_WIDTH / 2);
    let y = (RAVEN_WINDOW_HEIGHT / 2);
    if (browser) {
      x = browser.getSize()[0] / 2 + browser.getPosition()[0] - (RAVEN_WINDOW_WIDTH / 2);
      y = browser.getSize()[1] / 2 + browser.getPosition()[1] - (RAVEN_WINDOW_HEIGHT / 2);
    }

    this.ravenWindow = new BrowserWindow({
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
    return new Promise<void>((resolve) => {
      this.ravenWindow.on('close', (event) => {
        resolve();
      });
    });
  }
  private stripTokensFromRedirect(url: string): IRavenRedirectContents {
    const encodedToken = url.split('#')[1];
    const response = Buffer.from(encodedToken, 'base64').toString();
    const tokens = JSON.parse(response);
    return {
      rawResponse: encodedToken,
      tokens: tokens,
      decodedToken: jwt_decode(tokens.accessToken)
    };
  }
  private sentTokensToWebContents(webContents: WebContents, tokens: IRavenTokens) {
    webContents.send('sparrow/raven-token', tokens);
  }
}
interface IRavenRedirectContents {
  rawResponse: string;
  tokens: IRavenTokens;
  decodedToken: IRavenDecodedToken;
}
interface IRavenTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  decodedToken: IRavenDecodedToken;
}
interface IRavenDecodedToken extends JwtPayload {
  ravenId: string;
}
