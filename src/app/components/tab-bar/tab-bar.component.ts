import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pasco-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss']
})
export class TabBarComponent implements OnInit {
  private selectedTabId: number;
  private tabs: number[];
  constructor() {
    this.selectedTabId = 0;
    this.tabs = [0, 1, 2, 3, 4, 5];
  }


  ngOnInit(): void {
  }
  private tabSelected(tabId: number): void {
    this.selectedTabId = tabId;
  }
  private isSelectedTab(tabId: number): boolean {
    return this.selectedTabId === tabId;
  }
}
