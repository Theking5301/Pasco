import { IBrowserTab } from './../../../../app/services/user-data-access';
import { Injectable, Output, EventEmitter, Input } from '@angular/core';
import { IBrowserInstance } from '../../../../app/services/user-data-access';
import { BrowserPaneContainerComponent } from '../../components/browser-pane-container/browser-pane-container.component';
import { BrowserPaneComponent } from '../../components/browser-pane/browser-pane.component';
import { PascoElectronService } from '../pasco-electron/pasco-electron.service';
import { UserDataService } from '../user-data-service/user-data-service.service';

@Injectable({
  providedIn: 'root',
})
export class BrowserManagerService {
  @Output()
  public focusedPaneChanged: EventEmitter<string>;
  private selectedTabId: string;
  private focusedInstanceId: string;

  constructor(private electron: PascoElectronService, private userService: UserDataService) {
    this.focusedPaneChanged = new EventEmitter();
    if (userService.getTabs().length > 0) {
      this.selectedTabId = userService.getTabs()[0].id;
    }
  }
  public setSelectedTabId(tabId: string) {
    this.selectedTabId = tabId;
  }
  public getSelectedTabId(): string {
    return this.selectedTabId;
  }
  public setFocusedInstance(focusedInstanceId: string) {
    this.focusedInstanceId = focusedInstanceId;
  }
  public navigateFocusedInstance(url: string) {
    this.getFocusedInstance().url = url;
  }
  public performBack() {
    // this.getFocusedInstance().performBack();
  }
  public performForward() {
    //this.getFocusedInstance().performForward();
  }
  public performRefresh() {
    //this.getFocusedInstance().performRefresh();
  }
  public removeFocusedInstance() {
    this.userService.removeInstanceFromTab(
      this.selectedTabId,
      this.getFocusedInstance().id
    );
  }
}
