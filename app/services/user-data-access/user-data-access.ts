import * as axios from 'axios';
import { BrowserWindow, ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { Application } from '../../Application';
import { BrowserInstance, BrowserState, BrowserTab, UserData } from '../../models/UserData';
import { Logger } from '../../utilities/Logger';
import { BaseService } from '../BaseService';
import { ServiceCollection } from './../../ServiceCollections';


export class UserDataAccess extends BaseService {
  private cachedUserData: UserData;

  public constructor() {
    super();

    ipcMain.on('sparrow/window-data/update', async (event, data: BrowserState) => {
      // Get the window for this sender.
      const windowIndex = BrowserWindow.fromWebContents(event.sender).id - 1;

      // Update the user data.
      this.cachedUserData.setBrowser(new BrowserState(data), windowIndex);

      // Wrap this for safety if the database or internet has a momentary hiccup.
      const results = await Promise.allSettled([this.upsertUserData(this.cachedUserData), this.syncDataToCloud(this.cachedUserData)]);
      for (const result of results) {
        if (result.status === 'rejected') {
          Logger.error(result.reason);
        }
      }
    });

    ipcMain.on('sparrow/window-data', async (event) => {
      // Get the sender's window id.
      const window = BrowserWindow.fromWebContents(event.sender);
      const windowIndex = window.id - 1;

      // Get the current user data.
      await this.getProfileFromBestAvailableSource();

      // If we dont have browser window data for this window, create a new set and sync it.
      let newBrowserStateCreated = false;
      if (windowIndex >= this.cachedUserData.getBrowsers().length) {
        this.cachedUserData.addBrowserState(this.createDefaultBrowserData(window));
        Logger.info(`Creating new BrowserState for WindowIndex: ${windowIndex}.`);
        newBrowserStateCreated = true;
      }

      // Send the browser data over to the sender.
      Logger.info(`Sending the BrowserState for WindowIndex: ${windowIndex}.`);
      event.sender.send('sparrow/window-data', this.cachedUserData.getBrowser(windowIndex));

      // Check if we created a new browser. If we did, sync it.
      // We do this last to ensure a failure here won't impact the user experience.
      if (newBrowserStateCreated) {
        Logger.info(`Syncing the new BrowserState for WindowIndex: ${windowIndex}.`);
        await Promise.allSettled([this.upsertUserData(this.cachedUserData), this.syncDataToCloud(this.cachedUserData)]);
      }
    });
  }

  public async initialize(): Promise<void> {
    return;
  }
  public async onWindowClosed(window: BrowserWindow): Promise<void> {
    // Get the window and update its position.
    const windowIndex = window.id - 1;
    this.cachedUserData.getBrowser(windowIndex).xPosition = window.getPosition()[0];
    this.cachedUserData.getBrowser(windowIndex).yPosition = window.getPosition()[1];
    this.cachedUserData.getBrowser(windowIndex).width = window.getSize()[0];
    this.cachedUserData.getBrowser(windowIndex).height = window.getSize()[1];
    this.cachedUserData.getBrowser(windowIndex).maximized = window.isMaximized()

    Logger.info(`Saving window state on close. WindowIndex: ${windowIndex}.`);

    // Save the data.
    const results = await Promise.allSettled([this.upsertUserData(this.cachedUserData), this.syncDataToCloud(this.cachedUserData)]);
    for (const result of results) {
      if (result.status === 'rejected') {
        Logger.error(result.reason);
      }
    }
  }
  public async getProfileFromBestAvailableSource(): Promise<UserData> {
    // Capture the local and cloud profiles.
    let cloudProfile: UserData = undefined;
    let localProfile: UserData = undefined;
    try {
      cloudProfile = await this.syncProfileFromCloud();
    } catch { }
    try {
      localProfile = await this.getUserDataFromDatabase();
    } catch { }

    // If either of them returned values, get the latest one and use that as the truth.
    let output: UserData = undefined;
    if (cloudProfile && localProfile) {
      if (cloudProfile.lastModified > localProfile.lastModified) {
        output = cloudProfile;
        Logger.info('Loaded profile from the cloud.');
      } else {
        output = localProfile;
        Logger.info('Loaded profile from local copy.');
      }
    } else if (cloudProfile) {
      output = cloudProfile;
      Logger.info('Loaded profile from the cloud.');
    } else if (localProfile) {
      output = localProfile;
      Logger.info('Loaded profile from local copy.');
    } else {
      output = await this.createDefaultUserData();
      Logger.info('Initializing first time profile.');
    }

    this.cachedUserData = output;
    return output;
  }
  public async syncProfileFromCloud(): Promise<UserData> {
    if (!(await ServiceCollection.RAVEN.areCloudOperationsEnabled())) {
      Logger.info('Skipping cloud sync -- user is not logged in or has expired token.');
      return undefined;
    }

    const tokens = await ServiceCollection.RAVEN.getValidAccessToken(false);
    try {
      const response = await axios.default.post<any>('http://34.139.72.55/api/v1',
        {
          query:
            `query {
          profile(ravenId: "${tokens.decodedToken.ravenId}") {
            ravenId
            version
            browsers {
              id
              tabs {
                id
                instances {
                  url
                  id
                  title
                  icon
                }
              }
            }
          }
        } `
        },
        {
          headers: {
            authorization: `Bearer ${tokens.accessToken}`
          }
        }
      );

      if (response.data.data.profile) {
        Logger.info(`Synced User Data from the cloud: ${response.data.data.profile}`);
        return new UserData(response.data.data.profile);
      } else {
        return undefined;
      }
    } catch (err) {
      throw new Error(`"An error occurred when syncing profile data from the cloud. Error: ${err}`);
    }
  }
  private async syncDataToCloud(data: UserData): Promise<void> {
    if (!(await ServiceCollection.RAVEN.areCloudOperationsEnabled())) {
      Logger.info('Skipping cloud sync -- user is not logged in or has expired token.');
      return;
    }

    const tokens = await ServiceCollection.RAVEN.getValidAccessToken(false);
    try {
      await axios.default.post<any>('http://34.139.72.55/api/v1',
        {
          query:
            `mutation($profile: SparrowProfileInput!){
            updateProfile(profile: $profile) {
              ravenId
              version
              browsers {
                id
                tabs {
                  id
                  instances {
                    id
                    url
                    title
                    icon
                  }
                }
              }
            }
          }`,
          variables: {
            profile: data
          }
        },
        {
          headers: {
            authorization: `Bearer ${tokens.accessToken}`
          }
        }
      );
      Logger.info(`Synced User Data to the cloud: ${data}`);
    } catch (error) {
      throw new Error(`"An error occurred when syncing profile data to the cloud. Error: ${error}`);
    }
  }
  private async upsertUserData(data: UserData): Promise<void> {
    await ServiceCollection.DB.query(
      `INSERT OR REPLACE INTO tbl_UserData (RavenId, UserData) VALUES ($RavenId, $UserData)`, {
      $RavenId: data.ravenId,
      $UserData: JSON.stringify(data)
    });
    Logger.info(`Updated local profile: ${data}`);
  }
  private async getUserDataFromDatabase(): Promise<UserData> {
    try {
      const user = await ServiceCollection.RAVEN.getRavenTokens();
      const data = await ServiceCollection.DB.query('SELECT UserData from tbl_UserData where RavenId=$RavenId', { $RavenId: user.decodedToken.ravenId });
      if (data.UserData) {
        Logger.info(`Read profile from the database: ${JSON.stringify(data.UserData)}`);
        return new UserData(JSON.parse(data.UserData));
      }
    } catch (error) {
      throw new Error(`"An error occurred when syncing profile data to the database. Error: ${error}`);
    }
    return undefined;
  }
  private async createDefaultUserData(window?: BrowserWindow): Promise<UserData> {
    const tokens = await ServiceCollection.RAVEN.getRavenTokens();
    const ravenId = tokens?.decodedToken?.ravenId ? tokens.decodedToken.ravenId : 'LOCAL';
    return new UserData({
      version: '1',
      ravenId: ravenId,
      openBrowsers: [this.createDefaultBrowserData(window)]
    });
  }
  private createDefaultBrowserData(window?: BrowserWindow): BrowserState {
    return new BrowserState({
      id: window ? window.id : 1,
      xPosition: window ? window.getPosition()[0] : 0,
      yPosition: window ? window.getPosition()[1] : 0,
      width: window ? window.getPosition()[0] : Application.DEFAULT_WINDOW_SIZE.width,
      height: window ? window.getPosition()[1] : Application.DEFAULT_WINDOW_SIZE.height,
      maximized: window ? window.isMaximized() : false,
      name: 'Default',
      tabs: [
        new BrowserTab({
          id: uuidv4(),
          instances: [
            new BrowserInstance({
              id: uuidv4(),
              url: 'https://www.google.com'
            })
          ]
        })
      ]
    });
  }
}

