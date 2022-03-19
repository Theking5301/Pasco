import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Logger } from '../../../../app/utilities/Logger';
import { BrowserManagerService } from '../../services/browser-manager/browser-manager.service';
import { StaticDataService } from './../../services/static-data-service/static-data-service.service';
import { UserDataService } from './../../services/user-data-service/user-data-service.service';

const TOP_OVERLAY_TRIGGER_HEIGHT = 32;
const SIDE_OVERLAY_TRIGGER_HEIGHT = 32;
const TOP_OVERLAY_FADE_OFF_TIME = 1500;
const DEBUG_OVERLAYS = false;

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
  @Output()
  public startedLoading: EventEmitter<IPaneNavigatedEvent>;
  @Output()
  public finishedLoading: EventEmitter<IPaneNavigatedEvent>;

  @ViewChild('webview')
  private webview: any;

  public topOverlayHovered: boolean;
  public leftOverlayHovered: boolean;
  public rightOverlayHovered: boolean;

  public url: string;
  public preload: string;

  private webviewNative: any;
  private domLoaded: boolean;
  private firstTimeLoaded: boolean;
  private topButtonFadeOffTimeout: NodeJS.Timeout;
  private leftButtonFadeOffTimeout: NodeJS.Timeout;
  private rightButtonFadeOffTimeout: NodeJS.Timeout;
  private isLoading: boolean;
  private canGoBack: boolean;
  private canGoForward: boolean;

  constructor(private userService: UserDataService, private manager: BrowserManagerService,
    staticData: StaticDataService, private element: ElementRef) {
    this.navigated = new EventEmitter();
    this.startedLoading = new EventEmitter();
    this.finishedLoading = new EventEmitter();

    this.domLoaded = false;
    this.preload = `file://${staticData.getStaticData().appDirectory}/preload.js`;
    this.topOverlayHovered = false;
    this.leftOverlayHovered = false;
    this.rightOverlayHovered = false;
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
            Logger.info(message.args);
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

      // Capture the first time loaded state.
      this.firstTimeLoaded = true;

      // If the page closed, close this instance too.
      this.webviewNative.addEventListener('close', () => {
        this.manager.removeInstanceFromTab(this.tabId, this.id);
      });

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
    this.webviewNative.addEventListener('did-start-loading', (event) => {
      this.startedLoading.emit();
      this.isLoading = true;
    });

    this.webviewNative.addEventListener('did-stop-loading', (event) => {
      this.finishedLoading.emit();
      this.isLoading = false;
    });

    this.webviewNative.addEventListener('did-navigate', (event) => {
      this.domLoaded = true;
      this.canGoBack = this.webviewNative.canGoBack();
      this.canGoForward = this.webviewNative.canGoForward();
      this.navigated.emit({
        instanceId: this.id,
        tabId: this.tabId,
        url: event.url
      });
    });

    this.webviewNative.addEventListener('did-navigate-in-page', (event) => {
      this.domLoaded = true;
      this.canGoBack = this.webviewNative.canGoBack();
      this.canGoForward = this.webviewNative.canGoForward();
      this.navigated.emit({
        instanceId: this.id,
        tabId: this.tabId,
        url: event.url
      });
    });

    this.webviewNative.addEventListener('page-title-updated', (event) => {
      this.userService.getBrowserData().getTab(this.tabId).getInstance(this.id).setTitle(event.title);
    });

    this.webviewNative.addEventListener('page-favicon-updated', (event) => {
      if (event.favicons && event.favicons.length > 0) {
        this.userService.getBrowserData().getTab(this.tabId).getInstance(this.id).setIcon(event.favicons[0]);
      }
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
    return this.isLoading;
  }
  public getCanGoForward(): boolean {
    return this.domLoaded && this.canGoForward;
  }
  public getCanGoBack(): boolean {
    return this.domLoaded && this.canGoBack;
  }
  public hasLoadedFirstTime() {
    return this.firstTimeLoaded;
  }
  public displayFocusedIndicator() {
    return this.focused() && this.manager.getSelectedTab().getInstances().length > 1;
  }
  public displayCloseInstanceButton() {
    return this.manager.getSelectedTab().getInstances().length > 1;
  }
  public displayTopOverlay(): boolean {
    return DEBUG_OVERLAYS || this.topOverlayHovered;
  }
  public displayLeftOverlay(): boolean {
    return DEBUG_OVERLAYS || this.leftOverlayHovered;
  }
  public displayRightOverlay(): boolean {
    return DEBUG_OVERLAYS || this.rightOverlayHovered;
  }
  public closeInstance() {
    this.manager.removeInstanceFromTab(this.tabId, this.id);
  }
  public newInstanceAfter() {
    this.manager.addInstanceToTabAfterInstance(this.tabId, this.id, 'https://www.google.com');
  }
  public newInstanceBefore() {
    this.manager.addInstanceToTabBeforeInstance(this.tabId, this.id, 'https://www.google.com');
  }
  private webContentsMouseMove(e) {
    const bounds = this.element.nativeElement.getBoundingClientRect();

    if (e.y <= TOP_OVERLAY_TRIGGER_HEIGHT) {
      this.overlayTopMouseEnter();
      return;
    } else {
      this.overlayTopMouseLeave();
    }

    if (e.x <= SIDE_OVERLAY_TRIGGER_HEIGHT) {
      this.overlayLeftMouseEnter();
      return;
    } else {
      this.overlayLeftMouseLeave();
    }

    if (e.x >= bounds.width - SIDE_OVERLAY_TRIGGER_HEIGHT) {
      this.overlayRightMouseEnter();
      return;
    } else {
      this.overlayRightMouseLeave();
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
  private overlayTopMouseEnter() {
    this.topOverlayHovered = true;
    clearTimeout(this.topButtonFadeOffTimeout);
    this.topButtonFadeOffTimeout = setTimeout(() => {
      this.topOverlayHovered = false;
    }, TOP_OVERLAY_FADE_OFF_TIME);
  }
  private overlayTopMouseLeave() {
    this.topOverlayHovered = false;
  }
  private overlayLeftMouseEnter() {
    this.leftOverlayHovered = true;
    clearTimeout(this.leftButtonFadeOffTimeout);
    this.leftButtonFadeOffTimeout = setTimeout(() => {
      this.leftOverlayHovered = false;
    }, TOP_OVERLAY_FADE_OFF_TIME);
  }
  private overlayLeftMouseLeave() {
    this.leftOverlayHovered = false;
  }
  private overlayRightMouseEnter() {
    this.rightOverlayHovered = true;
    clearTimeout(this.rightButtonFadeOffTimeout);
    this.rightButtonFadeOffTimeout = setTimeout(() => {
      this.rightOverlayHovered = false;
    }, TOP_OVERLAY_FADE_OFF_TIME);
  }
  private overlayRightMouseLeave() {
    this.rightOverlayHovered = false;
  }
}
export interface IPaneNavigatedEvent {
  instanceId: string;
  tabId: string;
  url: string;
}
