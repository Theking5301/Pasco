import { Component, OnInit } from '@angular/core';
import { BrowserManagerService } from '../../services/browser-manager/browser-manager.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {
  public url: string;
  constructor(private manager: BrowserManagerService) {
    this.url = this.manager.getCurrentTabFocusedInstance().getUrl();
    this.manager.focusedPaneChanged.subscribe((pane) => {
      this.url = this.manager.getCurrentTabFocusedInstance().getUrl();
    });
    this.manager.anyInstanceNavigated.subscribe((e) => {
      this.url = e.url;
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
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
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

  }
}
