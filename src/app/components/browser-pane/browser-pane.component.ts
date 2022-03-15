import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BrowserManagerService } from '../../services/browser-manager/browser-manager.service';
import { SparrowElectronService } from '../../services/sparrow-electron/sparrow-electron.service';
import { UserDataService } from './../../services/user-data-service/user-data-service.service';


@Component({
  selector: 'app-browser-pane',
  templateUrl: './browser-pane.component.html',
  styleUrls: ['./browser-pane.component.scss']
})
export class BrowserPaneComponent implements OnInit, AfterViewInit {
  @Input()
  public id: string;
  @Input()
  public tabId: string;
  @Output()
  public navigated: EventEmitter<IPaneNavigatedEvent>;
  @ViewChild('webview')
  private webview: any;

  public topOverlayHovered: boolean;
  public url: string;
  public preload: string;
  private webviewNative: any;
  private domLoaded: boolean;
  private firstTimeLoaded: boolean;
  private topButtonFadeOffTimeout: NodeJS.Timeout;


  constructor(private electron: SparrowElectronService, private userService: UserDataService, private manager: BrowserManagerService) {
    this.domLoaded = false;
    this.navigated = new EventEmitter();
    const querystring = require('querystring');
    const query = querystring.parse(global.location.search);
    const sanitizedQuery = query['?dirname'].replaceAll('\\', '/');
    this.preload = 'file://' + sanitizedQuery + '/preload.js';
  }

  ngOnInit(): void {
    this.url = this.userService.getUserData().getTab(this.tabId).getInstance(this.id).getUrl();
    this.manager.registerInstance(this);
  }
  ngAfterViewInit(): void {
    this.webviewNative = this.webview.nativeElement;

    this.webviewNative.addEventListener('dom-ready', (e) => {
      // Listen for clicks.
      if (!this.firstTimeLoaded) {
        // Handle IPC messages.
        this.webviewNative.addEventListener('ipc-message', (message) => {
          if (message.channel === 'mousedown') {
            this.webContentsMouseDown(message.args[0]);
          } else if (message.channel === 'click') {
            this.webContentsClicked(message.args[0]);
            this.webviewNative.click();
          } else if (message.channel === 'auxclick') {
            this.webContentsAuxClicked(message.args[0]);
          } else if (message.channel === 'contextmenu') {
            console.log(message.args);
          }
        });
        // When loading for the first time, display the buttons so the user knows that they're there.
        this.topOverlayHovered = true;
        this.topButtonFadeOffTimeout = setTimeout(() => {
          this.topOverlayHovered = false;
        }, 2000);
      }


      // If the page closed, close this instance too.
      this.webviewNative.addEventListener('close', () => {
        console.log('close');
        this.manager.removeInstanceFromTab(this.tabId, this.id);
      });

      // Capture the first time loaded state.
      this.firstTimeLoaded = true;

      // Modify the scrollbars.
      this.webviewNative.insertCSS(`
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background-color: rgba(150, 25, 200, 0.5);
          border-radius: 10px;
          border: 2px solid white;
        }
        `);
    });

    this.webviewNative.addEventListener('did-navigate', (e) => {
      this.domLoaded = true;
      this.navigated.emit({
        instanceId: this.id,
        tabId: this.tabId,
        url: e.url
      });
    });

    this.webviewNative.addEventListener('page-title-updated', (e) => {
      this.userService.getUserData().getTab(this.tabId).getInstance(this.id).setTitle(e.title);
    });

    this.webviewNative.addEventListener('page-favicon-updated', (e) => {
      this.userService.getUserData().getTab(this.tabId).getInstance(this.id).setIcon(e.favicons[0]);
    });
  }
  public navigate(url: string): void {
    if (this.domLoaded) {
      this.domLoaded = false;
      return this.webviewNative.loadURL(url);
    }
  }

  public mouseUp(e) {
    console.log(e);
  }
  public focused() {
    return this.manager.getCurrentTabFocusedInstance().getId() === this.id;
  }
  public goBack() {
    if (this.domLoaded) {
      this.webviewNative.goBack();
    }
  }
  public goForward() {
    if (this.domLoaded) {
      this.webviewNative.goForward();
    }
  }
  public reload() {
    if (this.domLoaded) {
      this.webviewNative.reload();
    }
  }
  public isReloading(): boolean {
    if (this.domLoaded) {
      return this.webviewNative.isLoading();
    }
    return false;
  }
  public canGoForward(): boolean {
    if (this.domLoaded) {
      return this.webviewNative.canGoForward();
    }
    return false;
  }
  public canGoBack(): boolean {
    if (this.domLoaded) {
      return this.webviewNative.canGoBack();
    }
    return false;
  }
  public hasLoadedFirstTime() {
    return this.firstTimeLoaded;
  }
  public displayFocusedIndicator() {
    return this.focused() && this.manager.getSelectedTab().getInstances().length > 1;
  }
  public closeInstance() {
    this.manager.removeInstanceFromTab(this.tabId, this.id);
  }
  public newInstance() {
    this.manager.addInstanceToTabAfterInstance(this.tabId, this.id, 'https://www.google.com');
  }
  public overlayTopMouseEnter() {
    this.topOverlayHovered = true;
    clearTimeout(this.topButtonFadeOffTimeout);
    this.topButtonFadeOffTimeout = setTimeout(() => {
      this.topOverlayHovered = false;
    }, 2000);
  }
  public overlayTopMouseLeave() {
    this.topOverlayHovered = false;
  }

  public displayCloseInstanceButton() {
    return this.topOverlayHovered && this.manager.getSelectedTab().getInstances().length > 1;
  }
  public displayNewInstanceButton() {
    return this.topOverlayHovered;
  }
  private webContentsMouseDown(e) {
    this.manager.setCurrentTabFocusedInstance(this.id);

  }
  private webContentsClicked(e) {

  }
  private webContentsAuxClicked(e) {
    if (e.button === 3) {
      this.webviewNative.goBack();
    } else if (e.button === 4) {
      this.webviewNative.goForward();
    }
  }
}
export interface IPaneNavigatedEvent {
  instanceId: string;
  tabId: string;
  url: string;
}
