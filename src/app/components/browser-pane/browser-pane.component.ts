import { Component, Input, ViewChild, OnInit, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { BrowserManagerService } from '../../services/browser-manager/browser-manager.service';
import { PascoElectronService } from '../../services/pasco-electron/pasco-electron.service';

@Component({
  selector: 'pasco-browser-pane',
  templateUrl: './browser-pane.component.html',
  styleUrls: ['./browser-pane.component.scss']
})
export class BrowserPaneComponent implements OnInit, AfterViewInit {
  @Input()
  public id: string;
  @Output()
  public navigated: EventEmitter<BrowserPaneComponent>;

  @ViewChild('webview')
  private webview: any;
  private webviewNative: any;
  private domLoaded: boolean;
  private firstTimeLoaded: boolean;


  constructor(private electron: PascoElectronService, private paneManager: BrowserManagerService) {
    this.domLoaded = false;
    this.navigated = new EventEmitter();
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.webviewNative = this.webview.nativeElement;
    this.webviewNative.addEventListener('dom-ready', (e) => {
      // Capture the loaded state.
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

    this.webviewNative.addEventListener('did-navigate', (e) => {
      this.domLoaded = true;
      this.navigated.emit(this);
    });
  }
  public navigate(url: string): void {
    if (this.domLoaded) {
      this.domLoaded = false;
      return this.webviewNative.loadURL(url);
    }
  }
  public getUrl() : string {
    return this.paneManager.getSelectedTab().;
  }
  public mouseUp(e) {
    console.log(e);
  }
  public clicked() {
    this.paneManager.setFocusedInstance(this.id);
  }
  public focused() {
    return this.paneManager.getFocusedInstance().id === this.id;
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
  public hasLoadedFirstTime() {
    return this.firstTimeLoaded;
  }
}
