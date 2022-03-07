import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pasco-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent implements OnInit {
  @Input()
  public active: boolean;
  @Input()
  public tabId: number;
  @Output()
  public select: EventEmitter<number>;

  constructor() {
    this.select = new EventEmitter();
  }

  ngOnInit(): void {
  }
  public tabClicked(): void {
    this.select.emit(this.tabId);
  }
}
