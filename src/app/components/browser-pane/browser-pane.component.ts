import { Component, Input, ViewChild, OnInit, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { Menu, MenuItem, webFrame } from 'electron';
import { BrowserPaneManagerService } from '../../services/browser-pane-manager/browser-pane-manager.service';
import { PascoElectronService } from '../../services/pasco-electron/pasco-electron.service';

@Component({
  selector: 'pasco-browser-pane',
  templateUrl: './browser-pane.component.html',
  styleUrls: ['./browser-pane.component.scss']
})
export class BrowserPaneComponent implements OnInit, AfterViewInit {
  @Input()
  public id: string;
  @Input()
  public url: string;
  @Output()
  public navigated: EventEmitter<BrowserPaneComponent>;

  @ViewChild('webview')
  private webview: any;
  private webviewNative: any;
  private domLoaded: boolean;
  private firstTimeLoaded: boolean;


  constructor(private electron: PascoElectronService, private paneManager: BrowserPaneManagerService) {
    this.url = 'https://www.google.com';
    this.domLoaded = false;
    this.navigated = new EventEmitter();
  }

  ngOnInit(): void {

  }
  ngAfterViewInit(): void {
    this.webviewNative = this.webview.nativeElement;
    this.webviewNative.addEventListener('dom-ready', (e) => {
      // If this is the SECOND or more navigate, then we raise the event.
      if (this.firstTimeLoaded) {
        this.navigated.emit(this);
      }

      // Capture the loaded state.
      this.domLoaded = true;
      this.firstTimeLoaded = true;
      this.webviewNative.executeJavaScript('console.log("test")');

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
  }
  public navigate(url: string): void {
    if (this.domLoaded) {
      this.domLoaded = false;
      this.url = url;
      return this.webviewNative.loadURL(url);
    }
  }
  public getUrl(): string {
    if (this.domLoaded) {
      return this.webviewNative.getURL();
    } else {
      return this.url;
    }
  }
  public mouseUp(e) {
    console.log(e);
  }
  public clicked() {
    this.paneManager.setFocusedPane(this);
  }
  public focused() {
    return this.paneManager.getFocusedPane() === this;
  }
  public performBack() {
    if (this.domLoaded) {
      this.webviewNative.goBack();
    }
  }
  public performForward() {
    if (this.domLoaded) {
      this.webviewNative.goForward();
    }
  }
  public performRefresh() {
    if (this.domLoaded) {
      this.webviewNative.reload();
    }
  }
}
