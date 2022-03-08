import { IBrowserTab } from './../../../../app/services/user-data-access';
import { Component, OnInit } from '@angular/core';
import { BrowserManagerService } from '../../services/browser-manager/browser-manager.service';
import { UserDataService } from '../../services/user-data-service/user-data-service.service';

@Component({
  selector: 'pasco-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})
export class BrowserComponent implements OnInit {

  constructor(private manager: BrowserManagerService, private userService: UserDataService) {
  }

  ngOnInit(): void {
  }
  public getTabs(): IBrowserTab[] {
    return this.userService.getTabs();
  }
  public isVisible(tabId: string) {
    return this.manager.getSelectedTabId() === tabId;
  }
}
