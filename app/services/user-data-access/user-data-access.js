"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataAccess = void 0;
const axios = require("axios");
const electron_1 = require("electron");
const uuid_1 = require("uuid");
const Application_1 = require("../../Application");
const UserData_1 = require("../../models/UserData");
const Logger_1 = require("../../utilities/Logger");
const BaseService_1 = require("../BaseService");
const ServiceCollections_1 = require("./../../ServiceCollections");
class UserDataAccess extends BaseService_1.BaseService {
    constructor() {
        super();
        electron_1.ipcMain.on('sparrow/window-data/update', async (event, data) => {
            // Get the window for this sender.
            const windowIndex = electron_1.BrowserWindow.fromWebContents(event.sender).id - 1;
            // Update the user data.
            this.cachedUserData.setBrowser(new UserData_1.BrowserState(data), windowIndex);
            // Wrap this for safety if the database or internet has a momentary hiccup.
            const results = await Promise.allSettled([this.upsertUserData(this.cachedUserData), this.syncDataToCloud(this.cachedUserData)]);
            for (const result of results) {
                if (result.status === 'rejected') {
                    Logger_1.Logger.error(result.reason);
                }
            }
        });
        electron_1.ipcMain.on('sparrow/window-data', async (event) => {
            // Get the sender's window id.
            const window = electron_1.BrowserWindow.fromWebContents(event.sender);
            const windowIndex = window.id - 1;
            // Get the current user data.
            await this.getProfileFromBestAvailableSource();
            // If we dont have browser window data for this window, create a new set and sync it.
            let newBrowserStateCreated = false;
            if (windowIndex >= this.cachedUserData.getBrowsers().length) {
                this.cachedUserData.addBrowserState(this.createDefaultBrowserData(window));
                Logger_1.Logger.info(`Creating new BrowserState for WindowIndex: ${windowIndex}.`);
                newBrowserStateCreated = true;
            }
            // Send the browser data over to the sender.
            Logger_1.Logger.info(`Sending the BrowserState for WindowIndex: ${windowIndex}.`);
            event.sender.send('sparrow/window-data', this.cachedUserData.getBrowser(windowIndex));
            // Check if we created a new browser. If we did, sync it.
            // We do this last to ensure a failure here won't impact the user experience.
            if (newBrowserStateCreated) {
                Logger_1.Logger.info(`Syncing the new BrowserState for WindowIndex: ${windowIndex}.`);
                await Promise.allSettled([this.upsertUserData(this.cachedUserData), this.syncDataToCloud(this.cachedUserData)]);
            }
        });
    }
    async initialize() {
        return;
    }
    async onWindowClosed(window) {
        // Get the window and update its position.
        const windowIndex = window.id - 1;
        this.cachedUserData.getBrowser(windowIndex).xPosition = window.getPosition()[0];
        this.cachedUserData.getBrowser(windowIndex).yPosition = window.getPosition()[1];
        this.cachedUserData.getBrowser(windowIndex).width = window.getSize()[0];
        this.cachedUserData.getBrowser(windowIndex).height = window.getSize()[1];
        this.cachedUserData.getBrowser(windowIndex).maximized = window.isMaximized();
        Logger_1.Logger.info(`Saving window state on close. WindowIndex: ${windowIndex}.`);
        // Save the data.
        const results = await Promise.allSettled([this.upsertUserData(this.cachedUserData), this.syncDataToCloud(this.cachedUserData)]);
        for (const result of results) {
            if (result.status === 'rejected') {
                Logger_1.Logger.error(result.reason);
            }
        }
    }
    async getProfileFromBestAvailableSource() {
        // Capture the local and cloud profiles.
        let cloudProfile = undefined;
        let localProfile = undefined;
        try {
            cloudProfile = await this.syncProfileFromCloud();
        }
        catch (_a) { }
        try {
            localProfile = await this.getUserDataFromDatabase();
        }
        catch (_b) { }
        // If either of them returned values, get the latest one and use that as the truth.
        let output = undefined;
        if (cloudProfile && localProfile) {
            if (cloudProfile.lastModified > localProfile.lastModified) {
                output = cloudProfile;
                Logger_1.Logger.info('Loaded profile from the cloud.');
            }
            else {
                output = localProfile;
                Logger_1.Logger.info('Loaded profile from local copy.');
            }
        }
        else if (cloudProfile) {
            output = cloudProfile;
            Logger_1.Logger.info('Loaded profile from the cloud.');
        }
        else if (localProfile) {
            output = localProfile;
            Logger_1.Logger.info('Loaded profile from local copy.');
        }
        else {
            output = await this.createDefaultUserData();
            Logger_1.Logger.info('Initializing first time profile.');
        }
        this.cachedUserData = output;
        return output;
    }
    async syncProfileFromCloud() {
        if (!(await ServiceCollections_1.ServiceCollection.RAVEN.areCloudOperationsEnabled())) {
            Logger_1.Logger.info('Skipping cloud sync -- user is not logged in or has expired token.');
            return undefined;
        }
        const tokens = await ServiceCollections_1.ServiceCollection.RAVEN.getValidAccessToken(false);
        try {
            const response = await axios.default.post('http://34.139.72.55/api/v1', {
                query: `query {
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
            }, {
                headers: {
                    authorization: `Bearer ${tokens.accessToken}`
                }
            });
            if (response.data.data.profile) {
                Logger_1.Logger.info(`Synced User Data from the cloud: ${response.data.data.profile}`);
                return new UserData_1.UserData(response.data.data.profile);
            }
            else {
                return undefined;
            }
        }
        catch (err) {
            throw new Error(`"An error occurred when syncing profile data from the cloud. Error: ${err}`);
        }
    }
    async syncDataToCloud(data) {
        if (!(await ServiceCollections_1.ServiceCollection.RAVEN.areCloudOperationsEnabled())) {
            Logger_1.Logger.info('Skipping cloud sync -- user is not logged in or has expired token.');
            return;
        }
        const tokens = await ServiceCollections_1.ServiceCollection.RAVEN.getValidAccessToken(false);
        try {
            await axios.default.post('http://34.139.72.55/api/v1', {
                query: `mutation($profile: SparrowProfileInput!){
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
            }, {
                headers: {
                    authorization: `Bearer ${tokens.accessToken}`
                }
            });
            Logger_1.Logger.info(`Synced User Data to the cloud: ${data}`);
        }
        catch (error) {
            throw new Error(`"An error occurred when syncing profile data to the cloud. Error: ${error}`);
        }
    }
    async upsertUserData(data) {
        await ServiceCollections_1.ServiceCollection.DB.query(`INSERT OR REPLACE INTO tbl_UserData (RavenId, UserData) VALUES ($RavenId, $UserData)`, {
            $RavenId: data.ravenId,
            $UserData: JSON.stringify(data)
        });
        Logger_1.Logger.info(`Updated local profile: ${data}`);
    }
    async getUserDataFromDatabase() {
        try {
            const user = await ServiceCollections_1.ServiceCollection.RAVEN.getRavenTokens();
            const data = await ServiceCollections_1.ServiceCollection.DB.query('SELECT UserData from tbl_UserData where RavenId=$RavenId', { $RavenId: user.decodedToken.ravenId });
            if (data.UserData) {
                Logger_1.Logger.info(`Read profile from the database: ${JSON.stringify(data.UserData)}`);
                return new UserData_1.UserData(JSON.parse(data.UserData));
            }
        }
        catch (error) {
            throw new Error(`"An error occurred when syncing profile data to the database. Error: ${error}`);
        }
        return undefined;
    }
    async createDefaultUserData(window) {
        var _a;
        const tokens = await ServiceCollections_1.ServiceCollection.RAVEN.getRavenTokens();
        const ravenId = ((_a = tokens === null || tokens === void 0 ? void 0 : tokens.decodedToken) === null || _a === void 0 ? void 0 : _a.ravenId) ? tokens.decodedToken.ravenId : 'LOCAL';
        return new UserData_1.UserData({
            version: '1',
            ravenId: ravenId,
            openBrowsers: [this.createDefaultBrowserData(window)]
        });
    }
    createDefaultBrowserData(window) {
        return new UserData_1.BrowserState({
            id: window ? window.id : 1,
            xPosition: window ? window.getPosition()[0] : 0,
            yPosition: window ? window.getPosition()[1] : 0,
            width: window ? window.getPosition()[0] : Application_1.Application.DEFAULT_WINDOW_SIZE.width,
            height: window ? window.getPosition()[1] : Application_1.Application.DEFAULT_WINDOW_SIZE.height,
            maximized: window ? window.isMaximized() : false,
            name: 'Default',
            tabs: [
                new UserData_1.BrowserTab({
                    id: (0, uuid_1.v4)(),
                    instances: [
                        new UserData_1.BrowserInstance({
                            id: (0, uuid_1.v4)(),
                            url: 'https://www.google.com'
                        })
                    ]
                })
            ]
        });
    }
}
exports.UserDataAccess = UserDataAccess;
//# sourceMappingURL=user-data-access.js.map