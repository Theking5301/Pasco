import { Injectable, Output, EventEmitter, Input } from '@angular/core';
import { IBrowserTab, IUserData } from '../../../../app/services/user-data-access';
import { BrowserPaneComponent } from '../../components/browser-pane/browser-pane.component';
import { PascoElectronService } from '../pasco-electron/pasco-electron.service';
import { UserDataService } from '../user-data-service/user-data-service.service';

@Injectable({
  providedIn: 'root'
})
export class BrowserPaneManagerService {
  @Output()
  public focusedPaneChanged: EventEmitter<BrowserPaneComponent>;
  private selectedTabId: string;
  private panes: BrowserPaneComponent[];
  private focusedPane: BrowserPaneComponent;

  constructor(private electron: PascoElectronService, private userService: UserDataService) {
    this.focusedPaneChanged = new EventEmitter();
    this.selectedTabId = userService.getTabs()[0].id;
  }
  public setSelectedTabId(tabId: string) {
    this.selectedTabId = tabId;
  }
  public setPanes(panes: BrowserPaneComponent[]): void {
    this.panes = panes;
  }
  public setFocusedPane(pane: BrowserPaneComponent): void {
    if (pane !== this.focusedPane) {
      this.focusedPane = pane;
      this.focusedPaneChanged.emit(pane);
    }
  }
  public getFocusedPane(): BrowserPaneComponent {
    return this.focusedPane;
  }
  public navigateFocusedPane(url: string) {
    this.getFocusedPane().navigate(url);
  }
  public performBack() {
    this.getFocusedPane().performBack();
  }
  public performForward() {
    this.getFocusedPane().performForward();
  }
  public performRefresh() {
    this.getFocusedPane().performRefresh();
  }
  public removeFocusedPane() {
    this.userService.removeInstanceFromTab(this.selectedTabId, this.getFocusedPane().id);
  }
}
