import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
import { PascoElectronService } from '../../services/pasco-electron/pasco-electron.service';

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
  public showWindowControls: boolean;


  constructor(private electron: PascoElectronService, private app: AppComponent) {
    this.framesMoved = 0;
    this.showWindowControls = app.getPlatform() !== 'darwin';
  }

  ngOnInit(): void {
  }
  public titleBarMouseDown(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    document.addEventListener('mouseup', this.titleBarMouseUp.bind(this));
    document.addEventListener('mousemove', this.mouseMove.bind(this));
    requestAnimationFrame(this.moveWindow.bind(this, this.electron.ipcRenderer));
    cancelAnimationFrame(this.animationId);
    this.framesMoved = 0;
  }
  public titleBarMouseUp(e) {
    this.electron.ipcRenderer.send('windowMoved');
    document.removeEventListener('mouseup', this.titleBarMouseUp.bind(this));
    cancelAnimationFrame(this.animationId);
  }
  public moveWindow(ipcHandler) {
    ipcHandler.send('windowMoving', { windowId: 0, mouseX: this.mouseX, mouseY: this.mouseY });
    this.animationId = requestAnimationFrame(() => this.moveWindow(ipcHandler));
    this.framesMoved++;
  }
  public mouseMove(e) {
    this.currentMouseButtonDown = e.buttons !== undefined ? e.buttons : e.which;
  }
  public titleBarDoubleClick() {
    this.maximizeRestore();
  }
  public close() {
    this.electron.ipcRenderer.send('pasco/close');
  }
  public minimize() {
    this.electron.ipcRenderer.send('pasco/minimize');
  }
  public maximizeRestore() {
    this.electron.ipcRenderer.send('pasco/maximize');
  }
  public onDoubleClick() {
    this.electron.ipcRenderer.send('pasco/maximize');
  }
}
