import * as axios from 'axios';
import { ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { BrowserInstance, BrowserTab, UserData } from '../../models/UserData';
import { ServiceCollection } from './../../ServiceCollections';

export class UserDataAccess {

  public constructor() {
    ipcMain.on('sparrow/user-data/update', async (event, data: any) => {
      const userData = new UserData(data);
      await this.upsertUserData(userData);
      await this.syncDataToCloud(userData);
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
          console.log('Loaded profile from the cloud.');
        } else {
          output = localProfile;
          console.log('Loaded profile from local copy.');
        }
      } else if (cloudProfile) {
        output = cloudProfile;
        console.log('Loaded profile from the cloud.');
      } else if (localProfile) {
        output = localProfile;
        console.log('Loaded profile from local copy.');
      } else {
        output = await this.createDefaultUserData();
        console.log('Initializing first time profile.');
      }

      event.sender.send('sparrow/user-data', output);
    });
  }
  private async syncProfileFromCloud(): Promise<UserData> {
    if (!(await ServiceCollection.RAVEN.shouldPerformCloudOperations())) {
      return undefined;
    }

    const tokens = await ServiceCollection.RAVEN.getValidAccessToken(true);
    try {
      const response = await axios.default.post<any>('http://localhost:8090/api/v1',
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
        console.log(`Synced User Data from the cloud: ${response.data.data.profile}`);
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
      return;
    }

    const tokens = await ServiceCollection.RAVEN.getValidAccessToken(true);
    try {
      await axios.default.post<any>('http://localhost:8090/api/v1',
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
      console.log(`Synced User Data to the cloud: ${data}`);
    } catch (err) {
      throw new Error(`"An error occurred when syncing profile data to the cloud. Error: ${err}`);
    }
  }
  private async upsertUserData(data: UserData): Promise<void> {
    await ServiceCollection.DB.query(
      `INSERT OR REPLACE INTO tbl_UserData (RavenId, UserData) VALUES ($RavenId, $UserData)`, {
      $RavenId: data.ravenId,
      $UserData: JSON.stringify(data)
    });
  }
  private async getUserDataFromDatabase(): Promise<UserData> {
    try {
      const user = await ServiceCollection.RAVEN.getRavenTokens();
      const data = await ServiceCollection.DB.query('SELECT UserData from tbl_UserData where RavenId=$RavenId', { $RavenId: user.decodedToken.ravenId });
      if (data) {
        console.log(`Read profile: ${JSON.stringify(data)} from the database.`);
        return new UserData(JSON.parse(data.userData));
      }
    } catch (error) {
      console.error(error);
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

