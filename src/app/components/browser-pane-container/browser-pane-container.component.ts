/* eslint-disable @angular-eslint/component-selector */
import { AfterViewChecked, Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { BrowserInstance } from '../../../../app/models/UserData';
import { BrowserManagerService } from '../../services/browser-manager/browser-manager.service';
import { UserDataService } from '../../services/user-data-service/user-data-service.service';
import { BrowserPaneComponent } from '../browser-pane/browser-pane.component';

@Component({
  selector: 'app-browser-pane-container',
  templateUrl: './browser-pane-container.component.html',
  styleUrls: ['./browser-pane-container.component.scss'],
})
export class BrowserPaneContainerComponent implements OnInit, AfterViewChecked {
  @Input()
  public tabId: string;
  @ViewChildren(BrowserPaneComponent)
  private panes: QueryList<BrowserPaneComponent>;

  constructor(private router: Router, private manager: BrowserManagerService, private userService: UserDataService) {
  }

  ngOnInit(): void { }
  ngAfterViewChecked(): void {

  }

  public getInstances(): BrowserInstance[] {
    return this.userService.getBrowserData().getTab(this.tabId).getInstances();
  }
  public getInstanceById(instanceId: string): BrowserPaneComponent {
    for (const pane of this.panes.toArray()) {
      if (pane.id === instanceId) {
        return pane;
      }
    }
    return undefined;
  }
}
