import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BrowserManagerService } from '../../services/browser-manager/browser-manager.service';
import { StaticDataService } from './../../services/static-data-service/static-data-service.service';
import { UserDataService } from './../../services/user-data-service/user-data-service.service';

const TOP_OVERLAY_TRIGGER_HEIGHT = 32;
const TOP_OVERLAY_FADE_OFF_TIME = 1500;

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


  constructor(private userService: UserDataService, private manager: BrowserManagerService, staticData: StaticDataService) {
    this.domLoaded = false;
    this.navigated = new EventEmitter();
    this.preload = `file://${staticData.getStaticData().appDirectory}/preload.js`;
  }

  ngOnInit(): void {
    this.manager.registerInstance(this);
    this.url = this.userService.getBrowserData().getTab(this.tabId).getInstance(this.id).getUrl();
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
          } else if (message.channel === 'mousemove') {
            this.webContentsMouseMove(message.args[0]);
          }
        });

        this.webviewNative.addEventListener('new-window', (newWindowEvent) => {
          if (newWindowEvent.disposition.indexOf('tab') >= 0) {
            this.manager.addTab(newWindowEvent.frameName, newWindowEvent.disposition === 'foreground-tab', newWindowEvent.url);
            newWindowEvent.preventDefault();
          }
        });

        // When loading for the first time, display the buttons so the user knows that they're there.
        this.topOverlayHovered = true;
        this.topButtonFadeOffTimeout = setTimeout(() => {
          this.topOverlayHovered = false;
        }, TOP_OVERLAY_FADE_OFF_TIME);
      }


      // If the page closed, close this instance too.
      this.webviewNative.addEventListener('close', () => {
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
      this.userService.getBrowserData().getTab(this.tabId).getInstance(this.id).setTitle(e.title);
      this.userService.syncToDataAccess();
    });

    this.webviewNative.addEventListener('page-favicon-updated', (e) => {
      this.userService.getBrowserData().getTab(this.tabId).getInstance(this.id).setIcon(e.favicons[0]);
      this.userService.syncToDataAccess();
    });
  }
  public navigate(url: string): void {
    if (this.domLoaded) {
      this.domLoaded = false;
      return this.webviewNative.loadURL(url);
    }
  }
  public focused() {
    return this.manager.getSelectedTabFocusedInstance().getId() === this.id;
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
    return this.domLoaded;
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
    }, TOP_OVERLAY_FADE_OFF_TIME);
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
  private webContentsMouseMove(e) {
    if (e.y <= TOP_OVERLAY_TRIGGER_HEIGHT) {
      this.overlayTopMouseEnter();
    } else {
      this.overlayTopMouseLeave();
    }
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
