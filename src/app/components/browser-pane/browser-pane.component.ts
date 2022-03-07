import { Component, Input, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Menu, MenuItem, webFrame } from 'electron';
import { ElectronService } from '../../core/services/electron/electron.service';
import { BrowserPaneManagerService } from '../../services/browser-pane-manager.service';

@Component({
  selector: 'pasco-browser-pane',
  templateUrl: './browser-pane.component.html',
  styleUrls: ['./browser-pane.component.scss']
})
export class BrowserPaneComponent implements OnInit, AfterViewInit {
  @Input()
  private url: string;
  @ViewChild('webview')
  private webview: any;


  constructor(private electron: ElectronService, private paneManager: BrowserPaneManagerService) {
    this.url = 'https://www.google.com';
  }

  ngOnInit(): void {

  }
  ngAfterViewInit(): void {
    const webviewNative = this.webview.nativeElement;
    webviewNative.addEventListener('ipc-message', (e) => {
      console.log(e);
    });
    webviewNative.addEventListener('dom-ready', (e) => {
      webviewNative.executeJavaScript('console.log("test")');
      webviewNative.insertCSS(`
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
  private mouseUp(e) {
    console.log(e);
  }
  private clicked() {
    this.paneManager.setFocusedPane(this);
    console.log("foused");
  }
  private focused() {
    return this.paneManager.getFocusedPane() === this;
  }
}
