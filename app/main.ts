import { app } from 'electron';
import * as contextMenu from 'electron-context-menu';
import { Application } from './Application';
import { ServiceCollection } from './ServiceCollections';
import { Logger } from './utilities/Logger';

const ARGS = process.argv.slice(1);
export const APP_DIRECTORY = __dirname;
export const IS_DEV = ARGS.some(val => val === '--serve');
export const SERVICE_COLLECTION = new ServiceCollection(app, IS_DEV);
export const APP: Application = new Application(IS_DEV);

contextMenu({
  prepend: (params, browserWindow) => [{
    label: 'Rainbow',
  }]
});

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    SERVICE_COLLECTION.initialize().then((resolve) => {
      setTimeout(async () => await APP.initialize(), 400);
    })
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On MacOS, don't quit when all windows are closed.
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', async () => {
    // On MacOS, create a new window if there are no windows.
    if (APP.getWindows().length === 0) {
      await APP.createNewWindow();
    }
  });

  app.on("web-contents-created", (e, contents) => {
    if (contents.getType() == "webview") {
      // set context menu in webview
      contextMenu({ window: contents, });
    }
  });
} catch (e) {

}

export function logToDevtools(message) {
  Logger.info(message);
  for (const window of APP.getWindows()) {
    if (window && window.webContents) {
      window.webContents.executeJavaScript(`Logger.info("${message.toString()}")`)
    }
  }
}
