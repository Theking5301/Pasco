import { BrowserPaneManagerService } from './../../services/browser-pane-manager/browser-pane-manager.service';
import { PascoElectronService } from './../../services/pasco-electron/pasco-electron.service';
import { AfterViewChecked, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { UserData } from '../../../../app/models/UserData';
import { BrowserPaneComponent } from '../browser-pane/browser-pane.component';

@Component({
  selector: 'pasco-browser-pane-container',
  templateUrl: './browser-pane-container.component.html',
  styleUrls: ['./browser-pane-container.component.scss']
})
export class BrowserPaneContainerComponent implements OnInit, AfterViewChecked {
  @ViewChildren(BrowserPaneComponent)
  private panes: QueryList<BrowserPaneComponent>;

  constructor(private router: Router, private electron: PascoElectronService, private manager: BrowserPaneManagerService) {

  }

  ngOnInit(): void {
  }
  ngAfterViewChecked(): void {
    if (this.manager.getFocusedPane() === undefined) {
      this.manager.setFocusedPane(this.panes.first);
      this.manager.setPanes(this.panes.toArray());
    }
  }
  public getUserData(): UserData {
    return this.manager.getUserData();
  }
}
