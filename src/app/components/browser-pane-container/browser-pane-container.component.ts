/* eslint-disable @angular-eslint/component-selector */
import { IBrowserInstance, IBrowserTab } from '../../../../app/services/user-data-access';
import { BrowserManagerService } from '../../services/browser-manager/browser-manager.service';
import { AfterViewChecked, Component, OnInit, Input, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { BrowserPaneComponent } from '../browser-pane/browser-pane.component';
import { UserDataService } from '../../services/user-data-service/user-data-service.service';

@Component({
  selector: 'pasco-browser-pane-container',
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
    if (this.manager.getFocusedInstance() === undefined) {
      this.manager.setFocusedInstance(this.panes.first.id);
    }
  }

  public newInstance() {
    this.userService.addInstanceToTab(this.tabId, 'https://www.google.com');
  }
  public getInstances(): IBrowserInstance[] {
    return this.userService.getTabById(this.tabId).instances;
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
