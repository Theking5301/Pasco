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
        } else {
          output = localProfile;
        }
      } else if (cloudProfile) {
        output = cloudProfile;
      } else if (localProfile) {
        output = localProfile;
      } else {
        output = this.createDefaultUserData();
      }

      event.sender.send('sparrow/user-data', output);
    });
  }
  public async syncProfileFromCloud(): Promise<UserData> {
    const tokens = await ServiceCollection.RAVEN.getValidAccessToken(true);
    if (!tokens || !tokens.accessToken) {
      return;
    }

    try {
      const response = await axios.default.post<any>('http://localhost:8090/api/v1',
        {
          query:
            `query {
          profile(ravenId: "${tokens.decodedToken.ravenId}") {
            ravenId
            browsers {
              id
              tabs {
                id
                instances {
                  url
                  id
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

      return new UserData(response.data.data.profile);
    } catch (err) {
      throw new Error(`"An error occurred when syncing profile data from the cloud. Error: ${err}`);
    }
  }

  private async syncDataToCloud(data: UserData): Promise<void> {
    if (!data.ravenId) {
      return;
    }

    const tokens = await ServiceCollection.RAVEN.getValidAccessToken(true);
    try {
      await axios.default.post<any>('http://localhost:8090/api/v1',
        {
          query:
            `mutation($profile: SparrowProfileInput!){
            updateProfile(profile: $profile) {
              browsers {
                id
                tabs {
                  id
                  instances {
                    id
                    url
                  }
                }
              }
              ravenId
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
        return new UserData(JSON.parse(data.userData));
      }
    } catch (error) {
      console.error(error);
    }

    // If we made it this far due to error, return an empty UserData.
    return new UserData();
  }
  private createDefaultUserData(): UserData {
    return new UserData({
      version: 1,
      browsers: [
        {
          id: '',
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

