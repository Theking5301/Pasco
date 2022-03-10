import { TestBed } from '@angular/core/testing';

import { BrowserManagerService } from './browser-manager.service';

describe('BrowserManagerService', () => {
  let service: BrowserManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowserManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
