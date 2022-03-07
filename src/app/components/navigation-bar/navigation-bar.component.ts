import { BrowserPaneManagerService } from './../../services/browser-pane-manager/browser-pane-manager.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pasco-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {
  public url: string;

  constructor(private paneManager: BrowserPaneManagerService) {
    if (this.paneManager.getFocusedPane() !== undefined) {
      this.url = this.paneManager.getFocusedPane().getUrl();
    }
    this.paneManager.focusedPaneChanged.subscribe((pane) => {
      this.url = this.paneManager.getFocusedPane().getUrl();
    });
  }

  ngOnInit(): void {
  }
  public urlSubmitted(e) {
    if (this.paneManager.getFocusedPane() !== undefined) {
      this.url = this.formatUrl(this.url);
      this.paneManager.navigateFocusedPane(this.url);
    }
  }
  public formatUrl(url: string): string {
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    return url;
  }
}
