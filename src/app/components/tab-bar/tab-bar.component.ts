import { Component, OnInit } from '@angular/core';
import { BrowserTab } from '../../../../app/models/UserData';
import { BrowserManagerService } from '../../services/browser-manager/browser-manager.service';
import { UserDataService } from '../../services/user-data-service/user-data-service.service';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss', '../tab/tab.component.scss'],
})
export class TabBarComponent implements OnInit {
  public selectedTabId: string;

  constructor(private userService: UserDataService, private manager: BrowserManagerService) {

  }

  ngOnInit(): void { }
  public getTabs(): BrowserTab[] {
    return this.userService.getUserData().getTabs();
  }
  public tabSelected(tabId: string): void {
    this.selectedTabId = tabId;
    this.manager.setSelectedTab(tabId);
  }

  public isSelectedTab(tabId: string): boolean {
    return this.manager.getSelectedTab().getId() === tabId;
  }

  public newTabClicked() {
    this.manager.addTab('test');
  }
}
