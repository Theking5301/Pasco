import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
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
  private showWindowControls: boolean;


  constructor(private electron: ElectronService, private app: AppComponent) {
    this.framesMoved = 0;
    this.showWindowControls = app.getPlatform() !== 'darwin';
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
