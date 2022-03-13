import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SparrowElectronService } from './services/sparrow-electron/sparrow-electron.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private platform: string;
  constructor(private electronService: SparrowElectronService, private translate: TranslateService) {
    this.translate.setDefaultLang('en');
    electronService.getData('platform').then((response) => {
      console.log(response);
    });
  }
  public getPlatform(): string {
    return this.platform;
  }
}
