import { Component, OnInit, ViewChild } from '@angular/core';
import { BrowserManagerService } from '../../services/browser-manager/browser-manager.service';
import { BrowserMenuComponent, IMenuEntryEvent } from './../browser-menu/browser-menu.component';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {
  @ViewChild(BrowserMenuComponent)
  private browserMenu: BrowserMenuComponent;
  public url: string;

  constructor(private manager: BrowserManagerService) {
    this.url = this.manager.getCurrentTabFocusedInstance().getUrl();
    this.manager.focusedPaneChanged.subscribe((pane) => {
      this.url = this.manager.getCurrentTabFocusedInstance().getUrl();
    });
    this.manager.anyInstanceNavigated.subscribe((e) => {
      if (e.instanceId === this.manager.getCurrentTabFocusedInstance().getId()) {
        this.url = e.url;
      }
    });
  }

  ngOnInit(): void {
  }
  public getUrl() {
    return this.manager.getCurrentTabFocusedInstance().getUrl();
  }
  public urlSubmitted(e) {
    if (this.manager.getCurrentTabFocusedInstance() !== undefined) {
      this.url = this.formatUrl(this.url);
      this.manager.navigateFocusedInstance(this.url);
    }
  }
  public formatUrl(url: string): string {
    url = url.trim();

    if (url.indexOf('') >= 1) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
    } else {
      url = 'https://www.google.com/search?q=' + url;
    }
    return url;
  }
  public forward() {
    this.manager.performForward();
  }
  public back() {
    this.manager.performBack();
  }
  public refresh() {
    this.manager.performRefresh();
  }
  public openMenu() {
    this.browserMenu.toggleOpen();
  }
  public menuEntryClicked(event: IMenuEntryEvent) {
    switch (event.entry.action) {
      case 'new_tab': this.manager.addTab('New Tab');
        break;
      case 'close_tab': this.manager.removeTab(this.manager.getSelectedTab().getId());
        break;
      case 'new_instance': this.manager.addInstanceToTab(this.manager.getSelectedTab().getId(), 'https://www.google.com');
        break;
      case 'close_instance': this.manager.removeInstanceFromTab(
        this.manager.getSelectedTab().getId(),
        this.manager.getFocusedInstance(this.manager.getSelectedTab().getId()).getId()
      );
        break;
    }
  }
}
