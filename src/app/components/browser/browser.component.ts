import { Component, OnInit } from '@angular/core';
import { BrowserTab } from '../../../../app/models/UserData';
import { BrowserManagerService } from '../../services/browser-manager/browser-manager.service';
import { SparrowElectronService } from '../../services/sparrow-electron/sparrow-electron.service';
import { UserDataService } from '../../services/user-data-service/user-data-service.service';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})
export class BrowserComponent implements OnInit {

  constructor(private electron: SparrowElectronService, private manager: BrowserManagerService, private userService: UserDataService) {
  }

  ngOnInit(): void {
  }
  public getTabs(): BrowserTab[] {
    return this.userService.getBrowserData().getTabs();
  }
  public isVisible(tabId: string) {
    return this.manager.getSelectedTab().getId() === tabId;
  }
}
