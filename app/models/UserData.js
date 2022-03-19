"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserInstance = exports.BrowserTab = exports.BrowserState = exports.UserData = void 0;
const uuid_1 = require("uuid");
class UserData {
    constructor(json) {
        if (json) {
            this.version = json.version;
            this.ravenId = json.ravenId;
            this.lastModified = json.lastModified;
            this.browsers = [];
            for (const t of json.browsers) {
                this.browsers.push(new BrowserState(t));
            }
        }
        if (!this.lastModified) {
            this.lastModified = Date.now();
        }
    }
    getBrowser(id) {
        for (const browser of this.browsers) {
            if (browser.getId() === id) {
                return browser;
            }
        }
        return this.browsers[0];
    }
    addBrowserState() {
        this.browsers.push(new BrowserState({ id: (0, uuid_1.v4)() }));
    }
}
exports.UserData = UserData;
class BrowserState {
    constructor(json) {
        if (json) {
            this.id = json.id;
            this.tabs = [];
            for (const t of json.tabs) {
                this.tabs.push(new BrowserTab(t));
            }
        }
    }
    getId() {
        return this.id;
    }
    getTab(id) {
        for (const tab of this.tabs) {
            if (tab.getId() === id) {
                return tab;
            }
        }
        return undefined;
    }
    getTabs() {
        return this.tabs;
    }
    addTab(name, url) {
        const tab = new BrowserTab({
            name,
            id: (0, uuid_1.v4)(),
            instances: [
                new BrowserInstance({ id: (0, uuid_1.v4)(), url: url ? url : 'https://www.google.com' })
            ]
        });
        this.tabs.push(tab);
        return tab;
    }
    removeTab(tabId) {
        const index = this.getTabIndex(tabId);
        if (index >= 0) {
            this.tabs.splice(index, 1);
        }
    }
    getTabIndex(tabId) {
        let index = -1;
        for (let i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].getId() === tabId) {
                index = i;
                break;
            }
        }
        return index;
    }
}
exports.BrowserState = BrowserState;
class BrowserTab {
    constructor(json) {
        if (json) {
            this.id = json.id;
            this.instances = [];
            for (const t of json.instances) {
                this.instances.push(new BrowserInstance(t));
            }
        }
    }
    getId() {
        return this.id;
    }
    getInstance(id) {
        for (const instance of this.instances) {
            if (instance.getId() === id) {
                return instance;
            }
        }
        return undefined;
    }
    getInstances() {
        return this.instances;
    }
    addInstance(url) {
        return this.addInstanceAfterIndex(this.instances.length - 1, url);
    }
    addInstanceAfterIndex(index, url) {
        const inst = new BrowserInstance({
            id: (0, uuid_1.v4)(), url
        });
        this.instances.splice(index, 0, inst);
        return inst;
    }
    addInstanceBeforeIndex(index, url) {
        const inst = new BrowserInstance({
            id: (0, uuid_1.v4)(), url
        });
        this.instances.splice(Math.max(0, index), 0, inst);
        return inst;
    }
    removeInstance(instanceId) {
        const index = this.getInstanceIndex(instanceId);
        if (index >= 0) {
            this.instances.splice(index, 1);
        }
    }
    getInstanceIndex(instanceId) {
        let index = -1;
        for (let i = 0; i < this.instances.length; i++) {
            if (this.instances[i].getId() === instanceId) {
                index = i;
                break;
            }
        }
        return index;
    }
}
exports.BrowserTab = BrowserTab;
class BrowserInstance {
    constructor(json) {
        if (json) {
            this.id = json.id;
            this.url = json.url;
            this.title = json.title;
            this.icon = json.icon;
        }
    }
    getId() {
        return this.id;
    }
    getUrl() {
        return this.url;
    }
    setUrl(url) {
        this.url = url;
    }
    getTitle() {
        return this.title;
    }
    setTitle(title) {
        this.title = title;
    }
    getIcon() {
        return this.icon;
    }
    setIcon(icon) {
        this.icon = icon;
    }
}
exports.BrowserInstance = BrowserInstance;
//# sourceMappingURL=UserData.js.map