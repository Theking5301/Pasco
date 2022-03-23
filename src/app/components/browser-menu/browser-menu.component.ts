/* eslint-disable @typescript-eslint/member-ordering */
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { IMenuEntry, IMenuEntryEvent, SparrowContextMenuComponent } from '../sparrow-context-menu/sparrow-context-menu.component';

@Component({
  selector: 'app-browser-menu',
  templateUrl: './browser-menu.component.html',
  styleUrls: ['./browser-menu.component.scss']
})
export class BrowserMenuComponent implements OnInit {
  @Output()
  public entryclicked: EventEmitter<IMenuEntryEvent>;

  public entries: Map<string, IMenuEntry[]>;
  @ViewChild(SparrowContextMenuComponent)
  private menu: SparrowContextMenuComponent;

  constructor() {
    this.entryclicked = new EventEmitter();
    this.entries = new Map<string, IMenuEntry[]>();
    this.addEntry({ category: 'browser-functions', name: 'browser.menu.new_tab', action: 'new_tab' });
    this.addEntry({ category: 'browser-functions', name: 'browser.menu.close_tab', action: 'close_tab' });
    this.addEntry({ category: 'browser-functions', name: 'browser.menu.new_instance', action: 'new_instance' });
    this.addEntry({ category: 'browser-functions', name: 'browser.menu.close_instance', action: 'close_instance' });
    this.addEntry({ category: 'profile', name: 'browser.menu.switch_profile', action: 'switch_profile' });
    this.addEntry({ category: 'profile', name: 'browser.menu.new_profile', action: 'new_profile' });
    this.addEntry({ category: 'functions', name: 'browser.menu.print', action: 'print' });
    this.addEntry({ category: 'browser', name: 'browser.menu.settings', action: 'settings' });
    this.addEntry({ category: 'browser', name: 'browser.menu.exit', action: 'exit' });
  }

  ngOnInit(): void {
  }
  public toggleOpen() {
    this.menu.toggleOpen();
  }
  private addEntry(entry: IMenuEntry) {
    if (!this.entries.has(entry.category)) {
      this.entries.set(entry.category, []);
    }
    this.entries.get(entry.category).push(entry);
  }
}
