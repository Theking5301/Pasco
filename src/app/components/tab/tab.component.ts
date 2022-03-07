import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pasco-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent implements OnInit {
  @Input()
  private active: boolean;
  @Input()
  private tabId: number;
  @Output()
  private select: EventEmitter<number>;

  constructor() {
    this.select = new EventEmitter();
  }

  ngOnInit(): void {
  }
  private tabClicked(): void {
    this.select.emit(this.tabId);
  }
}
