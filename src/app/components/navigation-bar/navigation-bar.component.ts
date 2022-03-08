import { BrowserManagerService } from '../../services/browser-manager/browser-manager.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pasco-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {
  public url: string;

  constructor(private paneManager: BrowserManagerService) {
    this.paneManager.focusedPaneChanged.subscribe((pane) => {
      console.log("emit");
      this.url = this.paneManager.getFocusedInstance().url;
    });
  }

  ngOnInit(): void {
  }
  public urlSubmitted(e) {
    if (this.paneManager.getFocusedInstance() !== undefined) {
      this.url = this.formatUrl(this.url);
      this.paneManager.navigateFocusedInstance(this.url);
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
    this.paneManager.performForward();
  }
  public back() {
    this.paneManager.performBack();
  }
  public refresh() {
    this.paneManager.performRefresh();
  }
  public closeInstance() {
    this.paneManager.removeFocusedInstance();
  }
}
