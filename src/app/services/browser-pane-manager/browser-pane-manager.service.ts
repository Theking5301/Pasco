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
  private panes: BrowserPaneComponent[];
  private focusedPane: BrowserPaneComponent;

  constructor(private electron: PascoElectronService, private userService: UserDataService) {
    this.focusedPaneChanged = new EventEmitter();
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
}
