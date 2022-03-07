import { Injectable } from '@angular/core';
import { BrowserPaneComponent } from '../components/browser-pane/browser-pane.component';

@Injectable({
  providedIn: 'root'
})
export class BrowserPaneManagerService {
  private focusedPane: BrowserPaneComponent;
  constructor() { }

  public setFocusedPane(pane: BrowserPaneComponent): void {
    this.focusedPane = pane;
  }
  public getFocusedPane(): BrowserPaneComponent {
    return this.focusedPane;
  }
}
