/* eslint-disable @angular-eslint/component-selector */
import { IBrowserTab } from '../../../../app/services/user-data-access';
import { BrowserPaneManagerService } from './../../services/browser-pane-manager/browser-pane-manager.service';
import { AfterViewChecked, Component, OnInit, Input, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { BrowserPaneComponent } from '../browser-pane/browser-pane.component';
import { UserDataService } from '../../services/user-data-service/user-data-service.service';

@Component({
  selector: 'pasco-browser-pane-container',
  templateUrl: './browser-pane-container.component.html',
  styleUrls: ['./browser-pane-container.component.scss']
})
export class BrowserPaneContainerComponent implements OnInit, AfterViewChecked {
  @Input()
  public tabId: string;
  @ViewChildren(BrowserPaneComponent)
  private panes: QueryList<BrowserPaneComponent>;
  private tab: IBrowserTab;

  constructor(private router: Router, private manager: BrowserPaneManagerService, private userService: UserDataService) {
    this.tabId = 'random';
    this.tab = this.userService.getTabById(this.tabId);
  }

  ngOnInit(): void {
  }
  ngAfterViewChecked(): void {
    if (this.manager.getFocusedPane() === undefined) {
      this.manager.setFocusedPane(this.panes.first);
      this.manager.setPanes(this.panes.toArray());
    }
  }
  public getTabData(): IBrowserTab {
    return this.tab;
  }
}
