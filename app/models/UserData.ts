import { v4 as uuid } from 'uuid';

export interface IUserData {
  version: string;
  ravenId: string;
  openBrowsers: BrowserState[];
  lastModified?: number;
  profiles?: BrowserState[];
}
export interface UserData extends IUserData { }
export class UserData {
  public constructor(json?: IUserData) {
    if (json) {
      this.version = json.version;
      this.ravenId = json.ravenId;
      this.lastModified = json.lastModified;
      this.openBrowsers = [];
      this.profiles = [];
      for (const t of json.openBrowsers) {
        this.openBrowsers.push(new BrowserState(t));
      }
    }

    if (!this.lastModified) {
      this.lastModified = Date.now();
    }
  }

  public getBrowser(id: number): BrowserState {
    return this.openBrowsers[id];
  }
  public getBrowsers(): BrowserState[] {
    return this.openBrowsers;
  }
  public setBrowser(state: BrowserState, index: number) {
    this.openBrowsers[index] = state;
  }
  public addBrowserState(state: BrowserState) {
    this.openBrowsers.push(state);
  }
  public addSavedProfile(profileName: string, browserId: number) {
    const openBrowser = this.getBrowser(browserId - 1);
    const profile = JSON.parse(JSON.stringify(openBrowser));
    profile.name = profileName;
    profile.id = uuid();
    this.profiles.push(profile);
  }
}
export interface IBrowserState {
  id: number;
  name: string;
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  maximized: boolean;
  tabs: BrowserTab[];
}
export interface BrowserState extends IBrowserState { }
export class BrowserState {
  public constructor(json?: IBrowserState) {
    if (json) {
      this.id = json.id;
      this.name = json.name;
      this.xPosition = json.xPosition;
      this.yPosition = json.yPosition;
      this.width = json.width;
      this.height = json.height;
      this.maximized = json.maximized;
      this.tabs = [];
      for (const t of json.tabs) {
        this.tabs.push(new BrowserTab(t));
      }
    }
  }
  public getName(): string {
    return this.name;
  }
  public getId(): number {
    return this.id;
  }
  public getTab(id: string): BrowserTab {
    for (const tab of this.tabs) {
      if (tab.getId() === id) {
        return tab;
      }
    }
    return undefined;
  }

  public getTabs(): BrowserTab[] {
    return this.tabs;
  }

  public addTab(name: string, url?: string): BrowserTab {
    const tab = new BrowserTab({
      id: uuid(),
      instances: [
        new BrowserInstance({ id: uuid(), url: url ? url : 'https://www.google.com', title: '', icon: '' })
      ]
    });
    this.tabs.push(tab);
    return tab;
  }

  public removeTab(tabId: string) {
    const index = this.getTabIndex(tabId);
    if (index >= 0) {
      this.tabs.splice(index, 1);
    }
  }

  public getTabIndex(tabId: string) {
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
export interface IBrowserTab {
  id: string;
  instances: BrowserInstance[];
}
export interface BrowserTab extends IBrowserTab { }
export class BrowserTab {
  public constructor(json?: IBrowserTab) {
    if (json) {
      this.id = json.id;
      this.instances = [];
      for (const t of json.instances) {
        this.instances.push(new BrowserInstance(t));
      }
    }
  }

  public getId(): string {
    return this.id;
  }

  public getInstance(id: string): BrowserInstance {
    for (const instance of this.instances) {
      if (instance.getId() === id) {
        return instance;
      }
    }
    return undefined;
  }
  public getInstances(): BrowserInstance[] {
    return this.instances;
  }
  public addInstance(url: string): BrowserInstance {
    return this.addInstanceAfterIndex(this.instances.length - 1, url);
  }
  public addInstanceAfterIndex(index: number, url: string): BrowserInstance {
    const inst = new BrowserInstance({
      id: uuid(), url, title: '', icon: ''
    });
    this.instances.splice(index, 0, inst);
    return inst;
  }
  public addInstanceBeforeIndex(index: number, url: string): BrowserInstance {
    const inst = new BrowserInstance({
      id: uuid(), url, title: '', icon: ''
    });
    this.instances.splice(Math.max(0, index), 0, inst);
    return inst;
  }
  public removeInstance(instanceId: string) {
    const index = this.getInstanceIndex(instanceId);
    if (index >= 0) {
      this.instances.splice(index, 1);
    }
  }

  public getInstanceIndex(instanceId: string) {
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

export interface IBrowserInstance {
  id: string;
  url: string;
  title?: string;
  icon?: string;
}
export interface BrowserInstance extends IBrowserInstance { }
export class BrowserInstance {
  public constructor(json?: IBrowserInstance) {
    if (json) {
      this.id = json.id;
      this.url = json.url;
      this.title = json.title;
      this.icon = json.icon;
    }
  }
  public getId() {
    return this.id;
  }
  public getUrl(): string {
    return this.url;
  }
  public setUrl(url: string) {
    this.url = url;
  }
  public getTitle(): string {
    return this.title;
  }
  public setTitle(title: string) {
    this.title = title;
  }
  public getIcon(): string {
    return this.icon;
  }
  public setIcon(icon: string) {
    this.icon = icon;
  }
}
