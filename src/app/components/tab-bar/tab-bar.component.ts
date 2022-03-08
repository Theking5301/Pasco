import { Component, Input, OnInit } from "@angular/core";
import { IBrowserTab } from "../../../../app/services/user-data-access";
import { BrowserManagerService } from "../../services/browser-manager/browser-manager.service";
import { UserDataService } from "../../services/user-data-service/user-data-service.service";

@Component({
  selector: "pasco-tab-bar",
  templateUrl: "./tab-bar.component.html",
  styleUrls: ["./tab-bar.component.scss", "../tab/tab.component.scss"],
})
export class TabBarComponent implements OnInit {
  public selectedTabId: string;
  public tabs: IBrowserTab[];

  constructor(
    private userService: UserDataService,
    private manager: BrowserManagerService
  ) {
    this.tabs = this.userService.getTabs();
    this.selectedTabId = this.userService.getTabs()[0].id;
  }

  ngOnInit(): void {}
  public tabSelected(tabId: string): void {
    this.selectedTabId = tabId;
    this.manager.setSelectedTabId(tabId);
  }
  public isSelectedTab(tabId: string): boolean {
    return this.selectedTabId === tabId;
  }
  public newTabClicked() {
    this.userService.addTab("test");
  }
}
