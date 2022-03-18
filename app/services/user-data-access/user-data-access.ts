
import * as axios from 'axios';
import { ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { BrowserInstance, BrowserTab, UserData } from '../../models/UserData';
import { Logger } from '../../utilities/Logger';
import { BaseService } from '../BaseService';
import { ServiceCollection } from './../../ServiceCollections';

export class UserDataAccess extends BaseService {

  public constructor() {
    super();
    ipcMain.on('sparrow/user-data/update', async (event, data: any) => {
      const userData = new UserData(data);

      // Wrap this for safety if the database or internet has a momentary hiccup.
      const results = await Promise.allSettled([this.upsertUserData(userData), this.syncDataToCloud(userData)]);
      for (const result of results) {
        if (result.status === 'rejected') {
          Logger.error(result.reason);
        }
      }
    });


    ipcMain.on('sparrow/user-data', async (event) => {
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

      event.sender.send('sparrow/user-data', output);
    });
  }
  public initialize(): Promise<void> {
    return Promise.resolve();
  }
  private async syncProfileFromCloud(): Promise<UserData> {
    if (!(await ServiceCollection.RAVEN.shouldPerformCloudOperations())) {
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
    if (!(await ServiceCollection.RAVEN.shouldPerformCloudOperations())) {
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
  private async createDefaultUserData(): Promise<UserData> {
    const tokens = await ServiceCollection.RAVEN.getRavenTokens();
    const ravenId = tokens?.decodedToken?.ravenId ? tokens.decodedToken.ravenId : 'LOCAL';
    return new UserData({
      version: '1',
      ravenId: ravenId,
      browsers: [
        {
          id: uuidv4(),
          tabs: [
            new BrowserTab({
              name: 'DefaultTab',
              id: uuidv4(),
              instances: [
                new BrowserInstance({
                  id: uuidv4(),
                  url: 'https://www.google.com'
                })
              ]
            })
          ]
        }
      ]
    });
  }
}

