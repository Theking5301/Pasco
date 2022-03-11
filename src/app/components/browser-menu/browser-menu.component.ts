/* eslint-disable @typescript-eslint/member-ordering */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PascoElectronService } from '../../services/pasco-electron/pasco-electron.service';

@Component({
  selector: 'app-browser-menu',
  templateUrl: './browser-menu.component.html',
  styleUrls: ['./browser-menu.component.scss']
})
export class BrowserMenuComponent implements OnInit {
  @Output()
  public entryclicked: EventEmitter<IMenuEntryEvent>;
  public categories: string[];
  public entries: Map<string, IMenuEntry[]>;
  private open: boolean;

  constructor(private electron: PascoElectronService) {
    this.entryclicked = new EventEmitter();
    this.entries = new Map<string, IMenuEntry[]>();
    this.categories = [];
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

  unsorted() { }
  public setOpen(open: boolean) {
    this.open = open;
  }
  public isOpen() {
    return this.open;
  }
  public toggleOpen() {
    this.open = !this.open;
  }
  public entryClicked(event, entry) {
    // If they requested a close, just close the app.
    if (entry.action === 'exit') {
      this.electron.ipcRenderer.send('pasco/close');
    } else {
      this.entryclicked.emit({
        entry
      });
    }
  }
  public getEntriesForCategory(category: string) {
    return this.entries.get(category);
  }
  private addEntry(entry: IMenuEntry) {
    if (!this.entries.has(entry.category)) {
      this.entries.set(entry.category, []);
      this.categories.push(entry.category);
    }
    this.entries.get(entry.category).push(entry);
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
