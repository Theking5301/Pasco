import { Component, Input, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Menu, MenuItem, webFrame } from 'electron';
import { ElectronService } from '../../core/services/electron/electron.service';

@Component({
  selector: 'pasco-browser-tab',
  templateUrl: './browser-tab.component.html',
  styleUrls: ['./browser-tab.component.scss']
})
export class BrowserTabComponent implements OnInit, AfterViewInit {
  @Input() url: string;
  @ViewChild('webview') webview: any;
  constructor(private electron: ElectronService) { }

  ngOnInit(): void {

  }
  ngAfterViewInit(): void {
    const webviewNative = this.webview.nativeElement;
    webviewNative.addEventListener('dom-ready', () => {
      webviewNative.contentWindow.addEventListener('mouseup', (event) => {
        console.log(event);
      });
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
}
