import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DetailModule } from './detail/detail.module';

import { AppComponent } from './app.component';
import { TitlebarComponent } from './components/titlebar/titlebar.component';
import { BrowserPaneContainerComponent } from './components/browser-pane-container/browser-pane-container.component';
import { BrowserPaneComponent } from './components/browser-pane/browser-pane.component';
import { NavigationBarComponent } from './components/navigation-bar/navigation-bar.component';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { TabComponent } from './components/tab/tab.component';
import { UserDataService } from './services/user-data-service/user-data-service.service';
import { BrowserComponent } from './components/browser/browser.component';

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader => new TranslateHttpLoader(http, './assets/i18n/', '.json');

export function initializeApplication(userData: UserDataService): () => Promise<any> {
  return (): Promise<any> => userData.initialize();
}

@NgModule({
  declarations: [AppComponent, TitlebarComponent, BrowserPaneContainerComponent, BrowserPaneComponent, NavigationBarComponent, TabBarComponent, TabComponent, BrowserComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    DetailModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: initializeApplication, deps: [UserDataService], multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
