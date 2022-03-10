import { v4 as uuid } from 'uuid';

export class UserData {
  private version: number;
  private tabs: BrowserTab[];

  public constructor(json?: any) {
    if (json) {
      this.version = json.version;
      this.tabs = [];
      for (const t of json.tabs) {
        this.tabs.push(new BrowserTab(t));
      }
    }
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

  public addTab(name: string): BrowserTab {
    const tab = new BrowserTab({
      name,
      id: uuid(),
      instances: [
        new BrowserInstance({ id: uuid(), url: 'https://www.google.com' })
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
export class BrowserTab {
  private id: string;
  private name: string;
  private instances: BrowserInstance[];

  public constructor(json?: any) {
    if (json) {
      this.id = json.id;
      this.name = json.name;
      this.instances = [];
      for (const t of json.instances) {
        this.instances.push(new BrowserInstance(t));
      }
    }
  }

  public getId(): string {
    return this.id;
  }
  public getName(): string {
    return this.name;
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
      id: uuid(), url
    });
    this.instances.splice(index, 0, inst);
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

export class BrowserInstance {
  private id: string;
  private url: string;


  public constructor(json?: any) {
    if (json) {
      this.id = json.id;
      this.url = json.url;
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
}
