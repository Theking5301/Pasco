import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../core/services/electron/electron.service';

@Component({
  selector: 'pasco-titlebar',
  templateUrl: './titlebar.component.html',
  styleUrls: ['./titlebar.component.scss']
})
export class TitlebarComponent implements OnInit {
  private animationId;
  private mouseX;
  private mouseY;
  private currentMouseButtonDown;
  private framesMoved;


  constructor(private electron: ElectronService) {
    this.framesMoved = 0;
  }

  ngOnInit(): void {
  }
  private titleBarMouseDown(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    document.addEventListener('mouseup', this.titleBarMouseUp.bind(this));
    document.addEventListener('mousemove', this.mouseMove.bind(this));
    requestAnimationFrame(this.moveWindow.bind(this, this.electron.ipcRenderer));
    cancelAnimationFrame(this.animationId);
    this.framesMoved = 0;
  }
  private titleBarMouseUp(e) {
    this.electron.ipcRenderer.send('windowMoved');
    document.removeEventListener('mouseup', this.titleBarMouseUp.bind(this));
    cancelAnimationFrame(this.animationId);
  }
  private moveWindow(ipcHandler) {
    ipcHandler.send('windowMoving', { windowId: 0, mouseX: this.mouseX, mouseY: this.mouseY });
    this.animationId = requestAnimationFrame(() => this.moveWindow(ipcHandler));
    this.framesMoved++;

    // This is just in case we get stuck, we check if the mouse button is still down.
    // We wait 10 frames to check just to avoid timing issues across the renderer.
    if (this.currentMouseButtonDown !== 1 && this.framesMoved > 10) {
      cancelAnimationFrame(this.animationId);
      this.framesMoved = 0;
    }
  }
  private mouseMove(e) {
    this.currentMouseButtonDown = e.buttons !== undefined ? e.buttons : e.which;
  }
  private titleBarDoubleClick() {
    this.maximizeRestore();
  }
  private close() {
    this.electron.ipcRenderer.send('pasco/close');
  }
  private minimize() {
    this.electron.ipcRenderer.send('pasco/minimize');
  }
  private maximizeRestore() {
    this.electron.ipcRenderer.send('pasco/maximize');
  }
  private onDoubleClick() {
    this.electron.ipcRenderer.send('pasco/maximize');
  }
}
