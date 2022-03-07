import { Component, Input, OnInit } from '@angular/core';
import { IBrowserTab } from '../../../../app/services/user-data-access';
import { UserDataService } from '../../services/user-data-service/user-data-service.service';

@Component({
  selector: 'pasco-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss', '../tab/tab.component.scss',]
})
export class TabBarComponent implements OnInit {
  public selectedTabId: string;
  public tabs: IBrowserTab[];

  constructor(private userService: UserDataService) {
    this.selectedTabId = 'random';
    this.tabs = this.userService.getTabs();
  }


  ngOnInit(): void {
  }
  public tabSelected(tabId: string): void {
    this.selectedTabId = tabId;
  }
  public isSelectedTab(tabId: string): boolean {
    return this.selectedTabId === tabId;
  }
  public newTabClicked() {
    this.userService.addTab('test');
  }
}
