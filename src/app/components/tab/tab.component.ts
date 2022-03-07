import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserDataService } from '../../services/user-data-service/user-data-service.service';

@Component({
  selector: 'pasco-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent implements OnInit {
  @Input()
  public active: boolean;
  @Input()
  public tabId: string;
  @Input()
  public name: string;
  @Output()
  public select: EventEmitter<string>;

  constructor(private userDataService: UserDataService) {
    this.select = new EventEmitter();
  }

  ngOnInit(): void {
  }
  public tabClicked(e): void {
    this.select.emit(this.tabId);
  }
  public tabAuxClicked(e): void {
    if (e.button === 1) {
      this.closeTab();
    }
  }
  public closeTab(): void {
    this.userDataService.removeTab(this.tabId);
  }
}
