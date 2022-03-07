import { Component } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { IpcComs } from './utils/IpcComs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private platform: string;
  constructor(private electronService: ElectronService, private translate: TranslateService) {
    this.translate.setDefaultLang('en');
    IpcComs.getData('platform', (event, data) => {
      this.platform = data;
    });
  }
  public getPlatform(): string {
    return this.platform;
  }
}
