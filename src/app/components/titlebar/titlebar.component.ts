import { Component, OnInit } from '@angular/core';
import { SparrowElectronService } from '../../services/sparrow-electron/sparrow-electron.service';
import { StaticDataService } from '../../services/static-data-service/static-data-service.service';
import { WindowDragService } from '../../services/window-drag.service';

@Component({
  selector: 'app-titlebar',
  templateUrl: './titlebar.component.html',
  styleUrls: ['./titlebar.component.scss']
})
export class TitlebarComponent implements OnInit {
  public showWindowControls: boolean;


  constructor(private electron: SparrowElectronService, private dragService: WindowDragService, private staticData: StaticDataService) {
    this.showWindowControls = staticData.getStaticData().platform !== 'darwin';
  }

  ngOnInit(): void {
  }
  public titleBarDoubleClick() {
    this.maximizeRestore();
  }
  public close() {
    this.electron.ipcRenderer.send('sparrow/close');
  }
  public minimize() {
    this.electron.ipcRenderer.send('sparrow/minimize');
  }
  public maximizeRestore() {
    this.electron.ipcRenderer.send('sparrow/maximize');
  }
  public onDoubleClick() {
    this.electron.ipcRenderer.send('sparrow/maximize');
  }
}
