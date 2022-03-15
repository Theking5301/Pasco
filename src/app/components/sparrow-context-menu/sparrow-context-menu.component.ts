/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-context-menu',
  templateUrl: './sparrow-context-menu.component.html',
  styleUrls: ['./sparrow-context-menu.component.scss']
})
export class SparrowContextMenuComponent implements OnInit {
  @Output()
  public entryclicked: EventEmitter<IMenuEntryEvent>;
  @Input()
  set entries(newEntries: Map<string, IMenuEntry[]>) {
    this._entries = newEntries;
    for (const category of newEntries.keys()) {
      if (this.categories.indexOf(category) === -1) {
        this.categories.push(category);
      }
    }
  }
  public _entries: Map<string, IMenuEntry[]>;
  public categories: string[];

  @ViewChild('sparrowContextMenu')
  private menu: ElementRef<HTMLDivElement>;
  private open: boolean;

  constructor() {
    this.entryclicked = new EventEmitter();
    this._entries = new Map<string, IMenuEntry[]>();
    this.categories = [];
  }

  ngOnInit(): void {
  }

  public setOpen(open: boolean) {
    setTimeout(() => {
      this.open = open;
    }, 0);
  }
  public isOpen() {
    return this.open;
  }
  public toggleOpen() {
    this.setOpen(!this.open);
  }
  public entryClicked(event, entry) {
    this.entryclicked.emit({ entry });
  }
  public getEntriesForCategory(category: string) {
    return this._entries.get(category);
  }
  public clickedOutside() {
    this.open = false;
  }
}

export interface IMenuEntry {
  category: string;
  action: string;
  name: string;
  shortcut?: string;
}

export interface IMenuEntryEvent {
  entry: IMenuEntry;
}
