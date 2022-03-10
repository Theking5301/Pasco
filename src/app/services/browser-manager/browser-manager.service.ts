import { EventEmitter, Injectable, Output } from '@angular/core';
import { BrowserTab } from '../../../../app/models/UserData';
import { BrowserPaneComponent } from '../../components/browser-pane/browser-pane.component';
import { UserDataService } from '../user-data-service/user-data-service.service';
import { BrowserInstance } from './../../../../app/models/UserData';

@Injectable({
  providedIn: 'root',
})
export class BrowserManagerService {
  @Output()
  public selectedTabChanged: EventEmitter<string>;
  @Output()
  public focusedPaneChanged: EventEmitter<string>;
  @Output()
  public urlNavigate: EventEmitter<IUrlNavigateEvent>;
  @Output()
  public navigate: EventEmitter<INavigateEvent>;
  @Output()
  public anyInstanceNavigated: EventEmitter<IUrlNavigateEvent>;

  private selectedTab: string;
  private focusedInstances: Map<string, string>;

  constructor(private userService: UserDataService) {
    this.urlNavigate = new EventEmitter();
    this.navigate = new EventEmitter();
    this.anyInstanceNavigated = new EventEmitter();
    this.selectedTabChanged = new EventEmitter();
    this.focusedPaneChanged = new EventEmitter();
    this.focusedInstances = new Map();
    if (userService.getUserData().getTabs().length > 0) {
      this.selectedTab = userService.getUserData().getTabs()[0].getId();
      if (this.getSelectedTab().getInstances().length > 0) {
        this.setFocusedInstance(this.selectedTab, this.getSelectedTab().getInstances()[0].getId());
      }
    }
  }
  public setSelectedTab(tabId: string) {
    console.log('Focused tab changed to: ' + tabId);
    this.selectedTab = tabId;
    this.setFocusedInstance(tabId, this.getSelectedTab().getInstances()[0].getId());
    this.selectedTabChanged.emit(this.selectedTab);
  }
  public getSelectedTab(): BrowserTab {
    return this.userService.getUserData().getTab(this.selectedTab);
  }
  public setCurrentTabFocusedInstance(focusedInstanceId: string) {
    this.setFocusedInstance(this.selectedTab, focusedInstanceId);
  }
  public setFocusedInstance(tabId: string, focusedInstanceId: string) {
    this.focusedInstances.set(tabId, focusedInstanceId);
    console.log('Focused instance changed to: ' + focusedInstanceId);
    this.focusedPaneChanged.emit(focusedInstanceId);
  }
  public getCurrentTabFocusedInstance(): BrowserInstance {
    return this.getFocusedInstance(this.selectedTab);
  }
  public getFocusedInstance(tabId: string): BrowserInstance {
    return this.userService.getUserData().getTab(this.selectedTab)?.getInstance(this.focusedInstances.get(tabId));
  }
  public navigateFocusedInstance(url: string) {
    this.urlNavigate.emit({
      tabId: this.selectedTab,
      instanceId: this.focusedInstances.get(this.selectedTab),
      url
    });
    this.getFocusedInstance(this.selectedTab)?.setUrl(url);
  }
  public registerInstance(pane: BrowserPaneComponent,
    urlCallback: (IUrlNavigateEvent) => void,
    navigateCallback: (INavigateEvent) => void
  ) {
    this.urlNavigate.subscribe((e) => urlCallback(e));
    this.navigate.subscribe((e) => navigateCallback(e));
    pane.navigated.subscribe((e) => {
      this.userService.getUserData().getTab(e.tabId)?.getInstance(e.instanceId)?.setUrl(e.url);
      this.userService.syncToDataAccess();
      this.anyInstanceNavigated.emit({
        tabId: e.tabId,
        instanceId: e.instanceId,
        url: e.url
      });
    });
  }

  public addTab(name: string): BrowserTab {
    const newTab = this.userService.getUserData().addTab(name);
    this.setSelectedTab(newTab.getId());
    this.setFocusedInstance(newTab.getId(), newTab.getInstances()[0].getId());
    this.userService.syncToDataAccess();
    return newTab;
  }

  public removeTab(tabId: string) {
    const index = this.userService.getUserData().getTabIndex(tabId);
    this.userService.getUserData().removeTab(tabId);

    if (this.selectedTab === tabId) {
      if (this.userService.getUserData().getTabs().length > 0) {
        this.setSelectedTab(this.userService.getUserData().getTabs()[Math.max(0, index - 1)].getId());
      } else {
        this.addTab('New Tab');
      }
    }

    this.userService.syncToDataAccess();
  }

  public addInstanceToTab(tabId: string, url: string): BrowserInstance {
    const inst = this.userService.getUserData().getTab(tabId).addInstance(url);
    this.userService.syncToDataAccess();
    return inst;
  }
  public addInstanceToTabAfterInstance(tabId: string, instanceId: string, url: string): BrowserInstance {
    const tab = this.userService.getUserData().getTab(tabId);
    const existingIndex = tab.getInstanceIndex(instanceId);
    const inst = tab.addInstanceAfterIndex(existingIndex + 1, url);
    this.userService.syncToDataAccess();
    return inst;
  }
  public removeInstanceFromTab(tabId: string, instanceId: string) {
    // Capture the index of the existing instance and remove it.
    const tab = this.userService.getUserData().getTab(tabId);
    const index = tab.getInstanceIndex(instanceId);
    tab.removeInstance(instanceId);
    console.log('Removed instance with Id: ' + instanceId);

    // Clear the focused instance if that was this.
    if (this.focusedInstances.get(tabId) === instanceId) {
      this.focusedInstances.set(tabId, undefined);
    }

    // If we still have more instances, change the focused instance to the next one over.
    // Otherwise, add one.
    if (tab.getInstances().length > 0) {
      this.setFocusedInstance(tab.getId(), tab.getInstances()[Math.max(0, index - 1)].getId());
    } else {
      const inst = this.addInstanceToTab(this.selectedTab, 'https://www.google.com');
      this.setFocusedInstance(tab.getId(), inst.getId());
    }

    this.userService.syncToDataAccess();
  }

  public performBack() {
    this.navigate.emit({
      tabId: this.selectedTab,
      instanceId: this.focusedInstances.get(this.selectedTab),
      event: 'back'
    });
  }
  public performForward() {
    this.navigate.emit({
      tabId: this.selectedTab,
      instanceId: this.focusedInstances.get(this.selectedTab),
      event: 'forward'
    });
  }
  public performRefresh() {
    this.navigate.emit({
      tabId: this.selectedTab,
      instanceId: this.focusedInstances.get(this.selectedTab),
      event: 'refresh'
    });
  }
}
export interface IUrlNavigateEvent {
  tabId: string;
  instanceId: string;
  url: string;
}
export interface INavigateEvent {
  tabId: string;
  instanceId: string;
  event: string;
}
