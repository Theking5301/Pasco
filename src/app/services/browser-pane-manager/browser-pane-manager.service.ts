import { Injectable, Output, EventEmitter } from '@angular/core';
import { UserData } from '../../../../app/models/UserData';
import { BrowserPaneComponent } from '../../components/browser-pane/browser-pane.component';
import { PascoElectronService } from '../pasco-electron/pasco-electron.service';

@Injectable({
  providedIn: 'root'
})
export class BrowserPaneManagerService {
  @Output()
  public focusedPaneChanged: EventEmitter<BrowserPaneComponent>;
  private panes: BrowserPaneComponent[];
  private focusedPane: BrowserPaneComponent;
  private userData: UserData;

  constructor(private electron: PascoElectronService) {
    this.focusedPaneChanged = new EventEmitter();

    electron.getData<UserData>('user-data').then((response) => {
      this.userData = response.getData();
    });
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

    this.userData.urls = [];
    for (const pane of this.panes) {
      this.userData.urls.push(pane.getUrl());
    }
    this.electron.ipcRenderer.send('pasco/set-user-data', this.userData);
    console.log(this.userData.urls);
  }
  public getUserData(): UserData {
    return this.userData;
  }
}
