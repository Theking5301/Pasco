import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserData } from '../../../../app/models/UserData';
import { ElectronService } from '../../core/services/electron/electron.service';

@Component({
  selector: 'pasco-browser-pane-container',
  templateUrl: './browser-pane-container.component.html',
  styleUrls: ['./browser-pane-container.component.scss']
})
export class BrowserPaneContainerComponent implements OnInit {
  private userData: UserData;
  constructor(private router: Router, private electron: ElectronService) {
    this.userData = {
      urls: ['https://www.google.com']
    };

    electron.ipcRenderer.send('pasco/getUser');
    electron.ipcRenderer.on('pasco/userData', (event, data) => {
      this.userData = data;
    });
  }

  ngOnInit(): void {
  }

}
