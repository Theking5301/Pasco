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
  public anyInstanceNavigated: EventEmitter<IUrlNavigateEvent>;

  private panes: Map<string, BrowserPaneComponent>;
  private selectedTab: string;
  private focusedInstances: Map<string, string>;

  constructor(private userService: UserDataService) {
    this.urlNavigate = new EventEmitter();
    this.anyInstanceNavigated = new EventEmitter();
    this.selectedTabChanged = new EventEmitter();
    this.focusedPaneChanged = new EventEmitter();
    this.focusedInstances = new Map<string, string>();
    this.panes = new Map<string, BrowserPaneComponent>();
    if (userService.getBrowserData().getTabs().length > 0) {
      this.selectedTab = userService.getBrowserData().getTabs()[0].getId();
      for (const tab of userService.getBrowserData().getTabs()) {
        this.setFocusedInstance(tab.getId(), tab.getInstances()[0].getId());
      }
    }
  }
  public registerInstance(pane: BrowserPaneComponent) {
    this.panes.set(pane.id, pane);
    pane.navigated.subscribe((e) => {
      this.userService.getBrowserData().getTab(e.tabId)?.getInstance(e.instanceId)?.setUrl(e.url);
      this.userService.syncToDataAccess();
      this.anyInstanceNavigated.emit({
        tabId: e.tabId,
        instanceId: e.instanceId,
        url: e.url
      });
    });
  }
  public setSelectedTab(tabId: string) {
    if (this.selectedTab !== tabId) {
      console.log('Focused tab changed to: ' + tabId);
      this.selectedTab = tabId;
      this.setFocusedInstance(tabId, this.getSelectedTab().getInstances()[0].getId());
      this.selectedTabChanged.emit(this.selectedTab);
    }
  }
  public getSelectedTab(): BrowserTab {
    return this.userService.getBrowserData().getTab(this.selectedTab);
  }
  public setCurrentTabFocusedInstance(focusedInstanceId: string) {
    this.setFocusedInstance(this.selectedTab, focusedInstanceId);
  }
  public setFocusedInstance(tabId: string, focusedInstanceId: string) {
    if (!this.focusedInstances.has(tabId) || this.focusedInstances.get(tabId) !== focusedInstanceId) {
      this.focusedInstances.set(tabId, focusedInstanceId);
      console.log('Focused instance changed to: ' + focusedInstanceId);
      this.focusedPaneChanged.emit(focusedInstanceId);
    }
  }
  public getSelectedTabFocusedInstance(): BrowserInstance {
    return this.getFocusedInstance(this.selectedTab);
  }
  public getFocusedInstance(tabId: string): BrowserInstance {
    return this.userService.getBrowserData().getTab(tabId)?.getInstance(this.focusedInstances.get(tabId));
  }
  public getPane(tabId: string, instanceId: string): BrowserPaneComponent {
    return this.panes.get(instanceId);
  }
  public addTab(name: string, focus: boolean, url?: string): BrowserTab {
    const newTab = this.userService.getBrowserData().addTab(name, url);
    if (focus) {
      this.setSelectedTab(newTab.getId());
      this.setFocusedInstance(newTab.getId(), newTab.getInstances()[0].getId());
    }
    this.userService.syncToDataAccess();
    return newTab;
  }
  public removeTab(tabId: string) {
    const index = this.userService.getBrowserData().getTabIndex(tabId);
    this.userService.getBrowserData().removeTab(tabId);

    if (this.selectedTab === tabId) {
      if (this.userService.getBrowserData().getTabs().length > 0) {
        this.setSelectedTab(this.userService.getBrowserData().getTabs()[Math.max(0, index - 1)].getId());
      } else {
        this.addTab('New Tab', true);
      }
    }

    this.userService.syncToDataAccess();
  }
  public addInstanceToTab(tabId: string, url: string): BrowserInstance {
    const inst = this.userService.getBrowserData().getTab(tabId).addInstance(url);
    this.userService.syncToDataAccess();
    return inst;
  }
  public addInstanceToTabAfterInstance(tabId: string, instanceId: string, url?: string): BrowserInstance {
    const tab = this.userService.getBrowserData().getTab(tabId);
    const existingIndex = tab.getInstanceIndex(instanceId);
    const existingInstance = tab.getInstance(instanceId);
    const inst = tab.addInstanceAfterIndex(existingIndex + 1, url ? url : existingInstance.getUrl());
    this.userService.syncToDataAccess();
    return inst;
  }
  public removeInstanceFromTab(tabId: string, instanceId: string) {
    // Capture the index of the existing instance and remove it.
    const tab = this.userService.getBrowserData().getTab(tabId);
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
  public navigateFocusedInstance(url: string) {
    this.getFocusedBrowserPane().navigate(url);
    this.urlNavigate.emit({
      tabId: this.selectedTab,
      instanceId: this.focusedInstances.get(this.selectedTab),
      url
    });
    this.getFocusedInstance(this.selectedTab)?.setUrl(url);
  }
  public goBack() {
    this.getFocusedBrowserPane().goBack();
  }
  public goForward() {
    this.getFocusedBrowserPane().goForward();
  }
  public reload() {
    this.getFocusedBrowserPane().reload();
  }
  public isReloading() {
    return this.getFocusedBrowserPane().isReloading();
  }
  public canGoForward(): boolean {
    return this.getFocusedBrowserPane().canGoForward();
  }
  public canGoBack(): boolean {
    return this.getFocusedBrowserPane().canGoBack();
  }
  public getFocusedBrowserPane(): BrowserPaneComponent {
    return this.panes.get(this.getSelectedTabFocusedInstance().getId());
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
