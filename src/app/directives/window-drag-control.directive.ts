import { Directive, ElementRef } from '@angular/core';
import { SparrowElectronService } from '../services/sparrow-electron/sparrow-electron.service';
import { WindowDragService } from '../services/window-drag.service';

@Directive({
  selector: '[sparrowWindowDragControl]'
})
export class WindowDragControlDirective {

  constructor(private electron: SparrowElectronService, private elementRef: ElementRef, private dragService: WindowDragService) {
    elementRef.nativeElement.addEventListener('mousedown', (e) => {
      dragService.titleBarMouseDown(e);
    });
    elementRef.nativeElement.addEventListener('dblclick', (e) => {
      this.titleBarDoubleClick();
    });
  }
  public titleBarDoubleClick() {
    this.electron.ipcRenderer.send('sparrow/maximize');
  }
}
