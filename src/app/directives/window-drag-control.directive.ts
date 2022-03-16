import { Directive, ElementRef } from '@angular/core';
import { WindowDragService } from '../services/window-drag.service';

@Directive({
  selector: '[sparrowWindowDragControl]'
})
export class WindowDragControlDirective {

  constructor(private elementRef: ElementRef, private dragService: WindowDragService) {
    elementRef.nativeElement.addEventListener('mousedown', (e) => {
      dragService.titleBarMouseDown(e);
    });
  }
}
