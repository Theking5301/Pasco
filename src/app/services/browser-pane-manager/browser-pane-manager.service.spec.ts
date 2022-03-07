import { TestBed } from '@angular/core/testing';

import { BrowserPaneManagerService } from './browser-pane-manager.service';

describe('BrowserPaneManagerService', () => {
  let service: BrowserPaneManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowserPaneManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
